// Export all handlers for webpack bundling
module.exports = {
  collectEvent: require('./collectEvent'),
  getAnalytics: require('./getAnalytics'),
  getSiteStats: require('./getSiteStats'),
  registerSite: require('./registerSite'),
  getSites: require('./getSites'),
  analyticsScript: require('./analyticsScript')
};
