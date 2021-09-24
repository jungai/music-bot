#!/usr/bin/env zx

(async () => {
  const dockerUserName = "kittn888";
  const { name, version } = await fs.readJSON(__dirname + "/../package.json");
  const imageName = `${dockerUserName}/${name}:${version}`;
  const platform = ["linux/amd64", "linux/arm64"];

  platform.forEach(async (arch) => {
    await $`docker buildx build --platform ${arch} -t ${imageName}-${
      arch.split("/")[1]
    } .`;
  });
})();
