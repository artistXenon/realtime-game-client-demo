import { BrowserWindow, WebContents } from "electron";
import { GoogleCredential } from "../google";
import { IPCTerminal, UDPTerminal, TCPTerminal } from "../communication";
import { Lobby } from "../application/lobby";
import { apply } from "./IPC-application";
import { Preferences } from "../preferences";

export class SharedProperties {
  private constructor() {}

  private static preferences: Preferences;

  private static googleCredential: GoogleCredential;

  public static BrowserWindow: BrowserWindow;

  private static tcpTerminal: TCPTerminal;

  private static udpTerminal: UDPTerminal;

  private static ipcTerminal: IPCTerminal;

  private static lobby: Lobby;

  public static get Lobby() {
    return this.lobby;
  }

  public static get Preferences() {
    return this.preferences;
  }

  public static get GoogleCredential() {
    return this.googleCredential;
  }
  
  public static get TCPTerminal() {
    return this.tcpTerminal;
  }

  public static get UDPTerminal() {
    return this.udpTerminal;
  }
  
  public static get IPCTerminal() {
    return this.ipcTerminal;
  }  

  public static get UserIDBuffer() {
    if (!this.googleCredential.isValidated) return undefined;
    const id = this.googleCredential.ID!;
    const buf = Buffer.allocUnsafe(10);
    let hex = BigInt(id).toString(16);
    while (hex.length < 20) {
      hex = '0' + hex;
    }
    buf.write(hex, "hex");
    return buf
  }
  
  public static get SessionKey() {
    if (!this.googleCredential.isValidated) return undefined;
    return Buffer.from(this.googleCredential.SessionKey!);
  }

  public static set Preferences(v: Preferences) {
    this.preferences = v;
  }

  public static set GoogleCredential(v: GoogleCredential) {
    this.googleCredential = v;
  }

  public static set Lobby(lobby: Lobby) {
    this.lobby = lobby;
  }

  public static createTCPTerminal(address: string, port: number) {
    this.tcpTerminal = new TCPTerminal(address, port);
    return this.tcpTerminal;
  }

  public static createUDPTerminal(address: string, port: number) {
    if (this.udpTerminal != null && false) {
      try {
        const prevRemote = this.udpTerminal.connection.remoteAddress()
        if (prevRemote.address === address && prevRemote.port === port) {
          return this.udpTerminal;
        }
      } catch (_) {}
    }
    this.udpTerminal = new UDPTerminal(address, port);
    return this.udpTerminal;
  }

  public static createIPCTerminal(web: WebContents): IPCTerminal {
    this.ipcTerminal = new IPCTerminal(web);
    apply(this.ipcTerminal);
    return this.ipcTerminal;
  }
}