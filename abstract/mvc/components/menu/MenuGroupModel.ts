import { MouseHandler } from "../../../..";
import { Rect } from "../../../../math/Rect";
import { MenuButtonModel } from "./MenuButtonModel";
import { MenuButtonGenerator, MenuGenerator, MenuGroupGenerator } from "./MenuGenerator";
import { MenuGlobals } from "./MenuGlobals";
import { MenuModel } from "./MenuModel";

interface MenuGroupModelControls {
    addChild(child: MenuModel | string): MenuModel;
    open(): void;
    close(): void;
}

export class MenuGroupModel extends MenuButtonModel implements MenuGroupModelControls {
    // 
    public is_open: boolean = false;
    //
    public padding: number = 10;
    public item_height: number = 28;
    public spacing: number = 4;
    public child_area: Rect = new Rect(0, 0, 0, 0);
    public icon_open: string | null = null;
    public icon_close: string | null = null;
    //
    public children: Array<MenuModel> = []

    /**
     * 
     * @param name 
     * @param width 
     * @param height 
     */
    public constructor(
        globals: MenuGlobals,
        name: string,
        width?: number,
        height?: number,
        child_area_width?: number
    ) {
        super(globals, name, width, height);
        this.child_area = new Rect(
            this.area.right + this.padding,
            this.area.top,
            (child_area_width ?? this.area.width) + this.padding * 2,
            this.area.height + this.padding * 2,
        );
    }

    /**
     * returns a generator for child items belonging to this group.
     * @returns 
     */
    public childGenerator(): MenuGenerator {
        return new MenuGenerator(this.globals, {
            parent: this,
            x: this.padding,
            width: this.child_area.width - this.padding * 2,
            height: this.item_height,
            child_area_width: this.child_area.width,
            icon: this.icon,
            icon_close: this.icon_close,
            icon_open: this.icon_open,
            callback: (button: MenuButtonModel) => { 
                this.appendChild(button);
            },
        });
    }

    /**
     * Add a child to this group.
     * Will automatically recalculate the child's position.
     * @param child 
     * @returns 
     */
    public addChild(child: MenuModel | string): MenuModel {
        if (typeof child === "string") {
            return this.childGenerator()
                .button()
                .make(child);
        }
        return this.appendChild(child);
    }

    /**
     * Add a child to this group.
     * Will automatically recalculate the child's position.
     * @param child 
     * @returns 
     */
    public addGroupChild(child: MenuGroupModel | string, child_area_width: number = this.child_area.width): MenuGroupModel {
        if (typeof child === "string") {
            return this.childGenerator()
                .group()
                .set("child_area_width", child_area_width)
                .make(child);
        }
        return this.appendChild(child);
    }

    /**
     * Adds the menu element to this group.
     * Does not recalculate the child's size, but position.
     * @param child 
     */
    public appendChild<T extends MenuModel>(child: T): T {
        child.parent = this;
        child.area.top = this.spacing * 2 + this.children.length * (this.item_height + this.spacing);
        this.children.push(child);
        this.child_area.height += (child.area.height + this.spacing);
        return child;
    }

    /**
     * Recalculates all attributes for this element.
     */
    public refresh() {
        this.refreshIcon();
        this.refreshChildren();
        this.refreshChildArea();
    }

    /**
     * Refreshed the current icon of this element based on the open/close state.
     */
    public refreshIcon() {
        if (this.is_open) {
            this.icon = this.icon_open;
        } else {
            this.icon = this.icon_close;
        }
    }

    /**
     * Recalculate the position of all children.
     * Also recalculates the size of the child area.
     */
    public refreshChildren() {
        let offset_top = this.spacing * 2;
        let width = this.children.reduce((width: number, child: MenuModel) => {
            return Math.max(width, child.area.width);
        }, 0);
        this.children.forEach((child: MenuModel, index: number) => {
            child.area.left = this.padding;
            child.area.top = offset_top;
            child.area.width = width;
            offset_top += this.item_height + this.spacing;
            child.refresh();
        });
        this.child_area = new Rect(
            this.area.right + this.padding,
            this.area.top,
            width + this.padding * 2,
            offset_top + this.spacing,
        );
    }

    /**
     * Recalculate the area for the children enclosing all of them.
     */
    public refreshChildAreaSize(): Rect {
        let width = this.children.reduce((width: number, child: MenuModel) => {
            return Math.max(width, child.area.width);
        }, 0) + this.padding * 2;
        // if there are no children, the width should not changed
        if (this.children.length === 0) {
            width = this.child_area.width;
        }
        const height = this.children.reduce((height: number, child: MenuModel) => {
            return height + child.area.height + this.spacing;
        }, this.spacing * 3);
        this.child_area.left = (width - this.child_area.width) / 2;
        this.child_area.top = (height - this.child_area.height) / 2;
        this.child_area.width = width;
        this.child_area.height = height;
        return this.child_area;
    }

    /**
     * Recalculate the area for the children enclosing all of them.
     */
    public refreshChildAreaPosition(): Rect {
        this.child_area.left = this.area.right + this.padding * 2;
        this.child_area.top = this.area.top;
        return this.child_area;
    }

    /**
     * Recalculate the area for the children enclosing all of them.
     */
    public refreshChildArea(): Rect {
        this.refreshChildAreaSize();
        this.refreshChildAreaPosition();
        return this.child_area;
    }

    /**
     * Propagate an update to all children.
     * @param delta_seconds 
     * @param mouse 
     */
    public update(delta_seconds: number, mouse: MouseHandler) {
        super.update(delta_seconds, mouse);
        this.children.forEach((child: MenuModel) => {
            child.update(delta_seconds, mouse);
        });
    }

    /**
     * Get the menu item that is selected inside this menugroup level.
     * @returns 
     */
    public getFocusedChildMenuItem(): MenuModel | null {
        return this.children.find((child) => child.is_focused) ?? null;
    }

    /**
     * Get the element that is selected on the deepest level.
     * @returns 
     */
    public getFocusedMenuItem(): MenuModel | null {
        const item = this.getFocusedChildMenuItem();
        if (item instanceof MenuGroupModel && item.is_open) {
            // if nothing is focused in the deeper layer, return the group itself
            return item.getFocusedMenuItem() ?? item;
        }
        return item;
    }

    /**
     * Rotate the focus to the next child.
     */
    public next(amount: number = 1): void {
        super.next(amount);
        this.rotateFocus(amount);
    }

    /**
     * Rotate the focus to the previous child.
     */
    public previous(amount: number = 1): void {
        super.previous(amount);
        this.rotateFocus(-amount);
    }

    /**
     * Rotate the focus by the given direction.
     * @param direction 
     * @returns 
     */
    public rotateFocus(direction: number): void {
        if (this.children.length == 0) {
            return;
        }
        const focused_index = this.children.findIndex((child) => child.is_focused);
        if (focused_index === -1) {
            this.children[0].focus();
            return;
        }
        const focused = this.children[focused_index];
        focused.blur();
        const next_index = (focused_index + this.children.length + direction % this.children.length) % this.children.length;
        this.children[next_index].focus();
    }

    /**
     * Removes the focus from this element.
     * Also closing the menu if it is open.
     * @returns 
     */
    public blur(): void {
        if (this.is_open) {
            this.close();
        }
        super.blur();
    }

    /**
     * Escape to a higher element.
     * @returns 
     */
    public escape(): void {
        if (this.is_open) {
            this.close();
        }
    }

    /**
     * Opens this group or delegates the selection to the focused child.
     * @returns 
     */
    public select(): void {
        super.select();
        if (this.is_open) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Close this menue
     */
    public close() {
        // remove focus from all children
        this.children.forEach((child) => {
            if (child.is_focused) {
                child.blur();
            }
        });
        this.is_open = false;
        this.icon = this.icon_close;
    }

    /**
     * Open this menu
     */
    public open() {
        this.rotateFocus(0);
        this.is_open = true;
        this.icon = this.icon_open;
    }
}