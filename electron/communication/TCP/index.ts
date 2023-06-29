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

    public static readonly COMMAND_JOIN: TCPCommand = 0x01;
    public static readonly COMMAND_CONNECT: TCPCommand = 0x04;
    public static readonly COMMAND_RECONNECT: TCPCommand = 0x05;

    public static readonly COMMAND_WITH_LOBBY: TCPCommand = 0x20;

    public static readonly COMMAND_ERROR: TCPCommand = 0xFF;

    private callbacks: Map<TCPCommand, (...args: any[]) => void> = new Map();

    private isConnected: boolean = false;

    private doReconnect: boolean = true;

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
            console.log(call)
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
        if (reconnect) {
            commandBuffer.writeUInt8(TCPTerminal.COMMAND_RECONNECT);
        } else {
            commandBuffer.writeUInt8(TCPTerminal.COMMAND_JOIN);
        }        

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

        this.connection.write(messageBuffer);
    }

    private createConnection(address: string, port: number): net.Socket {
        this.connection.destroy();
        const newConnection = net.connect({ // TODO: look out for this throwing an error. 
            host: address,
            port: port
        }, () => {
            this.isConnected = true;
        });

        newConnection.on(TCPTerminal.EVENT_DATA, (msg: Buffer, info) => {
            const command = msg.readInt8();
            const callback = this.callbacks.get(command);
            callback?.(msg.subarray(1), info);
        });

        newConnection.on(TCPTerminal.EVENT_DRAIN, () => { });

        newConnection.on(TCPTerminal.EVENT_TIMEOUT, () => { });

        newConnection.on(TCPTerminal.EVENT_ERROR, (err) => { });

        newConnection.on(TCPTerminal.EVENT_CLOSE, () => { 
            if (this.doReconnect) {
                this.connection = this.createConnection(address, port);
                this.join(true);

                // TODO: on reconnect failure, let app know and leave the lobby
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
