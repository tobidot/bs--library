import { assert } from "../flow";

/**
 * A 2D vector-like object.
 */
export interface Vector2DLike {
    x: number;
    y: number;
}

/**
 * A 2D vector.
 * used to represent position, velocity, acceleration, etc.
 * provides basic vector operations that manipulate the vector in place.
 * use cpy() to create a copy of the vector. 
 */
export class Vector2D implements Vector2DLike {

    public x: number;
    public y: number;

    constructor(other: Vector2DLike);
    constructor(x: number, y: number);
    constructor(other: Vector2DLike | number, y?: number) {
        if (other instanceof Object) {
            this.x = other.x;
            this.y = other.y;
        } else {
            assert(y !== undefined);
            this.x = other;
            this.y = y;
        }
    }

    /**
     * @returns a copy of this vector.
     */
    public cpy(): Vector2D {
        return new Vector2D(this);
    }

    /**
     * Create a vector from an angle and length.
     * @param radians 
     * @param length 
     */
    public static fromAngle(radians: number, length: number = 1): Vector2D {
        return new Vector2D(
            Math.cos(radians) * length,
            Math.sin(radians) * length
        );
    }

    /**
     * Set the values of this vector to the values of another vector.
     * @param other 
     * @returns 
     */
    public set(other: Vector2DLike): this {
        this.x = other.x;
        this.y = other.y;
        return this;
    }

    /**
     * Add another vector to this vector.
     * @param other 
     * @returns 
     */
    public add(other: Vector2DLike): this {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    /**
     * Subtract another vector from this vector.
     * @param other 
     * @returns 
     */
    public sub(other: Vector2DLike): this {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    /**
     * Multiply this vector by a scalar or component wise by another vector.
     * @param scalar 
     * @returns 
     */
    public mul(scalar: number | Vector2DLike): this {
        if (scalar instanceof Object) {
            this.x *= scalar.x;
            this.y *= scalar.y;
        } else {
            this.x *= scalar;
            this.y *= scalar;
        }
        return this;
    }

    /**
     * Calculate the dot product of this vector and another vector.
     * @param other  
     */
    public dot(other: Vector2DLike): number {
        return this.x * other.x + this.y * other.y;
    }

    /**
     * @returns Return the length of this vector squared.
     **/
    public length2(): number {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * @returns the length of this vector.
     */
    public length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Make this vector a unit vector.
     */
    public normalize() : this {
        const length = this.length();
        if (length === 0) {
            return this;
        }
        this.x /= length;
        this.y /= length;
        return this;
    }
}