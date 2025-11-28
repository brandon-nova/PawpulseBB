const syncHeaderHeight = () => {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const headerHeight = `${header.getBoundingClientRect().height}px`;
  document.documentElement.style.setProperty("--header-height", headerHeight);
};

// Modal functionality
const initModal = () => {
  const modal = document.getElementById("signup-modal");
  if (!modal) return;

  const triggers = document.querySelectorAll("[data-modal-trigger]");
  const closeButtons = document.querySelectorAll("[data-modal-close]");
  const overlay = modal.querySelector(".modal-overlay");

  let previouslyFocusedElement = null;
  let focusableElements = null;

  const getFocusableElements = () => {
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(modal.querySelectorAll(selector)).filter(
      (el) => !el.disabled && el.offsetParent !== null
    );
  };

  const trapFocus = (e) => {
    if (e.key !== "Tab") return;

    if (!focusableElements || focusableElements.length === 0) {
      focusableElements = getFocusableElements();
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  const openModal = () => {
    previouslyFocusedElement = document.activeElement;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    focusableElements = getFocusableElements();
    
    // Focus first focusable element
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
    
    modal.addEventListener("keydown", trapFocus);
  };

  const closeModal = () => {
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    modal.removeEventListener("keydown", trapFocus);
    
    // Return focus to previously focused element
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
      previouslyFocusedElement = null;
    }
  };

  // Open modal on trigger click
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  });

  // Close modal on close button or overlay click
  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  if (overlay) {
    overlay.addEventListener("click", closeModal);
  }

  // Close modal on ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") {
      closeModal();
    }
  });

  // Auto-close after form submission (listen for Tally form submission)
  const formIframe = modal.querySelector("iframe[data-tally-src]");
  if (formIframe) {
    // Listen for messages from Tally iframe
    window.addEventListener("message", (e) => {
      // Tally sends a message when form is submitted
      if (e.data && typeof e.data === "object" && e.data.type === "tallyFormSubmitted") {
        setTimeout(() => {
          closeModal();
        }, 1000);
      }
    });

    // Also listen for iframe load to set up postMessage listener
    formIframe.addEventListener("load", () => {
      // Tally form will send a message on submission
      // We'll also check for URL changes as a fallback
      let lastSrc = formIframe.src;
      const checkSubmission = setInterval(() => {
        if (formIframe.src !== lastSrc) {
          lastSrc = formIframe.src;
          // If URL changed, form might have been submitted
          setTimeout(() => {
            closeModal();
            clearInterval(checkSubmission);
          }, 1000);
        }
      }, 500);

      // Clean up interval after 30 seconds
      setTimeout(() => clearInterval(checkSubmission), 30000);
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  syncHeaderHeight();
  window.addEventListener("resize", syncHeaderHeight);

  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  initModal();
});

