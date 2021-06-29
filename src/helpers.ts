// @ts-nocheck
import os from "os";
import fs from "fs-extra";
import path from "path";
import execa from "execa";
import { waitFor } from "poll-until-promise";
import AwesomeDebouncePromise from "awesome-debounce-promise";

export const checkPlatform = async () => {
  if (os.platform() !== "win32") {
    throw new Error("Only Windows is supported");
  }
};

export const checkPath = async (pathToCheck: string, errorMessage: string) => {
  if (!fs.pathExists(pathToCheck)) {
    throw new Error(errorMessage);
  }
};

export const checkStreamDeckAppRunning = async () => {
  const { stdout } = await execa("tasklist");

  return /StreamDeck.exe/i.test(stdout);
};

export const stopStreamDeckApp = async () => {
  await execa.command("Taskkill /IM StreamDeck.exe /F");
};

export const startStreamDeckApp = async () => {
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
