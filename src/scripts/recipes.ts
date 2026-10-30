import { $ } from "../lib/dom";
import { reelCard } from "../lib/reels";
import { getProducts, loadMenu } from "../lib/store";
import { setVisible } from "../lib/ui";

async function init(force = false): Promise<void> {
  setVisible($("#skeleton"), true, "grid");
  setVisible($("#error"), false);
  setVisible($("#empty"), false);
  setVisible($("#video-grid"), false, "grid");
  try {
    await loadMenu(force);
    const list = getProducts().filter((p) => p.videoId);
    $("#video-grid").replaceChildren(
      ...list.map((p) => {
        const li = reelCard(p);
        li.className = "group";
        return li;
      }),
    );
    setVisible($("#skeleton"), false, "grid");
    setVisible($("#empty"), list.length === 0);
    setVisible($("#video-grid"), list.length > 0, "grid");
  } catch (err) {
    console.error(err);
    setVisible($("#skeleton"), false, "grid");
    setVisible($("#error"), true);
  }
}

$("#retry").addEventListener("click", () => void init(true));
void init();
