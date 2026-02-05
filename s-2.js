(() => {
  function parseConfig(text) {
    const cfg = {};
    const regex = /([\w.]+)\s*:\s*`([^`]*)`/g;
    let m;
    while ((m = regex.exec(text))) cfg[m[1]] = m[2];
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
<title>${tabName}</title>
${tabImg ? `<link rel="icon" href="${tabImg}">` : ""}
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;background:black}
#overlay{
  position:fixed;
  inset:0;
  background:black;
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:99999;
}
#overlay button{
  font-size:24px;
  padding:18px 32px;
  cursor:pointer;
}
</style>
</head>
<body>

<div id="overlay">
  <button id="go">Press the button</button>
</div>

<script>
document.getElementById("go").onclick = () => {
  let w;
  try {
    w = window.open("macvgembed:uwu");
  } catch {}

  if (w) {
    try {
      w.location.replace("about:blank");
      w.document.write(\`
<!DOCTYPE html>
<html>
<title>${tabName}</title>
<script>
window.addEventListener("beforeunload", e => {
  e.preventDefault();
  e.returnValue = "";
});
<\/script>
<body style="margin:0;background:black">
<iframe
  data-frame="yes"
  src="${safeLink}"
  style="border:none;width:100vw;height:100vh"
  allow="fullscreen *"
  allowfullscreen
></iframe>
</body>
</html>
\`);
      w.document.close();
    } catch {}
  }

  location.replace("https://google.com?igu=1");
};
<\/script>

${closeBlock ? `
<script>
window.addEventListener("beforeunload", e => {
  e.preventDefault();
  e.returnValue = "";
});
<\/script>
` : ""}

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
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
