import { Sprite } from "artistic-engine/sprite";

export class TempSprite extends Sprite {
    protected color: string;
    protected name: string;

    constructor(color: string, name: string) {
        super();
        this.color = color;
        this.name = name;
    }

    public onDraw(context: CanvasRenderingContext2D, delay: number): void {
        context.fillStyle = this.color;
        context.fillRect(0, 0, this.W, this.H);
        context.textBaseline = "top";
        context.fillStyle = "black";
        context.font = "15px serif";
        context.fillText(this.name, 2, 2);
    }
}