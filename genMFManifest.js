const fs = require('fs')
const path = require('path')

// for CRA-2 un-comment line 5 and comment line 6
// const assetManifest = require('./build/asset-manifest.json')
const assetManifest = require('./build/asset-manifest.json').files;

const indexFilePath = path.join(__dirname, 'build/index.html')

const BUILD_PATH = path.join(__dirname, 'build/micro-frontend-manifest.json')

// Filter paths that exists in the create-react-app generated `build/asset-manifest.json` and use the path from that file because that can contain the "homepage" prefix from package.json.
const filterAssetManifestPaths = filePaths =>
  filePaths.reduce((y, x) => {
    Object.keys(assetManifest).forEach(key => {
      if (
        assetManifest[key].includes(x) &&
        assetManifest[key].split('.').reverse()[0] !== 'map'
      ) {
        y.push(assetManifest[key])
      }
    })
    return y
  }, [])

// Read and process the create-react-app generated `build/index.html`
fs.readFile(indexFilePath, 'utf8', (err, htmlData) => {
  if (err) {
    return console.error('err', err)
  }

  // Get array (or null) with js & css paths from the create-react-app generated `build/index.html`
  const js = htmlData.match(/(\/static\/js\/).*?(.js)/gim)
  const css = htmlData.match(/(\/static\/css\/).*?(.css)/gim)

  // Create the useful-asset-manifest.json object
  // NOTE: if you want to include the paths that don't exist in `build/asset-manifest.json` leave out `filterAssetManifestPaths(css/js)`.
  const assets = {
    css: Array.isArray(css) ? filterAssetManifestPaths(css) : [],
    js: Array.isArray(js) ? [assetManifest['runtime~main.js'], ...filterAssetManifestPaths(js)] : [],
  }

  fs.writeFileSync(BUILD_PATH, JSON.stringify(assets))
})


// Outputs (in the correct order) something like:
// build/useful-asset-manifest.json
//
// {
//   "css": [
//     "/static/css/2.1b02c459.chunk.css",
//     "/static/css/main.f8da7d89.chunk.css"
//   ],
//   "js": [
//     "/static/js/runtime~main.3e5a2071.js",
//     "/static/js/2.5717aa4d.chunk.js",
//     "/static/js/main.8363db78.chunk.js"
//   ]
// }
