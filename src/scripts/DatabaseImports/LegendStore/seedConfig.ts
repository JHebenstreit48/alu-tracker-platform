import path from "path";
import fs from "fs";

export const ROOT_DIR = path.resolve(
  process.cwd(),
  "src/seeds/LegendStore/BlueprintData"
);

export const logLegendStoreConfig = (): void => {
  console.log(
    "📁 LS ROOT_DIR:",
    ROOT_DIR,
    "exists:",
    fs.existsSync(ROOT_DIR)
  );
};