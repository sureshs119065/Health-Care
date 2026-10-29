// The small "Compare (n)" bar that appears when items are selected for comparison.
import * as compare from "../lib/compare";
import { setVisible } from "../lib/ui";

const tray = document.getElementById("compare-tray");
if (tray) {
  const render = () => {
    const ids = compare.getIds();
    setVisible(tray, ids.length > 0, "flex");
    document.getElementById("compare-count")!.textContent = String(ids.length);
    document.getElementById("compare-link")!.setAttribute("href", `/compare?ids=${ids.map(encodeURIComponent).join(",")}`);
  };
  document.getElementById("compare-clear")!.addEventListener("click", () => compare.clear());
  compare.subscribe(render);
  window.addEventListener("storage", (e) => {
    if (e.key === "compare:v1") compare.reload();
  });
  render();
}
