// Extends app.json. BASE_URL sets the path the web export is served from,
// for hosts that publish under a sub-path (GitHub Pages serves this app at
// /mandarin-grove). Leave it unset for a domain root.
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    baseUrl: process.env.BASE_URL || "",
  },
});
