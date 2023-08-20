import { Config } from "../../common/types";
import { Global } from "./global";

export class Preferences {
    private config: Config;

    constructor(v: Config) {
        this.config = v;
        this.onUpdate(v);
    }

    public get Locale() {
        return this.config.locale;
    }

    public get SaveLogin() {
        return this.config.saveLogin;
    }

    public get Name() {
        return this.config.name;
    }
    
    public set Locale(v: string) {
        this.config.locale = v;
        this.doUpdate();
    }

    public set SaveLogin(v: boolean) {
        this.config.saveLogin = v;
        this.doUpdate();
    }

    public set Name(v: string) {
        this.config.name = v;
        this.doUpdate();
    }

    public onUpdate(v: Config) {
        this.config = v;
    }

    private doUpdate() {
        Global.updatePreferences(this.config);
    }
}