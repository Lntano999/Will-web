export function registerMobileNavigation({
  document = globalThis.document,
  window = globalThis.window,
}) {
  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector(".navigation");
    const trigger = document.querySelector("[data-mobile-nav-trigger]");
    const panel = document.querySelector("#mobile-navigation");
    if (!root || !trigger || !panel) return;

    const links = document.querySelectorAll("#mobile-navigation a[href^='#']");
    let open = false;

    function setOpen(nextOpen, { restoreFocus = false } = {}) {
      open = nextOpen;
      root.classList.toggle("menu-open", open);
      panel.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
      if (!open && restoreFocus) trigger.focus();
    }

    trigger.addEventListener("click", () => setOpen(!open));
    links.forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && open) {
        setOpen(false, { restoreFocus: true });
      }
    });

    window.addEventListener?.("resize", () => {
      if (window.innerWidth >= 992 && open) setOpen(false);
    });
  });
}
