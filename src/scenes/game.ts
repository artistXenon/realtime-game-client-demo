import Sprite from "artistic-engine/sprite/sprite";

export class GameScene extends Sprite {
    private static instance: GameScene;

    public static get INSTANCE() {
        if (this.instance === undefined) {
            this.instance = new GameScene();
        }
        return this.instance;
    }

    constructor() {
        super();
    }

    public onDraw(context: CanvasRenderingContext2D, delay: number): void {
        // throw new Error("Method not implemented.");
    }
}
