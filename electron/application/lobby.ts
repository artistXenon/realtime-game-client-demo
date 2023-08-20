import axios from "axios";
import { GoogleCredential } from "../google";
import { SharedProperties } from "../shared-properties";
import { generateHash } from "../crypto";
import { PingApp } from "./ping";
import { LobbyState } from "../../common/types";

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

    public onUpdate(state: LobbyState) {
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

    public static parseLobbyJoin(b: Buffer) {
        const state = b.readInt8();
        const playerBuffers = [
            b.subarray(1, 26),
            b.subarray(26, 51),
            b.subarray(51, 76),
            b.subarray(76, 101)
        ];
        const players = [];
        for (const playerBuffer of playerBuffers) {
            const playerState = playerBuffer.readInt8();
            if ((playerState & 0b1000_0000) === 0) continue;
            // const ready = (playerState & 0b0100_0000) !== 0;
            const leader = (playerState & 0b0010_0000) !== 0;
            const me = (playerState & 0b0001_0000) !== 0;

            const team = playerBuffer.readInt8(1);
            const name = playerBuffer.subarray(2, 18).toString().replaceAll("\x00", "");
            const id = playerBuffer.subarray(18, 23).toString();
            const character = playerBuffer.readInt16BE(23);
            players.push({
                id, name, team, me, leader, character
            });
        }
        return {
            id: SharedProperties.Lobby.ID,
            private: SharedProperties.Lobby.isPrivate,
            state, players
        };
    }
}