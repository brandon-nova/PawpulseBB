const syncHeaderHeight = () => {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const headerHeight = `${header.getBoundingClientRect().height}px`;
  document.documentElement.style.setProperty("--header-height", headerHeight);
};

document.addEventListener("DOMContentLoaded", () => {
  syncHeaderHeight();
  window.addEventListener("resize", syncHeaderHeight);

  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});

