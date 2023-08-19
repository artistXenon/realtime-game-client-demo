// WARNING: keep this up to date with Config in main.
export interface Config {
    saveLogin: boolean;
    showName: boolean;
}

export class Preferences {
    private config: Config;
    constructor(v: Config) {
        this.config = v;
        this.onUpdate(v);
    }

    public onUpdate(v: Config) {
        console.log(v);
    }
}