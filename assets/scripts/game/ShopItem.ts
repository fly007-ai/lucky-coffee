import { _decorator, Component, Node, Vec2 } from 'cc';
import { GridManager } from '../core/GridManager';
const { ccclass, property } = _decorator;

/**
 * ShopItem — base class for every placeable object in the coffee shop
 * (furniture, equipment, decorations, etc.).
 *
 * Subclasses should extend this component and add their specific logic.
 */
@ccclass('ShopItem')
export class ShopItem extends Component {
    /** Unique identifier for this item type (e.g. "coffee_machine_01"). */
    @property
    id: string = '';

    /** Display name shown in the UI. */
    @property
    itemName: string = '';

    /** Grid row the item occupies (top-left corner for multi-tile items). */
    @property
    gridRow: number = 0;

    /** Grid column the item occupies (top-left corner for multi-tile items). */
    @property
    gridCol: number = 0;

    /** How many grid columns this item spans. */
    @property
    sizeWidth: number = 1;

    /** How many grid rows this item spans. */
    @property
    sizeHeight: number = 1;

    // ─── Placement ───────────────────────────────────────────────────────────

    /**
     * Place the item at the given grid position and refresh the node's screen
     * position and Z-order immediately.
     */
    setGridPosition(row: number, col: number) {
        this.gridRow = row;
        this.gridCol = col;
        this._applyPosition();
    }

    /** Convenience getter that returns the grid position as a Vec2(col, row). */
    get gridPosition(): Vec2 {
        return new Vec2(this.gridCol, this.gridRow);
    }

    /** Convenience getter that returns the footprint size as Vec2(width, height). */
    get size(): Vec2 {
        return new Vec2(this.sizeWidth, this.sizeHeight);
    }

    // ─── Lifecycle ───────────────────────────────────────────────────────────

    onLoad() {
        this._applyPosition();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Sync the Cocos node position and Z-order from the current grid coordinates.
     * Call this whenever gridRow / gridCol change.
     */
    protected _applyPosition() {
        const gm = GridManager.Instance;
        if (!gm) return;

        // Use the visual centre of the item's footprint for screen positioning.
        const centreRow = this.gridRow + (this.sizeHeight - 1) / 2;
        const centreCol = this.gridCol + (this.sizeWidth - 1) / 2;

        const screenPos = gm.gridToScreen(centreRow, centreCol);
        this.node.setPosition(screenPos.x, screenPos.y, 0);

        this.updateZOrder();
    }

    /**
     * Recalculate and apply the Z-order (layer / draw order) for this item.
     * Objects closer to the front of the isometric view (higher row + col)
     * must be rendered on top of objects further back.
     */
    updateZOrder() {
        const gm = GridManager.Instance;
        if (!gm) return;

        // Use the back-most corner (top-left) for Z calculation so that the
        // furthest part of a large item still sorts correctly against neighbours.
        const zOrder = gm.getZOrder(this.gridRow, this.gridCol);
        this.node.setSiblingIndex(zOrder);
    }
}
