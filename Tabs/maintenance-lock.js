(function () {
  var LOCK_KEY = "tmc_site_unlocked";
  var path = window.location.pathname || "/";
  var rawFile = path.split("/").pop() || "";
  var file = normalizePage(rawFile);
  var publicPages = new Set(["coming-soon"]);
  var unlocked = window.sessionStorage.getItem(LOCK_KEY) === "1";

  if (!unlocked && !publicPages.has(file)) {
    window.location.replace("/coming-soon");
    return;
  }

  if (unlocked && file === "coming-soon") {
    window.location.replace("/");
  }

  function normalizePage(name) {
    if (!name || name === "/") return "index";
    return String(name).replace(/\.html$/i, "");
  }
})();
