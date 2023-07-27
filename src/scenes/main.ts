import Sprite from "artistic-engine/sprite/sprite";

export class MainScene extends Sprite {
    private static instance: MainScene;

    public static get INSTANCE() {
        if (this.instance === undefined) {
            this.instance = new MainScene();
        }
        return this.instance;
    }

    constructor() {
        super();

        // attach children

        // branch menu items
        // play game
        // options

        // ... check tablet again

        // 
    }

    public onDraw(context: CanvasRenderingContext2D, delay: number): void {
        // throw new Error("Method not implemented.");
    }

}