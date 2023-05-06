import { assert } from "../flow";
import { Vector2D, Vector2DLike } from "./Vector";

/**
 * A rectangle with x, y of the top left and width and height
 */
export interface RectLike {
    x: number;
    y: number;
    w: number;
    h: number;
}

/**
 * A rectangle with the left, right, top and bottom
 */
export interface BoundingBox {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

/**
 * A rectangle with a center and a size
 */
export class Rect implements RectLike, BoundingBox {
    public center: Vector2D;
    public size: Vector2D;

    /**
     * Construct from a top left and a bottom right
     * or from a center and a size
     * @param other 
     * @param y 
     * @param w 
     * @param h 
     */
    constructor(
        other: RectLike | number,
        y?: number,
        w?: number,
        h?: number,
    ) {
        if (other instanceof Object) {
            this.center = new Vector2D(other.x + other.w / 2, other.y + other.h / 2);
            this.size = new Vector2D(other.w, other.h);
        } else {
            assert(y !== undefined);
            assert(w !== undefined);
            assert(h !== undefined);
            this.center = new Vector2D(other + w / 2, y + h / 2);
            this.size = new Vector2D(w, h);
        }
    }

    /**
     * Create a rect from center and a size
     * @param bounding_box 
     * @returns 
     */
    public static fromCenterAndSize(
        center: Vector2DLike,
        size: Vector2DLike
    ): Rect {
        return new Rect({
            x: center.x - size.x / 2,
            y: center.y - size.y / 2,
            w: size.x,
            h: size.y,
        });
    }

    /**
     * Create a rect from a bounding box
     * @param bounding_box 
     * @returns 
     */
    public static fromBoundingBox(bounding_box: BoundingBox): Rect {
        return new Rect({
            x: bounding_box.left,
            y: bounding_box.top,
            w: bounding_box.right - bounding_box.left,
            h: bounding_box.bottom - bounding_box.top,
        });
    }

    /**
     * @returns A copy of this rect
     */
    public cpy(): Rect {
        return new Rect(this);
    }

    /**
     * Set the values of this rect to the values of the given rect
     * @param other 
     * @returns 
     */
    public set(other: RectLike): this {
        this.center.x = other.x;
        this.center.y = other.y;
        this.size.x = other.w;
        this.size.y = other.h;
        return this;
    }

    /**
     * Move the rect by the given offset
     * @param offset 
     * @returns 
     */
    public move(offset: Vector2DLike): this {
        this.center.add(offset);
        return this;
    }

    /**
     * Reduce the size of the rect by the given size
     * @param size 
     */
    public inset(size: Vector2D) {
        this.size.sub(size);
        this.size.sub(size);
        return this;
    }

    /**
     * Determine the overlap between this rect and the given rect.
     * @param other 
     * @returns The rectangle that both this rect and the given rect overlap in.
     */
    public overlap(other: Rect): BoundingBox {
        return {
            left: Math.max(this.left, other.left),
            right: Math.min(this.right, other.right),
            top: Math.max(this.top, other.top),
            bottom: Math.min(this.bottom, other.bottom),
        };
    }

    /**
     * Gets the distance between this rect and the given rect. 
     * If the rects overlap, the distance is 0.
     * 
     * @param other 
     */
    public distance(other: Rect): Vector2D {
        const top = other.bottom - this.top;
        const bottom = other.top - this.bottom;
        const left = other.right - this.left;
        const right = other.left - this.right;
        return new Vector2D(
            (left < 0) ? left : (right > 0 ? right : 0),
            (top < 0) ? top : (bottom > 0 ? bottom : 0),
        );
    }

    public get x() {
        return this.center.x - this.size.x / 2;
    }

    public get y() {
        return this.center.y - this.size.y / 2;
    }

    public get w() {
        return this.size.x;
    }

    public get h() {
        return this.size.y;
    }

    public get left(): number {
        return this.x;
    }

    public get right(): number {
        return this.x + this.w;
    }

    public get top(): number {
        return this.y;
    }

    public get bottom(): number {
        return this.y + this.h;
    }

    public asBoundingBox(): BoundingBox {
        return {
            left: this.left,
            right: this.right,
            top: this.top,
            bottom: this.bottom,
        };
    }
}