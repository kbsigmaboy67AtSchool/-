(() => {
  function parseConfig(text) {
    const cfg = {};
    const regex = /([\w.]+)\s*:\s*`([^`]*)`/g;
    let match;
    while ((match = regex.exec(text))) {
      cfg[match[1]] = match[2];
    }
    return cfg;
  }

  function run() {
    const node = document.querySelector("nvg");
    if (!node) {
      console.error("<nvg> not found");
      return;
    }

    const cfg = parseConfig(node.textContent || "");

    let link = cfg["link"];
    if (!link) {
      console.error("link is required in <nvg>");
      return;
    }

    // decode support
    try {
      if (!/^(https?|data:|blob:)/i.test(link)) {
        link = atob(link);
      }
    } catch {}

    try {
      link = decodeURIComponent(link);
    } catch {}

    const tabName = cfg["tab.name"] || "";
    const tabImg = cfg["tab.img.url"] || "";
    const closeBlock = (cfg["tab.closePreventionEnabled"] || "").toLowerCase() === "yes";

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
#fs {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: transparent;
}
</style>
</head>
<body>

<div id="fs"></div>

<iframe
  id="frame"
  src="${safeLink}"
  allow="fullscreen *"
  allowfullscreen>
</iframe>

<script>
  const f = document.getElementById("frame");
  const overlay = document.getElementById("fs");

  overlay.addEventListener("click", () => {
    overlay.remove();
    if (f.requestFullscreen) f.requestFullscreen().catch(()=>{});
    else if (f.webkitRequestFullscreen) f.webkitRequestFullscreen();
  }, { once: true });

  ${closeBlock ? `
  window.addEventListener("beforeunload", e => {
    e.preventDefault();
    e.returnValue = "";
  });
  ` : ""}
<\/script>

</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const blobURL = URL.createObjectURL(blob);

    location.replace(blobURL);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
