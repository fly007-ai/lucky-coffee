import { _decorator, Component, Prefab, instantiate, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CustomerSpawner')
export class CustomerSpawner extends Component {
    @property(Prefab)
    customerPrefab: Prefab | null = null;

    @property
    spawnInterval: number = 5;

    onLoad() {
        this.schedule(() => {
            this._spawnCustomer();
        }, this.spawnInterval);
    }

    private _spawnCustomer() {
        if (!this.customerPrefab) {
            return;
        }
        const customer = instantiate(this.customerPrefab);
        customer.setPosition(new Vec3(-400, 0, 0));
        this.node.addChild(customer);
    }
}
