/* Preview-only runtime (scripts/preview-snapshot.mjs). Recreates the app's
 * client behaviour over captured HTML: routing, drawers, cart, search, sort,
 * size picker, home widgets. Mock catalogue; nothing is sent anywhere. */
(function () {
  'use strict';
  var D = window.__PREVIEW__;
  var main = document.getElementById('main');
  var CART_KEY = 'trenzora-preview-cart';
  var SHIPPING_NOTE =
    'Taxes included. Shipping is calculated at checkout. Printed to order — ships in 2–4 working days, delivered in 3–7 working days.';

  /* ---------------------------------------------------------------- utils */
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c];
    });
  }
  var inr = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
  function money(n) {
    return inr.format(n);
  }
  function hydrateImages(root) {
    $$('[data-img]', root).forEach(function (img) {
      img.setAttribute('src', D.images[Number(img.getAttribute('data-img'))]);
      img.removeAttribute('data-img');
      img.removeAttribute('srcset');
      img.setAttribute('loading', 'lazy');
    });
  }
  function nameParts(title) {
    var i = title.indexOf(' — ');
    return i < 0
      ? {design: title, type: ''}
      : {design: title.slice(0, i), type: title.slice(i + 3)};
  }

  /* -------------------------------------------------------------- routing */
  // Paths map to bare hash tokens: /products/x → #products~x, / → #home.
  function toHash(path) {
    return path === '/' ? 'home' : path.replace(/^\//, '').replace(/\//g, '~');
  }
  function fromHash(hash) {
    var h = (hash || '').replace(/^#/, '');
    if (!h || h === 'home' || h === 'main') return '/';
    return '/' + h.replace(/~/g, '/');
  }
  var searchTerm = '';

  function go(href) {
    var url = new URL(href, 'https://trenzora.in');
    var path = url.pathname.replace(/\/$/, '') || '/';
    if (path === '/search') searchTerm = url.searchParams.get('q') || '';
    var size = url.searchParams.get('Size');
    if (size) pendingSize = size;
    var target = '#' + toHash(path);
    if (location.hash === target) render();
    else location.hash = target;
  }
  var pendingSize = null;

  function render() {
    var path = fromHash(location.hash);
    var entry = D.pages[path];
    if (entry && entry.redirect) {
      history.replaceState(null, '', '#' + toHash(entry.redirect));
      path = entry.redirect;
      entry = D.pages[path];
    }
    closeDrawer();
    if (path === '/checkout') {
      main.innerHTML = checkoutPage();
      document.title = 'Checkout hand-off — Trenzora preview';
    } else {
      if (!entry) entry = D.pages['404'];
      main.innerHTML = entry.html;
      document.title = entry.title;
    }
    hydrateImages(main);
    markNav(path);
    afterRender(path);
    window.scrollTo(0, 0);
  }

  function markNav(path) {
    $$('.nav-primary a, .mobile-nav a').forEach(function (a) {
      var active = a.getAttribute('href') === path;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function afterRender(path) {
    if (path === '/') initHome();
    if (path.indexOf('/products/') === 0) initProduct(path.split('/').pop());
    if (path.indexOf('/collections/') === 0) initSort();
    if (path === '/cart') renderCartInto(main, 'page');
    if (path === '/search') renderSearchPage();
  }

  /* -------------------------------------------------------------- drawers */
  var drawers = {
    cart: '.drawer--right',
    search: '.drawer--top',
    menu: '.drawer--left',
  };
  function openDrawer(type) {
    closeDrawer();
    var el = $(drawers[type]);
    if (!el) return;
    if (type === 'cart') renderCartInto($('.drawer__body', el), 'aside');
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    var f = $(
      '[data-autofocus], input, a[href], button',
      $('.drawer__body', el),
    );
    setTimeout(function () {
      if (f) f.focus();
    }, 60);
  }
  function closeDrawer() {
    $$('.drawer.is-open').forEach(function (el) {
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');
    });
    document.body.classList.remove('is-locked');
  }

  /* ----------------------------------------------------------------- cart */
  var cart = [];
  try {
    cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]') || [];
  } catch {
    cart = [];
  }
  cart = cart.filter(function (l) {
    return D.products[l.handle];
  });
  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* private mode: in-memory only */
    }
    updateBadge();
    var open = $('.drawer--right.is-open .drawer__body');
    if (open) renderCartInto(open, 'aside');
    if (fromHash(location.hash) === '/cart') renderCartInto(main, 'page');
  }
  function addToCart(handle, size) {
    var line = cart.filter(function (l) {
      return l.handle === handle && l.size === size;
    })[0];
    if (line) line.qty += 1;
    else cart.push({handle, size, qty: 1});
    saveCart();
    openDrawer('cart');
  }
  function count() {
    return cart.reduce(function (n, l) {
      return n + l.qty;
    }, 0);
  }
  function updateBadge() {
    var a = $('.header-actions a[href="/cart"]');
    if (!a) return;
    var n = count();
    a.setAttribute('aria-label', 'Cart, ' + n + (n === 1 ? ' item' : ' items'));
    var badge = $('.cart-count', a);
    if (n && !badge) {
      badge = document.createElement('span');
      badge.className = 'cart-count';
      badge.setAttribute('aria-hidden', 'true');
      a.appendChild(badge);
    }
    if (badge) {
      if (n) badge.textContent = n;
      else badge.remove();
    }
  }

  function cartHtml(layout) {
    if (!cart.length) {
      return (
        '<div class="empty-state"><p class="h3">Your cart is empty.</p>' +
        '<p class="muted">Every Trenzora piece is an original design, printed for you.</p>' +
        '<a href="/collections/drops" class="btn btn--primary">Explore the drop</a></div>'
      );
    }
    var subtotal = 0;
    var lines = cart
      .map(function (l, i) {
        var p = D.products[l.handle];
        var parts = nameParts(p.title);
        var total = p.price * l.qty;
        subtotal += total;
        var url = '/products/' + l.handle + (l.size ? '?Size=' + l.size : '');
        return (
          '<li class="cart-line"><a href="' +
          url +
          '" tabindex="-1" aria-hidden="true">' +
          p.media +
          '</a><div class="cart-line__main"><div class="cart-line__top">' +
          '<a href="' +
          url +
          '" class="cart-line__title">' +
          esc(parts.design) +
          (parts.type
            ? '<span class="cart-line__type">' + esc(parts.type) + '</span>'
            : '') +
          '</a><strong>' +
          money(total) +
          '</strong></div>' +
          (l.size
            ? '<span class="cart-line__variant">Size: ' +
              esc(l.size) +
              '</span>'
            : '') +
          '<div class="cart-line__controls"><div class="qty" role="group" aria-label="Quantity for ' +
          esc(p.title) +
          '">' +
          '<button type="button" data-qty="-1" data-line="' +
          i +
          '" aria-label="Decrease quantity"' +
          (l.qty <= 1 ? ' disabled' : '') +
          '>−</button>' +
          '<output aria-live="polite">' +
          l.qty +
          '</output>' +
          '<button type="button" data-qty="1" data-line="' +
          i +
          '" aria-label="Increase quantity">+</button></div>' +
          '<button type="button" class="text-btn" data-remove="' +
          i +
          '">Remove</button></div></div></li>'
        );
      })
      .join('');
    return (
      '<div class="' +
      (layout === 'page' ? 'cart-page' : 'cart-aside') +
      '">' +
      '<ul class="cart-lines" aria-label="Items in your cart">' +
      lines +
      '</ul>' +
      '<section class="cart-summary" aria-label="Order summary">' +
      '<div class="cart-summary__row"><span>Subtotal</span><span>' +
      money(subtotal) +
      '</span></div>' +
      '<p class="meta">' +
      SHIPPING_NOTE +
      '</p>' +
      '<a href="/checkout" class="btn btn--accent btn--lg btn--block">Checkout securely</a>' +
      '<p class="meta center">Secure checkout powered by Shopify</p>' +
      '</section></div>'
    );
  }

  function renderCartInto(root, layout) {
    var slot =
      layout === 'aside'
        ? root
        : $('.cart-page, .cart-aside, .empty-state', root);
    if (!slot) return;
    var wrap = document.createElement('div');
    wrap.innerHTML = cartHtml(layout);
    hydrateImages(wrap);
    if (layout === 'aside') {
      root.innerHTML = '';
      root.appendChild(wrap.firstChild);
    } else {
      slot.replaceWith(wrap.firstChild);
    }
  }

  function checkoutPage() {
    var items = cart.length
      ? cart
          .map(function (l) {
            var p = D.products[l.handle];
            return (
              '<li>' +
              esc(p.title) +
              (l.size ? ' · ' + esc(l.size) : '') +
              ' × ' +
              l.qty +
              '</li>'
            );
          })
          .join('')
      : '<li>Your cart is empty.</li>';
    return (
      '<div class="container page-end"><header class="page-hero"><p class="eyebrow">Preview</p>' +
      '<h1>Checkout hand-off</h1><p class="lede">In the live store, this button takes you to Shopify’s secure checkout (UPI, cards, netbanking, COD if enabled). ' +
      'This preview runs on the mock catalogue with no store connected, so there’s no payment step.</p></header>' +
      '<div class="preview-checkout stack"><p class="eyebrow">Would be sent to checkout</p><ol>' +
      items +
      '</ol>' +
      '<p class="meta">Prices are provisional.</p>' +
      '<p><a href="/cart" class="btn btn--primary">Back to cart</a></p></div></div>'
    );
  }

  /* -------------------------------------------------------------- product */
  function initProduct(handle) {
    var p = D.products[handle];
    if (!p) return;
    var selected = p.selected;
    if (pendingSize && p.sizes.indexOf(pendingSize) >= 0)
      selected = pendingSize;
    pendingSize = null;

    function sync() {
      $$('.option-grid .option-btn', main).forEach(function (b) {
        b.setAttribute(
          'aria-checked',
          String(b.textContent.trim() === selected),
        );
      });
      var strong = $('.option-group legend strong', main);
      if (strong && selected) strong.textContent = selected;
      var atc = $('.atc button', main);
      if (atc && p.canAdd) atc.textContent = 'Add to cart · ' + money(p.price);
      var info = $('.sticky-atc__info .meta', main);
      if (info && selected)
        info.textContent = selected + ' · ' + money(p.price);
    }
    $$('.option-grid .option-btn', main).forEach(function (b) {
      if (b.tagName === 'A') return;
      b.addEventListener('click', function () {
        selected = b.textContent.trim();
        sync();
      });
    });
    if (selected) sync();

    $$('.atc form, .sticky-atc form', main).forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (p.canAdd) addToCart(handle, p.sizes.length ? selected : null);
      });
    });

    stickyTarget = {atc: $('.atc', main), bar: $('.sticky-atc', main)};
    updateSticky();
  }

  // Sticky add-to-cart once the main button has scrolled above the viewport.
  var stickyTarget = null;
  function updateSticky() {
    if (!stickyTarget || !stickyTarget.atc || !stickyTarget.bar) return;
    if (!document.contains(stickyTarget.atc)) return void (stickyTarget = null);
    var show = stickyTarget.atc.getBoundingClientRect().bottom < 0;
    stickyTarget.bar.classList.toggle('is-visible', show);
    stickyTarget.bar.setAttribute('aria-hidden', String(!show));
  }
  window.addEventListener('scroll', updateSticky, {passive: true});

  /* ------------------------------------------------------------ home page */
  function initHome() {
    $$('.design-switch .chip', main).forEach(function (chip) {
      chip.addEventListener('click', function () {
        var label = chip.textContent.trim();
        var html = D.designWay[label];
        if (!html) return;
        $$('.design-switch .chip', main).forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('is-active', on);
          c.setAttribute('aria-pressed', String(on));
        });
        var section = chip.closest('.container');
        $('.way', section).remove();
        $('.way-foot', section).remove();
        section.insertAdjacentHTML('beforeend', html);
        hydrateImages(section);
      });
    });
    var miyInput = $('.miy .input', main);
    var miyText = $('.miy__preview-text', main);
    if (miyInput && miyText) {
      miyInput.addEventListener('input', function () {
        miyText.textContent = miyInput.value.trim() || 'Your name';
      });
    }
  }

  /* ----------------------------------------------------------- collection */
  function initSort() {
    var select = $('.collection-toolbar select', main);
    var grid = $('.grid-products', main);
    if (!select || !grid) return;
    var original = $$('.product-card', grid);
    select.addEventListener('change', function () {
      var cards = original.slice();
      var price = function (c) {
        var h = c.getAttribute('href').split('/').pop();
        return (D.products[h] || {}).price || 0;
      };
      if (select.value === 'price-asc' || select.value === 'price-low-high')
        cards.sort(function (a, b) {
          return price(a) - price(b);
        });
      else if (select.value.indexOf('price') === 0)
        cards.sort(function (a, b) {
          return price(b) - price(a);
        });
      cards.forEach(function (c) {
        grid.appendChild(c);
      });
    });
  }

  /* --------------------------------------------------------------- search */
  var index = Object.keys(D.products).map(function (handle) {
    var p = D.products[handle];
    var cols = Object.keys(D.collections).filter(function (c) {
      return D.collections[c].indexOf(handle) >= 0;
    });
    return {
      handle,
      text: (
        p.title +
        ' ' +
        p.story +
        ' ' +
        cols.join(' ') +
        ' ' +
        handle.replace(/-/g, ' ')
      ).toLowerCase(),
    };
  });
  function search(term) {
    var words = term
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map(function (w) {
        return w.replace(/s$/, '');
      });
    if (!words.length) return [];
    return index
      .filter(function (e) {
        return words.every(function (w) {
          return e.text.indexOf(w) >= 0;
        });
      })
      .map(function (e) {
        return e.handle;
      });
  }

  function renderSearchPage() {
    var input = $('#search-page-input', main);
    if (!searchTerm) return;
    if (input) input.value = searchTerm;
    var h1 = $('h1', main);
    if (h1) h1.textContent = 'Results for “' + searchTerm + '”';
    var hits = search(searchTerm);
    var empty = $('.empty-state', main);
    var html = hits.length
      ? '<p class="meta" role="status">' +
        hits.length +
        ' products</p><div class="grid-products grid-products--4 mt-4">' +
        hits
          .map(function (h) {
            return D.cards[h] || '';
          })
          .join('') +
        '</div>'
      : '<div class="empty-state"><p class="h3">No matches for “' +
        esc(searchTerm) +
        '”.</p><p class="muted">Try “Mumbai”, “coffee” or “gift”.</p></div>';
    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    hydrateImages(wrap);
    var container = $('.page-end', main) || main;
    if (empty) empty.remove();
    while (wrap.firstChild) container.appendChild(wrap.firstChild);
  }

  function renderSuggest(term) {
    var box = $('.drawer--top .search-suggest');
    if (!box) return;
    var hits = term.trim().length >= 2 ? search(term.trim()).slice(0, 6) : [];
    box.innerHTML = hits.length
      ? '<p class="eyebrow">Products</p><div>' +
        hits
          .map(function (h) {
            var p = D.products[h];
            var parts = nameParts(p.title);
            return (
              '<a href="/products/' +
              h +
              '" class="search-hit">' +
              p.media +
              '<span><strong>' +
              esc(parts.design) +
              '</strong><br><span class="meta">' +
              esc(parts.type) +
              '</span></span>' +
              '<span>' +
              money(p.price) +
              '</span></a>'
            );
          })
          .join('') +
        '</div>'
      : term.trim().length >= 2
        ? '<p class="muted">No products match “' + esc(term.trim()) + '”.</p>'
        : '';
    hydrateImages(box);
  }

  /* --------------------------------------------------------------- events */
  document.addEventListener('click', function (e) {
    var t = e.target;
    var btn = t.closest('button');
    if (btn) {
      if (btn.classList.contains('menu-toggle')) return void openDrawer('menu');
      if (
        btn.closest('.drawer') &&
        (btn.classList.contains('drawer__backdrop') ||
          btn.getAttribute('aria-label') === 'Close')
      )
        return void closeDrawer();
      if (btn.hasAttribute('data-qty')) {
        var line = cart[Number(btn.getAttribute('data-line'))];
        line.qty = Math.max(1, line.qty + Number(btn.getAttribute('data-qty')));
        return void saveCart();
      }
      if (btn.hasAttribute('data-remove')) {
        cart.splice(Number(btn.getAttribute('data-remove')), 1);
        return void saveCart();
      }
    }
    var a = t.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (href === '#main') {
      e.preventDefault();
      return void main.focus();
    }
    if (a.closest('.header-actions')) {
      e.preventDefault();
      return void openDrawer(href === '/cart' ? 'cart' : 'search');
    }
    if (href.charAt(0) === '/' && href.charAt(1) !== '/') {
      e.preventDefault();
      go(href);
    }
  });

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (form.closest('.atc, .sticky-atc')) return; // handled per product
    e.preventDefault();
    if ((form.getAttribute('action') || '') === '/search') {
      var q = (form.querySelector('[name="q"]') || {}).value || '';
      go('/search?q=' + encodeURIComponent(q.trim()));
      return;
    }
    // Newsletter / waitlist forms: never sent from the preview.
    var status =
      form.querySelector('[role="status"], [aria-live]') ||
      form.nextElementSibling;
    var button = form.querySelector(
      'button[type="submit"], button:not([type])',
    );
    if (button) {
      button.textContent = 'You’re in (preview)';
      button.disabled = true;
    }
    var note = document.createElement('p');
    note.className = 'meta preview-note';
    note.textContent =
      'Preview only — nothing was sent. In the live store this adds you to the Trenzora list.';
    if (status && status.parentNode === form)
      status.textContent = note.textContent;
    else form.appendChild(note);
  });

  document.addEventListener('input', function (e) {
    if (e.target.id === 'drawer-search') renderSuggest(e.target.value);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });

  window.addEventListener('hashchange', render);

  hydrateImages(document.getElementById('app'));
  updateBadge();
  render();
})();
