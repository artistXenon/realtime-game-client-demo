import fs from "fs";

const config_file = "./config.json";

export interface Config {
    saveLogin: boolean;
    showName: boolean;
    locale: string;
}

export class Preferences {
    private static preferences: Preferences;

    public static get INSTANCE() {
        if (Preferences.preferences == null) {
            Preferences.preferences = new Preferences();
        }
        return Preferences.preferences;
    }

    private object: Config = {
        saveLogin: true,
        showName: true,
        locale: "en"
        // localName: true// TODO: replace w/ blank string later
    };

    private constructor() {
        let json;
        try {
            let raw_config;
            if (!fs.existsSync(config_file)) {
                raw_config = "{}";
            } else {
                raw_config = fs.readFileSync(config_file, "utf8");
            }
            json = JSON.parse(raw_config);
        } catch (ignore) { 
            json = {};
        }
        
        this.Object = json;

        fs.writeFileSync(config_file, JSON.stringify(this.object), "utf8");
        // todo: search local files for json config

    }

    public get Object() {
        return this.object;
    }

    public set Object(v: Config) {
        const { 
            saveLogin, 
            showName, 
            locale
            // localName 
        } = v;
        this.object.saveLogin = saveLogin ?? true;
        this.object.showName = showName ?? true;
        this.object.locale = locale ?? "en";
        // this.object.localName = localName ?? "";
    }


    // in pub or hidden name private match, player name will be taco 0000
    // where 0000 is last 4 digits of google ids

}