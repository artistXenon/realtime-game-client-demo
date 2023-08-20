import { Engine, FontBuilder } from "artistic-engine";
import { PointerEventGroup } from "artistic-engine/event";
import English from "../assets/translations/en.json";
import { IpcRendererEvent } from "electron/renderer";
import { Config, LobbyState } from "../../common/types";
import { Preferences } from "./preference";

export class Global {
    public static Engine: Engine;

    public static preferences: Preferences;

    public static PointerEventGroup: PointerEventGroup;

    public static FontPoppin: FontBuilder;
    public static FontQuicksand: FontBuilder;
    public static FontVanilla: FontBuilder;

    private constructor() {}

    public static Exit(code: number = 0) {
        (<any>window).electronIPC.exit(code);
    }

    public static JoinLobby(isPrivate: boolean, lobbyID: string | undefined, onResult: (e: IpcRendererEvent, success: boolean, err: string) => void) {
        (<any>window).electronIPC.joinResult(onResult);
        (<any>window).electronIPC.joinLobby(isPrivate, lobbyID);
    }

    public static ListenToLobby(
        onInfo: (e: IpcRendererEvent, result: LobbyState) => void,
        onLeave: (e: IpcRendererEvent, code: number) => void) {
        (<any>window).electronIPC.listenToLobby(onInfo, onLeave);
    }

    public static GetLobbyData() {
        (<any>window).electronIPC.getLobby();
    }

    public static LeaveLobby(id: string) {
        (<any>window).electronIPC.leaveLobby(id);
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

    public static updatePreferences(c: Config) {
        (<any>window).electronIPC.updatePreference(c);
    }

    public static getString(key: string, ...args: string[]) {
        let template: string;
        switch (this.preferences.Locale) {
            case "en": 
            default: 
                template = (<any>English)[key];
                if (template === undefined) return "!LOCALE ERROR!";
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