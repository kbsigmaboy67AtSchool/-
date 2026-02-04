(() => {
  function parseConfig(text) {
    const cfg = {};
    const regex = /([\w.]+)\s*:\s*`([^`]*)`/g;
    let m;
    while ((m = regex.exec(text))) {
      cfg[m[1]] = m[2];
    }
    return cfg;
  }

  function isInNVGFrame() {
    try {
      return window.frameElement?.getAttribute("data-frame") === "yes";
    } catch {
      return false;
    }
  }

  function process(node) {
    // ⛔ Prevent redirect if already inside the NVG iframe
    if (isInNVGFrame()) return;

    const cfg = parseConfig(node.textContent || "");

    let link = cfg["link"] || window.location.href;

    try {
      if (!/^(https?|data:|blob:)/i.test(link)) link = atob(link);
    } catch {}
    try {
      link = decodeURIComponent(link);
    } catch {}

    const tabName = cfg["tab.name"] || "";
    const tabImg = cfg["tab.img.url"] || "";
    const closeBlock =
      (cfg["tab.closePreventionEnabled"] || "").toLowerCase() === "yes";

    const safeLink = link.replace(/"/g, "&quot;");

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="Permissions-Policy" content="fullscreen=*">
<title>${tabName}</title>
${tabImg ? `<link rel="icon" href="${tabImg}">` : ""}
<style>
* { margin:0; padding:0; background:black; }
html, body { width:100%; height:100%; overflow:hidden; }
iframe { width:100%; height:100%; border:none; }
#fs { position:fixed; inset:0; z-index:9999; }
</style>
</head>
<body>

<div id="fs"></div>

<iframe
  id="frame"
  data-frame="yes"
  src="${safeLink}"
  allow="fullscreen *"
  allowfullscreen
></iframe>

<script>
const f = document.getElementById("frame");
const o = document.getElementById("fs");

o.addEventListener("click", () => {
  o.remove();
  f.requestFullscreen?.().catch(()=>{}) ||
  f.webkitRequestFullscreen?.();
}, { once:true });

${closeBlock ? `
window.addEventListener("beforeunload", e => {
  e.preventDefault();
  e.returnValue = "";
});
` : ""}
<\/script>

</body>
</html>`;

    const blobURL = URL.createObjectURL(
      new Blob([html], { type: "text/html" })
    );

    location.replace(blobURL);
  }

  function waitForNVG() {
    const found = document.getElementsByTagName("nvg")[0];
    if (found) {
      process(found);
      return true;
    }
    return false;
  }

  if (!waitForNVG()) {
    const obs = new MutationObserver(() => {
      if (waitForNVG()) obs.disconnect();
    });
    obs.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
})();
