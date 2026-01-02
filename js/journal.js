//
// Journal JS - Vanilla Edition
// Zero dependencies, all features preserved
//

(function() {
  'use strict';

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  /**
   * Debounce function - delays execution until after wait ms have elapsed
   */
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * Throttle function - limits execution to once per wait ms
   */
  function throttle(func, wait) {
    let lastTime = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastTime >= wait) {
        lastTime = now;
        func.apply(this, args);
      }
    };
  }

  /**
   * Wait for images to load (replacement for imagesLoaded plugin)
   * @param {Element} container - Element containing images
   * @param {Object} options - { background: true } for background images
   * @param {Function} callback - Called when all images loaded
   */
  function onImagesLoaded(container, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    const images = [];

    if (options.background) {
      // Check for background images
      const bgUrl = getComputedStyle(container).backgroundImage;
      if (bgUrl && bgUrl !== 'none') {
        const match = bgUrl.match(/url\(["']?(.+?)["']?\)/);
        if (match) {
          images.push(match[1]);
        }
      }
    }

    // Also check regular images
    container.querySelectorAll('img').forEach(img => {
      if (img.src) images.push(img.src);
    });

    if (images.length === 0) {
      callback();
      return;
    }

    let loaded = 0;
    const checkComplete = () => {
      loaded++;
      if (loaded >= images.length) {
        callback();
      }
    };

    images.forEach(src => {
      const img = new Image();
      img.onload = checkComplete;
      img.onerror = checkComplete;
      img.src = src;
    });
  }

  /**
   * Parse HTML string into DOM elements
   */
  function parseHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content;
  }

  // ==========================================================================
  // STATE
  // ==========================================================================

  let navTarget = document.body.getAttribute('data-page-url');
  let docTitle = document.title;
  let featuredImage = document.querySelector('.page__content')?.getAttribute('data-image') || '';
  let isAjaxEnabled = document.body.classList.contains('ajax-loading');

  // ==========================================================================
  // AJAX NAVIGATION
  // ==========================================================================

  /**
   * Handle AJAX page navigation
   */
  function initAjaxNavigation() {
    if (!isAjaxEnabled) return;

    // Listen for popstate (back/forward buttons)
    window.addEventListener('popstate', (e) => {
      if (e.state) {
        loadPage(window.location.pathname);
      }
    });

    // Intercept link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Skip if modifier keys pressed
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;

      // Skip special links
      if (link.classList.contains('js-no-ajax') ||
          href.includes('#') ||
          href.includes('mailto:') ||
          href.includes('tel:')) {
        return;
      }

      // Skip gallery item links (handled by lightbox)
      if (link.classList.contains('gallery__item__link')) {
        e.preventDefault();
        return;
      }

      // External links - open in new tab
      if (href.includes('http') && !href.includes(window.location.hostname)) {
        e.preventDefault();
        window.open(href, '_blank', 'noopener');
        return;
      }

      // Internal links - AJAX load
      if (!href.includes('http') || href.includes(window.location.hostname)) {
        e.preventDefault();
        navTarget = href;
        history.pushState({ path: href }, '', href);
        loadPage(href);
      }
    });
  }

  /**
   * Load page content via fetch
   */
  async function loadPage(url) {
    document.body.classList.add('loading');

    try {
      const response = await fetch(url);
      const html = await response.text();

      // Parse the response and extract page content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newContent = doc.querySelector('.page__content');

      if (!newContent) {
        window.location = url;
        return;
      }

      // Wait for transition
      await new Promise(resolve => setTimeout(resolve, 400));

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Replace content
      const page = document.querySelector('.page');
      const oldContent = page.querySelector('.page__content');
      if (oldContent) oldContent.remove();
      page.appendChild(newContent);

      // Update page state
      document.body.setAttribute('data-page-url', window.location.pathname);
      navTarget = window.location.pathname;

      // Update title
      docTitle = newContent.getAttribute('data-page-title') || doc.title;
      document.title = docTitle;

      // Update featured image
      const newFeaturedImage = newContent.getAttribute('data-image');
      if (newFeaturedImage && newFeaturedImage !== featuredImage) {
        updateHeaderImage(newFeaturedImage);
        featuredImage = newFeaturedImage;
      }

      // Re-run page functions
      pageFunctions();

    } catch (error) {
      console.error('AJAX load failed:', error);
      window.location = url;
    }
  }

  /**
   * Animate header image transition
   */
  function updateHeaderImage(newImageUrl) {
    const headerImages = document.querySelectorAll('.header-image');
    const inactiveImage = document.querySelector('.header-image:not(.header-image--on)');

    if (!inactiveImage) return;

    inactiveImage.style.backgroundImage = `url(${newImageUrl})`;
    inactiveImage.classList.add('header-image--switch');

    onImagesLoaded(inactiveImage, { background: true }, () => {
      headerImages.forEach(img => img.classList.remove('header-image--on'));
      inactiveImage.classList.add('header-image--on');
      inactiveImage.classList.remove('header-image--switch');
    });
  }

  // ==========================================================================
  // PAGE FUNCTIONS
  // ==========================================================================

  function pageFunctions() {
    showContent();
    updateActiveLinks();
    initGalleries();
    enhanceImages();
    enhanceVideos();
    enhanceTables();
  }

  /**
   * Show content after header image loads
   */
  function showContent() {
    const headerImage = document.querySelector('.header-image');
    if (!headerImage) {
      document.body.classList.remove('loading', 'menu--open');
      return;
    }

    onImagesLoaded(headerImage, { background: true }, () => {
      document.body.classList.remove('loading', 'menu--open');
    });
  }

  /**
   * Update active link states in navigation
   */
  function updateActiveLinks() {
    document.querySelectorAll('.active-link').forEach(el => {
      el.classList.remove('active-link');
    });

    const activeLink = document.querySelector(`a[href="${navTarget}"]`);
    if (activeLink) {
      activeLink.classList.add('active-link');
    }
  }

  // ==========================================================================
  // GALLERIES
  // ==========================================================================

  let galleryCount = 0;
  let carouselObservers = [];

  function initGalleries() {
    // Clean up previous observers
    carouselObservers.forEach(obs => obs.disconnect());
    carouselObservers = [];
    galleryCount = 0;

    document.querySelectorAll('.gallery').forEach(gallery => {
      galleryCount++;
      const galleryId = `gallery-${galleryCount}`;
      gallery.id = galleryId;

      const columns = gallery.getAttribute('data-columns');

      // Create gallery wrapper
      const wrap = document.createElement('div');
      wrap.className = 'gallery__wrap';

      // Move images into wrapper
      gallery.querySelectorAll(':scope > img').forEach(img => {
        const item = document.createElement('div');
        item.className = 'gallery__item';

        const link = document.createElement('a');
        link.href = img.src;
        link.className = 'gallery__item__link';
        link.appendChild(img.cloneNode(true));

        item.appendChild(link);
        wrap.appendChild(item);
        img.remove();
      });

      gallery.appendChild(wrap);

      // Wait for images to load
      onImagesLoaded(gallery, () => {
        if (columns === '1') {
          initCarousel(gallery, wrap);
        } else {
          initMasonryGallery(gallery, wrap);
        }
        gallery.classList.add('gallery--on');
      });
    });
  }

  /**
   * Initialize masonry-style gallery using CSS columns
   */
  function initMasonryGallery(gallery, wrap) {
    gallery.classList.add('gallery--grid');

    // Init lightbox for gallery items
    wrap.querySelectorAll('.gallery__item__link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        openLightbox(link.href);
      });
    });
  }

  /**
   * Initialize carousel gallery with CSS scroll-snap
   */
  function initCarousel(gallery, wrap) {
    gallery.classList.add('gallery--carousel');
    wrap.classList.add('carousel');

    const items = wrap.querySelectorAll('.gallery__item');
    if (items.length === 0) return;

    // Create navigation dots
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel__dots';

    items.forEach((item, index) => {
      const dot = document.createElement('button');
      dot.className = 'carousel__dot';
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      if (index === 0) dot.classList.add('carousel__dot--active');

      dot.addEventListener('click', () => {
        items[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      });

      dotsContainer.appendChild(dot);
    });

    gallery.appendChild(dotsContainer);

    // Update dots on scroll
    const updateDots = debounce(() => {
      const scrollLeft = wrap.scrollLeft;
      const itemWidth = items[0].offsetWidth;
      const activeIndex = Math.round(scrollLeft / itemWidth);

      dotsContainer.querySelectorAll('.carousel__dot').forEach((dot, i) => {
        dot.classList.toggle('carousel__dot--active', i === activeIndex);
      });
    }, 50);

    wrap.addEventListener('scroll', updateDots);

    // Autoplay with IntersectionObserver
    let autoplayInterval = null;

    const startAutoplay = () => {
      if (autoplayInterval) return;
      autoplayInterval = setInterval(() => {
        const scrollLeft = wrap.scrollLeft;
        const itemWidth = items[0].offsetWidth;
        const currentIndex = Math.round(scrollLeft / itemWidth);
        const nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      }, 6000);
    };

    const stopAutoplay = () => {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
      }
    };

    // Use IntersectionObserver to pause/play when in view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startAutoplay();
        } else {
          stopAutoplay();
        }
      });
    }, { threshold: 0.5 });

    observer.observe(gallery);
    carouselObservers.push(observer);
  }

  // ==========================================================================
  // LIGHTBOX
  // ==========================================================================

  let lightboxElement = null;

  function openLightbox(imageSrc) {
    // Create lightbox if it doesn't exist
    if (!lightboxElement) {
      lightboxElement = document.createElement('div');
      lightboxElement.className = 'lightbox';
      lightboxElement.innerHTML = `
        <div class="lightbox__overlay"></div>
        <div class="lightbox__content">
          <img class="lightbox__image" src="" alt="">
        </div>
        <button class="lightbox__close" aria-label="Close lightbox">&times;</button>
      `;
      document.body.appendChild(lightboxElement);

      // Close on overlay click
      lightboxElement.querySelector('.lightbox__overlay').addEventListener('click', closeLightbox);
      lightboxElement.querySelector('.lightbox__close').addEventListener('click', closeLightbox);

      // Close on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxElement.classList.contains('lightbox--open')) {
          closeLightbox();
        }
      });
    }

    // Set image and show
    const img = lightboxElement.querySelector('.lightbox__image');
    img.src = imageSrc;

    // Wait for image to load before showing
    img.onload = () => {
      lightboxElement.classList.add('lightbox--open');
      document.body.style.overflow = 'hidden';
    };
  }

  function closeLightbox() {
    if (!lightboxElement) return;
    lightboxElement.classList.remove('lightbox--open');
    document.body.style.overflow = '';
  }

  // ==========================================================================
  // CONTENT ENHANCEMENTS
  // ==========================================================================

  /**
   * Unwrap images from paragraph tags and add wrapper
   */
  function enhanceImages() {
    document.querySelectorAll('.single p > img').forEach(img => {
      const p = img.parentElement;
      const wrapper = document.createElement('div');
      wrapper.className = 'image-wrap';
      wrapper.appendChild(img.cloneNode(true));
      p.parentNode.insertBefore(wrapper, p);
      p.remove();
    });
  }

  /**
   * Wrap YouTube/Vimeo iframes for responsive display
   */
  function enhanceVideos() {
    document.querySelectorAll('.single iframe').forEach(iframe => {
      const src = iframe.getAttribute('src') || '';
      if (!src.includes('youtube') && !src.includes('vimeo')) return;

      const width = parseFloat(iframe.getAttribute('width')) || 16;
      const height = parseFloat(iframe.getAttribute('height')) || 9;
      const ratio = (height / width) * 100;

      const videoWrap = document.createElement('div');
      videoWrap.className = 'video-wrap';

      const video = document.createElement('div');
      video.className = 'video';
      video.style.paddingBottom = `${ratio}%`;

      iframe.parentNode.insertBefore(videoWrap, iframe);
      video.appendChild(iframe);
      videoWrap.appendChild(video);
    });
  }

  /**
   * Wrap tables for horizontal scroll on mobile
   */
  function enhanceTables() {
    document.querySelectorAll('.single table').forEach(table => {
      if (table.parentElement.classList.contains('table-wrap')) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'table-wrap';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  }

  // ==========================================================================
  // MENU
  // ==========================================================================

  function initMenu() {
    document.addEventListener('click', (e) => {
      // Menu toggle button
      if (e.target.closest('.js-menu-toggle')) {
        document.body.classList.toggle('menu--open');
        return;
      }

      // Menu link click (close menu on mobile)
      if (e.target.closest('.menu__list__item__link')) {
        document.body.classList.remove('menu--open');
      }
    });
  }

  // ==========================================================================
  // CONTACT FORM
  // ==========================================================================

  function initContactForm() {
    document.addEventListener('submit', (e) => {
      if (!e.target.matches('#contact-form')) return;

      const form = e.target;
      const emailField = form.querySelector('.contact-form__input[name="email"]');
      const nameField = form.querySelector('.contact-form__input[name="name"]');
      const messageField = form.querySelector('.contact-form__textarea[name="message"]');
      const gotchaField = form.querySelector('.contact-form__gotcha');

      // Clear previous errors
      form.querySelectorAll('.contact-form__item--error').forEach(item => {
        item.classList.remove('contact-form__item--error');
      });

      let hasError = false;

      // Validate fields
      if (emailField && !emailField.value) {
        emailField.closest('.contact-form__item')?.classList.add('contact-form__item--error');
        hasError = true;
      }
      if (nameField && !nameField.value) {
        nameField.closest('.contact-form__item')?.classList.add('contact-form__item--error');
        hasError = true;
      }
      if (messageField && !messageField.value) {
        messageField.closest('.contact-form__item')?.classList.add('contact-form__item--error');
        hasError = true;
      }

      // Check honeypot
      if (gotchaField && gotchaField.value.length > 0) {
        hasError = true;
      }

      if (hasError) {
        e.preventDefault();
      }
    });
  }

  // ==========================================================================
  // WINDOW RESIZE
  // ==========================================================================

  function initResizeHandler() {
    const handleResize = throttle(() => {
      // Recalculate gallery layouts if needed
      document.querySelectorAll('.gallery--on').forEach(gallery => {
        // CSS handles most of this, but we can add custom logic here if needed
      });
    }, 500);

    window.addEventListener('resize', handleResize);
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  function init() {
    initAjaxNavigation();
    initMenu();
    initContactForm();
    initResizeHandler();
    pageFunctions();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
