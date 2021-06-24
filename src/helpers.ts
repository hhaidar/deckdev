import * as os from "os";
import * as fs from "fs-extra";

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
