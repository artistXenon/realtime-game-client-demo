import { IPointerListener } from "artistic-engine/event/event_groups";
import { ResolutionVector2D } from "../../helper/engine/resolution-vector2D";
import { TempSprite } from "../temp-sprite";
import { Global } from "../../helper/global";
import { JoinPrivatePrompt } from "../../prompt/join-prv";
import { CreatePrivatePrompt } from "../../prompt/crt-prv";
import { onClick } from "../../helper/engine/pointer-processor";
import { MainScene } from "../../scenes/main";


export class MainButton extends TempSprite implements IPointerListener {
    // public get PointerRegistered(): boolean {
    //     // return MainScene.INSTANCE.MenuState === this.assignedState;
    // }

    public PointerRegistered: boolean = true;

    public RecieveEventsOutOfBound: boolean = false;

    private assignedState: number = 0;

    constructor(color: string, name: string, idx: number, menuState: number) {
        super(color, name);
        this.assignedState = menuState;
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

        this.onPointer = onClick(() => {
            switch(idx) {
                case 0:
                    break;
                case 1:
                        this.Parent!.attachChildren(new JoinPrivatePrompt());
                    break;
                case 2:
                        this.Parent!.attachChildren(new CreatePrivatePrompt());
                    break;
                case 3:
                    // TODO: may be exit animation etc
                    Global.Exit();
            }
        }, () => true);
    }

    public onPointer(e: PointerEvent): boolean { return false; }
}
