import { _decorator, Component, sys } from 'cc';
const { ccclass, property } = _decorator;

const SAVE_KEY = 'lucky_coffee_save';

interface SaveData {
    gold: number;
    diamond: number;
    reputation: number;
}

@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager | null = null;

    static get instance(): GameManager {
        return GameManager._instance!;
    }

    private _gold: number = 0;
    private _diamond: number = 0;
    private _reputation: number = 0;

    get gold(): number { return this._gold; }
    get diamond(): number { return this._diamond; }
    get reputation(): number { return this._reputation; }

    onLoad(): void {
        if (GameManager._instance && GameManager._instance !== this) {
            this.node.destroy();
            return;
        }
        GameManager._instance = this;
        this.loadData();
    }

    onDestroy(): void {
        if (GameManager._instance === this) {
            GameManager._instance = null;
        }
    }

    // ── Gold ──────────────────────────────────────────────────────────────────

    addGold(amount: number): void {
        if (amount <= 0) return;
        this._gold += amount;
        this.saveData();
    }

    spendGold(amount: number): boolean {
        if (amount <= 0 || this._gold < amount) return false;
        this._gold -= amount;
        this.saveData();
        return true;
    }

    // ── Diamond ───────────────────────────────────────────────────────────────

    addDiamond(amount: number): void {
        if (amount <= 0) return;
        this._diamond += amount;
        this.saveData();
    }

    spendDiamond(amount: number): boolean {
        if (amount <= 0 || this._diamond < amount) return false;
        this._diamond -= amount;
        this.saveData();
        return true;
    }

    // ── Reputation ────────────────────────────────────────────────────────────

    addReputation(amount: number): void {
        if (amount <= 0) return;
        this._reputation += amount;
        this.saveData();
    }

    loseReputation(amount: number): void {
        if (amount <= 0) return;
        this._reputation = Math.max(0, this._reputation - amount);
        this.saveData();
    }

    // ── Persistence ───────────────────────────────────────────────────────────

    private saveData(): void {
        const data: SaveData = {
            gold: this._gold,
            diamond: this._diamond,
            reputation: this._reputation,
        };
        sys.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    }

    private loadData(): void {
        const raw = sys.localStorage.getItem(SAVE_KEY);
        if (!raw) return;
        try {
            const data: SaveData = JSON.parse(raw);
            this._gold = data.gold ?? 0;
            this._diamond = data.diamond ?? 0;
            this._reputation = data.reputation ?? 0;
        } catch {
            // corrupted save – start fresh
        }
    }

    resetData(): void {
        this._gold = 0;
        this._diamond = 0;
        this._reputation = 0;
        sys.localStorage.removeItem(SAVE_KEY);
    }
}
