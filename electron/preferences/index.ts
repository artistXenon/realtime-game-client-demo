import fs from "fs";

const config_file = "./config.json";

export default class Preferences {
    public static readonly i = new Preferences();
    private constructor() {
        if (!fs.existsSync(config_file)) {
            return;
        }
        const raw_config = fs.readFileSync(config_file, "utf8");
        try {
            const { saveLogin, showName, localName } = JSON.parse(raw_config);
            this.saveLogin = saveLogin ?? true;
            this.showName = showName ?? true;
            this.localName = localName ?? "";
        } catch (ignore) {

        }
        
        // todo: search local files for json config

    }

    public saveLogin: boolean = true;

    public showName: boolean = true;

    public localName: string = "";


    // in pub or hidden name private match, player name will be taco 0000
    // where 0000 is last 4 digits of google ids

}