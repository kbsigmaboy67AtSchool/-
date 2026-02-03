const html = `
<!DOCTYPE html>
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
  src="${link}"
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
</html>
`;
