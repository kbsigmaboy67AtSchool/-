(() => {
  function run() {
    const node = document.querySelector("nextVG");
    if (!node) {
      console.error("<nextVG> not found");
      return;
    }

    let link = (node.textContent || "").trim();
    const tabname = node.getAttribute("tabname");
    const tabimage = node.getAttribute("tabimage");

    if (!link) {
      console.error("No link inside <nextVG>");
      return;
    }

    // base64 decode if needed
    try {
      if (!/^(https?|data:|blob:)/i.test(link)) {
        link = atob(link);
      }
    } catch {}

    // URI decode fallback
    try {
      link = decodeURIComponent(link);
    } catch {}

    // Escape for HTML
    const safeLink = link.replace(/"/g, "&quot;");

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="Permissions-Policy" content="fullscreen=*">
<title>${tabname || ""}</title>
${tabimage ? `<link rel="icon" href="${tabimage}">` : ""}
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
<\/script>

</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const blobURL = URL.createObjectURL(blob);

    // No history entry
    location.replace(blobURL);
  }

  // Ensure DOM exists
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
