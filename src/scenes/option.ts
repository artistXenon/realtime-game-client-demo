import { Sprite } from "artistic-engine/sprite";

export class OptionScene extends Sprite {
    private static instance: OptionScene;

    public static get INSTANCE() {
        if (this.instance === undefined) {
            this.instance = new OptionScene();
        }
        return this.instance;
    }

    constructor() {
        super();
        // need a config manager seperate from this scene
        // that will init calling local file for config
        // config it self will source on node side
        // scene will communicate to call options and request update to node
    }

    public onDraw(context: CanvasRenderingContext2D, delay: number): void {
        // throw new Error("Method not implemented.");
    }
}
