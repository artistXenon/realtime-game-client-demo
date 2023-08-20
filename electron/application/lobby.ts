import axios from "axios";
import { GoogleCredential } from "../google";
import { SharedProperties } from "../shared-properties";
import { generateHash } from "../crypto";
import { PingApp } from "./ping";
import { LobbyState, PlayerState } from "../../common/types";
import { TCPTerminal } from "../communication";

const LOBBY_ID_REGEX = /^[a-zA-Z0-9]{5}$/;

const UPDATE_FLAG_INFO = 0;
const UPDATE_FLAG_GAME = 1;
export class Lobby {
    private id: string;

    private isPrivate: boolean;

    private state: number = 1;
    // game state
    // players
    private players: PlayerState[] = [];
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
        // TODO: player 1 is me
    }

    public get StateObject() {
        return {
            id: this.id,
            private: this.isPrivate,
            state: this.state,
            players: this.players
        };
    }

    public get ID() {
        return this.id;
    }

    public get isJoined() {
        return this.joined
    }

    public async join() {
        const result = await SharedProperties.TCPTerminal.join();
        if (!result) {
            return false;
        }
        
        const ping = new PingApp();
        ping.initPing(200);
        this.attachTCPListeners(SharedProperties.TCPTerminal);
        this.joined = true;
        return true;
    }

    public onRendererReady() {
        SharedProperties.TCPTerminal.send(TCPTerminal.COMMAND_LOBBY, Buffer.allocUnsafe(0));
    }

    public onUpdate(e: Buffer, updateFlag: number) {
        switch (updateFlag) {
            case UPDATE_FLAG_INFO: 
                const lobby = Lobby.parseLobbyJoin(e);
                this.players = lobby.players;
                this.state = lobby.state;
                SharedProperties.IPCTerminal.send("lobby:info", lobby);
                break;
            default:
        }
    }

    public destroy(id?: string) {
        if (this.id !== id && id !== undefined) return;
        if (this.joined) {
            SharedProperties.TCPTerminal.send(TCPTerminal.COMMAND_LEAVE, Buffer.allocUnsafe(0));
            this.joined = false;
        }
        
        SharedProperties.TCPTerminal.doDestroy();
    }

    private attachTCPListeners(t: TCPTerminal) {
        t.listenTo(TCPTerminal.COMMAND_LOBBY, (e: Buffer) => {
            this.onUpdate(e, UPDATE_FLAG_INFO);
        })
        .listenTo(TCPTerminal.COMMAND_LEAVE, (e: Buffer) => {
            const code = e.readInt8();
            switch (code) {
                case 0:
                    // we requested to leave.
                    break;
                case 1: 
                    // we are kicked from lobby
                    break;
                case 2: 
                    // we had connection issue
                    break;
            }
            // TODO: destroy this lobby lobby
            // SharedProperties.Lobby.Destroy()
            // SharedProperties.Lobby = undefined;
            SharedProperties.IPCTerminal.send("lobby:leave", code);
        });
    }

    public static async GetLobby(prv: boolean, lobbyId: string) {
        try {
            if (SharedProperties.Lobby?.ID !== lobbyId && SharedProperties.Lobby?.isJoined) {
                SharedProperties.Lobby.destroy();
            }
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

    private static parseLobbyJoin(b: Buffer): LobbyState {
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