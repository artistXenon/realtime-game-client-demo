import { IPointerListener } from "artistic-engine/event/event_groups";
import { ResolutionVector2D } from "../../helper/engine/resolution-vector2D";
import { TempSprite } from "../temp-sprite";
import { Global } from "../../helper/global";
import { JoinPrivatePrompt } from "../../prompt/join-prv";
import { CreatePrivatePrompt } from "../../prompt/crt-prv";
import { onClick } from "../../helper/engine/pointer-processor";
import { MainScene } from "../../scenes/main";
import { OptionPrompt } from "../../prompt/option";


export class SubButton extends TempSprite implements IPointerListener {
    public PointerRegistered: boolean = true;

    public RecieveEventsOutOfBound: boolean = false;


    constructor(color: string, name: string, idx: number) {
        super(color, name);
        const 
            LEFT_PAD = 30,
            INNER_GAP = 20,
            TOP_PAD = 30,
            WIDTH = 80,
            HEIGHT = 80;
        this.Dimension = new ResolutionVector2D(
            WIDTH,
            HEIGHT
        );
        this.Position = new ResolutionVector2D(
            LEFT_PAD + idx * (WIDTH + INNER_GAP),
            TOP_PAD
        );

        this.onPointer = onClick(() => {
            switch(idx) {
                case 0:
                    this.Parent!.attachChildren(new OptionPrompt());
                    break;
                case 1:
                    Global.Exit();
                    break;
                case 2:
                    break;
                case 3:
                    // TODO: may be exit animation etc
                    
            }
        }, () => true);
    }

    public onPointer(e: PointerEvent): boolean { return false; }
}
