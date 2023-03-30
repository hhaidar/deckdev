import { Args, Flags } from "@oclif/core";

import path from "node:path";
import fs from "fs-extra";
import chokidar from "chokidar";
import CDP from "chrome-remote-interface";
import debounce from "debounce";

import Command from "../command";
import { checkPlatform, checkPath, restartStreamDeckApp } from "../helpers";

const checkManifest = async (manifestPath: string) => {
  let raw;
  let parsed;

  try {
    raw = await fs.readFile(manifestPath, "utf8");
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`There was a problem loading the manifest file: ${error}`);
  }

  if (!parsed.SDKVersion) {
    throw new Error("A valid manifest file was not found");
  }
};

export default class Watch extends Command {
  static description = "Watch a plugin directory for changes.";

  static args = {
    plugin: Args.string({
      name: "plugin",
      description: "plugin source directory",
      required: true,
    }),
  };

  static flags = {
    restart: Flags.boolean({
      char: "r",
      description: "force the StreamDeck app to restart",
    }),
  };

  async refreshWithCDP(pluginFullName: string): Promise<void> {
    const config = {
      host: "127.0.0.1",
      port: 23654,
    };

    let list: any[] = [];

    try {
      list = await CDP.List(config);
    } catch (error) {
      this.warn(`Unable to get active pages list from CDP → ${error}`);
      this.warn("Is the StreamDeck app running with debug enabled?");
    }

    list.forEach(async (endpoint) => {
      if (!endpoint.url.includes(pluginFullName)) {
        return;
      }

      let client;

      try {
        client = await CDP({ target: endpoint });

        await client.Page.reload({ ignoreCache: true });
      } catch (error) {
        this.warn(`Unable to reload plugin page via CDP → ${error}`);
        this.warn("Is the StreamDeck app running with debug enabled?");
      } finally {
        if (client) {
          client.close();
        }
      }
    });
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Watch);

    const sourcePluginPath = path.resolve(args.plugin);
    const elgatoPluginsPath = path.resolve(
      String(process.env.APPDATA),
      "Elgato/StreamDeck/Plugins/"
    );

    await checkPlatform();
    await checkManifest(path.resolve(sourcePluginPath, "./manifest.json"));
    await checkPath(sourcePluginPath, "Source plugin path not found");
    await checkPath(elgatoPluginsPath, "Elgato plugins path not found");

    const matches = sourcePluginPath.match(/([\w.-]+)\.sdplugin/i);

    const pluginFullName = matches ? matches[0] : "";

    const destinationPath = path.resolve(elgatoPluginsPath, pluginFullName);

    const install = async () => {
      const restartNeeded =
        flags.restart || !(await fs.pathExists(destinationPath));

      await fs.emptyDir(destinationPath);
      await fs.copy(sourcePluginPath, destinationPath);
      this.log(`Copied plugin to ${destinationPath}`);

      if (restartNeeded) {
        await restartStreamDeckApp();
        this.log("Restarted the StreamDeck app");
      } else {
        await this.refreshWithCDP(pluginFullName);
        this.log(`Reloaded ${pluginFullName} via CDP`);
      }
    };

    const onChange = debounce(async (event: string, eventPath: string) => {
      this.log("Change Detected:", eventPath);

      await install();
    }, 200);

    chokidar
      .watch(sourcePluginPath, { ignoreInitial: true })
      .on("all", onChange);

    this.log(`Started watching ${pluginFullName}`);

    if (flags.restart) {
      this.warn("Restart mode enabled");
    }
  }
}
