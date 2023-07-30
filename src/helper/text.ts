import { Global } from "./global";

export function getTextWidth(text: string, font: string) {
    const ctx = Global.Engine.Context;    
    const tmpf = ctx.font;
    ctx.font = font;
    const textMeasure = ctx.measureText(text);
    ctx.font = tmpf;
    return textMeasure;
}
