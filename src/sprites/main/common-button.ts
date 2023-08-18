import { IPointerListener } from "artistic-engine/event/event_groups";
import { ResolutionVector2D } from "../../helper/engine/resolution-vector2D";
import { TempSprite } from "../temp-sprite";
import { onClick } from "../../helper/engine/pointer-processor";
import { OptionPrompt } from "../../prompt/option";
import { ExitPrompt } from "../../prompt/exit";
import { Vector } from "artistic-engine";


export class CommonButton extends TempSprite implements IPointerListener {
    public PointerRegistered: boolean = true;

    public RecieveEventsOutOfBound: boolean = false;

    public onPointer: (e: PointerEvent) => boolean;

    constructor(color: string, name: string, idx: number) {
        super(color, name);
        const 
            LEFT_PAD = 15,
            INNER_GAP = 10,
            TOP_PAD = 15,
            WIDTH = 50,
            HEIGHT = 50;
        this.Dimension = new Vector.Vector2D(WIDTH, HEIGHT);
        // new ResolutionVector2D(
        //     WIDTH,
        //     HEIGHT
        // );
        this.Position = new Vector.Vector2D(
            LEFT_PAD + idx * (WIDTH + INNER_GAP),
            TOP_PAD
        );

        this.onPointer = onClick(() => {
            switch(idx) {
                case 0:
                    this.Parent!.attachChildren(new OptionPrompt());
                    break;
                case 1:
                    this.Parent!.attachChildren(new ExitPrompt());
                    break;
                case 2:
                    break;
                case 3:
                    // TODO: may be exit animation etc
                    
            }
        }, () => true);
    }
}
