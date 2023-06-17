import axios from "axios";
import { UDPTerminal } from "../communication";
import { GoogleCredential } from "../google";
import { SharedProperties } from "../shared-properties";
import { PingMeasurement } from "./ping";
import { generateHash } from "../crypto";

const LOBBY_ID_REGEX = /^[a-zA-Z0-9]{5}$/;

export class Lobby {
    private id: string;

    // game state
    // players
    // teams


    // lobby state
    private joined: boolean = false;
    // is waiting
    // is gaming
    // is game ended etc

    constructor(id: string) {
        const isValidLobbyID = LOBBY_ID_REGEX.test(id);
        if (!isValidLobbyID) throw new Error("Given lobby id is malformatted: ");
        this.id = id;
    }

    public get ID() {
        return this.id;
    }

    public join() {
        const buffer = Buffer.allocUnsafe(32);
        buffer.write(SharedProperties.Preferences.localName); // TODO: safely limit characters and length
        const joinListener = (command: Buffer, msg: Buffer) => {
            if (UDPTerminal.COMMAND_JOIN !== command.readUInt8()) return;
            if (this.isJoinSuccess(msg)) {
                const ping = new PingMeasurement(SharedProperties.UDPTerminal);
                ping.initPing(Infinity, 1000, 1);
            } else {
                SharedProperties.IPCTerminal.send("error", "Game has failed to join the match.");
            }
            SharedProperties.UDPTerminal.unlistenTo(UDPTerminal.EVENT_MESSAGE, joinListener);
        };
        SharedProperties.UDPTerminal.listenTo(UDPTerminal.EVENT_MESSAGE, joinListener);
        SharedProperties.UDPTerminal.send(UDPTerminal.COMMAND_JOIN, buffer);
    }

    private isJoinSuccess(msg: Buffer): boolean {
        this.joined = msg.readInt8() === 0x00;
        return this.joined;
    }

    public get isJoined() {
        return this.joined
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
            
            const { server, port, lobby } = data;
            if (server === undefined) return undefined;
            SharedProperties.createUDPTerminal(server, port);
            return new Lobby(lobby);
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