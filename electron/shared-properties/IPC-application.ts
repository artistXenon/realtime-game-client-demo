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
            // this is called only once every lobby
                SharedProperties.TCPTerminal.listenTo(TCPTerminal.COMMAND_LOBBY, (e: Buffer) => {
                    const obj = Lobby.parseLobbyJoin(e);
                    // TODO: update local lobby. do i have to?
                    SharedProperties.Lobby.onUpdate(obj);
                    SharedProperties.IPCTerminal.send("lobby:info", obj);
                });
            // TODO: NO WAIT. this shouldnt be here. 
            // update everything on Lobby class
            // renderer will get object from Lobby class.
            // rendere will likely not request update.
            // Lobby class will listen to update through tcp
            // and update throuigh IPC to renderer

            // about UDP ...


            SharedProperties.TCPTerminal.send(TCPTerminal.COMMAND_LOBBY, Buffer.allocUnsafe(0));
        })
        .addListener("lobby:leave", (event: IpcMainEvent) => {
            try {
                SharedProperties.TCPTerminal.listenTo(TCPTerminal.COMMAND_LEAVE, (e: Buffer) => {
                    const code = e.readInt8();
                    // TODO: destroy local lobby
                    SharedProperties.IPCTerminal.send("lobby:leave", code);
                });
            } catch (ignore) { }
            SharedProperties.TCPTerminal.send(TCPTerminal.COMMAND_LEAVE, Buffer.allocUnsafe(0));
        })
        .addListener("app:exit", (event: IpcMainEvent, code: number) => {
            console.log("browser requested exit with code: " + code);
            app.quit();
        });
}