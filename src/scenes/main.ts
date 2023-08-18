import { Sprite } from "artistic-engine/sprite";
import { Character } from "../sprites/common/character";
import { ResolutionVector2D } from "../helper/engine/resolution-vector2D";
import { MainButton } from "../sprites/main/main-button";
import { Global } from "../helper/global";
import { CommonButton } from "../sprites/main/common-button";
import { PlayerState } from "../helper/type";
import { Lobby } from "../game/lobby";

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

    private characters: Characters;

    private optionButton: CommonButton;
    private exitButton: CommonButton;

    private joinPubButton: MainButton;
    private joinPrvButton: MainButton;
    private createPrvButton: MainButton;
    // private exitButtonSprite: MainButton;

    private constructor() {
        super();

        // common
        this.characters = new Characters();
        this.optionButton = new CommonButton("#aaa", "opt", 0);
        this.exitButton = new CommonButton("#aaa", "exit", 1);

        // menu 1
        this.joinPubButton = new MainButton("#aaa", "join pub", 0, 1);
        this.joinPrvButton = new MainButton("#aaa", "join prv", 1, 1);
        this.createPrvButton = new MainButton("#aaa", "create prv", 2, 1);
        
        // menu 2
        // this.inviteButton = new SubButton()

        /**
         * options o
         * exit o
         * 
         * join pub
         * join/create prv o
         * 
         * leave
         * lead - force start
         * private - invite
         * 
         */

        this.attachChildren([
            ...this.characters.Sprites,
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
        // TODO: refresh relevenat states. 
        const currChildren = this.stateElement(this.menuState);
        const nextChildren = this.stateElement(state);
        
        this.detachChildren(currChildren);
        this.attachChildren(nextChildren);

        this.menuState = state;
    }    

    public updatePlayers() {
        const players = Lobby.INSTANCE.Players;
        if (players != null) 
            this.characters.update(players);
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

class Characters {
    private sprites: Character[];

    constructor() {
        const me = new Character("#aaa", "Main Char");

        me.Dimension = new ResolutionVector2D(200, 200);
        me.Position = new ResolutionVector2D(960 - 100, 540 - 100);

        this.sprites = [ me ];        
    }

    public update(players: PlayerState[] | undefined) {
        // TODO
        // if undefined, we are not in lobby. so only me.
        // must be length of 4
    }

    public get Sprites(): Character[] {
        return this.sprites;
    }
}

