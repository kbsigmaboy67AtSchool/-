(() => {
  const s = document.currentScript;
  if (!s) return;

  let link = s.getAttribute("link");
  const tabname = s.getAttribute("tabname");
  const tabimage = s.getAttribute("tabimage");

  if (!link) {
    console.error("No link attribute provided");
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

  // Apply title early (only affects the original page briefly)
  if (tabname) document.title = tabname;

  // Apply favicon early
  if (tabimage) {
    let icon = document.querySelector("link[rel*='icon']");
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      document.head.appendChild(icon);
    }
    icon.href = tabimage;
  }

  // Escape quotes to avoid breaking HTML
  const safeLink = link.replace(/"/g, "&quot;");

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="Permissions-Policy" content="fullscreen=*">
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
    else if (f.msRequestFullscreen) f.msRequestFullscreen();
  }, { once: true });
</script>

</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const blobURL = URL.createObjectURL(blob);

  // Replace immediately, no history entry
  location.replace(blobURL);
})();
