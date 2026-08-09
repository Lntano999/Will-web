export function registerContactCopy({
  document = globalThis.document,
  window = globalThis.window,
}) {
  document.addEventListener("DOMContentLoaded", () => {
    const contactButton = document.getElementById("wechat-copy-btn");
    const toastContainer = document.getElementById("toast-container");

    function showToast(message) {
      const toast = document.createElement("div");
      toast.className = "premium-toast";
      toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>${message}</span>
      `;

      toastContainer.appendChild(toast);
      void toast.offsetHeight;
      toast.classList.add("show");

      window.setTimeout(() => {
        toast.classList.remove("show");
        window.setTimeout(() => {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 600);
      }, 3000);
    }

    if (contactButton) {
      contactButton.addEventListener("click", (event) => {
        event.preventDefault();
        const textArea = document.createElement("textarea");
        textArea.value = "hi@will.xyz";
        textArea.style.position = "fixed";
        textArea.style.top = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          showToast("邮箱 hi@will.xyz 已复制");
        } catch {
          showToast("复制失败，请重试");
        } finally {
          document.body.removeChild(textArea);
        }
      });
    }
  });
}
