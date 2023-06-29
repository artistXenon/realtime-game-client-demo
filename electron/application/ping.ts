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
};

export class PingApp extends UDPApplication<PingSnapshot> {
    protected pings: number[] = [];

    constructor() {
        super(UDPTerminal.COMMAND_PONG);
        this.registerListener();
    }
    
    public get Ping() {
        let successfulPingCount = 0, pingSum = 0;

        for (let i = 0; i < this.pings.length; i++) {
            const ping = this.pings[i];
            if (ping !== undefined) {
                successfulPingCount++;
                pingSum += ping;
            }            
        }
        return pingSum / successfulPingCount;
    }

    public get Loss() {
        let lossCount = 0;
        for (let i = 0; i < this.pings.length; i++) {
            const ping = this.pings[i];
            if (ping === undefined) {
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

    protected listener(buf: Buffer, _: any, snapshot: PingSnapshot): void {
        const pingCount = snapshot.count;
        const { ping, sendDelay } = this.parsePing(buf, snapshot.pingedTime);

        this.pings[pingCount] = ping;
        if (pingCount < this.pings.length) {
            this.generatePing(pingCount + 1, sendDelay);   
        } else {
            this.unregisterListener();
        }
    }

    private parsePing(msg: Buffer, pingedTime: number) {
        const sentServerTime = msg.readBigInt64BE(0);
        // const sentReceiveDelay = msg.readUIntBE(8, 2); // offset + half_ping

        const now = Date.now();
        const ping = now - pingedTime;
        const sendDelay = parseInt(sentServerTime.toString()) - now; // offset - half_ping
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
