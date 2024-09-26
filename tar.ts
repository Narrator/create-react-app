import { createWriteStream, statSync } from "fs";
import globby from "globby";
import archiver from "archiver";
import { finished } from "stream/promises";

const cache = async () => {
  const globs = ["./node_modules/**/*"];

  // If they are caching node modules, omit the .cache folder
  const omitNodeModulesCacheGlob = "!node_modules/.cache";
  if (
    globs.some((e) => e.includes("node_modules")) &&
    !globs.includes(omitNodeModulesCacheGlob)
  ) {
    globs.push(omitNodeModulesCacheGlob);
  }

  const root = "/home/ANT.AMAZON.COM/kgnanask/sandbox/create-react-app";
  const cacheFileName = "cache.tar";
  const cacheArchiveWriteStream = createWriteStream(`${root}/${cacheFileName}`);

  cacheArchiveWriteStream.on("error", (err) => {
    console.error("Error writing cache archive stream", err);
  });

  const tarArchiver = archiver("tar");

  // Register error listener for logging alone
  tarArchiver.on("error", (err) => {
    console.error("Failed to process compressed file", err);
  });

  tarArchiver.pipe(cacheArchiveWriteStream);

  cacheArchiveWriteStream.on("close", () => {
    console.log("Close event emitted for cache archive write stream");
  });

  cacheArchiveWriteStream.on("end", () => {
    console.log("End event emitted for cache archive write stream");
  });

  cacheArchiveWriteStream.on("finish", () => {
    console.log("Finish event emitted for cache archive write stream");
  });

  const globStream = globby.stream(globs, {
    dot: true,
    cwd: root,
    deep: 20,
  });

  // Append each file from the spec to the zip archive
  console.log("# Creating cache artifact...");

  for await (const path of globStream) {
    tarArchiver.file(`${root}/${path}`, {
      name: path.toString(),
      // stats,
    });
  }

  await tarArchiver.finalize();

  // Wait for the stream to close
  await finished(cacheArchiveWriteStream);
};

cache()
  .then(() => {
    console.log("Cache artifact created successfully");
  })
  .catch((err) => {
    console.error("Failed to create cache artifact", err);
  });
