import { Command as BaseCommand } from "@oclif/command";

export default abstract class Command extends BaseCommand {
  log(...args: any) {
    super.log(`[${new Date().toISOString()}]`, ...args);
  }
}
