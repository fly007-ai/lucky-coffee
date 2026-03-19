import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/** Number of rows and columns in the isometric grid. */
const GRID_ROWS = 6;
const GRID_COLS = 6;

/** Half-widths of a single isometric tile in pixels. */
const TILE_HALF_W = 64;
const TILE_HALF_H = 32;

@ccclass('GridManager')
export class GridManager extends Component {
    private static _instance: GridManager | null = null;

    static get instance(): GridManager {
        return GridManager._instance!;
    }

    /** Prefab used for each floor tile. Assign in the Cocos Creator Inspector. */
    @property(Prefab)
    floorPrefab: Prefab | null = null;

    /** Parent node that holds all generated floor tiles. Assign in the Inspector. */
    @property(Node)
    gridRoot: Node | null = null;

    onLoad(): void {
        if (GridManager._instance && GridManager._instance !== this) {
            this.node.destroy();
            return;
        }
        GridManager._instance = this;
        this.generateGrid();
    }

    onDestroy(): void {
        if (GridManager._instance === this) {
            GridManager._instance = null;
        }
    }

    // ── Grid Generation ───────────────────────────────────────────────────────

    /**
     * Instantiates a GRID_ROWS × GRID_COLS set of floor tiles and positions
     * each one using the isometric coordinate formula.
     */
    generateGrid(): void {
        if (!this.floorPrefab) {
            console.warn('GridManager: floorPrefab is not assigned.');
            return;
        }

        const parent = this.gridRoot ?? this.node;

        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const tile = instantiate(this.floorPrefab);
                const screenPos = this.gridToScreen(row, col);
                tile.setPosition(screenPos);
                tile.setSiblingIndex(this.getZOrder(row, col));
                parent.addChild(tile);
            }
        }
    }

    // ── Coordinate Conversion ─────────────────────────────────────────────────

    /**
     * Converts a grid cell (row, col) to its isometric screen position (Vec3).
     *
     * Isometric projection:
     *   screenX = (col - row) * TILE_HALF_W
     *   screenY = (col + row) * TILE_HALF_H * -1   (y grows downward in screen space)
     */
    gridToScreen(row: number, col: number): Vec3 {
        const x = (col - row) * TILE_HALF_W;
        const y = -(col + row) * TILE_HALF_H;
        return new Vec3(x, y, 0);
    }

    /**
     * Converts a screen position (Vec3) back to the nearest grid cell [row, col].
     * Returns [-1, -1] if the position is outside the grid.
     */
    screenToGrid(screenPos: Vec3): [number, number] {
        // Inverse of the gridToScreen formula
        const col = (screenPos.x / TILE_HALF_W - screenPos.y / TILE_HALF_H) / 2;
        const row = (-screenPos.y / TILE_HALF_H - screenPos.x / TILE_HALF_W) / 2;

        const r = Math.round(row);
        const c = Math.round(col);

        if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) {
            return [-1, -1];
        }
        return [r, c];
    }

    /**
     * Returns a z-order (sibling index) value for a cell so that tiles closer
     * to the camera (higher row+col sum) are rendered on top.
     */
    getZOrder(row: number, col: number): number {
        return row + col;
    }

    /**
     * Returns true when the given grid coordinates are within bounds.
     */
    isValidCell(row: number, col: number): boolean {
        return row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS;
    }
}
