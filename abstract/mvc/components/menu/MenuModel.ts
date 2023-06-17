import { MouseButtonName, MouseHandler, assert } from "../../../..";
import { Rect } from "../../../../math/Rect";
import { MenuGroupModel } from "./MenuGroupModel";
import { MenuGlobals } from "./MenuGlobals";

/**
 * The interface that every menu model should implement.
 * To allow interacting with the menu model.
 */
export interface MenuModelControls {
    /**
     * Focuses the element.
     */
    focus(): void;
    /**
     * Removes the focus from the element.
     */
    blur(): void;
    /**
     * Selects the element (triggers the action behind the element). 
     */
    select(): void;
    /**
     * Escapes from the element (closes the element).
     */
    escape(): void;
    /**
     * Indicates that the next element should be selected.
     * (Or generally increase a value)
     */
    next(amount?: number): void;
    /**
     * Indicates that the previous element should be selected.
     * (Or generally decrease a value)
     */
    previous(amount?: number): void;
    /**
     * When the element is select this callback should be executed.
     * @param callback { (element: this) => void}
     */
    onSelect(callback: (element: MenuModel) => void): void;
    /**
     * Recalculates all dependant attributes of the element.
     */
    refresh(): void;
}

export class MenuModel implements MenuModelControls {
    public id: number;
    // 
    public parent: MenuGroupModel | null = null;
    // 
    public area: Rect;
    public is_visible = true;
    // input states
    public is_focused = false;
    public is_hovered = false;
    public is_pressed = false;
    //
    protected listeners: ((element: MenuModel) => void)[] = [];

    public constructor(
        public readonly globals: MenuGlobals,
        public name: string,
        width?: number,
        height?: number
    ) {
        this.id = globals.next_id++;
        const area = this.area = new Rect(
            0, 0,
            width ?? 0, height ?? 0
        );
    }

    public getGlobalBounds(): Rect {
        const bounds = this.area.cpy();
        let parent = this.parent;
        while (parent) {
            bounds.x += parent.child_area.left;
            bounds.y += parent.child_area.top;
            parent = parent.parent;
        }
        return bounds;
    }

    public update(delta_seconds: number, mouse: MouseHandler) {
        const global_bounds = this.getGlobalBounds();
        const is_hovered = global_bounds.contains(mouse.position);
        if (is_hovered != this.is_hovered) {
            this.onHoverChanged(is_hovered);
        }
        const is_pressed = is_hovered && mouse.getButton(MouseButtonName.LEFT).is_down;
        if (is_pressed != this.is_pressed) {
            this.onPressedChanged(is_pressed);
        }
    }

    protected onHoverChanged(is_hovered: boolean) {
        if (is_hovered) {
            this.onHoverEnter();
        } else {
            this.onHoverLeave();
        }
        this.is_hovered = is_hovered;
    }

    protected onHoverEnter() { };

    protected onHoverLeave() { };

    protected onPressedChanged(is_pressed: boolean) {
        if (is_pressed) {
            this.onPressed();
        } else {
            this.onReleased();
        }
        this.is_pressed = is_pressed;
    }

    protected onPressed() { };

    protected onReleased() { };

    protected playSelectSound() {
        if (this.globals.audio_player && this.globals.select_sound) {
            this.globals.audio_player.sfx.play(this.globals.select_sound);
        }
    }

    public focus() {
        this.is_focused = true;
    }

    public blur() {
        this.is_focused = false;
    }

    public select() {
        this.playSelectSound();
        this.listeners.forEach(listener => listener(this));
        // propagate the event to the parent menu
        let parent = this.parent;
        while(parent) {
            parent.listeners.forEach(listener => listener(this));
            parent = parent.parent;
        }
    }

    public escape() : void {}
    public next(amount?: number | undefined): void { }
    public previous(amount?: number | undefined): void { }

    public onSelect(callback: (element: MenuModel) => void): void {
        this.listeners.push(callback);
    }

    public refresh(): void { }
}