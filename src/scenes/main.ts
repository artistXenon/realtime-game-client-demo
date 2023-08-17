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

    private menuState: number = 0;
    // 0: nothing. initial state
    // 1: main menu. not in lobby
    // 2: lobby menu. show players and control

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

        this.startButtonSprite = new MainButton("#aaa", "join pub", 0, 1);
        this.inviteButtonSprite = new MainButton("#aaa", "join prv", 1, 1);
        this.optionButtonSprite = new MainButton("#aaa", "create prv", 2, 1);
        this.exitButtonSprite = new MainButton("#aaa", "exit button", 3, 1); // TODO: this can be hidden

        this.attachChildren([
            char
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
        this.MenuState = 1;
    }

    public get MenuState() {
        return this.menuState;
    }

    public set MenuState(state: number) {
        // TODO: u know what to do
        if (state !== 0) {

        }

        switch (state) {
            case 1: 
                this.attachChildren([
                    this.startButtonSprite,
                    this.inviteButtonSprite,
                    this.optionButtonSprite,
                    this.exitButtonSprite
                ]);
                break;
            default:
        }
        this.menuState = state;
    }

    

    public override onDraw(context: CanvasRenderingContext2D, delay: number): void {
        // context.fillStyle = "black";
        // context.fillRect(0, 0, this.W, this.H);
    }

}