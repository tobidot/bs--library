import { KeyDownEvent, KeyName, KeyboardController, MouseController, MouseDownEvent } from "../../../../input";
import { Vector2D } from "../../../../math";
import { Controller } from "../../Controller";
import { Model } from "../../Model";
import { ControllerResponse } from "../../Response";
import { MenuGroupGenerator } from "./MenuGenerator";
import { MenuGroupModel } from "./MenuGroupModel";
import { MenuModel } from "./MenuModel";


export class MenuController implements Controller, KeyboardController, MouseController {

    public constructor(
        public menu: MenuGroupModel
    ) {
    }

    /**
     * Propagate the update to the menu model.
     * @param delta_seconds 
     * @returns 
     */
    public update(delta_seconds: number): ControllerResponse {
        this.menu.update(delta_seconds, game.mouse);
        return null;
    }

    /**
     * Handle keyboard input for the menu.
     * @param event 
     */
    public onKeyDown(
        event: KeyDownEvent
    ): void {
        if (!this.menu.is_open) {
            if (event.key.name === KeyName.Escape) {
                this.menu.open();
            }
            return;
        }
        const focus = this.menu.getFocusedMenuItem();
        const parent = focus?.parent;
        switch (event.key.name) {
            case KeyName.Tab:
            case KeyName.ArrowDown:
                parent?.next();
                break;
            case KeyName.ArrowUp:
                parent?.previous();
                break;
            case KeyName.Escape:
            case KeyName.ArrowLeft:
                if (focus instanceof MenuGroupModel && focus.is_open) {
                    focus.escape();
                } else {
                    parent?.escape();
                }
                break;
            case KeyName.Enter:
                focus?.select();
                break;
            case KeyName.ArrowRight: {
                const focus = this.menu.getFocusedMenuItem();
                if (focus instanceof MenuGroupModel) {
                    focus.open();
                }
            }
        }
    }

    /**
     * Check if a menu item has been clicked
     * @param event 
     */
    public onMouseUp(event: MouseDownEvent): void {
        const menu = this.menu;
        const mouse = game.mouse;
        const mouse_position = mouse.position.cpy();
        this.checkMouseSelect(menu, mouse_position);
    }

    /**
     * Check if the given menu item or any of its children has been clicked.
     * @param menu 
     * @param mouse 
     */
    public checkMouseSelect(menu: MenuModel, mouse: Vector2D): boolean {
        if (menu instanceof MenuGroupModel && menu.is_open) {
            const old_focus = menu.getFocusedChildMenuItem();
            const inner_mouse = mouse.cpy().sub({ x: menu.child_area.left, y: menu.child_area.top });
            const selected = menu.children.reduce((selected: MenuModel | null, child: MenuModel): MenuModel | null => {
                if (!!selected) return selected;
                if (this.checkMouseSelect(child, inner_mouse)) {
                    return child;
                };
                return null;
            }, null);
            if (!!selected) {
                if (!!old_focus && selected !== old_focus) {
                    old_focus.escape();
                    old_focus.blur();
                }
                selected.focus();
                return true;
            }
        }
        if (menu.area.contains(mouse)) {
            menu.select();
            return true;
        }
        return false;
    }
}