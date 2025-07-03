# Self-contained example of running end-to-end tests for tauri v2 apps
This repo includes an extremely basic tauri app and similarly simple tests using [webdriverio](https://webdriver.io/).

## Pre-requisites
`pnpm` and the build environment for tauri v2 apps. These are documented in <https://v2.tauri.app/start/prerequisites/>.

1. Clone this repo locally.
2. Run `pnpm install` in the root of the cloned repo. This command installs the project's package dependencies.
3. Change to the `e2e` folder e.g. `cd e2e` and run `pnpm install` in that directory which installs the additional dependencies to run the tests.

### Additional MacOS pre-requisites
Obtain an API key from CrabNebula which enables the underlying driver for MacOS testing. New customers are welcome <https://crabnebula.dev/contact/>.

On MacOS export the key:
`export CN_API_KEY=<your instance of the API key>` e.g.
`export CN_API_KEY=ABCDE12345...Z`

Note: the keys generally have a finite life and need to be replaced when they expire.

## Run the tests
Simply run `pnpm test` in the `e2e` folder. Optionally prefix this to obtain the stack trace if failures occur:
`RUST_BACKTRACE=1 pnpm test`

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
