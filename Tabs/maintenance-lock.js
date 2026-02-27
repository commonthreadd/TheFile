(function () {
  var LOCK_KEY = "tmc_site_unlocked";
  var file = window.location.pathname.split("/").pop() || "index.html";
  var publicPages = new Set(["coming-soon.html"]);
  var unlocked = window.localStorage.getItem(LOCK_KEY) === "1";

  if (!unlocked && !publicPages.has(file)) {
    window.location.replace("coming-soon.html");
    return;
  }

  if (unlocked && file === "coming-soon.html") {
    window.location.replace("index.html");
  }
})();
