import { Rect } from "../../../../math/Rect";
import { MenuButtonModel } from "./MenuButtonModel";
import { MenuGlobals } from "./MenuGlobals";
import { MenuGroupModel } from "./MenuGroupModel";
import { MenuModel } from "./MenuModel";

export abstract class Configurable<
    SETTINGS extends { [key: string]: any },
> {
    /**
     * The data currently set up for future items.
     */
    public data: SETTINGS;

    constructor(settings: SETTINGS) {
        this.data = Object.assign({}, settings);
    }

    /**
     * Change the data for the generator.
     * @param key 
     * @param value 
     * @returns 
     */
    public set<KEY extends keyof SETTINGS>(
        key: KEY,
        value: SETTINGS[KEY]
    ) {
        this.data[key] = value;
        return this;
    }
}

/**
 * A generator for Menu Models.
 */
export abstract class MenuModelGenerator<
    SETTINGS extends { [key: string]: any },
    MODEL extends MenuModel = MenuModel,
    ARGS extends Array<any> = Array<any>
> extends Configurable<SETTINGS> {
    /**
     * 
     * @param globals 
     */
    public constructor(
        public readonly globals: MenuGlobals,
        settings: SETTINGS,
    ) {
        super(settings);
    }


    /**
     * Copy the current state of the generator.
     * @returns 
     */
    public cpy(): MenuButtonGenerator {
        return new MenuButtonGenerator(this.globals, this.data);
    }

    /**
     * Create an actual instance of the button.
     * @returns
     * */
    public abstract make(...args: [...ARGS]): MODEL;
}

/**
 * Possible settings for a MenuButtonGenerator.
 */
interface MenuButtonGeneratorSettings {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    icon?: string | null;
    parent?: MenuGroupModel;
    on_select?: (button: MenuModel) => void;
    callback?: (button: MenuButtonModel) => void;
}

/**
 * A generator for Menu Button Models.
 */
export class MenuButtonGenerator extends MenuModelGenerator<MenuButtonGeneratorSettings, MenuButtonModel> {
    public static readonly default: MenuButtonGeneratorSettings = {
        x: 0,
        y: 0,
        width: 50,
        height: 50,
    };

    constructor(
        public readonly globals: MenuGlobals,
        settings: Partial<MenuButtonGeneratorSettings>,
    ) {
        super(globals, Object.assign(MenuButtonGenerator.default, settings));
    }

    /**
     * Create an actual instance of the button.
     * @param name 
     */
    public make(name: string): MenuButtonModel {
        const item = new MenuButtonModel(
            this.globals,
            name,
        );
        item.area.left = this.data.x ?? 0;
        item.area.top = this.data.y ?? 0;
        item.area.width = this.data.width ?? 0;
        item.area.height = this.data.height ?? 0;
        item.icon = this.data.icon ?? null;
        item.parent = this.data.parent ?? null;
        if (this.data.on_select) {
            item.onSelect(this.data.on_select);
        }
        this.data.callback?.(item);
        return item;
    }
}


/**
 * Possible settings for a MenuGroupGenerator.
 */
interface MenuGroupGeneratorSettings {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    child_area_width?: number;
    icon_open?: string | null;
    icon_close?: string | null;
    parent?: MenuGroupModel;
    on_select?: (button: MenuModel) => void;
    callback?: (button: MenuGroupModel) => void;
}



/**
 * A generator for Menu Group Models.
 */
export class MenuGroupGenerator extends MenuModelGenerator<MenuGroupGeneratorSettings, MenuGroupModel> {

    public static readonly default: MenuButtonGeneratorSettings = {
        x: 0,
        y: 0,
        width: 50,
        height: 50,
    };

    constructor(
        public readonly globals: MenuGlobals,
        settings: Partial<MenuButtonGeneratorSettings>,
    ) {
        super(globals, Object.assign(MenuButtonGenerator.default, settings));
    }


    /**
     * Create an actual instance of the button.
     * @param name 
     */
    public make(name: string): MenuGroupModel {
        const item = new MenuGroupModel(
            this.globals,
            name,
        );
        item.area.left = this.data.x ?? 0;
        item.area.top = this.data.y ?? 0;
        item.area.width = this.data.width ?? 0;
        item.area.height = this.data.height ?? 0;
        item.child_area.width = this.data.child_area_width ?? 100;
        item.icon_open = this.data.icon_open ?? null;
        item.icon_close = this.data.icon_close ?? null;
        item.icon = item.icon_open;
        item.parent = this.data.parent ?? null;
        if (this.data.on_select) {
            item.onSelect(this.data.on_select);
        }
        this.data.callback?.(item);
        return item;
    }
}

interface MenuDefinitionGroup {
    name: string;
    width: number;
    children: Array<MenuDefinitionItem>;
}

interface MenuDefinitionButton {
    name: string;
}

type MenuDefinitionItem = MenuDefinitionButton | MenuDefinitionGroup;

export class MenuGenerator extends Configurable<MenuButtonGeneratorSettings & MenuGroupGeneratorSettings> {
    public static readonly default: Partial<MenuButtonGeneratorSettings & MenuGroupGeneratorSettings> = {};

    public constructor(
        public readonly globals: MenuGlobals,
        settings: Partial<MenuButtonGeneratorSettings & MenuGroupGeneratorSettings> = {},
    ) {
        super(Object.assign(MenuGenerator.default, settings));
    }

    public button() {
        return new MenuButtonGenerator(this.globals, this.data);
    }

    public group() {
        return new MenuGroupGenerator(this.globals, this.data);
    }

    public compile(
        menu_definition: MenuDefinitionItem,
    ): MenuModel {
        if (!("children" in menu_definition)) {
            return this.button()
                .make(menu_definition.name);
        }
        const group = this.group()
            .set("width", menu_definition.width)
            .make(menu_definition.name);
        for (const child of menu_definition.children) {
            group.childGenerator().compile(child);
        }
        return group;
    }
}