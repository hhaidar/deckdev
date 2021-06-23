import { Command, flags } from "@oclif/command";

import * as os from "os";
import * as path from "path";
import * as fs from "fs-extra";
import * as chokidar from "chokidar";
import * as CDP from "chrome-remote-interface";
import * as debounce from "debounce";

const checkManifest = async (manifestPath) => {
  let raw, parsed;

  try {
    raw = await fs.readFile(manifestPath, "utf8");
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error("There was a problem loading the manifest file");
  }

  if (!parsed.SDKVersion) {
    throw new Error("A valid manifest file was not found");
  }
};

const checkPlatform = async () => {
  if (os.platform() !== "win32") {
    throw new Error("Only Windows is supported");
  }
};

const checkPath = async (pathToCheck, errorMessage) => {
  if (!fs.pathExists(pathToCheck)) {
    throw new Error(errorMessage);
  }
};

export default class Watch extends Command {
  static description = "describe the command here";

  static args = [
    { name: "plugin", description: "plugin source directory", required: true },
  ];

  log(...args) {
    super.log(`[${new Date().toISOString()}]`, ...args);
  }

  async connect(pluginUID) {
    if (this.client) {
      return;
    }

    try {
      this.client = await CDP({
        host: "localhost",
        port: 23654,
        target: (list) => list.find((i) => i.title === pluginUID),
      });

      this.log(`Connected to debugger at ${this.client.webSocketUrl}`);
    } catch (e) {
      this.error(e);
      this.error(
        `Unable to connect to debugger at ${this.client.webSocketUrl}`
      );
    } finally {
      if (this.client) {
        this.client.on("disconnect", () => {
          this.log(`Disconnected from debugger`);
          this.client.close();
          this.client = undefined;
        });
      }
    }
  }

  async run() {
    const { args, flags } = this.parse(Watch);

    const sourcePluginPath = path.resolve(args.plugin);
    const elgatoPluginsPath = path.resolve(
      process.env.APPDATA,
      "Elgato/StreamDeck/Plugins/"
    );

    await checkPlatform();
    await checkManifest(path.resolve(sourcePluginPath, "./manifest.json"));
    await checkPath(sourcePluginPath, "Source plugin path not found");
    await checkPath(elgatoPluginsPath, "Elgato plugins path not found");

    const [pluginFullName, pluginUID] = sourcePluginPath.match(
      /(com[a-z\.]*).sdPlugin/i
    );

    const destinationPath = path.resolve(elgatoPluginsPath, pluginFullName);

    await this.connect(pluginUID);

    const installPlugin = debounce(async (event, eventPath) => {
      this.log("Change Detected:", eventPath);
      await this.connect(pluginUID);

      await fs.emptyDir(destinationPath);
      await fs.copy(sourcePluginPath, destinationPath);
      this.log(`Copied plugin to ${destinationPath}`);

      await this.client.Page.reload();
      this.log(`Reloaded ${pluginFullName}`);
    }, 200);

    chokidar
      .watch(sourcePluginPath, { ignoreInitial: true })
      .on("all", installPlugin);
  }
}
