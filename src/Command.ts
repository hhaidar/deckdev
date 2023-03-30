import { Command as BaseCommand } from "@oclif/core";

export default abstract class Command extends BaseCommand {
  log(...args: string[]): void {
    super.log(`[${new Date().toISOString()}]`, ...args);
  }
}
