import { Sprite } from "artistic-engine/sprite";
import { Maze } from "../maze";
import { Transform, Vector } from "artistic-engine";

export class MazeScene extends Sprite {
    private static instance: MazeScene;

    public static get INSTANCE() {
        if (this.instance === undefined) {
            this.instance = new MazeScene();
        }
        return this.instance;
    }

    private zoom: number = 1;

    private center: Vector.Vector2D = new Vector.Vector2D(0, 0);

    constructor() {
        super();
    }

    public onDraw(context: CanvasRenderingContext2D, delay: number): void {
        // throw new Error("Method not implemented.");
    }

    public setMaze(maze: Maze) {

    }

    public getCenterPosition() {
        return this.center;
    }
    
    public setCenterPosition(x: number, y: number) {
        this.center.X = x;
        this.center.Y = y;
        this.applyTransform();
    }

    public get Zoom() {
        return this.zoom;
    }

    public set Zoom(zoom: number) {
        this.zoom = zoom;
        this.applyTransform();
    }

    public applyTransform() {
        // this.Transform = new Transform();
        // this.Transform.scale(this.zoom)
        // TODO calculate 
    }
}
