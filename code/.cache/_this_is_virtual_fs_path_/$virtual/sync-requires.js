
// prefer default export if available
const preferDefault = m => (m && m.default) || m


exports.components = {
  "component---cache-dev-404-page-js": preferDefault(require("/home/caelinl/Code/web/punkSocMedia/code/.cache/dev-404-page.js")),
  "component---src-pages-404-js": preferDefault(require("/home/caelinl/Code/web/punkSocMedia/code/src/pages/404.js"))
}

