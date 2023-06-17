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
    public static readonly COMMAND_JOIN: UDPCommand = 0x03;
    public static readonly COMMAND_CONNECT: UDPCommand = 0x04;

    public static readonly COMMAND_WITH_LOBBY: UDPCommand = 0x20;

    public static readonly COMMAND_ERROR: UDPCommand = 0xFF;

    private callbacks: Map<UDPEvent, Set<(...args: any[]) => void>>;

    private isConnected: boolean = false;

    public readonly connection: dgram.Socket;

    constructor(address: string, port: number) {
        this.callbacks = new Map();
        this.callbacks.set(UDPTerminal.EVENT_LISTENING, new Set());
        this.callbacks.set(UDPTerminal.EVENT_CONNECT, new Set());
        this.callbacks.set(UDPTerminal.EVENT_MESSAGE, new Set());
        this.callbacks.set(UDPTerminal.EVENT_ERROR, new Set());
        this.callbacks.set(UDPTerminal.EVENT_CLOSE, new Set());

        this.connection = dgram.createSocket('udp4');
        
        this.connection.on(UDPTerminal.EVENT_LISTENING, () => { 
            const callbacks = this.callbacks.get(UDPTerminal.EVENT_LISTENING)!;
            for (const callback of callbacks) {
                callback();
            }
        });

        this.connection.on(UDPTerminal.EVENT_CONNECT, () => { 
            this.isConnected = true;
        });

        this.connection.on(UDPTerminal.EVENT_MESSAGE, (msg: Buffer, info) => {
            const command = msg.subarray(0, 1);

            const callbacks = this.callbacks.get(UDPTerminal.EVENT_MESSAGE)!;
            for (const callback of callbacks) {
                callback(command, msg.subarray(1), info);
            }
        });

        this.connection.on(UDPTerminal.EVENT_ERROR, (err) => {
            const callbacks = this.callbacks.get(UDPTerminal.EVENT_ERROR)!;
            for (const callback of callbacks) {
                callback(err);
            }
        });

        this.connection.on(UDPTerminal.EVENT_CLOSE, () => {
            const callbacks = this.callbacks.get(UDPTerminal.EVENT_CLOSE)!;
            for (const callback of callbacks) {
                callback();
            }
        });

        this.connection.connect(port, address);
    }
    
    public listenTo(eventName: UDPEvent, callback: (...args: any[]) => void) {
        const callbackSet = this.callbacks.get(eventName)!;
        callbackSet.add(callback);
        return this;
    }
    
    public unlistenTo(eventName: UDPEvent, callback: (...args: any[]) => void) {
        const callbackSet = this.callbacks.get(eventName)!;
        callbackSet.delete(callback);
        return this;
    }

    public async send(command: UDPCommand, body: Buffer) {
        await new Promise<void>((res, rej) => {
            const itv = setInterval(_ => {
                if (this.isConnected) {
                    clearInterval(itv);
                    res();
                }
            }, 10);
        });

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
        const hashBuffer = Buffer.allocUnsafe(4);
        if (!skipHash) {
            const sessionKey = SharedProperties.SessionKey!;
            const signedBodyBuffer = Buffer.concat([sessionKey, bodyBuffer]);
            hashBuffer.writeInt32BE(generateCRC32(signedBodyBuffer));
        }        

        const messageBuffer = Buffer.concat([hashBuffer, bodyBuffer]);

        this.connection.send(messageBuffer);
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
