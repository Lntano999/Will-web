export async function copyText(
  value,
  {
    clipboard = globalThis.navigator?.clipboard,
    document = globalThis.document,
  } = {},
) {
  let textArea;
  try {
    if (clipboard?.writeText) {
      await clipboard.writeText(value);
      return true;
    }

    if (!document?.createElement || !document.body?.appendChild) return false;
    textArea = document.createElement("textarea");
    textArea.value = value;
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    const copied = document.execCommand?.("copy") ?? false;
    textArea.remove();
    return copied;
  } catch {
    textArea?.remove?.();
    return false;
  }
}

export function registerContactCopy({
  document = globalThis.document,
  window = globalThis.window,
  navigator = globalThis.navigator,
}) {
  document.addEventListener("DOMContentLoaded", () => {
    const contactButtons = document.querySelectorAll("[data-copy-wechat]");
    const toastContainer = document.getElementById("toast-container");

    function showToast(message) {
      if (!toastContainer) return;
      const toast = document.createElement("div");
      toast.className = "premium-toast";
      toast.innerHTML =
        '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      const label = document.createElement("span");
      label.textContent = message;
      toast.appendChild(label);

      toastContainer.appendChild(toast);
      void toast.offsetHeight;
      toast.classList.add("show");

      window.setTimeout(() => {
        toast.classList.remove("show");
        window.setTimeout(() => toast.remove(), 600);
      }, 3000);
    }

    contactButtons.forEach((contactButton) => {
      contactButton.addEventListener("click", async (event) => {
        event.preventDefault();
        const copied = await copyText("jc3400098970", {
          clipboard: navigator?.clipboard,
          document,
        });
        showToast(
          copied
            ? "微信号 jc3400098970 已复制"
            : "复制失败，请手动添加 jc3400098970",
        );
      });
    });
  });
}
