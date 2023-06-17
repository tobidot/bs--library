import { assertNotNull } from "../../flow";
import * as tgt from "../../index";
import { MenuController } from "../mvc/components/menu/MenuController";

/**
 * A base template for a game
 */
export abstract class GameTemplate<
    MODEL extends tgt.Model & { menu?: tgt.MenuGroupModel },
    VIEW extends tgt.View,
    CONTROLLER extends tgt.KeyboardController & tgt.MouseController & tgt.Controller,
> {
    // features
    public assets: tgt.AssetManager;
    public keyboard: tgt.KeyboardHandler;
    public mouse: tgt.MouseHandler;
    public audio: tgt.AudioPlayer;
    // mvc
    public model: MODEL;
    public view: VIEW;
    public controller: CONTROLLER;
    public menu_controller?: MenuController;
    // properties
    public last_time_ms: number = 0;
    public loading_promise: Promise<void> = Promise.resolve();

    public constructor(
        public app: HTMLElement,
    ) {
        (<any>window).game = this;
        const canvas = tgt.getElementByQuerySelector(app, "canvas", HTMLCanvasElement);
        const context = canvas.getContext("2d", { alpha: false });
        assertNotNull(context, "No 2d context found");
        this.audio = new tgt.AudioPlayer();
        this.assets = new tgt.AssetManager();
        this.registerAssets(this.assets);
        this.loading_promise = this.loading_promise.then(() => this.assets.loadAll(context));
        const mvc = this.initMvc(context);
        this.model = mvc.model;
        this.controller = mvc.controller;
        this.view = mvc.view;
        if ("menu" in this.model && !!this.model.menu && this.model.menu instanceof tgt.MenuModel) {
            this.menu_controller = new MenuController(this.model.menu);
        }
        this.keyboard = new tgt.KeyboardHandler(app, () => this.getKeyboardControllers());
        this.mouse = new tgt.MouseHandler(app, canvas, () => this.getMouseControllers());
    }
    
    protected getKeyboardControllers(): Array<tgt.KeyboardController> {
        return [this.controller, this.menu_controller].filter((c): c is CONTROLLER => !!c);
    };
    protected getMouseControllers(): Array<tgt.MouseController> {
        return [this.controller, this.menu_controller].filter((c): c is CONTROLLER => !!c);
    };
    protected abstract registerAssets(assets: tgt.AssetManager): void;
    protected abstract initMvc(context: CanvasRenderingContext2D) : this;
    protected abstract newGame(resolve: () => void, reject: (reason?: any) => void): void;

    protected update(delta_ms: number) {
        this.controller.update(delta_ms / 1000);
        this.menu_controller?.update(delta_ms / 1000);
        this.view.update(delta_ms / 1000);
        this.view.render(this.model);
    }

    protected onFrame = (timestamp_ms: number) => {
        // limit the delta time to 30 fps
        const delta_ms = Math.min(timestamp_ms - this.last_time_ms, 1000 / 30);
        this.update(delta_ms);
        this.last_time_ms = timestamp_ms;
        requestAnimationFrame(this.onFrame);
    }

    /**
     * Initialize the game
     */
    public async init() {
        this.keyboard.init();
        this.mouse.init();
    }

    /**
     * Start the game loop
     * @returns 
     */
    public async run() {
        return this.loading_promise
            .then(() => {
                new Promise<void>((resolve, reject) => {
                    this.newGame(resolve, reject)
                    requestAnimationFrame(this.onFrame);
                })
            });
    }
}