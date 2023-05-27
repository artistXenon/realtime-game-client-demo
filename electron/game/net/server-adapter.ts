import dgram from "dgram";

export default class ServerAdapter {
    private connection: dgram.Socket;

    private tickRate: number = 1000; // / 30


    constructor(addr: string, port: number) {
        this.connection = dgram.createSocket('udp4');

        this.connection.on("listening", () => { 
            // socket is made
        });
        
        this.connection.on("connect", () => { 
            // socket is connected
        });
        
        this.connection.on("message", (msg, info) => {
            // todo: handle wrapping info: tick number, reqeust hash
            const msgStr = msg.toString()
            if (msgStr[0] === '!') {
                // this is an error
            }
            // attached from another file
        });
        
        this.connection.on("error", (err) => {
            // on error. what kind?
        });
        
        this.connection.on("close", () => {
            // on socket terminate
            this.connection.unref();
        });
        
        this.connection.connect(port, addr);
    }
}
