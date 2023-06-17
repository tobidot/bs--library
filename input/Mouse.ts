import { Vector2D } from "../math";
import { Rect } from "../math/Rect";

/**
 * Represents the state of the keyboard.
 */
export type MouseState = Map<MouseButtonName, MouseButtonState>;

/**
 * Represents the state of a key.
 */
export interface MouseButtonState {
    /** @var name name of the key */
    name: MouseButtonName;
    /** @var state true if the button is down, false otherwise */
    is_down: boolean;
    /** @var since the timestamp at which the key has last changed */
    since: number;
}

/**
 * Represents a controller that accepts keyboard input.
 */
export interface MouseController {
    onMouseMove?(event: MouseMoveEvent): void;
    onMouseDown?(event: MouseDownEvent): void;
    onMouseUp?(event: MouseUpEvent): void;
    onMouseWheel?(event: MouseWheelEvent): void;
}

/**
 * Represents a mouse event.
 */
export class MouseEvent { };
export class MouseButtonEvent extends MouseEvent {
    constructor(
        public button: MouseButtonState
    ) { super(); };
};
export class MouseDownEvent extends MouseButtonEvent { };
export class MouseUpEvent extends MouseButtonEvent { };
export class MouseMoveEvent extends MouseEvent {
    constructor(
        public position: Vector2D
    ) { super(); };
};
export class MouseWheelEvent extends MouseEvent {
    constructor(
        public deltaX: number,
        public deltaY: number,
        public deltaZ: number,
    ) { super(); };
};

/**
 * Enum for key codes.
 */
export enum MouseButtonName {
    LEFT = "Left",
    MIDDLE = "Middle",
    RIGHT = "Right",
    BACK = "Back",
    FORWARD = "Forward",
}


export class MouseHandler {
    public state: MouseState = new Map<MouseButtonName, MouseButtonState>();
    public not_moved_since: number = 0;
    public position: Vector2D = new Vector2D(0, 0);

    // the canvas element bounding rect
    protected canvas_rect!: Rect;
    // the in game screen size
    protected screen_rect!: Rect;

    constructor(
        public app: HTMLElement,
        public canvas: HTMLCanvasElement,
        /**
         *  @var controller_callback a callback that returns the controller that will handle the mouse input 
         */
        public controller_callback: () => Array<MouseController>
    ) {
    }

    public init() {
        this.app.addEventListener("mousedown", this.onMouseDown);
        this.app.addEventListener("mouseup", this.onMouseUp);
        this.app.addEventListener("mousemove", this.onMouseMove);
        this.app.addEventListener("wheel", this.onMouseWheel);
        this.app.addEventListener("blur", this.onBlur);
        window.addEventListener("resize", this.onResize);
        this.onResize();
    }

    /**
     * Get all the keys that are currently down.
     * @returns 
     */
    public getButtonsDown(): MouseButtonState[] {
        return [...this.state.values()].filter((button_state: MouseButtonState) => button_state.is_down);
    }

    /**
     * Get the state of a key.
     * @param button_name 
     * @returns 
     */
    public getButton(button_name: MouseButtonName): MouseButtonState {
        let button = this.state.get(button_name);
        if (button) return button;
        button = this.makeMouseButtonState(button_name);
        this.state.set(button_name, button);
        return button;
    }

    /**
     * If something changed size, make suure the rects are updated.
     * @param event 
     */
    protected onResize = () => {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas_rect = Rect.fromBoundingBox(rect);
        this.screen_rect = new Rect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * A mouse button has been pressed.
     * @param event 
     */
    protected onMouseWheel = (event: { deltaX: number, deltaY: number, deltaZ: number }) => {
        this.controller_callback().forEach(
            (controller)=> controller.onMouseWheel?.(new MouseWheelEvent(event.deltaX, event.deltaY, event.deltaZ))
        );
    }

    /**
     * A mouse button has been pressed.
     * @param event 
     */
    protected onMouseDown = (event: { button: number, timeStamp: number }) => {
        const button_name = MouseButtonName[event.button];
        const button = this.getButton(button_name);
        button.is_down = true;
        button.since = event.timeStamp;
        this.controller_callback().forEach(
            (controller)=> controller.onMouseDown?.(new MouseDownEvent(button))
        );
    }

    /**
     * A mouse release event.
     * @param event 
     */
    protected onMouseUp = (event: { button: number, timeStamp: number }) => {
        const button_name = MouseButtonName[event.button];
        const button = this.getButton(button_name);
        button.is_down = true;
        button.since = event.timeStamp;
        this.controller_callback().forEach(
            (controller)=> controller.onMouseUp?.(new MouseUpEvent(button))
        );
    }


    /**
     * A mouse move event.
     * @param event 
     */
    protected onMouseMove = (event: { clientX: number, clientY: number, timeStamp: number }) => {
        this.position.x = (event.clientX - this.canvas_rect.left) / this.canvas_rect.w * this.screen_rect.w;
        this.position.y = (event.clientY - this.canvas_rect.top) / this.canvas_rect.h * this.screen_rect.h;
        this.not_moved_since = event.timeStamp;
        this.controller_callback().forEach(
            (controller) => controller.onMouseMove?.(new MouseMoveEvent(this.position.cpy()))
        );
    }

    /**
     * When the container looses focus, we need to reset the state of the mouse buttons.
     * @param event 
     */
    protected onBlur = (event: FocusEvent) => {
        this.getButtonsDown().forEach((button_state: MouseButtonState) => {
            const key_name = button_state.name;
            const key = this.getButton(key_name);
            key.is_down = false;
            key.since = event.timeStamp;
            this.controller_callback().forEach(
                (controller) => controller.onMouseUp?.(new MouseUpEvent(key))
            );
        });
    }

    /**
     * Create an empty key state.
     * @param button KeyName
     * @returns 
     */
    protected makeMouseButtonState(button: MouseButtonName): MouseButtonState {
        return {
            name: button,
            is_down: false,
            since: 0,
        };
    }
}