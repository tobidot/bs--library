import { Vector2D, Vector2DLike } from "../math";
import { BoundingBox, Rect } from "../math/Rect";
import { Collision, PhysicsProxiable, PhysicsProxy, PhysicsEngine } from "./Physics";

export interface AABBPhysicsEngineOptions {
    world_box: Rect;
    simple_collisions?: boolean;
}

/**
 * Handles collisions between Axis-Aligned Bounding Boxes (AABBs) that are moving.
 * 
 * A call to `update` will calculate a physics simulation step for each box and
 * on collision, call the `onCollision` callback for each box.
 * 
 * Updates run in fixed time steps.
 * 
 * @module Physics
 */
export class AABBPhysicsEngine extends PhysicsEngine<AABBPhysicsProxy> {

    constructor(
        public options: AABBPhysicsEngineOptions,
    ) {
        super();
    }

    /**
     * Update all proxies and handle collisions.
     * 
     * @param delta_seconds 
     */
    public update(delta_seconds: number): void {
        delta_seconds = 0.016; // 60 FPS
        this.proxies.forEach(proxy => {
            proxy.outerBox.move(proxy.velocity.cpy().mul(delta_seconds));
        });
        this.checkCollisions();
        this.handleWorldCollisions();
    }

    /**
     * Handles collisions between the world box and the AABBs.
     */
    public handleWorldCollisions() {
        // inset the screen box by the size of the text box,
        // this will be the area the textbox should always touch
        this.proxies.forEach(proxy => {
            // if (proxy.static) return;
            const area_of_freedom = this.options.world_box.cpy().inset(proxy.outerBox.size);
            const distance = area_of_freedom.distance(proxy.outerBox);
            if (Math.abs(distance.x) > 0) {
                proxy.velocity.x = Math.abs(proxy.velocity.x) * ((distance.x > 0) ? -1 : 1);
                proxy.outerBox.center.x -= distance.x;
            }
            if (Math.abs(distance.y) > 0) {
                proxy.velocity.y = Math.abs(proxy.velocity.y) * ((distance.y > 0) ? -1 : 1);
                proxy.outerBox.center.y -= distance.y;
            }
            if (Math.abs(distance.x) > 0 || Math.abs(distance.y) > 0) {
                proxy.onWorldCollision(distance);
            }
        });
    }

    /**
     * Handles collisions between the AABBs.
     */
    public checkCollisions() {
        this.collisions = [];
        this.proxies.forEach(proxy => {
            this.proxies.forEach(other => {
                // don't collide with yourself
                if (proxy === other) return;
                // get overlapping rectangle between the two boxes
                const overlap = proxy.outerBox.overlap(other.outerBox);
                // if the overlap is a "real" rectangle, then there is a collision
                if (overlap.bottom > overlap.top && overlap.right > overlap.left) {
                    this.handleCollision(proxy, other, overlap);
                }
            });
        });
    }

    /**
     * A collision happened, solve it and call the onCollision callback for each box.
     * @param proxy 
     * @param other 
     * @param overlap 
     */
    public handleCollision(proxy: AABBPhysicsProxy, other: AABBPhysicsProxy, overlap: BoundingBox) {
        // create a collision object
        const collision: AABBCollision = {
            overlap: overlap,
            a: proxy,
            b: other,
        }
        // solve the collision on physics side
        this.solveCollision(collision);
        // call the onCollision callback for each box
        proxy.onCollision(other, collision);
        other.onCollision(proxy, collision);
        // add the collision to the list of collisions
        this.collisions.push(collision);
    }

    /**
     * Handles a collision between two AABBs.
     * @param collision 
     */
    public solveCollision(collision: AABBCollision) {
        if (this.options.simple_collisions) {
            this.solveCollisionSimple(collision);
        } else {
            this.solveCollisionComplex(collision);
        }

    }

    /**
     * This solves collisions by moving the boxes out of the overlap.
     * and reversing the velocity of the box that is moving into the other box.
     * 
     * @param collision 
     */
    public solveCollisionSimple(collision: AABBCollision) {

        const { overlap, a, b } = collision;
        const overlap_rect = Rect.fromBoundingBox(overlap);
        if (a.static && b.static) return;
        if (a.static || b.static) {
            overlap_rect.size.mul(2);
        }
        if (overlap_rect.w < overlap_rect.h) {
            // if the overlap is taller than it is wide, then the collision is horizontal
            const a_direction = (overlap_rect.center.x < a.outerBox.center.x) ? 1 : -1;
            if (!a.static) {
                a.velocity.x = Math.abs(a.velocity.x) * a_direction;
                a.outerBox.center.x += overlap_rect.w / 2 * a_direction;
            }
            const b_direction = (overlap_rect.center.x < b.outerBox.center.x) ? 1 : -1;
            if (!b.static) {
                b.velocity.x = Math.abs(b.velocity.x) * b_direction;
                b.outerBox.center.x += overlap_rect.w / 2 * b_direction;
            }
        } else {
            // if the overlap is wider than it is tall, then the collision is vertical
            const a_direction = (overlap_rect.center.y < a.outerBox.center.y) ? 1 : -1;
            if (!a.static) {
                a.velocity.y = Math.abs(a.velocity.y) * a_direction;
                a.outerBox.center.y += overlap_rect.h / 2 * a_direction;
            }
            const b_direction = (overlap_rect.center.y < b.outerBox.center.y) ? 1 : -1;
            if (!b.static) {
                b.velocity.y = Math.abs(b.velocity.y) * b_direction;
                b.outerBox.center.y += overlap_rect.h / 2 * b_direction;
            }
        }
    }

    /**
     * 
     * This solves collisions by moving the boxes out of the overlap.
     * and calculating a new velocity for each box based on the impact.
     * 
     * @param collision 
     */
    public solveCollisionComplex(collision: AABBCollision) {
        if (collision.a.static || collision.b.static) {
            return this.solveCollisionSimple(collision);
        };
        const { overlap, a, b } = collision;
        const overlap_rect = Rect.fromBoundingBox(overlap);

        // calculate the new velocity for each box
        const a_mass = a.outerBox.size.x * a.outerBox.size.y;
        const b_mass = b.outerBox.size.x * b.outerBox.size.y;
        const total_mass = a_mass + b_mass;
        const impact_vector_a = b.outerBox.center.cpy().sub(a.outerBox.center).normalize();
        const impact_vector_b = impact_vector_a.cpy().mul(-1);
        const a_force = a.velocity.dot(impact_vector_a) * (a_mass);
        const b_force = b.velocity.dot(impact_vector_b) * (b_mass);
        const impact_force = a_force + b_force;
        if (a.static) {
            impact_vector_a.set(impact_vector_b).mul(-1);
        }
        if (b.static) {
            impact_vector_b.set(impact_vector_a).mul(-1);
        }
        if (!a.static) {
            a.velocity.add(impact_vector_b.cpy().mul(impact_force / a_mass)).mul(0.999);
        }
        if (!b.static) {
            b.velocity.add(impact_vector_a.cpy().mul(impact_force / b_mass)).mul(0.999);
        }

        if (overlap_rect.w < overlap_rect.h) {
            // if the overlap is taller than it is wide, then the collision is horizontal
            const a_direction = (overlap_rect.center.x < a.outerBox.center.x) ? 1 : -1;
            if (!a.static) {
                a.outerBox.center.x += overlap_rect.w / 2 * a_direction;
            }
            const b_direction = (overlap_rect.center.x < b.outerBox.center.x) ? 1 : -1;
            if (!b.static) {
                b.outerBox.center.x += overlap_rect.w / 2 * b_direction;
            }
        } else {
            // if the overlap is wider than it is tall, then the collision is vertical
            const a_direction = (overlap_rect.center.y < a.outerBox.center.y) ? 1 : -1;
            if (!a.static) {
                a.outerBox.center.y += overlap_rect.h / 2 * a_direction;
            }
            const b_direction = (overlap_rect.center.y < b.outerBox.center.y) ? 1 : -1;
            if (!b.static) {
                b.outerBox.center.y += overlap_rect.h / 2 * b_direction;
            }
        }
    }

}

/**
 * Represents a collision between two moving Axis-Aligned Bounding Boxes (AABBs).
 */
export interface AABBCollision extends Collision {
    a: AABBPhysicsProxy;
    b: AABBPhysicsProxy;
}

/**
 * Represents an entity with an Axis-Aligned Bounding Box (AABB) that is moving.
 */
export class AABBPhysicsProxy extends PhysicsProxy {
    public static: boolean = false;

    constructor(
        outerBox: Rect,
        public velocity: Vector2D,
        reference: PhysicsProxiable,
    ) {
        super(outerBox, reference);
    }
}