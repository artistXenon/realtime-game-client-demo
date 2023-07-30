import { IPointerListener } from "artistic-engine/event/event_groups";
import { Sprite } from "artistic-engine/sprite";

export class TempPointerSprite extends Sprite implements IPointerListener {
    public PointerRegistered: boolean = true;
    public RecieveEventsOutOfBound: boolean = true;

    protected color: string;
    protected name: string;
    public onPointer: (e: PointerEvent) => boolean;

    constructor(color: string, name: string, onPointer: (e: PointerEvent) => boolean) {
        super();
        this.color = color;
        this.name = name;
        this.onPointer = onPointer;
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