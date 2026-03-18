import { _decorator, Component } from 'cc';
import { GameManager } from '../core/GameManager';
const { ccclass, property } = _decorator;

/** All possible states a customer can be in. */
export enum CustomerState {
    /** Customer is walking towards the counter or queue. */
    Queuing = 'Queuing',
    /** Customer is placing their order at the counter. */
    Ordering = 'Ordering',
    /** Customer is waiting for the order to be fulfilled. */
    WaitingForOrder = 'WaitingForOrder',
    /** Customer is leaving the shop (happy or angry). */
    Leaving = 'Leaving',
}

/**
 * Customer — base class for every customer that visits the coffee shop.
 *
 * Contains:
 *  - A simple state machine (`state`) driven by `_transitionTo()`.
 *  - A patience countdown that triggers an angry departure when exhausted.
 *  - An `order` string that records which coffee was ordered.
 *
 * Subclasses override `onStateEnter` / `onStateExit` to add specific behaviour
 * (animations, sound effects, movement, etc.).
 */
@ccclass('Customer')
export class Customer extends Component {
    /** Maximum patience value (counts down to 0). */
    @property
    maxPatience: number = 30;

    /** Amount of gold paid when the order is fulfilled. */
    @property
    payAmount: number = 10;

    /** Reputation lost when the customer leaves angry. */
    @property
    reputationPenalty: number = 5;

    /** Reputation gained when the customer leaves happy. */
    @property
    reputationReward: number = 2;

    // ─── Runtime state ───────────────────────────────────────────────────────

    /** Which coffee (or other item) this customer ordered. */
    order: string = '';

    /** Remaining patience. When it reaches 0 the customer leaves angry. */
    patience: number = 0;

    private _state: CustomerState = CustomerState.Queuing;

    // ─── Lifecycle ───────────────────────────────────────────────────────────

    onLoad() {
        this.patience = this.maxPatience;
        this._transitionTo(CustomerState.Queuing);
    }

    update(dt: number) {
        // Tick down patience while the customer is waiting for their order.
        if (this._state === CustomerState.WaitingForOrder) {
            this.patience -= dt;
            if (this.patience <= 0) {
                this.patience = 0;
                this._leaveAngry();
            }
        }
    }

    // ─── State machine ───────────────────────────────────────────────────────

    /** Read-only access to the current state. */
    get state(): CustomerState {
        return this._state;
    }

    /**
     * Advance the customer to the next logical state.
     * The sequence is: Queuing → Ordering → WaitingForOrder → Leaving.
     */
    advanceState() {
        switch (this._state) {
            case CustomerState.Queuing:
                this._transitionTo(CustomerState.Ordering);
                break;
            case CustomerState.Ordering:
                this._transitionTo(CustomerState.WaitingForOrder);
                break;
            case CustomerState.WaitingForOrder:
                this._serveAndLeave();
                break;
            default:
                break;
        }
    }

    /**
     * Called by the serving logic when the order is ready.
     * Awards gold and reputation then transitions to Leaving.
     */
    receiveOrder() {
        if (this._state !== CustomerState.WaitingForOrder) return;
        this._serveAndLeave();
    }

    // ─── Overridable hooks ───────────────────────────────────────────────────

    /**
     * Called whenever the customer enters a new state.
     * Override in subclasses to trigger animations, sound, etc.
     */
    protected onStateEnter(state: CustomerState) {}

    /**
     * Called whenever the customer exits a state.
     * Override in subclasses for clean-up logic.
     */
    protected onStateExit(state: CustomerState) {}

    // ─── Private helpers ─────────────────────────────────────────────────────

    private _transitionTo(next: CustomerState) {
        this.onStateExit(this._state);
        this._state = next;
        this.onStateEnter(next);
    }

    private _serveAndLeave() {
        const gm = GameManager.Instance;
        if (gm) {
            gm.addGold(this.payAmount);
            gm.addReputation(this.reputationReward);
        }
        this._transitionTo(CustomerState.Leaving);
        // Subclasses can override onStateEnter(Leaving) to play walk-out animation.
        this.scheduleOnce(() => {
            this.node.destroy();
        }, 1.5);
    }

    private _leaveAngry() {
        const gm = GameManager.Instance;
        if (gm) {
            gm.loseReputation(this.reputationPenalty);
        }
        this._transitionTo(CustomerState.Leaving);
        this.scheduleOnce(() => {
            this.node.destroy();
        }, 1.5);
    }
}
