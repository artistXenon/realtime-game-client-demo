import { UDPCommand } from "./terminal";
import { SharedProperties } from "../../shared-properties";


export abstract class UDPApplication<T> {
    protected command: UDPCommand;

    protected reqs: Map<number, T> = new Map();

    protected reqPacketIndex = 0;

    protected resPacketIndex = 0;

    constructor(command: UDPCommand) {
        this.command = command;
    }

    public get Listener() {
        return this.listener.bind(this);
    }

    public async send(command: UDPCommand, buf: Buffer, snapShot: T) {
        const packetNumber = await SharedProperties.UDPTerminal.send(command, buf);

        this.reqs.set(packetNumber, snapShot);
        this.reqPacketIndex = packetNumber;
    }

    public registerListener() {
        SharedProperties.UDPTerminal.listenTo(this.command, (buf: Buffer, count: number, info: any) => {
            const countOutOfRange = 
                count <= this.resPacketIndex || 
                count > this.reqPacketIndex ||
                !this.reqs.has(count);

            if (countOutOfRange) {
                return;
            }
            const snapshot = this.reqs.get(count)!;
            this.listener(buf, info, snapshot);
            this.reqs.delete(count);
            // TODO: cleaner for un responded messages.
        });
    }

    public unregisterListener() {
        SharedProperties.UDPTerminal.unlistenTo(this.command);
    }

    protected abstract listener(buf: Buffer, info: any, snapshot: T): void;
}