# Lucky Coffee ☕

A simulation/tycoon WeChat Mini Game built with **Cocos Creator (TypeScript)** where the player manages a coffee shop — produce drinks, serve customers, earn gold, and grow the business.

## Project Structure

```
lucky-coffee/
├── assets/
│   ├── prefabs/      # Customer and other reusable prefabs
│   ├── scenes/       # Cocos Creator scene files
│   ├── scripts/      # TypeScript game logic
│   │   ├── GameManager.ts      # Singleton: gold, level, save/load
│   │   ├── CoffeeMaker.ts      # Coffee production component
│   │   ├── Customer.ts         # Customer AI (walk in, order, pay, leave)
│   │   └── CustomerSpawner.ts  # Periodically spawns customers
│   └── textures/     # Sprite and UI textures
├── .gitignore
└── README.md
```

## Core Scripts

| Script | Responsibility |
|---|---|
| `GameManager.ts` | Singleton managing `gold` and `level`; persists data via `sys.localStorage` |
| `CoffeeMaker.ts` | Handles coffee production timer and awards gold on completion |
| `Customer.ts` | Customer lifecycle: walk in → order → wait → pay → leave |
| `CustomerSpawner.ts` | Spawns customer prefab instances at a configurable interval |

## How to Start

1. **Open Cocos Creator Dashboard** (version 3.x recommended).
2. Click **Open Other Project** → select / import this folder.
3. In the **Asset Manager**, open `assets/scenes/` and create a new scene (right-click → Create Scene).
4. In the **Hierarchy**, create an empty node named `GameManager` and drag `assets/scripts/GameManager.ts` onto it.
5. Create a Sprite node for the coffee machine and attach `CoffeeMaker.ts`.
6. Create a Sprite node for the customer, attach `Customer.ts`, and drag it into `assets/prefabs/` to make a **Prefab**.
7. Create an empty node named `Spawner`, attach `CustomerSpawner.ts`, and set the `Customer Prefab` property to the prefab created above.
8. Press **Play** in the editor to test.

## Game Loop

```
Customer arrives → walks to counter → orders → waits → pays gold → leaves
                                                  ↑
                              CoffeeMaker produces coffee (click to start)
                                                  ↓
                                    GameManager.addGold(profit)
```

## License

MIT