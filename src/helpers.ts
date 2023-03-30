import fs from "fs-extra";
import path from "node:path";
import os from "node:os";
import execa from "execa";
import { waitFor } from "poll-until-promise";
import AwesomeDebouncePromise from "awesome-debounce-promise";

export const checkPlatform = async (): Promise<void> => {
  if (os.platform() !== "win32") {
    throw new Error("Only Windows is supported");
  }
};

export const checkPath = async (
  pathToCheck: string,
  errorMessage: string
): Promise<void> => {
  if (!fs.pathExists(pathToCheck)) {
    throw new Error(errorMessage);
  }
};

export const checkStreamDeckAppRunning = async (): Promise<boolean> => {
  const { stdout } = await execa("tasklist");

  return /streamdeck.exe/i.test(stdout);
};

export const stopStreamDeckApp = async (): Promise<void> => {
  await execa.command("Taskkill /IM StreamDeck.exe /F");
};

export const startStreamDeckApp = async (): Promise<void> => {
  if (!process.env.ProgramFiles) {
    throw new Error("Unable to find program files in env");
  }

  await execa.command(
    `powershell -c & "${path.join(
      process.env.ProgramFiles,
      "Elgato/StreamDeck/StreamDeck.exe"
    )}"`
  );
};

export const restartStreamDeckApp = AwesomeDebouncePromise(async () => {
  await waitFor(
    async () => {
      if (!(await checkStreamDeckAppRunning())) {
        return true;
      }

      await stopStreamDeckApp();

      return !(await checkStreamDeckAppRunning());
    },
    {
      interval: 100,
      timeout: 10000,
    }
  );

  await waitFor(
    async () => {
      if (await checkStreamDeckAppRunning()) {
        return true;
      }

      // There's a dumb issue where the promise never resolves
      startStreamDeckApp();

      return checkStreamDeckAppRunning();
    },
    {
      interval: 100,
      timeout: 15000,
    }
  );
}, 500);
