// @ts-nocheck
// chrome-remote-interface types are incomplete :(
import { flags } from "@oclif/command";

import path from "path";
import fs from "fs-extra";
import chokidar from "chokidar";
import CDP from "chrome-remote-interface";
import debounce from "debounce";

import Command from "../Command";
import { checkPlatform, checkPath, restartStreamDeckApp } from "../helpers";

const checkManifest = async (manifestPath: string) => {
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

export default class Watch extends Command {
  static description = "describe the command here";

  static args = [
    { name: "plugin", description: "plugin source directory", required: true },
  ];

  static flags = {
    restart: flags.boolean({
      char: "r",
      description: "force the StreamDeck app to restart",
    }),
  };

  async refreshWithCDP(pluginFullName: string) {
    const config = {
      host: "localhost",
      port: 23654,
    };

    let list: any[] = [];

    try {
      list = await CDP.List(config);
    } catch (e) {
      this.warn(`Unable to get active pages list from CDP → ${e.message}`);
      this.warn("Is the StreamDeck app running with debug enabled?");
    }

    list.forEach(async (endpoint) => {
      if (!endpoint.url.includes(pluginFullName)) {
        return;
      }

      let client;

      try {
        client = await CDP(config);

        await client.Page.reload();
      } catch (e) {
        this.warn(`Unable to reload plugin page via CDP → ${e.message}`);
        this.warn("Is the StreamDeck app running with debug enabled?");
      } finally {
        if (client) {
          client.close();
        }
      }
    });
  }

  async run() {
    const { args, flags } = this.parse(Watch);

    const sourcePluginPath = path.resolve(args.plugin);
    const elgatoPluginsPath = path.resolve(
      String(process.env.APPDATA),
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
