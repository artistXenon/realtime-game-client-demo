import { IpcMainEvent } from "electron";
import { IPCTerminal } from "../communication";
import { SharedProperties } from ".";
import { Config } from "../../common/types";

export function applyPreference(ipcTerminal: IPCTerminal) {
    return ipcTerminal
        .addListener("preference", (event: IpcMainEvent) => {
            SharedProperties.IPCTerminal.send("preference", SharedProperties.Preferences.Object);
        })
        .addListener("preference:update", (event: IpcMainEvent, update: Config) => {
            SharedProperties.Preferences.Object = update;
        });
        // .addListener("preference:boolean", (event: IpcMainEvent, update: boolean) => {
        // });
}
