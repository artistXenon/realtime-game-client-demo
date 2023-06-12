import dgram from "dgram";

type UDPEvent = "listening" | "connect" | "message" | "error" | "close";

export class UDPTerminal {
    public static readonly EVENT_LISTENING: UDPEvent = "listening";
    public static readonly EVENT_CONNECT: UDPEvent = "connect";
    public static readonly EVENT_MESSAGE: UDPEvent = "message";
    public static readonly EVENT_ERROR: UDPEvent = "error";
    public static readonly EVENT_CLOSE: UDPEvent = "close";


    private connection: dgram.Socket;

    private callbacks: Map<UDPEvent, Set<(...args: any[]) => void>>;

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
            const callbacks = this.callbacks.get(UDPTerminal.EVENT_CONNECT)!;
            for (const callback of callbacks) {
                callback();
            }
        });

        this.connection.on(UDPTerminal.EVENT_MESSAGE, (msg, info) => {
            const callbacks = this.callbacks.get(UDPTerminal.EVENT_MESSAGE)!;
            for (const callback of callbacks) {
                callback(msg, info);
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
};
