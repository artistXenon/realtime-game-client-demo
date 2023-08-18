import { Sprite } from "artistic-engine/sprite";
import { ResolutionVector2D } from "../helper/engine/resolution-vector2D";
import { IPointerListener } from "artistic-engine/event";

export abstract class Prompt extends Sprite implements IPointerListener {
    public get PointerRegistered() {
        return this.Parent !== undefined;
    }
    public RecieveEventsOutOfBound: boolean = true;

    protected window: Sprite;

    constructor(window: Sprite) {
        super();
        this.window = window;
        this.attachChildren(this.window);
        this.Dimension = ResolutionVector2D.baseVector;
    }

    public onPointer(e: PointerEvent): boolean {
        if (e.type !== "pointerdown") return true;
        const xDiff = e.x - this.window.X;
        const yDiff = e.y - this.window.Y;
        if (
            xDiff < 0 || xDiff > this.window.W ||
            yDiff < 0 || yDiff > this.window.H
        ) {
            this.onDestroy();
        }
        return true;
    }

    public onDraw(context: CanvasRenderingContext2D, delay: number): void {
        context.globalAlpha = 0.6;
        context.fillStyle = "black";
        context.fillRect(0, 0, this.W, this.H);
        // throw new Error("Method not implemented.");
    }

    public abstract onDestroy(): void; 
}
