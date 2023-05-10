/**
 * Represents the state of the keyboard.
 */
export type KeyboardState = Map<KeyName, KeyState>;

/**
 * Represents the state of a key.
 */
export interface KeyState {
    /** @var key name of the key */
    name: KeyName;
    /** @var state true if the key is down, false otherwise */
    is_down: boolean;
    /** @var since the timestamp at which the key has last changed */
    since: number;
}

/**
 * Represents a controller that accepts keyboard input.
 */
export interface KeyboardController {
    onKeyDown(event: KeyDownEvent): void;
    onKeyUp(event: KeyUpEvent): void;
}

/**
 * Represents a keyboard event.
 */
export class KeyboardEvent {
    constructor(
       public  key: KeyState
    ) {};
}
export class KeyDownEvent extends KeyboardEvent {};
export class KeyUpEvent extends KeyboardEvent {};

/**
 * Handles keyboard input.
 * And provides helpers to interact with the keyboard.
 */
export class KeyboardHandler {
    /**
     * The current state of the keyboard.
     */
    protected state: KeyboardState = new Map<KeyName, KeyState>();

    constructor(
        public app: HTMLElement,
        /**
         *  @var controller_callback a callback that returns the controller that will handle the keyboard input 
         */
        public controller_callback: () => KeyboardController
    ) {
    }

    public init() {
        this.app.addEventListener("keydown", this.onKeyDown);
        this.app.addEventListener("keyup", this.onKeyUp);
        this.app.addEventListener("blur", this.onBlur);
    }

    /**
     * Get all the keys that are currently down.
     * @returns 
     */
    public getKeysDown(): KeyState[] {
        return [...this.state.values()].filter((key_state: KeyState) => key_state.is_down);
    }

    /**
     * Get the state of a key.
     * @param key_name 
     * @returns 
     */
    public getKey(key_name: KeyName): KeyState {
        let key = this.state.get(key_name);
        if (key) return key;
        key = this.makeKeyState(key_name);
        this.state.set(key_name, key);
        return key;
    }

    /**
     * A key press event.
     * @param event 
     */
    protected onKeyDown = (event: {key:string, timeStamp:number}) => {
        const key_name = event.key as KeyName;
        const key = this.getKey(key_name);
        key.is_down = true;
        key.since = event.timeStamp;
        this.controller_callback()
            .onKeyDown(new KeyDownEvent(key));
    }

    /**
     * A key release event.
     * @param event 
     */
    protected onKeyUp = (event: {key:string, timeStamp:number}) => {
        const key_name = event.key as KeyName;
        const key = this.getKey(key_name);
        key.is_down = false;
        key.since = event.timeStamp;
        this.controller_callback()
            .onKeyUp(new KeyUpEvent(key));
    }

    /**
     * When the container looses focus, we need to reset the state of the keys.
     * @param event 
     */
    protected onBlur = (event: FocusEvent) => {
        this.getKeysDown().forEach((key_state: KeyState) => {
            const key_name = key_state.name;
            const key = this.getKey(key_name);
            key.is_down = false;
            key.since = event.timeStamp;      
            this.controller_callback()
                .onKeyUp(new KeyUpEvent(key));      
        });
    }

    /**
     * Create an empty key state.
     * @param key KeyName
     * @returns 
     */
    protected makeKeyState(key: KeyName): KeyState {
        return {
            name: key,
            is_down: false,
            since: 0,
        };
    }
}

/**
 * Enum for key codes.
 */
export enum KeyName {
    ArrowRight = "ArrowRight",
    ArrowLeft = "ArrowLeft",
    ArrowDown = "ArrowDown",
    ArrowUp = "ArrowUp",
    Space = " ",
    Enter = "Enter",
    Escape = "Escape",
    Backspace = "Backspace",
    Tab = "Tab",
    Shift = "Shift",
    Control = "Control",
    Alt = "Alt",
    CapsLock = "CapsLock",
    Meta = "Meta",
    PageUp = "PageUp",
    PageDown = "PageDown",
    End = "End",
    Home = "Home",
    Insert = "Insert",
    Delete = "Delete",
    Digit0 = "0",
    Digit1 = "1",
    Digit2 = "2",
    Digit3 = "3",
    Digit4 = "4",
    Digit5 = "5",
    Digit6 = "6",
    Digit7 = "7",
    Digit8 = "8",
    Digit9 = "9",
    KeyA = "a",
    KeyB = "b",
    KeyC = "c",
    KeyD = "d",
    KeyE = "e",
    KeyF = "f",
    KeyG = "g",
    KeyH = "h",
    KeyI = "i",
    KeyJ = "j",
    KeyK = "k",
    KeyL = "l",
    KeyM = "m",
    KeyN = "n",
    KeyO = "o",
    KeyP = "p",
    KeyQ = "q",
    KeyR = "r",
    KeyS = "s",
    KeyT = "t",
    KeyU = "u",
    KeyV = "v",
    KeyW = "w",
    KeyX = "x",
    KeyY = "y",
    KeyZ = "z",
}
