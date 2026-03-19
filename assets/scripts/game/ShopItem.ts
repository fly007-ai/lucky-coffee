import { _decorator, Component, Vec3 } from 'cc';
import { GridManager } from '../core/GridManager';
const { ccclass, property } = _decorator;

/** Size of a shop item in grid cells. */
export interface ItemSize {
    rows: number;
    cols: number;
}

/**
 * Base class for all furniture / shop items that occupy grid cells.
 * Attach this (or a subclass) to any placeable item node.
 */
@ccclass('ShopItem')
export class ShopItem extends Component {
    @property
    id: string = '';

    @property
    itemName: string = '';

    /** Top-left grid row of this item. */
    @property
    gridRow: number = 0;

    /** Top-left grid column of this item. */
    @property
    gridCol: number = 0;

    /** How many rows × cols this item occupies on the grid. */
    @property({ type: Object })
    size: ItemSize = { rows: 1, cols: 1 };

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    onLoad(): void {
        this.applyGridPosition();
    }

    // ── Grid Placement ────────────────────────────────────────────────────────

    /**
     * Moves this item to the supplied grid cell and updates the node's world
     * position using GridManager's isometric projection.
     */
    setGridPosition(row: number, col: number): void {
        this.gridRow = row;
        this.gridCol = col;
        this.applyGridPosition();
    }

    /**
     * Reads the current gridRow/gridCol and repositions the node accordingly.
     * Also updates the z-order so items farther from the camera are drawn behind.
     */
    private applyGridPosition(): void {
        const gm = GridManager.instance;
        if (!gm) return;

        // Centre the item on its top-left anchor cell (offset by half its size)
        const anchorRow = this.gridRow + (this.size.rows - 1) / 2;
        const anchorCol = this.gridCol + (this.size.cols - 1) / 2;

        const pos: Vec3 = gm.gridToScreen(anchorRow, anchorCol);
        this.node.setPosition(pos);
        this.node.setSiblingIndex(gm.getZOrder(this.gridRow, this.gridCol) + 1); // +1 so items always render above floor tiles at the same cell
    }

    /**
     * Returns the list of all grid cells occupied by this item.
     */
    getOccupiedCells(): Array<[number, number]> {
        const cells: Array<[number, number]> = [];
        for (let r = 0; r < this.size.rows; r++) {
            for (let c = 0; c < this.size.cols; c++) {
                cells.push([this.gridRow + r, this.gridCol + c]);
            }
        }
        return cells;
    }
}
