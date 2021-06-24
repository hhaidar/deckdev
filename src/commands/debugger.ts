// @ts-nocheck
// rage-edit types are not available :(
import { flags } from "@oclif/command";

import Registry from "rage-edit";

import Command from "../Command";
import { checkPlatform, checkPath } from "../helpers";

const checkRegistry = async () => {
  const result = await Registry.get(
    "HKCU\\Software\\Elgato Systems GmbH\\StreamDeck",
    "hasbeenlaunchedbefore"
  );

  if (!result) {
    throw new Error(
      "Unable to find Stream Deck in the registry, are you sure it's installed?"
    );
  }
};

export default class Debugger extends Command {
  static description = "describe the command here";

  static args = [
    {
      name: "action",
      description: "toggle the remote debugger",
      required: true,
      options: ["enable", "disable"],
    },
  ];

  async run() {
    const { args } = this.parse(Debugger);

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
