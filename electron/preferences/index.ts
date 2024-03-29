import fs from "fs";
import { SharedProperties } from "../shared-properties";
import { Config } from "../../common/types";

const config_file = "./config.json";

export class Preferences {
    private object: Config = {
        saveLogin: true,
        showName: true,
        name: "",
        locale: "en"
        // localName: true// TODO: replace w/ blank string later
    };

    constructor() {
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
    }

    public get Object() {
        return this.object;
    }

    public set Object(v: Config) {
        const { 
            saveLogin, 
            showName, 
            name,
            locale
            // localName 
        } = v;
        this.object.saveLogin = saveLogin ?? true;
        if (!this.object.saveLogin) {
            SharedProperties.GoogleCredential?.clearCredential();
        }
        this.object.showName = showName ?? true;
        this.object.name = name ?? "";
        this.object.locale = locale ?? "en";
        // this.object.localName = localName ?? "";
    }
    // in pub or hidden name private match, player name will be taco 0000
    // where 0000 is last 4 digits of google ids
}