import hololive_logo from "../assets/hololive_logo.png"
import poppin from "../assets/fonts/Poppin.woff2"
import quicksand from "../assets/fonts/Quicksand.woff2"

import AssetLoader from "artistic-engine/loader/asset_loader";

export class EngineAssets {
    private assetLoader: AssetLoader;

    private fonts = [
        { name: "Poppin", source: "url(" + poppin + ")" },
        { name: "Quicksand", source: "url(" + quicksand + ")" },
        /*
        @font-face {
            font-family: 'Quicksand';
            font-style: normal;
            font-weight: 300;
            font-display: swap;
            src: url(https://fonts.gstatic.com/s/quicksand/v30/6xK-dSZaM9iE8KbpRA_LJ3z8mH9BOJvgkKEo58a-wg.woff2) format('woff2');
            unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        */
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
