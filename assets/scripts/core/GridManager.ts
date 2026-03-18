import { _decorator, Component, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

/** Width of one isometric floor tile in pixels. */
export const TILE_WIDTH = 64;
/** Height of one isometric floor tile in pixels. */
export const TILE_HEIGHT = 32;

/**
 * GridManager — handles 2.5D isometric (等轴视角) coordinate conversions
 * between logical grid positions (row, col) and screen pixel positions (x, y).
 *
 * Standard isometric formulae:
 *   screen.x = (col - row) * (TILE_WIDTH  / 2)
 *   screen.y = (col + row) * (TILE_HEIGHT / 2)   (positive = up in Cocos)
 *
 * The origin (0, 0) of the grid maps to screen position (0, 0) of this node.
 */
@ccclass('GridManager')
export class GridManager extends Component {
    private static _instance: GridManager | null = null;

    // ─── Singleton accessor ──────────────────────────────────────────────────

    static get Instance(): GridManager {
        return GridManager._instance!;
    }

    // ─── Lifecycle ───────────────────────────────────────────────────────────

    onLoad() {
        if (GridManager._instance !== null) {
            this.node.destroy();
            return;
        }
        GridManager._instance = this;
    }

    onDestroy() {
        if (GridManager._instance === this) {
            GridManager._instance = null;
        }
    }

    // ─── Coordinate conversion ───────────────────────────────────────────────

    /**
     * Convert a logical grid position (row, col) to screen pixel coordinates.
     * The returned Vec2 is relative to this node's origin.
     */
    gridToScreen(row: number, col: number): Vec2 {
        const x = (col - row) * (TILE_WIDTH / 2);
        const y = (col + row) * (TILE_HEIGHT / 2);
        return new Vec2(x, y);
    }

    /**
     * Convert a screen pixel position (x, y) to the nearest logical grid cell.
     * This is the inverse of gridToScreen, useful for hit-testing tap/click events.
     *
     * @returns A Vec2 where x = col and y = row (both may be fractional; use
     *          Math.floor / Math.round as needed for the target cell).
     */
    screenToGrid(x: number, y: number): Vec2 {
        // Solve the 2×2 linear system:
        //   x = (col - row) * (TILE_WIDTH  / 2)
        //   y = (col + row) * (TILE_HEIGHT / 2)
        const col = x / TILE_WIDTH + y / TILE_HEIGHT;
        const row = y / TILE_HEIGHT - x / TILE_WIDTH;
        return new Vec2(col, row);
    }

    /**
     * Compute the rendering Z-order for an object at the given grid position.
     * Higher row + col → drawn later → appears in front (closer to the camera).
     */
    getZOrder(row: number, col: number): number {
        return row + col;
    }
}
