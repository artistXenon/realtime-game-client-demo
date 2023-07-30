import { Sprite } from "artistic-engine/sprite";
import { ResolutionVector2D } from "../helper/engine/resolution-vector2D";

export class Prompt extends Sprite {

    protected window: Sprite;

    constructor(window: Sprite) {
        super();
        this.window = window;
        this.attachChildren(this.window);
        this.Dimension = ResolutionVector2D.baseVector;
    }

    public onDraw(context: CanvasRenderingContext2D, delay: number): void {
        // throw new Error("Method not implemented.");
    }
}
