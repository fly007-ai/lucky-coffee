import { _decorator, Component, sys } from 'cc';
const { ccclass, property } = _decorator;

/**
 * GameManager — global singleton that manages core player data:
 * Gold (金币), Diamond (钻石), and Reputation (口碑).
 */
@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager | null = null;

    private _gold: number = 0;
    private _diamond: number = 0;
    private _reputation: number = 0;

    // ─── Singleton accessor ──────────────────────────────────────────────────

    static get Instance(): GameManager {
        return GameManager._instance!;
    }

    // ─── Getters ─────────────────────────────────────────────────────────────

    get gold(): number {
        return this._gold;
    }

    get diamond(): number {
        return this._diamond;
    }

    get reputation(): number {
        return this._reputation;
    }

    // ─── Lifecycle ───────────────────────────────────────────────────────────

    onLoad() {
        if (GameManager._instance !== null) {
            this.node.destroy();
            return;
        }
        GameManager._instance = this;
        this.loadData();
    }

    onDestroy() {
        if (GameManager._instance === this) {
            GameManager._instance = null;
        }
    }

    // ─── Gold ────────────────────────────────────────────────────────────────

    addGold(amount: number) {
        if (amount <= 0) return;
        this._gold += amount;
        this.saveData();
    }

    /**
     * Deduct gold. Returns true on success, false when balance is insufficient.
     */
    spendGold(amount: number): boolean {
        if (this._gold < amount) {
            return false;
        }
        this._gold -= amount;
        this.saveData();
        return true;
    }

    // ─── Diamond ─────────────────────────────────────────────────────────────

    addDiamond(amount: number) {
        if (amount <= 0) return;
        this._diamond += amount;
        this.saveData();
    }

    /**
     * Deduct diamond. Returns true on success, false when balance is insufficient.
     */
    spendDiamond(amount: number): boolean {
        if (this._diamond < amount) {
            return false;
        }
        this._diamond -= amount;
        this.saveData();
        return true;
    }

    // ─── Reputation ──────────────────────────────────────────────────────────

    addReputation(amount: number) {
        if (amount <= 0) return;
        this._reputation += amount;
        this.saveData();
    }

    /**
     * Reduce reputation (e.g. when a customer leaves angry).
     * Reputation cannot drop below 0.
     */
    loseReputation(amount: number) {
        this._reputation = Math.max(0, this._reputation - amount);
        this.saveData();
    }

    // ─── Persistence ─────────────────────────────────────────────────────────

    saveData() {
        sys.localStorage.setItem('gold', String(this._gold));
        sys.localStorage.setItem('diamond', String(this._diamond));
        sys.localStorage.setItem('reputation', String(this._reputation));
    }

    loadData() {
        this._gold = this._loadInt('gold', 0);
        this._diamond = this._loadInt('diamond', 0);
        this._reputation = this._loadInt('reputation', 0);
    }

    private _loadInt(key: string, fallback: number): number {
        const raw = sys.localStorage.getItem(key);
        if (raw === null) return fallback;
        const parsed = parseInt(raw, 10);
        return isNaN(parsed) ? fallback : parsed;
    }
}
