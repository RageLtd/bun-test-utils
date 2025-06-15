// GitBook-style JavaScript for navigation and interactivity

document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation();
  initializeSearch();
  initializeMobileMenu();
  initializeScrollSpy();
  initializeCodeHighlighting();
  initializeTooltips();
});

// Navigation functionality
function initializeNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");
  const currentPath = window.location.pathname;

  navLinks.forEach((link) => {
    // Set active state based on current page
    if (
      link.getAttribute("href") === currentPath ||
      (currentPath === "/" && link.getAttribute("href") === "index.html")
    ) {
      link.classList.add("active");
    }

    // Add click handlers
    link.addEventListener("click", function (e) {
      // Remove active class from all links
      navLinks.forEach((l) => l.classList.remove("active"));
      // Add active class to clicked link
      this.classList.add("active");

      // Store active page in localStorage
      localStorage.setItem("activeNavLink", this.getAttribute("href"));
    });
  });

  // Restore active state from localStorage
  const savedActiveLink = localStorage.getItem("activeNavLink");
  if (savedActiveLink) {
    const savedLink = document.querySelector(`[href="${savedActiveLink}"]`);
    if (savedLink) {
      navLinks.forEach((l) => l.classList.remove("active"));
      savedLink.classList.add("active");
    }
  }
}

// Search functionality
function initializeSearch() {
  const searchInput = document.querySelector(".search-input");
  const navItems = document.querySelectorAll(".nav-item");

  if (!searchInput) return;

  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase().trim();

    navItems.forEach((item) => {
      const link = item.querySelector(".nav-link");
      const text = link.textContent.toLowerCase();

      if (searchTerm === "" || text.includes(searchTerm)) {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });

    // Show/hide section headers based on visible items
    const sections = document.querySelectorAll(".nav-section");
    sections.forEach((section) => {
      const visibleItems = section.querySelectorAll(
        '.nav-item:not([style*="none"])',
      );
      const sectionTitle = section.querySelector(".nav-section-title");

      if (visibleItems.length === 0 && searchTerm !== "") {
        if (sectionTitle) sectionTitle.style.display = "none";
      } else {
        if (sectionTitle) sectionTitle.style.display = "";
      }
    });
  });

  // Clear search on escape
  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      this.value = "";
      this.dispatchEvent(new Event("input"));
      this.blur();
    }
  });
}

// Mobile menu functionality
function initializeMobileMenu() {
  const mobileToggle = document.querySelector(".mobile-toggle");
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");

  if (!mobileToggle || !sidebar) return;

  mobileToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");

    // Close sidebar when clicking outside on mobile
    if (sidebar.classList.contains("open")) {
      document.addEventListener("click", closeSidebarOnOutsideClick);
    } else {
      document.removeEventListener("click", closeSidebarOnOutsideClick);
    }
  });

  function closeSidebarOnOutsideClick(e) {
    if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
      sidebar.classList.remove("open");
      document.removeEventListener("click", closeSidebarOnOutsideClick);
    }
  }

  // Close sidebar on nav link click (mobile)
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("open");
        document.removeEventListener("click", closeSidebarOnOutsideClick);
      }
    });
  });
}

// Scroll spy for highlighting current section
function initializeScrollSpy() {
  const headings = document.querySelectorAll("h1, h2, h3, h4");
  const navLinks = document.querySelectorAll(".nav-link");

  if (headings.length === 0) return;

  let ticking = false;

  function updateActiveHeading() {
    let current = "";
    const scrollPosition = window.scrollY + 100;

    headings.forEach((heading) => {
      const offsetTop = heading.offsetTop;
      if (scrollPosition >= offsetTop) {
        current = heading.id;
      }
    });

    // Update table of contents if it exists
    const tocLinks = document.querySelectorAll(".toc-link");
    tocLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });

    ticking = false;
  }

  function requestUpdateActiveHeading() {
    if (!ticking) {
      requestAnimationFrame(updateActiveHeading);
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestUpdateActiveHeading);
}

// Code highlighting and copy functionality
function initializeCodeHighlighting() {
  const codeBlocks = document.querySelectorAll("pre code");

  codeBlocks.forEach((codeBlock) => {
    // Add copy button
    const pre = codeBlock.parentElement;
    const copyButton = document.createElement("button");
    copyButton.className = "copy-button";
    copyButton.textContent = "Copy";
    copyButton.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            background: #666;
            color: white;
            border: none;
            padding: 4px 8px;
            font-size: 12px;
            border-radius: 3px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s;
        `;

    pre.style.position = "relative";
    pre.appendChild(copyButton);

    // Show/hide copy button on hover
    pre.addEventListener("mouseenter", () => {
      copyButton.style.opacity = "1";
    });

    pre.addEventListener("mouseleave", () => {
      copyButton.style.opacity = "0";
    });

    // Copy functionality
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(codeBlock.textContent);
        copyButton.textContent = "Copied!";
        setTimeout(() => {
          copyButton.textContent = "Copy";
        }, 2000);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = codeBlock.textContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        copyButton.textContent = "Copied!";
        setTimeout(() => {
          copyButton.textContent = "Copy";
        }, 2000);
      }
    });
  });
}

// Tooltip functionality
function initializeTooltips() {
  const elementsWithTooltips = document.querySelectorAll("[data-tooltip]");

  elementsWithTooltips.forEach((element) => {
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.textContent = element.getAttribute("data-tooltip");
    tooltip.style.cssText = `
            position: absolute;
            background: #333;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            white-space: nowrap;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
            transform: translateX(-50%);
        `;

    element.addEventListener("mouseenter", (e) => {
      document.body.appendChild(tooltip);
      const rect = element.getBoundingClientRect();
      tooltip.style.left = rect.left + rect.width / 2 + "px";
      tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + "px";
      tooltip.style.opacity = "1";
    });

    element.addEventListener("mouseleave", () => {
      if (tooltip.parentElement) {
        tooltip.style.opacity = "0";
        setTimeout(() => {
          if (tooltip.parentElement) {
            document.body.removeChild(tooltip);
          }
        }, 200);
      }
    });
  });
}

// Smooth scrolling for anchor links
document.addEventListener("click", (e) => {
  if (
    e.target.tagName === "A" &&
    e.target.getAttribute("href").startsWith("#")
  ) {
    e.preventDefault();
    const targetId = e.target.getAttribute("href").substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Update URL without triggering page reload
      history.pushState(null, null, `#${targetId}`);
    }
  }
});

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  // Search shortcut (Ctrl/Cmd + K)
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    const searchInput = document.querySelector(".search-input");
    if (searchInput) {
      searchInput.focus();
    }
  }

  // Navigation shortcuts
  if (e.altKey) {
    const currentActive = document.querySelector(".nav-link.active");
    const allNavLinks = Array.from(document.querySelectorAll(".nav-link"));
    const currentIndex = allNavLinks.indexOf(currentActive);

    if (e.key === "ArrowUp" && currentIndex > 0) {
      e.preventDefault();
      allNavLinks[currentIndex - 1].click();
    } else if (e.key === "ArrowDown" && currentIndex < allNavLinks.length - 1) {
      e.preventDefault();
      allNavLinks[currentIndex + 1].click();
    }
  }
});

// Dark mode toggle (optional)
function initializeDarkMode() {
  const darkModeToggle = document.querySelector(".dark-mode-toggle");
  if (!darkModeToggle) return;

  const currentTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", currentTheme);

  darkModeToggle.addEventListener("click", () => {
    const theme = document.documentElement.getAttribute("data-theme");
    const newTheme = theme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });
}

// Initialize page load animations
function initializeAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe elements for animation
  const animateElements = document.querySelectorAll(
    "h1, h2, h3, .callout, table",
  );
  animateElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });
}

// Print functionality
function initializePrint() {
  const printButton = document.querySelector(".print-button");
  if (printButton) {
    printButton.addEventListener("click", () => {
      window.print();
    });
  }
}

// Initialize all features when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initializeAnimations();
    initializePrint();
    initializeDarkMode();
  });
} else {
  initializeAnimations();
  initializePrint();
  initializeDarkMode();
}

// Export functions for potential external use
window.GitBookJS = {
  initializeNavigation,
  initializeSearch,
  initializeMobileMenu,
  initializeScrollSpy,
  initializeCodeHighlighting,
  initializeTooltips,
};
