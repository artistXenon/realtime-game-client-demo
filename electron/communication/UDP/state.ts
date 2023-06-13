export default class State {
    constructor(uid: string, lobby: string) {
        this.UserId = uid;
        this.LobbyId = lobby;
    }

    // user info
    public UserId = "";
    public UserName = "Ailre";

    //lobby info
    public LobbyId = "";

    public get UserIDinHEX() {
        return BigInt(this.UserId).toString(16);
    }
}



//0x 06 5C 35 58 E5 37 B7 83 F3