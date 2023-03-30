import { Args } from "@oclif/core";
import Registry from "rage-edit";

import Command from "../command";
import { checkPlatform } from "../helpers";

const checkRegistry = async () => {
  const hasRegistryKey = await Registry.has(
    "HKCU\\Software\\Elgato Systems GmbH\\StreamDeck",
    "hasbeenlaunchedbefore"
  );

  if (!hasRegistryKey) {
    throw new Error(
      "Unable to find Stream Deck in the registry, are you sure it's installed?"
    );
  }
};

export default class Debugger extends Command {
  static description = "Toggle the remote debugger";

  static args = {
    action: Args.string({
      name: "action",
      required: true,
      options: ["enable", "disable"],
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(Debugger);

    await checkPlatform();
    await checkRegistry();

    if (args.action === "enable") {
      await Registry.set(
        "HKCU\\Software\\Elgato Systems GmbH\\StreamDeck",
        "html_remote_debugging_enabled",
        1
      );

      this.log(
        "Remote Debugging has been enabled, please restart the Stream Deck app"
      );
    } else if (args.action === "disable") {
      await Registry.set(
        "HKCU\\Software\\Elgato Systems GmbH\\StreamDeck",
        "html_remote_debugging_enabled",
        0
      );

      this.log(
        "Remote Debugging has been disabled, please restart the Stream Deck app"
      );
    }
  }
}
