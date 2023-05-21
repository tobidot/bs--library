import { Vector2D } from "../math";
import { BoundingBox, Rect } from "../math/Rect";

/**
 * Represents an entity inside the Physics engine.
 */
export interface PhysicsProxiable {
    onWorldCollision?: (distance: Vector2D) => void;
    onCollision?: (other: PhysicsProxy, collision: Collision) => void;
}

/**
 * Represents an physics entity.
 */
export class PhysicsProxy {
    public static next_id = 1;
    public id: number = PhysicsProxy.next_id++;

    constructor(
        public outerBox: Rect,
        public reference: PhysicsProxiable,
    ) {

    }

    /**
     * A collision has occurred between this entity and another.
     * @param other 
     * @param collision 
     */
    public onCollision(other: PhysicsProxy, collision: Collision) {
        if (!!this.reference.onCollision) {
            this.reference.onCollision(other, collision);
        }
    }

    public onWorldCollision(distance: Vector2D) {
        if (!!this.reference.onWorldCollision) {
            this.reference.onWorldCollision(distance);
        }
    }
}

/**
 * Represents a collision between two Axis-Aligned Bounding Boxes (AABBs).
 */
export interface Collision {
    overlap: BoundingBox;
    a: PhysicsProxy;
    b: PhysicsProxy;
}

/**
 * Base abstract class for a physics engine.
 */
export abstract class PhysicsEngine<COLLISION_PROXY_TYPE extends PhysicsProxy> {
    public collisions = new Array<Collision>();
    public proxies = new Array<COLLISION_PROXY_TYPE>();

    /**
     * Handle an update to the physics engine.
     * @param delta_seconds 
     */
    public abstract update(delta_seconds: number): void;

    /**
     * Add a proxied entity to the physics engine.
     * @param proxy 
     */
    public add(proxy: COLLISION_PROXY_TYPE): COLLISION_PROXY_TYPE {
        this.proxies.push(proxy);
        return proxy;
    }

    /**
     * Remove a proxied entity from the physics engine by id.
     * @param proxy 
     */
    public remove(proxy: COLLISION_PROXY_TYPE | number): void {
        const proxy_id = proxy instanceof PhysicsProxy ? proxy.id : proxy;
        this.proxies = this.proxies.filter(p => p.id !== proxy_id);
    }

    /**
     * Remove all proxied entities from the physics engine.
     */
    public reset() {
        this.proxies = [];
        this.collisions = [];
    }
}