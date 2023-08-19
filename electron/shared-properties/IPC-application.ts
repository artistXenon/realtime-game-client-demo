import { IpcMainEvent, app } from "electron";
import { SharedProperties } from ".";
import { IPCTerminal, TCPTerminal } from "../communication";
import { Lobby } from "../application/lobby";
import { Preferences } from "../preferences";
import { applyPreference } from "./IPC-preference";

export function apply(ipcTerminal: IPCTerminal) {
    applyPreference(ipcTerminal)
        .addListener("boo", (a, b, c) => { // renderer to main
            console.log(c);
            setTimeout(() => SharedProperties.IPCTerminal.send("wah", c), 500); // main to renderer
        })
        .addListener("join", async (event: IpcMainEvent, isPrivate: boolean, lobbyID: string = "") => {
            // TODO: get error message from join attempt
            const lobby = await Lobby.GetLobby(isPrivate, lobbyID);
            if (lobby === undefined) {
                SharedProperties.IPCTerminal.send("join", false, 
                {
                    err: (isPrivate && lobbyID === "") ? "can not create lobby" : "can not join lobby"
                });  
                console.log("join failure: can not join/create lobby");
                return;
            }
            SharedProperties.Lobby = lobby; 
            await lobby.join();
            SharedProperties.IPCTerminal.send("join", true, {
                id: SharedProperties.Lobby.ID
            });
            // make join success response to renderer
        })
        .addListener("lobby:info", (event: IpcMainEvent, lobbyId: string) => {
            SharedProperties.TCPTerminal.send(TCPTerminal.COMMAND_LOBBY, Buffer.allocUnsafe(0));
            SharedProperties.TCPTerminal.listenTo(TCPTerminal.COMMAND_LOBBY, (e: Buffer) => {
                const obj = Lobby.parseLobbyJoin(e);
                // TODO: 
                SharedProperties.IPCTerminal.send("lobby:info", obj)
            });
        })
        .addListener("app:exit", (event: IpcMainEvent, code: number) => {
            console.log("browser requested exit with code: " + code);
            app.quit();
        });
}