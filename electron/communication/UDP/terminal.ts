import dgram from "dgram";
import { generateCRC32 } from "../../crypto";
import { SharedProperties } from "../../shared-properties";

export type UDPEvent = "listening" | "connect" | "message" | "error" | "close";
export type UDPCommand = number;

export class UDPTerminal {
    public static readonly EVENT_LISTENING: UDPEvent = "listening";
    public static readonly EVENT_CONNECT: UDPEvent = "connect";
    public static readonly EVENT_MESSAGE: UDPEvent = "message";
    public static readonly EVENT_ERROR: UDPEvent = "error";
    public static readonly EVENT_CLOSE: UDPEvent = "close";

    public static readonly COMMAND_PING: UDPCommand = 0x01;
    public static readonly COMMAND_PONG: UDPCommand = 0x02;
    public static readonly COMMAND_CONNECT: UDPCommand = 0x04;

    public static readonly COMMAND_WITH_LOBBY: UDPCommand = 0x20;

    public static readonly COMMAND_ERROR: UDPCommand = 0xFF;

    private callbacks: Map<UDPCommand, (...args: any[]) => void> = new Map();

    private isConnected = false;

    private packetCount = 0;

    public readonly connection: dgram.Socket;

    constructor(address: string, port: number) {
        this.connection = dgram.createSocket('udp4');
        
        this.connection.on(UDPTerminal.EVENT_LISTENING, () => { 
            // on listening
        });

        this.connection.on(UDPTerminal.EVENT_CONNECT, () => { 
            this.isConnected = true;
        });

        this.connection.on(UDPTerminal.EVENT_MESSAGE, (msg: Buffer, info) => {
            const command = msg.readInt8();
            const count = msg.readUInt32BE();
            const callback = this.callbacks.get(command);
            callback?.(msg.subarray(1), count, info);
        });

        this.connection.on(UDPTerminal.EVENT_ERROR, (err) => {
            // on error
        });

        this.connection.on(UDPTerminal.EVENT_CLOSE, () => {
            // on close
        });

        this.connection.connect(port, address);
    }
    
    public listenTo(command: UDPCommand, callback: (...args: any[]) => void, override: boolean = false) {
        const call = this.callbacks.get(command);
        if (override || call === undefined) {
            this.callbacks.set(command, callback);
            return this;
        } else {
            console.log(call);
            throw new Error("callback for command \'" + command + "\' is already defined");
        }
    }
    
    public unlistenTo(command: UDPCommand) {
        this.callbacks.delete(command);
        return this;
    }

    public async send(command: UDPCommand, body: Buffer):Promise<number> {
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
            throw new Error("Google credential must be validated before UDP communication.");
        }
        // command[1]
        const commandBuffer = Buffer.allocUnsafe(1);
        commandBuffer.writeUInt8(command);

        // userid[10]
        const userBuffer = SharedProperties.UserIDBuffer!;

        // lobby[5]
        const lobbyBuffer = Buffer.from(SharedProperties.Lobby.ID);

        // body[:]
        const bodyBuffer = Buffer.concat([
            commandBuffer, userBuffer, lobbyBuffer, body
        ]);

        // hash[4]
        const skipHash = command === UDPTerminal.COMMAND_PING || command === UDPTerminal.COMMAND_PONG;
        const hashBuffer = Buffer.allocUnsafe(8);
        hashBuffer.writeUInt32BE(this.packetCount);
        if (!skipHash) {
            const sessionKey = SharedProperties.SessionKey!;
            const signedBodyBuffer = Buffer.concat([sessionKey, bodyBuffer]);
            hashBuffer.writeInt32BE(generateCRC32(signedBodyBuffer), 4);
        }        

        const messageBuffer = Buffer.concat([hashBuffer, bodyBuffer]);

        this.connection.send(messageBuffer);

        return this.packetCount++; // TODO: return packet number.
    }
    /**
     * message format 
     * packetCount 4
     * hash(all of the following + online secret) 4
     * command 1
     * uid 10
     * lobbyid 5
     * [ body ~ ]
     */
};

