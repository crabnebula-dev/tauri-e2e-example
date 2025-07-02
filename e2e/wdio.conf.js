import path from "path";
import { spawn, spawnSync } from "child_process";
import { CrabNebulaCloudReporter } from "@crabnebula/webdriverio-cloud-reporter";
import { waitTauriDriverReady } from "@crabnebula/tauri-driver";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

let tauriDriver;
let exit = false;
let testRunnerBackend;

export const config = {
  host: "127.0.0.1",
  port: 4444,
  specs: ["./test/specs/**/*.js"],
  maxInstances: 1,
  capabilities: [
    {
      maxInstances: 1,
      "tauri:options": {
        application:
          process.platform === "darwin"
            ? "../src-tauri/target/debug/bundle/macos/WebDriver Example.app"
            : "../src-tauri/target/debug/webdriver-example",
      },
    },
  ],
  reporters: ["spec", CrabNebulaCloudReporter],
  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },
  connectionRetryCount: 0,

  // ensure the rust project is built since we expect this binary to exist for the webdriver sessions
  onPrepare: () => {
    spawnSync(
      "pnpm",
      ["tauri", "build", "--debug", "--features", "automation"].concat(
        process.platform === "drawin" ? ["-b", "app"] : ["--no-bundle"]
      ),
      {
        cwd: path.resolve(__dirname, ".."),
        stdio: "inherit",
        shell: true,
      }
    );

    if (process.platform === "darwin") {
      if (!process.env.CN_API_KEY) {
        console.error(
          "CN_API_KEY is not set, required for test-runner-backend"
        );
        process.exit(1);
      }

      testRunnerBackend = spawn("pnpm", ["test-runner-backend"], {
        stdio: "inherit",
        shell: true,
      });

      testRunnerBackend.on("error", (error) => {
        console.error("test-runner-backend error:", error);
        process.exit(1);
      });
      testRunnerBackend.on("exit", (code) => {
        if (!exit) {
          console.error("test-runner-backend exited with code:", code);
          process.exit(1);
        }
      });

      process.env.REMOTE_WEBDRIVER_URL = `http://127.0.0.1:3000`;
    }
  },

  // ensure we are running `tauri-driver` before the session starts so that we can proxy the webdriver requests
  beforeSession: async () => {
    // tauriDriver = spawn(tauriDriverPath, [], {
    tauriDriver = spawn("pnpm", ["tauri-driver"], {
      stdio: [null, process.stdout, process.stderr],
    });
    tauriDriver.on("error", (error) => {
      console.error("tauri-driver error:", error);
      process.exit(1);
    });
    tauriDriver.on("exit", (code) => {
      if (!exit) {
        console.error("tauri-driver exited with code:", code);
        process.exit(1);
      }
    });
    await waitTauriDriverReady();
    console.log("tauri-driver ready");
  },

  // clean up the `tauri-driver` process we spawned at the start of the session
  afterSession: () => {
    closeTauriDriver();
  },

  onComplete: () => {
    testRunnerBackend?.kill();
  },
};

function closeTauriDriver() {
  exit = true;
  tauriDriver?.kill();
}

function onShutdown(fn) {
  const cleanup = () => {
    try {
      fn();
    } finally {
      process.exit();
    }
  };

  process.on("exit", cleanup);
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("SIGHUP", cleanup);
  process.on("SIGBREAK", cleanup);
}

onShutdown(() => {
  closeTauriDriver();
  testRunnerBackend?.kill();
});
