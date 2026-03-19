import { _decorator, Component, Node } from 'cc';
import { GameManager } from '../core/GameManager';
const { ccclass, property } = _decorator;

/** Customer state machine states. */
export enum CustomerState {
    Queuing = 'Queuing',
    Ordering = 'Ordering',
    Waiting = 'Waiting',
    Receiving = 'Receiving',
    Paying = 'Paying',
    Leaving = 'Leaving',
}

@ccclass('Customer')
export class Customer extends Component {
    // ── Editor-assignable properties ─────────────────────────────────────────

    /** Maximum seconds the customer will wait before leaving unhappy. */
    @property
    maxPatience: number = 30;

    /** Gold awarded to the player when this customer pays. */
    @property
    goldReward: number = 10;

    /** Reputation lost when the customer leaves due to timeout. */
    @property
    reputationPenalty: number = 5;

    /** Seconds the customer spends walking to the counter before ordering. */
    @property
    queueDuration: number = 1.5;

    /** Seconds the customer spends placing the order. */
    @property
    orderingDuration: number = 2.0;

    /** Seconds spent celebrating when receiving the order. */
    @property
    receivingDuration: number = 1.0;

    /** Brief pause at the counter before the customer walks away after paying. */
    @property
    payingDuration: number = 0.5;

    /** Walk-out delay in seconds before the node is destroyed after leaving. */
    @property
    leaveDelay: number = 1.5;

    // ── Runtime state ─────────────────────────────────────────────────────────

    private _state: CustomerState = CustomerState.Queuing;
    private _patience: number = 0;
    private _elapsedInState: number = 0;

    get state(): CustomerState { return this._state; }
    get patience(): number { return this._patience; }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    onLoad(): void {
        this._patience = this.maxPatience;
        this.enterState(CustomerState.Queuing);
    }

    update(dt: number): void {
        this._elapsedInState += dt;

        // Patience tick – only counts down while the customer is waiting
        if (this._state === CustomerState.Waiting) {
            this._patience -= dt;
            if (this._patience <= 0) {
                this.onPatienceExpired();
                return;
            }
        }

        this.updateState(dt);
    }

    // ── State Machine ─────────────────────────────────────────────────────────

    private enterState(newState: CustomerState): void {
        this._state = newState;
        this._elapsedInState = 0;

        switch (newState) {
            case CustomerState.Queuing:
                // Play walk-in animation / move to counter position
                break;
            case CustomerState.Ordering:
                // Show order bubble, start ordering timer
                break;
            case CustomerState.Waiting:
                // Reset patience and start waiting for coffee
                this._patience = this.maxPatience;
                break;
            case CustomerState.Receiving:
                // Coffee delivered – brief celebration
                break;
            case CustomerState.Paying:
                this.pay();
                break;
            case CustomerState.Leaving:
                this.leave();
                break;
        }
    }

    private updateState(_dt: number): void {
        switch (this._state) {
            case CustomerState.Queuing:
                // Transition when the customer reaches the counter
                if (this._elapsedInState >= this.queueDuration) {
                    this.enterState(CustomerState.Ordering);
                }
                break;

            case CustomerState.Ordering:
                // Transition when the order is placed
                if (this._elapsedInState >= this.orderingDuration) {
                    this.enterState(CustomerState.Waiting);
                }
                break;

            case CustomerState.Receiving:
                if (this._elapsedInState >= this.receivingDuration) {
                    this.enterState(CustomerState.Paying);
                }
                break;

            case CustomerState.Paying:
                // pay() is called on enter; just wait briefly then leave
                if (this._elapsedInState >= this.payingDuration) {
                    this.enterState(CustomerState.Leaving);
                }
                break;

            default:
                break;
        }
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Called by the CoffeeMaker (or equivalent) when the ordered item is ready.
     */
    serveOrder(): void {
        if (this._state === CustomerState.Waiting) {
            this.enterState(CustomerState.Receiving);
        }
    }

    // ── Outcome Handlers ──────────────────────────────────────────────────────

    private pay(): void {
        const gm = GameManager.instance;
        if (gm) {
            gm.addGold(this.goldReward);
            gm.addReputation(1);
        }
    }

    private onPatienceExpired(): void {
        const gm = GameManager.instance;
        if (gm) {
            gm.loseReputation(this.reputationPenalty);
        }
        this.enterState(CustomerState.Leaving);
    }

    private leave(): void {
        // Destroy after a brief walk-out delay
        this.scheduleOnce(() => {
            this.node.destroy();
        }, this.leaveDelay);
    }
}
