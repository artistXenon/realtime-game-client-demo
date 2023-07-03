import { UDPApplication, UDPTerminal } from "../communication";

/**
 * @ message format
 * ping >
 * clientTime
 * sendDelay
 * 
 * pong <
 * serverTime
 * receiveDelay 
 */

type PingSnapshot = {
    count: number;
    pingedTime: number;
}

export class PingApp extends UDPApplication<PingSnapshot> {
    protected pings: number[] = [];

    constructor() {
        super(UDPTerminal.COMMAND_PONG);
        this.resTimeout = 300;
        this.registerListener();
    }
    
    public get Ping() {
        let successfulPingCount = 0, pingSum = 0;

        for (let i = 0; i < this.pings.length; i++) {
            const ping = this.pings[i];
            if (!isNaN(ping)) {
                successfulPingCount++;
                pingSum += ping;
            }            
        }
        if (successfulPingCount === 0) {
            return NaN;
        }
        return pingSum / successfulPingCount;
    }

    public get Loss() {
        let lossCount = 0;
        for (let i = 0; i < this.pings.length; i++) {
            const ping = this.pings[i];
            if (isNaN(ping)) {
                lossCount++;
            }            
        }
        return lossCount / this.pings.length;
    }
    
    public initPing(count: number) {
        if (count === 0) {
            throw new Error("ping count can not initiate with value 0");
        }
        this.pings = [];
        this.pings.length = count;
        this.generatePing(0);
    }

    protected override onResponse(buf: Buffer, _: any, snapshot: PingSnapshot): void {
        const pingCount = snapshot.count;
        const { ping, sendDelay } = this.parsePing(buf, snapshot.pingedTime);

        
        if (pingCount < this.pings.length) {
            this.generatePing(pingCount + 1, sendDelay);   
        } else {
            this.destroy();
        }
        this.pings[pingCount] = ping;
    }

    protected override onRequestTimeout(snapshot?: PingSnapshot | undefined): void {
        if (snapshot === undefined) return;
        const pingCount = snapshot.count;
        this.pings[pingCount] = NaN;
        this.generatePing(pingCount + 1);
    }

    private parsePing(msg: Buffer, pingedTime: number) {
        const sentServerTime = msg.readBigInt64BE(0);
        // const sentReceiveDelay = msg.readUIntBE(8, 2); // offset + half_ping

        const now = Date.now();
        const sendDelay = parseInt(sentServerTime.toString()) - now; // offset - half_ping
        const ping = now - pingedTime;
        // const offset = (sendDelay + sentReceiveDelay) / 2;
    
        return { ping, sendDelay };
    }

    private generatePing(count: number, sendDelay: number = -32768) {
        const now = Date.now();
        const buf = Buffer.allocUnsafe(10);
        buf.writeBigInt64BE(BigInt(now)); // lastPing: 8
        buf.writeInt16BE(sendDelay, 8);
        this.send(UDPTerminal.COMMAND_PING, buf, {
            count: count,
            pingedTime: now
        });
        // TODO: if pong timeout, manually send ping again for remaining ping count
    }
};
