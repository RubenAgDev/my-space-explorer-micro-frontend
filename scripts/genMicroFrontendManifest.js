const fs = require("fs");
const path = require("path");

const assetManifestFiles = require("../build/asset-manifest.json").files;
const indexFilePath = path.join(__dirname, "../build/index.html");
const buildPath = path.join(__dirname, "../build/micro-frontend-manifest.json");

// Process paths that exists in the create-react-app generated `build/asset-manifest.json` and use the path from that file because that can contain the "homepage" prefix from package.json.
const processAssetManifestPaths = filePaths =>
  filePaths.reduce((accumulator, currentValue) => {
    Object.keys(assetManifestFiles).forEach(key => {
      if (
        assetManifestFiles[key].includes(currentValue) &&
        assetManifestFiles[key].split(".").reverse()[0] !== "map"
      ) {
        accumulator.push(assetManifestFiles[key]);
      }
    });
    return accumulator;
  }, []);

// Read and process the create-react-app generated `build/index.html`
fs.readFile(indexFilePath, "utf8", (err, htmlData) => {
  if (err) {
    return console.error("err", err);
  }

  // Get array (or null) with js & css paths from the create-react-app generated `build/index.html`
  const js = htmlData.match(/(\/static\/js\/).*?(.js)/gim);
  const css = htmlData.match(/(\/static\/css\/).*?(.css)/gim);

  // Create the manifest.json object
  const assets = {
    css: Array.isArray(css) ? processAssetManifestPaths(css) : [],
    js: Array.isArray(js)
      ? [assetManifestFiles["runtime~main.js"], ...processAssetManifestPaths(js)]
      : []
  };

  fs.writeFileSync(buildPath, JSON.stringify(assets));
});
