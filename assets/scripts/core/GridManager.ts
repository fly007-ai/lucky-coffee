import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

const TILE_WIDTH = 128;
const TILE_HEIGHT = 64;
const GRID_ROWS = 6;
const GRID_COLS = 6;

@ccclass('GridManager')
export class GridManager extends Component {
    @property(Prefab)
    floorPrefab: Prefab = null;

    @property(Node)
    gridRoot: Node = null;

    onLoad() {
        this.generateGrid();
    }

    /**
     * Converts a grid coordinate (row, col) to an isometric screen position.
     */
    gridToScreen(row: number, col: number): Vec3 {
        const x = (col - row) * (TILE_WIDTH / 2);
        const y = -(col + row) * (TILE_HEIGHT / 2);
        return new Vec3(x, y, 0);
    }

    /**
     * Converts an isometric screen position back to grid coordinates.
     */
    screenToGrid(x: number, y: number): { row: number; col: number } {
        const col = (x / (TILE_WIDTH / 2) - y / (TILE_HEIGHT / 2)) / 2;
        const row = (-y / (TILE_HEIGHT / 2) - x / (TILE_WIDTH / 2)) / 2;
        return { row: Math.round(row), col: Math.round(col) };
    }

    /**
     * Returns the z-order value for a grid cell so that tiles closer to the
     * camera (higher row + col sum) are rendered in front of those further away.
     */
    getZOrder(row: number, col: number): number {
        return row + col;
    }

    /**
     * Instantiates a floor tile prefab for every cell in the GRID_ROWS × GRID_COLS
     * grid, positions each tile using the isometric formula, and parents them all
     * under gridRoot.  Tiles are sorted by z-order so that foreground tiles occlude
     * background tiles correctly.
     */
    generateGrid() {
        if (!this.floorPrefab) {
            console.warn('GridManager: floorPrefab is not assigned.');
            return;
        }
        if (!this.gridRoot) {
            console.warn('GridManager: gridRoot is not assigned.');
            return;
        }

        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const tile = instantiate(this.floorPrefab);
                tile.setPosition(this.gridToScreen(row, col));
                this.gridRoot.addChild(tile);
                tile.setSiblingIndex(this.getZOrder(row, col));
            }
        }
    }
}
