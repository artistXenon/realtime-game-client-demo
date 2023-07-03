import { UDPCommand } from "./terminal";
import { SharedProperties } from "../../shared-properties";

type SnapshotWrapper<T> = {
    time: number;
    snapshot?: T;
};

export abstract class UDPApplication<T> {
    private static instances: UDPApplication<any>[] = [];

    // something similar to a GC. collects unprocessed requests and callback/delete
    private static timer: NodeJS.Timer = setInterval(() => {
        const now = Date.now();
        for (const instance of this.instances) {
            if (instance.reqs.size === 0) {
                continue;
            }
            const keys = instance.reqs.keys();
            for (const key of keys) {
                if (key < instance.resPacketIndex) {
                    // this key has already been processed
                    continue;
                }
                const { snapshot, time } = instance.reqs.get(key)!;
                if (snapshot === undefined) {
                    // this key doesn't require process
                    continue;
                }
                if (time + instance.resTimeout < now) {
                    // this key didn't get response in time
                    instance.onRequestTimeout(snapshot);
                    instance.reqs.delete(key);
                }
            }
        }
    }, 100);

    protected command: UDPCommand;

    protected reqs: Map<number, SnapshotWrapper<T>> = new Map();

    protected resTimeout = 1000;

    protected reqPacketIndex = 0;

    protected resPacketIndex = 0;

    constructor(command: UDPCommand) {
        this.command = command;
        UDPApplication.instances.push(this);
    }

    public async send(command: UDPCommand, buf: Buffer, snapShot?: T) {
        const packetNumber = await SharedProperties.UDPTerminal.send(command, buf);

        this.reqs.set(packetNumber, {
            time: Date.now(),
            snapshot: snapShot
        });
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
            const { snapshot } = this.reqs.get(count)!;
            this.onResponse(buf, info, snapshot);
            this.reqs.delete(count);
            this.resPacketIndex = count;
        });
    }

    public destroy() {
        const instanceIndex = UDPApplication.instances.indexOf(this);
        if (instanceIndex !== -1) {
            UDPApplication.instances.splice(instanceIndex, 1);
        }
        SharedProperties.UDPTerminal.unlistenTo(this.command);
    }

    protected abstract onResponse(buf: Buffer, info: any, snapshot?: T): void;
    protected abstract onRequestTimeout(snapshot?: T): void;
}