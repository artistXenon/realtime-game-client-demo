import net from "net";
import { generateCRC32 } from "../../crypto";
import { SharedProperties } from "../../shared-properties";

export type TCPEvent = "drain" | "timeout" | "data" | "error" | "close" | "end" | "lookup";
export type TCPCommand = number;

export class TCPTerminal {
    public static readonly EVENT_DATA: TCPEvent = "data";
    public static readonly EVENT_DRAIN: TCPEvent = "drain";
    public static readonly EVENT_TIMEOUT: TCPEvent = "timeout";
    public static readonly EVENT_LOOKUP: TCPEvent = "lookup";
    public static readonly EVENT_ERROR: TCPEvent = "error";
    public static readonly EVENT_CLOSE: TCPEvent = "close";
    public static readonly EVENT_END: TCPEvent = "end";

    public static readonly COMMAND_CLOSE: TCPCommand = 0x00;
    public static readonly COMMAND_JOIN: TCPCommand = 0x01;
    public static readonly COMMAND_LOBBY: TCPCommand = 0x02;
    public static readonly COMMAND_LEAVE: TCPCommand = 0x03;
    public static readonly COMMAND_CONNECT: TCPCommand = 0x04;
    public static readonly COMMAND_RECONNECT: TCPCommand = 0x05;

    public static readonly COMMAND_WITH_LOBBY: TCPCommand = 0x20;

    public static readonly COMMAND_ERROR: TCPCommand = 0xFF;

    private callbacks: Map<TCPCommand, (...args: any[]) => void> = new Map();

    private isConnected: boolean = false;

    private doReconnect: boolean = true;

    private firstReconnect: number = 0;

    private destroy: net.Socket | undefined;

    private connection: net.Socket;

    constructor(address: string, port: number) {
        this.connection = this.createConnection(address, port);
    }
    
    public listenTo(command: TCPCommand, callback: (...args: any[]) => void, override: boolean = false) {
        const call = this.callbacks.get(command);
        if (override || call === undefined) {
            this.callbacks.set(command, callback);
            return this;
        } else {
            console.log(call);
            throw new Error("callback for command \'" + command + "\' is already defined");
        }
    }
    
    public unlistenTo(command: TCPCommand) {
        this.callbacks.delete(command);
        return this;
    }

    public async send(command: TCPCommand, body: Buffer) {     
        // command[1]
        const commandBuffer = Buffer.allocUnsafe(1);
        commandBuffer.writeUInt8(command);

        // body[:]
        const bodyBuffer = Buffer.concat([commandBuffer, body]);

        this.connection.write(bodyBuffer);
    }

    public async join(reconnect: boolean = false) {             
        let command: number;
        if (reconnect) {
            if (this.firstReconnect === 0) {
                this.firstReconnect = Date.now();
            } else if (Date.now() - this.firstReconnect > 10000){
                this.firstReconnect = 0;
                return;
            }
            command = TCPTerminal.COMMAND_RECONNECT;
        } else {
            command = TCPTerminal.COMMAND_JOIN;
        }        

        if (!this.isConnected) {
            await new Promise<void>((res, rej) => {
                const itv = setInterval(_ => {
                    if (this.isConnected) {
                        clearInterval(itv);
                        res();
                    }
                }, 10);
            });    
        }

        if (!SharedProperties.GoogleCredential.isValidated) {
            throw new Error("Google credential must be validated before TCP communication");
        }
        // command[1]
        const commandBuffer = Buffer.allocUnsafe(1);
        commandBuffer.writeInt8(command);

        // userid[10]
        const userBuffer = SharedProperties.UserIDBuffer!;

        // lobby[5]
        const lobbyBuffer = Buffer.from(SharedProperties.Lobby.ID);

        // body[:]
        const bodyBuffer = Buffer.concat([commandBuffer, userBuffer, lobbyBuffer]);

        // hash[4]
        const hashBuffer = Buffer.allocUnsafe(4);
        const sessionKey = SharedProperties.SessionKey!;
        const signedBodyBuffer = Buffer.concat([sessionKey, bodyBuffer]);
        hashBuffer.writeInt32BE(generateCRC32(signedBodyBuffer));
        const messageBuffer = Buffer.concat([hashBuffer, bodyBuffer]);

        this.listenTo(command, (b: Buffer) => {
            const err = b.readInt8();
            switch (err) {
                case 0: 
                    break;
                case 1:
                default: 
                this.doReconnect = false;
            }            
            this.unlistenTo(command);
        }, true);

        return this.connection.write(messageBuffer);
    }

    private createConnection(address: string, port: number): net.Socket {
        const newConnection = net.connect({ // TODO: look out for this throwing an error. 
            host: address,
            port: port
        }, () => {
            this.isConnected = true;
        });

        newConnection.on(TCPTerminal.EVENT_DATA, (msg: Buffer, info) => {
            const command = msg.readInt8();
            if (command === TCPTerminal.COMMAND_CLOSE) {
                this.destroy = newConnection;
                newConnection.unref();
                newConnection.destroy();
                return;
            }
            const length = msg.readUint32BE(1);
            const callback = this.callbacks.get(command);
            callback?.(msg.subarray(5, 5 + length), info);
        });

        newConnection.on(TCPTerminal.EVENT_DRAIN, () => { });

        newConnection.on(TCPTerminal.EVENT_TIMEOUT, () => { });

        newConnection.on(TCPTerminal.EVENT_ERROR, (err) => { });

        // newConnection.on("connect", () => { console.log("does this even happen") });

        newConnection.on(TCPTerminal.EVENT_CLOSE, () => { 
            this.isConnected = false;
            if (this.doReconnect && this.destroy !== newConnection) {
                setTimeout(async () => {
                    this.connection = this.createConnection(address, port);
                    await this.join(true);
                }, 2000);
                // TODO: on reconnect failure, let app know and leave the lobby
            } else {
                this.destroy = undefined;
            }
        });

        newConnection.on(TCPTerminal.EVENT_END, () => { });

        return newConnection;
    }
    /**
     * message format 
     * 
     * hash(all of the following + online secret) 4
     * command 1
     * uid 10
     * lobbyid 5
     * [ body ~ ]
     */
};
