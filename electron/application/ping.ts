import { UDPTerminal } from "../communication";

export class PingMeasurement {
    private maxPingCount = 5;

    private maxBufferSize = 5;

    private pingTimer: NodeJS.Timer | undefined;

    private udpTerminal: UDPTerminal;

    private lastPing = 0;

    private pingCount = 0;

    private pings: number[] = [];

    constructor(udpterminal: UDPTerminal) {
        this.udpTerminal = udpterminal;

        const pingListener = (command: Buffer, msg: Buffer) => {
            if (UDPTerminal.COMMAND_PING !== command.readUInt8()) return;

            if (!this.isCounting) {
                this.udpTerminal.unlistenTo(UDPTerminal.EVENT_MESSAGE, pingListener);
                if (this.pingTimer?.hasRef()) {
                    clearInterval(this.pingTimer);
                }
                return;
            }
            this.pingCount = this.pingCount + 1;

            const { ping, offset, sendDelay } = this.parsePing(msg);

            this.pings.push(ping);
            if (this.pings.length > this.maxBufferSize) {
                this.pings.shift();
            }
            this.udpTerminal.send(UDPTerminal.COMMAND_PONG, this.generatePong(ping, offset, sendDelay));            
        };

        this.udpTerminal.listenTo(UDPTerminal.EVENT_MESSAGE, pingListener);
    }

    public get Ping() {
        if (this.pings.length === 0) return NaN;
        return this.pings.reduce((a, c) => a + c) / this.maxBufferSize;
    }

    public get isCounting() {
        return this.maxPingCount > this.pingCount;
    }

    public initPing(count: number, interval: number = 500, buffer: number = 5) {
        this.maxPingCount = count;
        this.maxBufferSize = buffer
        this.lastPing = 0;
        this.pingCount = 0;
        this.pings = [];

        if (this.pingTimer?.hasRef()) {
            clearInterval(this.pingTimer);
        }

        this.pingTimer = setInterval(() => {
            this.udpTerminal.send(UDPTerminal.COMMAND_PING, this.generatePing());
        }, interval);

        this.udpTerminal.send(UDPTerminal.COMMAND_PING, this.generatePing());
    }

    private parsePing(msg: Buffer) {
        const sentServerTime = msg.readBigInt64BE(0);
        const sentReceiveDelay = msg.readUIntBE(8, 2); // offset + half_ping

        const now = Date.now();
        const ping = now - this.lastPing;
        const sendDelay = parseInt(sentServerTime.toString()) - now; // offset - half_ping
        const offset = (sendDelay + sentReceiveDelay) / 2;
    
        return {
            ping, offset, sendDelay
        }
    }

    private generatePing() {
        this.lastPing = Date.now();
        const buf = Buffer.allocUnsafe(8);
        buf.writeBigInt64BE(BigInt(this.lastPing)); // lastPing: 6
        return buf;
    }

    private generatePong(ping: number, offset: number, sendDelay: number) {
        const buf = Buffer.allocUnsafe(6);
        buf.writeUInt16BE(ping); // ping: 2
        buf.writeInt16BE(offset, 2); // offset: 2
        buf.writeInt16BE(sendDelay, 4); // sendDelay: 2
        return buf;
    }
}
