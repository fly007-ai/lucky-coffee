import { _decorator, Component, Vec3 } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

enum CustomerState {
    WalkingIn,
    Ordering,
    Waiting,
    Leaving,
}

@ccclass('Customer')
export class Customer extends Component {
    @property
    payAmount: number = 10;

    @property
    waitDuration: number = 5;

    @property
    moveSpeed: number = 100;

    private _state: CustomerState = CustomerState.WalkingIn;
    private readonly _counterPosition: Vec3 = new Vec3(0, 0, 0);

    private _moveCb: ((dt: number) => void) | null = null;

    onLoad() {
        this._state = CustomerState.WalkingIn;
        this._moveToCounter();
    }

    private _moveToCounter() {
        this._state = CustomerState.WalkingIn;
        const duration = 1.5;
        const startPos = this.node.position.clone();
        let elapsed = 0;

        this._moveCb = (dt: number) => {
            elapsed += dt;
            const t = Math.min(elapsed / duration, 1);
            this.node.setPosition(
                startPos.x + (this._counterPosition.x - startPos.x) * t,
                startPos.y + (this._counterPosition.y - startPos.y) * t,
                0,
            );
            if (t >= 1) {
                this.unschedule(this._moveCb!);
                this._moveCb = null;
                this._onArrived();
            }
        };
        this.schedule(this._moveCb);
    }

    private _onArrived() {
        this._state = CustomerState.Ordering;
        this.scheduleOnce(() => {
            this._state = CustomerState.Waiting;
            this.scheduleOnce(() => {
                this._pay();
            }, this.waitDuration);
        }, 0.5);
    }

    private _pay() {
        GameManager.instance.addGold(this.payAmount);
        this._leave();
    }

    private _leave() {
        this._state = CustomerState.Leaving;
        const startPos = this.node.position.clone();
        const exitPos = new Vec3(startPos.x - 300, startPos.y, 0);
        const duration = 1.5;
        let elapsed = 0;

        const leaveCb = (dt: number) => {
            elapsed += dt;
            const t = Math.min(elapsed / duration, 1);
            this.node.setPosition(
                startPos.x + (exitPos.x - startPos.x) * t,
                startPos.y,
                0,
            );
            if (t >= 1) {
                this.unschedule(leaveCb);
                this.node.destroy();
            }
        };
        this.schedule(leaveCb);
    }
}
