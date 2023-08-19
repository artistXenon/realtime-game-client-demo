import { Global } from "./global";

// WARNING: keep this up to date with Config in main.
export interface Config {
    saveLogin: boolean;
    showName: boolean;
    locale: string;
}

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
    
    public set Locale(v: string) {
        this.config.locale = v;
        this.doUpdate();
    }
    
    public set SaveLogin(v: boolean) {
        this.config.saveLogin = v;
        this.doUpdate();
    }



    public onUpdate(v: Config) {
        this.config = v;
        console.log(v);
    }

    private doUpdate() {
        Global.updatePreferences(this.config);
    }
}