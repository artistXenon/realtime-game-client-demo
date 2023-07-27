import { Sprite } from "artistic-engine/sprite";

export class TempSprite extends Sprite {
    private color: string;
    private name: string;

    constructor(color: string, name: string) {
        super();
        this.color = color;
        this.name = name;
    }

    public onDraw(context: CanvasRenderingContext2D, delay: number): void {
        context.fillStyle = this.color;
        context.fillRect(0, 0, this.W, this.H);
        context.fillStyle = "black";
        context.font = "5px serif";
        context.fillText(this.name, 2, 2);
    }
}