import { BrowserWindow } from "electron";

export class SharedProperties {
  private constructor() {}

  public static BrowserWindow: BrowserWindow;
}