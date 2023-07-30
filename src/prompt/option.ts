import { Vector } from "artistic-engine";
import { Prompt } from "./prompt";
import { ResolutionVector2D } from "../helper/engine/resolution-vector2D";
import { Rectangle } from "artistic-engine/sprite";
import { IPointerListener } from "artistic-engine/event";
import { Global } from "../helper/global";
import { OptionItem } from "../sprites/option/option-item";

export class OptionPrompt extends Prompt implements IPointerListener {
    public PointerRegistered: boolean = true;
    public RecieveEventsOutOfBound: boolean = true;

    constructor() {
        super(new Rectangle());
        
        (<Rectangle>this.window).FillStyle = "#666";
        this.window.Position = new ResolutionVector2D(96, 54);
        this.window.Dimension = new ResolutionVector2D(1728, 972);       

        const items = [
            new OptionItem("option1"),
            new OptionItem("option2"),
            new OptionItem("option3"),
            new OptionItem("option4"),
            new OptionItem("option5"),
            new OptionItem("option6"),
            new OptionItem("option7"),
            new OptionItem("option8")
        ];
        const dim = new ResolutionVector2D(819, 160);
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            item.Dimension = dim;
            item.Position = new ResolutionVector2D(
                i % 2 === 0 ? 30 : 879,
                30 + Math.floor(i / 2) * 190
            );      
            this.window.attachChildren(item);
            Global.PointerEventGroup.registerPointerListener(item);
        }

        const exit = new OptionItem("exit", (e: PointerEvent) => {
            for (const item of items) {
                Global.PointerEventGroup.unregisterPointerListener(item);
            }
            Global.PointerEventGroup.unregisterPointerListener(this);
            Global.PointerEventGroup.unregisterPointerListener(exit);
            this.Parent!.detachChildren(this);
            return true;
        });
        exit.Dimension = dim;
        exit.Position = new ResolutionVector2D(
            455, 790
        );

        this.window.attachChildren(
            items
        );
        this.window.attachChildren(exit);
        Global.PointerEventGroup.registerPointerListener(this);
        Global.PointerEventGroup.registerPointerListener(exit);
        // Global.PointerEventGroup.registerPointerListener();
    }

    public onPointer(e: PointerEvent): boolean {
        return true;
    }

    public onDraw(context: CanvasRenderingContext2D, delay: number): void {
        context.globalAlpha = 0.6;
        context.fillStyle = "black";
        context.fillRect(0, 0, this.W, this.H);
        // throw new Error("Method not implemented.");
    }
}
