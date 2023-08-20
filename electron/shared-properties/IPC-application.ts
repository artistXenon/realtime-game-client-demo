import { IpcMainEvent, app } from "electron";
import { SharedProperties } from ".";
import { IPCTerminal } from "../communication";
import { Lobby } from "../application/lobby";
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
            const result = await lobby.join();
            if (result) {
                SharedProperties.IPCTerminal.send("join", result, 
                result ? {
                    id: SharedProperties.Lobby.ID
                } : {
                    err: (isPrivate && lobbyID === "") ? "can not create lobby" : "can not join lobby"
                });
            }
            // make join success response to renderer
        })
        .addListener("lobby:ready", (event: IpcMainEvent) => {
            SharedProperties.Lobby.onRendererReady();
        })
        .addListener("lobby:info", (event: IpcMainEvent) => {
            // this is called only once every lobby
            // TODO: replace with local fetch. send is handled internally
            SharedProperties.IPCTerminal.send("lobby:info", SharedProperties.Lobby.StateObject);
            // TODO: NO WAIT.
            // update everything on Lobby class
            // renderer will get object from Lobby class.
            // rendere will likely not request update.
            // Lobby class will listen to update through tcp
            // and update throuigh IPC to renderer

            // about UDP ...
        })
        .addListener("lobby:leave", (event: IpcMainEvent, id: string) => {
            SharedProperties.Lobby.destroy(id);
        })
        .addListener("app:exit", (event: IpcMainEvent, code: number) => {
            SharedProperties.Lobby.destroy();
            console.log("browser requested exit with code: " + code);
            app.quit();
        });
}