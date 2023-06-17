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
     * @param top_y 
     * @param width 
     * @param height 
     */
    constructor(
        other: RectLike | number,
        top_y?: number,
        width?: number,
        height?: number,
    ) {
        if (other instanceof Object) {
            this.center = new Vector2D(other.x + other.w / 2, other.y + other.h / 2);
            this.size = new Vector2D(other.w, other.h);
        } else {
            assert(top_y !== undefined);
            assert(width !== undefined);
            assert(height !== undefined);
            this.center = new Vector2D(other + width / 2, top_y + height / 2);
            this.size = new Vector2D(width, height);
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
     * Check if the given position is inside this rect
     * @param position 
     */
    public contains(position: Vector2D): boolean {
        return position.x >= this.left
            && position.x <= this.right
            && position.y >= this.top
            && position.y <= this.bottom
            ;
    }

    /**
     * Determine if this rect intersects the given rect
     * @param other
     * @returns True if the rects intersect, false otherwise
     * @see https://stackoverflow.com/a/306332/1048862
     * */
    public intersects(other: RectLike): boolean {
        return this.x < other.x + other.w
            && this.x + this.w > other.x
            && this.y < other.y + other.h
            && this.y + this.h > other.y;
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
        return this.left;
    }

    public get y() {
        return this.top;
    }

    public set x(value: number) {
        this.left = value;
    }

    public set y(value: number) {
        this.top = value;
    }

    public get w() {
        return this.size.x;
    }

    public get h() {
        return this.size.y;
    }

    public set w(value: number) {
        this.width = value;
    }

    public set h(value: number) {
        this.height = value;
    }

    public get width() {
        return this.size.x;
    }

    public get height() {
        return this.size.y;
    }

    public set width(value: number) {
        this.center.x += (value - this.size.x) / 2;
        this.size.x = value;
    }

    public set height(value: number) {
        this.center.y += (value - this.size.y) / 2;
        this.size.y = value;
    }

    public get left(): number {
        return this.center.x - this.size.x / 2;
    }

    public get right(): number {
        return this.center.x + this.size.x / 2;
    }

    public get top(): number {
        return this.center.y - this.size.y / 2;
    }

    public get bottom(): number {
        return this.center.y + this.size.y / 2;
    }

    public set left(value: number) {
        this.center.x = value + this.size.x / 2;
    }

    public set right(value: number) {
        this.center.x = value - this.size.x / 2;
    }

    public set top(value: number) {
        this.center.y = value + this.size.y / 2;
    }

    public set bottom(value: number) {
        this.center.y = value - this.size.y / 2;
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