import { Rect } from "../../../../math/Rect";
import { MenuButtonModel } from "./MenuButtonModel";
import { MenuGroupModel } from "./MenuGroupModel";
import { MenuModel } from "./MenuModel";
import { ViewSettings } from "../../../../../game/views/ViewSettings";

export class MenuView {
    public constructor(
        public context: CanvasRenderingContext2D,
        public settings: ViewSettings,
    ) {

    }

    public update(delta_ms: number): void {
        // do nothing
    }

    /**
     * Render any menu element
     * @param model 
     */
    public render(model: MenuModel): void {
        if (model instanceof MenuButtonModel) {
            this.renderButton(model);
        }
        if (model instanceof MenuGroupModel && model.is_open) {
            this.renderGroup(model);
        }
    }

    /**
     * Render a button element
     * @param model 
     */
    public renderButton(model: MenuButtonModel): void {
        const is_highlighted = model.is_hovered || model.is_focused;
        this.renderRect(
            model.area,
            this.settings.color_secondary,
            this.settings.color_tertiary,
            is_highlighted ? 8 : 2
        );
        this.renderButtonIcon(model);
        this.renderButtonText(model);
    }

    /**
     * Render the children of a group
     * @param model 
     */
    public renderGroup(model: MenuGroupModel): void {
        this.renderRect(
            model.child_area,
            this.settings.color_secondary,
            this.settings.color_tertiary
        );
        this.context.save();
        this.context.translate(model.child_area.left, model.child_area.top);
        model.children.forEach((child) => {
            this.render(child);
        });
        this.context.restore();
    }

    public renderRect(
        rect: Rect,
        background: string = this.settings.color_secondary,
        border: string = this.settings.color_tertiary,
        border_width: number = 4
    ): void {
        this.context.fillStyle = background;
        this.context.fillRect(rect.left, rect.top, rect.width, rect.height);
        this.context.strokeStyle = border;
        this.context.lineWidth = border_width;
        this.context.strokeRect(rect.left, rect.top, rect.width, rect.height);
    }

    public renderText(
        text: string,
        rect: Rect,
        font: string = this.settings.font_size_text + "px" + " " + this.settings.font_family,
        color: string = this.settings.color_primary,
        alignment: CanvasTextAlign = "center",
        baseline: CanvasTextBaseline = "middle"
    ): void {
        this.context.fillStyle = color;
        this.context.font = font;
        this.context.textAlign = alignment;
        this.context.textBaseline = baseline;
        this.context.fillText(text, rect.center.x, rect.center.y);
    }

    public renderButtonIcon(model: MenuButtonModel): void {
        if (!model.icon || !model.globals.asset_manager) {
            return;
        }
        if (!model.globals.asset_manager.hasAsset(model.icon)) {
            return ;
        }
        const image = model.globals.asset_manager.getImage(model.icon);
        this.context.drawImage(
            image.image,
            model.area.left + 4,
            model.area.center.y - 8,
            16,
            16,
        );
    }

    public renderButtonText(model: MenuButtonModel): void {
        const area = model.area.cpy();
        if (!!model.icon) {
            area.left += 24;
            area.width -= 24;
        }
        this.renderText(
            model.name,
            area,
        );
    }
}