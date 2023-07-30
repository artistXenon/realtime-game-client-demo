import fs from "fs";
import axios from "axios";
import { BrowserWindow, dialog } from "electron";
import { machineIdSync } from "node-machine-id";

import { encrypt } from "../crypto";

const credential_file = "./credential.json";


export class GoogleCredential {
    private static instance: GoogleCredential;

    public static readonly match_host = "http://localhost:5002"; // TODO: move to somewhere else as a config??

    private static readonly token_endpoint = GoogleCredential.match_host + "/token"; // ??

    public static readonly code_endpoint = GoogleCredential.match_host + "/code"; // ??

    public static readonly URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=814596136620-kqu7ub1cjckd7e8neqq7rio02isnbl8a.apps.googleusercontent.com&redirect_uri=${this.code_endpoint}&response_type=code&scope=openid&access_type=offline`;

    private id: string | undefined;

    private local_token: string | undefined;

    private session_key: string | undefined;

    constructor() {
        if (GoogleCredential.instance != null) {
            throw new Error("GoogleCredential instance already initiated");
        }
        GoogleCredential.instance = this;
        if (!fs.existsSync(credential_file)) {
            return;
        }
        const raw_credential = fs.readFileSync(credential_file, "utf8");
        try {
            const { id, token } = JSON.parse(raw_credential);    
            this.id = id;
            this.local_token = token;
        } catch (ignore) {
            fs.unlinkSync(credential_file);
        }
    }

    public get ID() {
        return this.id;
    }

    public get SessionKey() {
        return this.session_key;
    }

    public get isLocalTokenPrepared(): boolean {
        return this.id != null && this.local_token != null;
    }

    public get isValidated(): boolean {
        return this.isLocalTokenPrepared && this.session_key != null;
    }

    public promptLogin(win: BrowserWindow) {
        win.loadURL(GoogleCredential.URL, {});
    }

    public async onCode(event: Electron.Event, url: string, win: BrowserWindow): Promise<boolean> { // is google redirection so we used it
        try {
            const { data } = await axios({
                method: 'post',
                url,
            });
            const { id, session_key } = data;
            const mid = machineIdSync();
            await this.saveNewToken(id, session_key, mid);
            return true;
        } catch (ignore) {
            if (true) return true; // DOTO: DEV MODE ONLY
            if (fs.existsSync(credential_file)) {
                fs.unlinkSync(credential_file);
            }
            // this.app.quit();
            dialog.showMessageBox(win, {
                title: 'Login error',
                message: 'Game has failed to log in with the google account.',
                detail: 'Please try again later or with a different account.',
            });
            return false;
        }
    }

    public async refreshLocalToken(): Promise<boolean> {
        try {
            const mid = machineIdSync();
            const { data } = await axios({
                method: 'post',
                url: GoogleCredential.token_endpoint,
                data: {
                    token: this.local_token,
                    id: this.id,
                    machine: mid
                }
            });
            const { id, session_key } = data;
            await this.saveNewToken(id, session_key, mid);
            return true;
        } catch(e) {
            const error_code = (<any>e).response?.status;
            if (error_code == null) {
                // this is axios
                console.log((<any>e).response);
            }
            fs.unlinkSync(credential_file);
            return false;
        }
    }

    private async saveNewToken(id: string, session_key: string, machine: string) {
        const token = await encrypt(session_key, JSON.stringify({ machine, id }));
        fs.writeFileSync(credential_file, JSON.stringify({ token, id }));
        this.local_token = token;
        this.id = id;
        this.session_key = session_key;
    }

    public static isGoogleAccountDomain(url: string): boolean {
        // https://accounts.google.com/
        const TLDs = [
            "com",      "ad",       "ae",       "com.af",   "com.ag",   "al",       "am",       "co.ao", 
            "com.ar",   "as",       "at",       "com.au",   "az",       "ba",       "com.bd",   "be", 
            "bs",       "bt",       "co.bw",    "by",       "com.bz",   "ca",       "cd",       "cf", 
            "bf",       "bg",       "com.bh",   "bi",       "bj",       "com.bn",   "com.bo",   "com.br", 
            "cg",       "ch",       "ci",       "co.ck",    "cl",       "cm",       "cn",       "com.co", 
            "co.cr",    "com.cu",   "cv",       "com.cy",   "cz",       "de",       "dj",       "dk", 
            "ee",       "com.fj",   "fm",       "fr",       "ga",       "ge",       "gg",       "com.gh",   
            "dm",       "com.eg",   "es",       "com.et",   "fi",       "com.do",   "dz",       "com.ec",   
            "com.gi",   "gl",       "gm",       "gr",       "com.gt",   "gy",       "com.hk",   "hn",       
            "hr",       "ht",       "hu",       "co.id",    "ie",       "co.il",    "im",       "co.in", 
            "iq",       "is",       "it",       "je",       "com.jm",   "jo",       "co.jp",    "co.ke",       
            "com.kh",   "ki",       "kg",       "co.kr",    "com.kw",   "kz",       "la",       "com.lb", 
            "li",       "lk",       "co.ls",    "lt",       "lu",       "lv",       "com.ly",   "co.ma", 
            "md",       "me",       "mg",       "mk",       "ml",       "com.mm",   "mn",       "com.mt", 
            "mu",       "mv",       "mw",       "com.mx",   "com.my",   "co.mz",    "com.na",   "com.ng", 
            "com.ni",   "ne",       "nl",       "no",       "com.np",   "nr",       "nu",       "co.nz", 
            "com.om",   "com.pa",   "com.pe",   "com.pg",   "com.ph",   "com.pk",   "pl",       "pn", 
            "com.pr",   "ps",       "pt",       "com.py",   "com.qa",   "ro",       "ru",       "rw", 
            "com.sa",   "com.sb",   "sc",       "se",       "com.sg",   "sh",       "si",       "sk", 
            "com.sl",   "sn",       "so",       "sm",       "sr",       "st",       "com.sv",   "td", 
            "tg",       "co.th",    "com.tj",   "tl",       "tm",       "tn",       "to",       "com.tr", 
            "tt",       "com.tw",   "co.tz",    "com.ua",   "co.ug",    "co.uk",    "com.uy",   "co.uz", 
            "com.vc",   "co.ve",    "co.vi",    "com.vn",   "vu",       "ws",       "rs",       "co.za", 
            "co.zm",    "co.zw",    "cat"
        ];
        for (const TLD of TLDs) {
            const googleAccounts = `https://accounts.google.${TLD}/`;
            if (url.startsWith(googleAccounts)) return true;
            const youtubeAccounts = `https://accounts.youtube.${TLD}/`;
            if (url.startsWith(youtubeAccounts)) return true;
        }
        return false;
    }
}
