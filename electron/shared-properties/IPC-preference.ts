import { IpcMainEvent } from "electron";
import { IPCTerminal } from "../communication";
import { SharedProperties } from ".";
import { Config, Preferences } from "../preferences";

export function applyPreference(ipcTerminal: IPCTerminal) {
    return ipcTerminal
        .addListener("preference", (event: IpcMainEvent) => {
            SharedProperties.IPCTerminal.send("preference", Preferences.INSTANCE.Object);
        })
        .addListener("preference:update", (event: IpcMainEvent, update: Config) => {
            Preferences.INSTANCE.Object = update;
        });
        // .addListener("preference:boolean", (event: IpcMainEvent, update: boolean) => {
        // });
}
