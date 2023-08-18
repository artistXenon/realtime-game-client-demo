import { Engine, FontBuilder } from "artistic-engine";
import { PointerEventGroup } from "artistic-engine/event";
import English from "../assets/translations/en.json";
import { IpcRendererEvent } from "electron/renderer";
import { LobbyState } from "./type";

export class Global {
    public static Engine: Engine;

    public static PointerEventGroup: PointerEventGroup;

    public static FontPoppin: FontBuilder;
    public static FontQuicksand: FontBuilder;
    public static FontVanilla: FontBuilder;

    public static Locale: string;

    private constructor() {}

    public static Exit(code: number = 0) {
        (<any>window).electronIPC.exit(code);
    }

    public static JoinMatch(isPrivate: boolean, matchID: string | undefined, onResult: (e: IpcRendererEvent, success: boolean, err: string) => void) {
        (<any>window).electronIPC.joinMatch(isPrivate, matchID);
        (<any>window).electronIPC.joinResult(onResult);
    }

    public static createMatch() {
        // TODO: create preload interface and connect to crt-prv
    }

    public static GetLobbyData(matchID: string, c: (e: IpcRendererEvent, result: LobbyState) => void) {
        (<any>window).electronIPC.getLobbyData(matchID, c);
    }

    public static getString(key: string, ...args: string[]) {
        let template: string;
        switch (Global.Locale) {
    
            case "english": 
            default: 
                template = (<any>English)[key];
                if (template === undefined) return "!ERROR!";
        }
        for (let i = 0; i < args.length; i++) {
            const component = args[i];
            const handle = "$" + i;
            const idx = template.indexOf(handle);
            if (idx === -1) continue;
            template = template.replaceAll(handle, component);
        }
        return template;
    }
}