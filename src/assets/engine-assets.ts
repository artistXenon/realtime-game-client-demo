import hololive_logo from "../assets/hololive_logo.png"
import poppin from "../assets/fonts/Poppin.woff2"
import quicksand from "../assets/fonts/Quicksand.woff2"
import vanillaExtractRegular from "../assets/fonts/VanillaExtractRegular.ttf"

import AssetLoader from "artistic-engine/loader/asset_loader";

export class EngineAssets {
    private assetLoader: AssetLoader;

    private fonts = [
        { name: "Poppin", source: "url(" + poppin + ")" },
        { name: "Quicksand", source: "url(" + quicksand + ")" },
        { name: "Vanilla", source: "url(" + vanillaExtractRegular + ")" },
    ];
    
    private images = [
        { name: "hololive_logo", source: hololive_logo },
    ];

    constructor(assetLoader: AssetLoader) {
        this.assetLoader = assetLoader;

        this.registerFonts();
        this.registerImages();

        this.assetLoader.onLoad = () => {
            this.onLoad();
        }
        this.assetLoader.load();
    }

    private registerFonts() {
        for (const { name, source } of this.fonts) {
            this.assetLoader.addFont(name, source);    
        }
    }

    public registerImages() {
        for (const { name, source } of this.images) {
            this.assetLoader.addImages(name, source);    
        }
    }

    public onLoad() {
        // TODO: whatever that is to be done after assets are loaded
    }
}
