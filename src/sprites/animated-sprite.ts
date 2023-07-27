import { TextureSprite } from "artistic-engine/sprite";

export class AnimatedSprite extends TextureSprite {
    public isAnimating = true;

    public isLoop: boolean;

    public fps: number;

    private textures: ImageBitmap[];

    constructor(fps: number = 0, loop: boolean = true, textures: ImageBitmap[] = []) {
        super({});
        this.textures = textures;
        if (this.textures.length > 0) {
            this.texture = this.textures[0];
        }
        this.fps = fps;
        this.isLoop = loop;
    }
}