import dgram from "dgram";
import State from "../state/state";

export default class ServerAdapter {
    private connection: dgram.Socket;

    private pingLoop: PingLoop | undefined;

    // private tickRate: number = 1000; // / 30

    constructor(addr: string, port: number) {
        this.connection = dgram.createSocket('udp4');

        this.connection.on("listening", () => { 
            // socket is made
        });
        
        this.connection.on("connect", () => { 
            // socket is connected
            this.onConnect();
        });
        
        this.connection.on("message", (msg, _) => { // info
            // todo: handle wrapping info: tick number, reqeust hash
            const msgStr = msg.toString();
            if (msgStr[0] === '!') {
                // this is an error
                // TODO: may be this type of error is unnecessary
            }
            const lines = msgStr.split("\n");
            const header = lines[0].split("!");
            switch (header[0]) {
                case "join":
                    this.onJoin();
                    break;
                case "ping":
                    this.pingLoop?.onPing(header[1], header[2]);
                    break;
                default:
            }
            // attached from another file
        });
        
        this.connection.on("error", (err) => {
            console.log(err);
            // on error. what kind?
        });
        
        this.connection.on("close", () => {
            // on socket terminate
            this.connection.unref();
        });
        
        this.connection.connect(port, addr);
    }

    public onConnect() {
        let sb = ServerAdapter.generateMsg("join", JSON.stringify({ LobbyId: State.LobbyId, Name: State.UserName }));
        this.connection.send(sb);
    }

    public onJoin() {
        this.pingLoop = new PingLoop(this.connection);
        this.pingLoop.sendPing();
    }

    public static generateMsg(event: string, body: string): Buffer {
        const b = Buffer.from(`${event}!${String(State.UserId)}!${ServerAdapter.generateHash(body)}!\n${body}`);
        if (b.length > 1024) {
            console.log("message size exceed server capacity");
        }
        return b;
    }

    private static generateHash(body: string) {
        return "" + body; //TODO: generate hash from sign cert

    }
}

class PingLoop {
    private connection: dgram.Socket;

    private maxPingCount = 5; /* how many times to execute ping count*/
    private pingCount = 0;
    private lastPing = 0;

    constructor(conn: dgram.Socket) {
        this.connection = conn;
    }

    public sendPing() {
        if (this.pingCount < this.maxPingCount ) {

        }
        this.lastPing = Date.now();
        let sb = ServerAdapter.generateMsg("ping", String(this.lastPing));
        this.connection.send(sb);
    }

    public onPing(sentServerTime: string, sentReceiveDelay: string) {
        const now = Date.now();
        const ping = now - this.lastPing;
        const sendDelay = Number(sentServerTime) - now; // offset - half_ping
        const receiveDelay = Number(sentReceiveDelay); // offset + half_ping
        const offset = (sendDelay + receiveDelay) / 2;
        let sb = ServerAdapter.generateMsg("pong", JSON.stringify({ Ping: ping, Offset: offset, SendDelay: sendDelay }));
        this.connection.send(sb);
        setTimeout(() => this.sendPing(), 50);
    }
}
