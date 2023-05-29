import { assert } from "../flow";
import { throwError } from "../flow/Error";
import { sleep } from "../input/Time";

/**
 * Reresents an asset that can be loaded by the AssetManager.
 */
export abstract class Asset {
    public loaded: boolean = false;

    public constructor(
        public name: string
    ) {

    }

    public abstract load(demo: CanvasRenderingContext2D): Promise<this>;
}

/**
 * Represents an image asset that can be loaded by the AssetManager.
 */
export class ImageAsset extends Asset {
    public url: string;
    protected _image?: HTMLImageElement;

    constructor(name: string, url: string) {
        super(name);
        this.url = url;
    }

    public get width(): number {
        return this.image?.width ?? 0;
    }

    public get height(): number {
        return this.image?.height ?? 0;
    }

    public get image(): HTMLImageElement {
        return this._image ?? throwError(`Image ${this.name} not loaded`);
    }

    public async load(demo: CanvasRenderingContext2D): Promise<this> {
        if (this.loaded && !!this._image) return this;
        return new Promise((resolve, reject) => {
            this._image = new Image();
            this._image.onload = () => {
                this.loaded = true;
                demo.drawImage(this.image, -this.width / 2, -this.height / 2);
                resolve(this);
            };
            this._image.onerror = (error) => {
                reject(error);
            };
            this._image.src = this.url;
        });
    }
}



/**
 * Represents an audio asset that can be played by the `AudioPlayer`.
 */
export class AudioAsset extends Asset {
    public url: string;
    protected _audio?: HTMLAudioElement;
    protected _channels = new Array<HTMLAudioElement>();

    constructor(name: string, url: string) {
        super(name);
        this.url = url;
    }

    public get duration(): number {
        return this.audio?.duration ?? 0;
    }

    public get audio(): HTMLAudioElement|null {
        return this._audio ?? throwError(`Audio ${this.name} not loaded`);
    }

    public async load(demo: CanvasRenderingContext2D): Promise<this> {
        if (this.loaded && !!this._audio) return this;
        return new Promise((resolve, reject) => {
            this._audio = document.createElement("audio");
            this._audio.addEventListener("canplaythrough", () => {
                this.loaded = true;
                resolve(this);
            });
            this._audio.addEventListener("onerror", (error) => {
                reject(error);
            });
            this._audio.src = this.url;
        });
    }
}


/**
 * Represents a sound that is meant to play shortly and frequent.
 */
export class SoundAsset extends AudioAsset {}

/**
 * Represents a piece of music that is meant to play for a longer time.
 */
export class MusicAsset extends AudioAsset {}

/**
 * Manages assets.
 * Loading, retrieving, etc.
 */
export class AssetManager {
    public assets = new Map<string, Asset>();

    /**
     * Adds an image asset definition to the manager.
     * @param name 
     * @param assetUrl 
     */
    public addImage(name: string, assetUrl: string): void {
        this.assets.set(
            name,
            new ImageAsset(name, assetUrl)
        );
    }

    /**
     * Add a sound asset definition to the manager.
     * @param name 
     * @param assetUrl 
     */
    public addSound(name: string, assetUrl: string) {
        this.assets.set(
            name,
            new SoundAsset(name, assetUrl)
        );
    }

    /**
     * Add a sound asset definition to the manager.
     * @param name 
     * @param assetUrl 
     */
    public addMusic(name: string, assetUrl: string) {
        this.assets.set(
            name,
            new MusicAsset(name, assetUrl)
        );
    }

    /**
     * Loads all assets.
     * @param demo A rendering context where all loaded images will be displayed once to make sure they are loaded.
     * @returns
     * @throws
     * @async
     * @example
     * ```typescript
     * const asset_manager = new AssetManager();
     * asset_manager.addImage("player", "assets/player.png");
     * asset_manager.addImage("enemy", "assets/enemy.png");
     * await asset_manager.loadAll();
     * ```
     *  */
    public async loadAll(demo: CanvasRenderingContext2D): Promise<void> {
        const promises = new Array<Promise<Asset>>();
        for (const asset of this.assets.values()) {
            promises.push(asset.load(demo));
        }
        demo.translate(demo.canvas.width / 2, demo.canvas.height / 2);
        await Promise.all(promises);
        demo.resetTransform();
    }

    public hasAsset(assetName: string): boolean {
        return this.assets.has(assetName);
    }

    public getAsset(assetName: string): Asset {
        return this.assets.get(assetName) ?? throwError(`Asset ${assetName} not found`);
    }

    public getImage(assetName: string): ImageAsset {
        const asset = this.getAsset(assetName);
        assert(asset instanceof ImageAsset, `Asset ${assetName} is not an image`);
        return asset;
    }

    public getSound(assetName: string): SoundAsset {
        const asset = this.getAsset(assetName);
        assert(asset instanceof SoundAsset, `Asset ${assetName} is not a sound`);
        return asset;
    }

    public getMusic(assetName: string): MusicAsset {
        const asset = this.getAsset(assetName);
        assert(asset instanceof MusicAsset, `Asset ${assetName} is not a music`);
        return asset;
    }
}