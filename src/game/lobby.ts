import { Global } from "../helper/global";
import { LobbyState } from "../../common/types";
import { MainScene } from "../scenes/main";

export class Lobby {
    private static lobby: Lobby = new Lobby("-1");
    
    public static createNew(id: string) {
        Lobby.lobby.leave();
        Lobby.lobby = new Lobby(id);
        // TODO: tell main we are ready to accept lobby informations
    }

    public static get INSTANCE(): Lobby {
        return Lobby.lobby;
    }

    private id: string;
    private lobbyState: LobbyState | undefined;

    private constructor(id: string) {
        this.id = id;
        if (id === "-1") return;
        // ask for lobby state in IPC

        Global.ListenToLobby(
            (e, r: LobbyState) => {
                this.onLobbyUpdate(r);
            }, 
            () => {/* onLeave */}
        );// this will also tell main we are ready


        // show players on lobby
        // hide join/create buttons
        // show lobby control buttons
    }

    public get ID() {
        return this.id;
    }

    public get Players() {
        return this.lobbyState?.players;
    }

    private showLobby() {
        // TODO: load components to main scene.
        // players, states, names
        // if leader, show control. (kick, give lead, switch team,)
    }

    private onLobbyUpdate(r: LobbyState) {
        console.log(r);
        MainScene.INSTANCE.updatePlayers();
    }


    public leave() {
        if (this.id === "-1") return;
        // TODO
        // send server we are leaving
        Global.LeaveLobby(this.id);
        // naviate to main scene with menu level 1
        // etc etc
        this.lobbyState = undefined;
    }
}
