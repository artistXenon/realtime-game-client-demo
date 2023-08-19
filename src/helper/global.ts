import { Engine, FontBuilder } from "artistic-engine";
import { PointerEventGroup } from "artistic-engine/event";
import English from "../assets/translations/en.json";
import { IpcRendererEvent } from "electron/renderer";
import { LobbyState } from "./type";
import { Config, Preferences } from "./preference";

export class Global {
    public static Engine: Engine;

    public static preferences: Preferences;

    public static PointerEventGroup: PointerEventGroup;

    public static FontPoppin: FontBuilder;
    public static FontQuicksand: FontBuilder;
    public static FontVanilla: FontBuilder;

    public static Locale: string;

    private constructor() {}

    public static Exit(code: number = 0) {
        (<any>window).electronIPC.exit(code);
    }

    public static JoinLobby(isPrivate: boolean, lobbyID: string | undefined, onResult: (e: IpcRendererEvent, success: boolean, err: string) => void) {
        (<any>window).electronIPC.joinLobby(isPrivate, lobbyID);
        (<any>window).electronIPC.joinResult(onResult);
    }

    public static GetLobbyData(matchID: string, c: (e: IpcRendererEvent, result: LobbyState) => void) {
        (<any>window).electronIPC.listenToLobby(c);
        (<any>window).electronIPC.getLobbyData(matchID);
    }

    public static initPreferences() {
        (<any>window).electronIPC.listenToPreference((e: IpcRendererEvent, r: Config) => {
            if (Global.preferences == null) {
                Global.preferences = new Preferences(r);
            } else {
                Global.preferences.onUpdate(r);
            }
        });
        (<any>window).electronIPC.getPreference();
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