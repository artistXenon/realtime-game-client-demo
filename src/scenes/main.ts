import { Sprite } from "artistic-engine/sprite";
import { Character } from "../sprites/common/character";
import { ResolutionVector2D } from "../helper/engine/resolution-vector2D";
import { MainButton } from "../sprites/main/main-button";
import { Global } from "../helper/global";

export class MainScene extends Sprite {
    private static instance: MainScene;

    public static get INSTANCE() {
        if (this.instance === undefined) {
            this.instance = new MainScene();
        }
        return this.instance;
    }

    private characterSprites: Character[] = [];

    private startButtonSprite: MainButton;
    private inviteButtonSprite: MainButton;
    private optionButtonSprite: MainButton;
    private exitButtonSprite: MainButton;

    constructor() {
        super();

        const char: Character = new Character("#aaa", "Main Char");
        this.characterSprites.push(char);
        char.Dimension = new ResolutionVector2D(200, 200);
        char.Position = new ResolutionVector2D(960 - 100, 540 - 100);

        this.startButtonSprite = new MainButton("#aaa", "join pub", 0);
        this.inviteButtonSprite = new MainButton("#aaa", "join prv", 1);
        this.optionButtonSprite = new MainButton("#aaa", "create prv", 2);
        this.exitButtonSprite = new MainButton("#aaa", "exit button", 3);

        this.attachChildren([
            char,
            this.startButtonSprite,
            this.inviteButtonSprite,
            this.optionButtonSprite,
            this.exitButtonSprite
        ]);

        Global.PointerEventGroup.registerPointerListener(this.startButtonSprite);
        Global.PointerEventGroup.registerPointerListener(this.inviteButtonSprite);
        Global.PointerEventGroup.registerPointerListener(this.optionButtonSprite);
        Global.PointerEventGroup.registerPointerListener(this.exitButtonSprite);

        // attach children

        // branch menu items
        // play game
        // options

        // ... check tablet again

        // 
    }

    

    public override onDraw(context: CanvasRenderingContext2D, delay: number): void {
        // context.fillStyle = "black";
        // context.fillRect(0, 0, this.W, this.H);
    }

}