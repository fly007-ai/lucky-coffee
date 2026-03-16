import { _decorator, Component, ProgressBar } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('CoffeeMaker')
export class CoffeeMaker extends Component {
    @property
    productionTime: number = 3;

    @property
    profit: number = 10;

    @property(ProgressBar)
    progressBar: ProgressBar | null = null;

    private _isBusy: boolean = false;

    onInteract() {
        if (this._isBusy) {
            return;
        }
        this._isBusy = true;

        if (this.progressBar) {
            this.progressBar.progress = 0;
        }

        this.scheduleOnce(() => {
            this._onProductionComplete();
        }, this.productionTime);
    }

    onDestroy() {
        this.unscheduleAllCallbacks();
    }

    private _onProductionComplete() {
        if (this.progressBar) {
            this.progressBar.progress = 1;
        }
        GameManager.instance.addGold(this.profit);
        this._isBusy = false;
    }
}
