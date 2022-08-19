import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import chokidar from "chokidar";

const OUT_FOLDER = ".dev";

const getAllFiles = (location) => {
  const entities = fs.readdirSync(location, { withFileTypes: true });

  const files = entities
    .filter((entity) => entity.isFile())
    .map((entity) => path.join(location, entity.name))
    .filter((file) => [".ts", ".js", ".mjs"].includes(path.parse(file).ext));

  const dirs = entities
    .filter((entity) => entity.isDirectory())
    .map((entity) => entity.name);

  return [
    ...files,
    ...dirs.map((dir) => getAllFiles(path.join(location, dir))).flat(),
  ];
};

const devBuild = (input) => {
  console.log("-- DEV BUILD -------------------");
  const files = Array.isArray(input) ? input : [input];
  const outDir = Array.isArray(input)
    ? OUT_FOLDER
    : path.parse(input).dir.replace(/^src/, OUT_FOLDER);

  spawnSync(
    "npx",
    [
      "esbuild",
      ...files,
      "--format=esm",
      `--outdir=${outDir}`,
      "--platform=node",
      "--target=node16",
      "--sourcemap",
    ],
    { stdio: "inherit", shell: true }
  );
};

const test = () => {
  console.log("\n-- TESTS -----------------------");
  spawnSync("npm", ["test"], { stdio: "inherit", shell: true });
};

const files = getAllFiles("src");

const run =
  (clear = false) =>
  (input) => {
    if (clear) {
      fs.rmSync(OUT_FOLDER, { recursive: true, force: true });
    }

    devBuild(input);
    test();
  };

run(true)(files);

chokidar
  .watch("src", { ignoreInitial: true })
  .on("add", run())
  .on("change", run())
  .on("unlink", run(true))
  .on("unlinkDir", run(true));
