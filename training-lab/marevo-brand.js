/* Runtime naming layer. Storage keys intentionally remain unchanged to preserve user data. */
(() => {
  const APP_NAME = "MAREVO";
  const FULL_NAME = "MAREVO · Training Lab";
  document.title = FULL_NAME;

  if (typeof notificationOnce === "function") {
    const baseNotificationOnce = notificationOnce;
    notificationOnce = function (key, title, body) {
      const brandedBody = typeof body === "string" ? body.replaceAll("Training Lab", APP_NAME) : body;
      return baseNotificationOnce(key, title, brandedBody);
    };
  }

  if (typeof buildSep26Report === "function") {
    const baseBuildSep26Report = buildSep26Report;
    buildSep26Report = function (...args) {
      const report = baseBuildSep26Report(...args);
      if (report && typeof report === "object") report.app = FULL_NAME;
      return report;
    };
  }
})();
