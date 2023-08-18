import { Sprite } from "artistic-engine/sprite";
import { Character } from "../sprites/common/character";
import { ResolutionVector2D } from "../helper/engine/resolution-vector2D";
import { MainButton } from "../sprites/main/main-button";
import { Global } from "../helper/global";
import { SubButton } from "../sprites/main/sub-button";

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
    private optionButton: SubButton;
    private exitButton: SubButton;

    private joinPubButton: MainButton;
    private joinPrvButton: MainButton;
    private createPrvButton: MainButton;
    // private exitButtonSprite: MainButton;

    private constructor() {
        super();

        // common
        const char: Character = new Character("#aaa", "Main Char");
        this.characterSprites.push(char);
        char.Dimension = new ResolutionVector2D(200, 200);
        char.Position = new ResolutionVector2D(960 - 100, 540 - 100);
        
        this.optionButton = new SubButton("#aaa", "opt", 0);
        this.exitButton = new SubButton("#aaa", "exit", 1);



        // menu 1
        this.joinPubButton = new MainButton("#aaa", "join pub", 0, 1);
        this.joinPrvButton = new MainButton("#aaa", "join prv", 1, 1);
        this.createPrvButton = new MainButton("#aaa", "create prv", 2, 1);
        // this.exitButtonSprite = new MainButton("#aaa", "exit button", 3, 1); // TODO: this can be hidden / some where else

        /**
         * options
         * exit
         * change character
         * 
         * join pub
         * join/create pub
         * 
         * leave
         * - lead 
         *      kick
         *      force start
         * 
         * - private
         *      invite
         *      change team (req to other player, accept)
         *      ready/pause
         *  
         */

        this.attachChildren([
            char,
            this.optionButton,
            this.exitButton
        ]);


        // attach children

        // branch menu items
        // play game
        // options

        // ... check tablet again

        
        Global.PointerEventGroup.registerPointerListener(this.optionButton);
        Global.PointerEventGroup.registerPointerListener(this.exitButton);
        Global.PointerEventGroup.registerPointerListener(this.joinPubButton);
        Global.PointerEventGroup.registerPointerListener(this.joinPrvButton);
        Global.PointerEventGroup.registerPointerListener(this.createPrvButton);
        // Global.PointerEventGroup.registerPointerListener(this.exitButtonSprite);

        this.MenuState = 1;
    }

    public get MenuState() {
        return this.menuState;
    }

    public set MenuState(state: number) {
        // TODO: u know what to do
        const currChildren = this.stateElement(this.menuState);
        const nextChildren = this.stateElement(state);
        
        this.detachChildren(currChildren);
        this.attachChildren(nextChildren);

        // switch (state) {
        //     case 0:
        //     case 1: 
        //         this.attachChildren([
        //             this.startButtonSprite,
        //             this.inviteButtonSprite,
        //             this.optionButtonSprite,
        //             this.exitButtonSprite
        //         ]);
        //         break;
        //     default:
        // }
        this.menuState = state;
    }    

    public override onDraw(context: CanvasRenderingContext2D, delay: number): void {
        // context.fillStyle = "black";
        // context.fillRect(0, 0, this.W, this.H);
    }

    private stateElement(state: number): Sprite[] {
        switch (state) {
            case 0:
                return [];
            case 1:
                return [
                    this.joinPubButton,
                    this.joinPrvButton,
                    this.createPrvButton,
                ];
            default: 
                return [];
        }
    }
}