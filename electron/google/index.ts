import fs from "fs";
import axios from "axios";
import { BrowserWindow, dialog } from "electron";
import { machineIdSync } from "node-machine-id";

import { encrypt } from "../crypto";

const credential_file = "./credential.json";


export default class GoogleCredential {
    private static instance: GoogleCredential;

    private static readonly match_host = "http://localhost:5002"; // ??

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

    public get isLocalTokenPrepared(): boolean {
        return this.id != null && this.local_token != null;
    }

    public get isValidated(): boolean {
        return this.isLocalTokenPrepared && this.session_key != null;
    }

    public promptLogin(win: BrowserWindow) {
        win.loadURL(GoogleCredential.URL);
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
            // todo: something is definitely wrong
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
            console.log(e);
            fs.unlinkSync(credential_file);
            return false;
        }
    }

    private async saveNewToken(id: string, session_key: string, mid: string) {
        const local_token = await encrypt(session_key, JSON.stringify({
            machine: mid,
            id: id
        }));
        fs.writeFileSync(credential_file, JSON.stringify({
            token: local_token,
            id: id
        }));
        this.local_token = local_token;
        this.id = id;
        this.session_key = session_key;
    }
}
