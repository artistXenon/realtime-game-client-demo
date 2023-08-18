import { Global } from "../helper/global";
import { LobbyState } from "../helper/type";

export class Lobby {
    private static lobby: Lobby = new Lobby("-1");
    
    public static createNew(id: string) {
        this.lobby.destroy();
        this.lobby = new Lobby(id);
    }

    private lobbyState: LobbyState | undefined;

    private constructor(id: string) {
        if (id === "-1") return;
        // ask for lobby state in IPC

        Global.GetLobbyData(id, (e, r: LobbyState) => {
            // reused to update players state.
            console.log(r);
        });

        // show players on lobby
        // hide join/create buttons
        // show lobby control buttons
    }

    private showLobby() {
        // TODO: load components to main scene.
        // players, states, names
        // if leader, show control. (kick, give lead, switch team,)
    }


    public destroy() {
        // etc etc
    }
}
