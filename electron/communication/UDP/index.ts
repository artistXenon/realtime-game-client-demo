import dgram from "dgram";
import { generateCRC32 } from "../../crypto";
import State from "./state";

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

    public readonly connection: dgram.Socket;

    public userState: State;

    constructor(address: string, port: number, userState: State) {
        this.userState = userState;
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
            const callbacks = this.callbacks.get(UDPTerminal.EVENT_CONNECT)!;
            for (const callback of callbacks) {
                callback();
            }
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

    public send(command: UDPCommand, body: Buffer) {
        let buffers: Buffer[] = [];
        let buf: Buffer;
        buf = Buffer.allocUnsafe(1 + 10);

        // command[1]
        buf.writeUInt8(command);

        // userid[10]
        buf.write(this.userState.UserIDinHEX, 'hex');
        buffers.push(buf);

        // lobby[5]
        if (command > UDPTerminal.COMMAND_WITH_LOBBY) {
            buf = Buffer.from(this.userState.LobbyId);
            buffers.push(buf);
        }

        // hash[4]
        buf = Buffer.allocUnsafe(4);
        buf.writeInt32BE(generateCRC32(body));
        buffers.push(buf);

        // body[:]
        buffers.push(body);
        buf = Buffer.concat(buffers);
        this.connection.send(buf);
    }
};
