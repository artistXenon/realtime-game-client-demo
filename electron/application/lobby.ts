import axios from "axios";
import { GoogleCredential } from "../google";
import { SharedProperties } from "../shared-properties";
import { generateHash } from "../crypto";
import { PingApp } from "./ping";

const LOBBY_ID_REGEX = /^[a-zA-Z0-9]{5}$/;

export class Lobby {
    private id: string;

    private isPrivate: boolean;

    private state: number = 1;
    // game state
    // players
    // teams

    // lobby state
    private joined: boolean = false;
    // is waiting
    // is gaming
    // is game ended etc

    constructor(id: string, prv: boolean) {
        const isValidLobbyID = LOBBY_ID_REGEX.test(id);
        if (!isValidLobbyID) throw new Error("given lobby id is malformatted: " + id);
        this.id = id;
        this.isPrivate = prv;
    }

    public get ID() {
        return this.id;
    }

    public get isJoined() {
        return this.joined
    }

    public async join() {
        await SharedProperties.TCPTerminal.join();
        
        const ping = new PingApp();
        ping.initPing(200);
        // TODO: // ask for lobby. wait for response
        // SharedProperties.TCPTerminal.send(); 
        // SharedProperties.TCPTerminal.listenTo()
        // update lobby to renderer
        // this.onUpdate();
    }

    public onUpdate() {
        // SharedProperties.IPCTerminal.send("lobby", this);
        console.log(this);
    }

    public static async GetLobby(prv: boolean, lobbyId: string) {
        try {
            if (!SharedProperties.GoogleCredential.isValidated) return;
            const userId = SharedProperties.GoogleCredential.ID!;
            const hashPayloads = [ userId, String(prv) ];
            if (lobbyId !== "") hashPayloads.push(lobbyId);
            const { data } = await axios({
                method: 'post',
                url: `${GoogleCredential.match_host}/join?private=${prv}&lobby=${lobbyId}`,
                data: {
                    id: userId,
                    hash: generateHash(hashPayloads)
                }
            });

            const { server, tcp, udp, lobby } = data;
            if (server === undefined) return undefined;
            SharedProperties.createUDPTerminal(server, udp);
            SharedProperties.createTCPTerminal(server, tcp);
            return new Lobby(lobby, prv);
        } catch (e) {
            const error_code = (<any>e).response?.status;
            // this is axios
            if (error_code != null) {
                console.log((<any>e).response);
            } else console.log(e);
            return undefined;
        }
    }
}