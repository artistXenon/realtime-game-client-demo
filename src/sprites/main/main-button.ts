import { IPointerListener } from "artistic-engine/event/event_groups";
import { ResolutionVector2D } from "../../helper/engine/resolution-vector2D";
import { TempSprite } from "../temp-sprite";
import { Global } from "../../helper/global";
import { OptionPrompt } from "../../prompt/option";
import { Vector } from "artistic-engine";


export class MainButton extends TempSprite implements IPointerListener {
    public PointerRegistered: boolean = true;

    public RecieveEventsOutOfBound: boolean = false;

    private pointerId: number = -1;

    constructor(color: string, name: string, idx: number) {
        super(color, name);
        const 
            OUTER_PAD = 70,
            INNER_GAP = 50,
            LOWER_PAD = 50,
            WIDTH = (1920 - 2 * OUTER_PAD - 3 * INNER_GAP) / 4,
            HEIGHT = 120;
        this.Dimension = new ResolutionVector2D(
            WIDTH,
            HEIGHT
        );
        this.Position = new ResolutionVector2D(
            OUTER_PAD + idx * (WIDTH + INNER_GAP),
            1080 - LOWER_PAD - HEIGHT
        );

        this.onPointer = (e: PointerEvent) => {
            if (e.type === "pointerdown") {
                this.pointerId = e.pointerId;
            } else if (e.type === "pointerup") {
                if (this.pointerId === e.pointerId) {                    
                    switch(idx) {
                        case 0:
                            break;
                        case 1:
                            break;
                        case 2:
                            this.Parent!.attachChildren(new OptionPrompt());
                            break;
                        case 3:
                            // TODO: may be exit animation etc
                            Global.Exit();
                    }
                }
            }
            return true;
        };
    }

    public onPointer(e: PointerEvent): boolean { return false; }
}
