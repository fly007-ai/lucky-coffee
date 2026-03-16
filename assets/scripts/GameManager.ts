import { _decorator, Component, sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager | null = null;

    private _gold: number = 0;
    private _level: number = 1;

    static get instance(): GameManager {
        return GameManager._instance!;
    }

    get gold(): number {
        return this._gold;
    }

    get level(): number {
        return this._level;
    }

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

    addGold(amount: number) {
        this._gold += amount;
        this.saveData();
    }

    spendGold(amount: number): boolean {
        if (this._gold < amount) {
            return false;
        }
        this._gold -= amount;
        this.saveData();
        return true;
    }

    saveData() {
        sys.localStorage.setItem('gold', String(this._gold));
        sys.localStorage.setItem('level', String(this._level));
    }

    loadData() {
        const savedGold = sys.localStorage.getItem('gold');
        const savedLevel = sys.localStorage.getItem('level');
        const parsedGold = savedGold !== null ? parseInt(savedGold, 10) : NaN;
        const parsedLevel = savedLevel !== null ? parseInt(savedLevel, 10) : NaN;
        this._gold = isNaN(parsedGold) ? 0 : parsedGold;
        this._level = isNaN(parsedLevel) ? 1 : parsedLevel;
    }
}
