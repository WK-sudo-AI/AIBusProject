(() => {
  'use strict';

  const { calculatePlan, COLORS, readPlan, STORAGE_KEY } = globalThis.ROIModel;
  const byId = id => document.getElementById(id);
  const setText = (id, text) => { byId(id).textContent = text; };
  const currencyFormat = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const percentFormat = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2 });
  const money = value => value === null ? '—' : currencyFormat.format(Object.is(value, -0) ? 0 : value);
  const percent = value => value === null ? '—' : percentFormat.format(value) + '%';

  // Inline SVG geometry: no icon library or external requests.
  const iconPaths = {
    chart: '<path d="M4 20V13M10 20V9M16 20V5M3 9l6-5 5 3 7-6M16 1h5v5"/>',
    dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    leaf: '<path d="M5 19C-1 7 11 7 20 3c2 10-2 19-11 15M4 22l11-11"/>',
    shield: '<path d="M12 3l8 3v6c0 5-4 8-8 10-4-2-8-5-8-10V6zM8 12l3 3 5-6"/>',
    chevron: '<path d="M9 5l7 7-7 7"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9 8a3 3 0 0 1 6 1c0 2-3 2-3 5M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    checks: '<path d="M2 12l4 4 8-9M10 15l3 3 9-10"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    wallet: '<path d="M19 8V5H5a2 2 0 0 0 0 4h16v12H5a2 2 0 0 1-2-2V7M21 12h-6v5h6M17 14.5h.01"/>',
    social: '<path d="M3 9v6l17 5V4zM6 16l2 5h4l-2-4M20 9h2v6h-2"/>',
    web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18"/>',
    radio: '<circle cx="12" cy="12" r="2"/><path d="M8 7a7 7 0 0 0 0 10M16 7a7 7 0 0 1 0 10M5 4a11 11 0 0 0 0 16M19 4a11 11 0 0 1 0 16M12 14v7"/>',
    tv: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 2l4 5 4-5"/>',
    press: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h3M14 11h2M8 15h3M14 15h2M8 18h8"/>',
    plus: '<path d="M12 4v16M4 12h16"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
    up: '<path d="M5 19L19 5M6 5h13v13"/>',
    down: '<path d="M19 5L5 19M5 6v13h13"/>',
  };

  function setIcon(svg, name) {
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.7');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = Object.hasOwn(iconPaths, name) ? iconPaths[name] : iconPaths.social;
  }
  document.querySelectorAll('svg[data-icon]').forEach(svg => setIcon(svg, svg.dataset.icon));

  let loaded;
  try { loaded = readPlan(window.localStorage); }
  catch { loaded = readPlan({ getItem() { throw new Error('Unavailable'); } }); }
  const plan = loaded.plan;
  const rowElements = new Map();
  if (loaded.warning) {
    setText('load-warning-text', loaded.warning);
    byId('load-warning').hidden = false;
  }

  function validateField(input, errorElement, error) {
    input.setAttribute('aria-invalid', String(!!error));
    input.parentElement.classList.toggle('invalid', !!error);
    errorElement.textContent = error || '';
    errorElement.hidden = !error;
    if (error) input.setAttribute('aria-describedby', errorElement.id);
    else input.removeAttribute('aria-describedby');
  }

  function createRow(category) {
    const row = byId('category-template').content.firstElementChild.cloneNode(true);
    const inputs = {};
    const errors = {};
    for (const field of ['name', 'share', 'roi']) {
      inputs[field] = row.querySelector(`[data-field="${field}"]`);
      errors[field] = row.querySelector(`[data-error="${field}"]`);
      inputs[field].id = `${field}-${category.id}`;
      errors[field].id = field === 'name' ? `name-error-${category.id}` : `${field}-${category.id}-error`;
      inputs[field].addEventListener('input', event => {
        category[field] = event.target.value;
        update();
      });
    }
    inputs.name.addEventListener('focus', () => inputs.name.select());
    const deleteButton = row.querySelector('.delete-button');
    deleteButton.addEventListener('click', () => {
      const index = plan.categories.indexOf(category);
      plan.categories.splice(index, 1);
      update();
      const next = plan.categories[Math.min(index, plan.categories.length - 1)];
      if (next) rowElements.get(next.id).inputs.name.focus();
      else byId('add-category').focus();
    });
    row.querySelector('.channel-icon').style.setProperty('--channel-color', category.color);
    setIcon(row.querySelector('.channel-icon svg'), category.icon);
    setIcon(deleteButton.querySelector('svg'), 'trash');
    byId('category-rows').append(row);
    const elements = { row, inputs, errors, deleteButton, amounts: Object.fromEntries(['amount', 'profit', 'gross'].map(key => [key, row.querySelector(`[data-result="${key}"]`)])) };
    rowElements.set(category.id, elements);
    return elements;
  }

  function savePlan() {
    let saved = false;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan)); saved = true; }
    catch { /* The form remains usable when storage is unavailable. */ }
    setText('save-label', saved ? 'Zapisano lokalnie' : 'Zapis niedostępny');
    byId('save-badge').classList.toggle('save-error', !saved);
    byId('save-warning').hidden = saved;
  }

  function renderDistribution(result) {
    let angle = 0;
    const denominator = Math.max(100, result.share ?? 100);
    const gradient = result.rows.filter(row => row.shareInput.value > 0 && !row.shareInput.error).map(row => {
      const start = angle;
      angle += row.shareInput.value / denominator * 360;
      return `${row.color} ${start}deg ${angle}deg`;
    });
    gradient.push(`#edf0ee ${angle}deg 360deg`);
    byId('donut').style.background = result.share === null ? '#edf0ee' : `conic-gradient(${gradient.join(',')})`;
    byId('donut').setAttribute('aria-label', result.share === null ? 'Podział budżetu: popraw udziały w kategoriach' : `Podział budżetu: ${result.rows.map(row => `${row.name} ${percent(row.shareInput.value)}`).join(', ')}`);
    setText('donut-share', percent(result.share));
    const legend = document.createDocumentFragment();
    const items = result.rows.map(row => ({ name: row.name || 'Bez nazwy', color: row.color, share: row.shareInput.value }));
    if (result.share !== null && result.share < 100) items.push({ name: 'Do przydzielenia', color: '#e4e8e5', share: 100 - result.share });
    for (const item of items) {
      const line = document.createElement('div');
      const dot = document.createElement('span');
      dot.className = 'legend-dot';
      dot.style.background = item.color;
      const name = document.createElement('span');
      name.textContent = item.name;
      const share = document.createElement('strong');
      share.textContent = percent(item.share);
      line.append(dot, name, share);
      legend.append(line);
    }
    byId('legend').replaceChildren(legend);
  }

  function update() {
    const result = calculatePlan(plan);
    const activeIds = new Set(plan.categories.map(category => category.id));
    for (const [id, elements] of rowElements) {
      if (!activeIds.has(id)) { elements.row.remove(); rowElements.delete(id); }
    }
    if (byId('annual-budget').value !== plan.budget) byId('annual-budget').value = plan.budget;
    validateField(byId('annual-budget'), byId('annual-budget-error'), result.budget.error);
    for (const row of result.rows) {
      const elements = rowElements.get(row.id) || createRow(plan.categories.find(category => category.id === row.id));
      for (const field of ['name', 'share', 'roi']) {
        if (elements.inputs[field].value !== row[field]) elements.inputs[field].value = row[field];
        const error = field === 'name' ? row.nameError : row[`${field}Input`].error;
        validateField(elements.inputs[field], elements.errors[field], error);
      }
      elements.inputs.name.setAttribute('aria-label', `Nazwa kategorii ${row.name || 'bez nazwy'}`);
      elements.inputs.share.setAttribute('aria-label', `Udział: ${row.name}`);
      elements.inputs.roi.setAttribute('aria-label', `Oczekiwany ROI: ${row.name}`);
      elements.deleteButton.setAttribute('aria-label', `Usuń kategorię ${row.name}`);
      for (const key of ['amount', 'profit', 'gross']) elements.amounts[key].textContent = money(row[key]);
      elements.amounts.profit.className = `numeric row-money ${row.profit < 0 ? 'negative' : row.profit > 0 ? 'positive' : 'muted'}`;
    }
    setText('channel-count', `${plan.categories.length} kanałów`);
    byId('empty-state').hidden = plan.categories.length > 0;

    const allocatedCorrectly = result.share === 100 && !result.budget.error;
    byId('allocation-note').className = `allocation-note ${allocatedCorrectly ? 'success' : 'attention'}`;
    setIcon(byId('allocation-icon'), allocatedCorrectly ? 'check' : 'info');
    setText('allocation-message', result.share === null ? 'Popraw wartości udziałów w kategoriach.' : result.budget.error ? 'Wpisz poprawny roczny budżet.' : result.share < 100 ? `Pozostało ${percent(100 - result.share)} · ${money(result.difference)} do przydzielenia.` : result.share > 100 ? `Przekroczenie o ${percent(result.share - 100)} · ${money(-result.difference)}. Zmniejsz udziały.` : 'Cały budżet ma swoje miejsce. Możesz dalej zmieniać proporcje.');
    setText('allocation-total', `${percent(result.share)} / 100%`);
    setText('total-roi', percent(result.roi));
    byId('roi-highlight').classList.toggle('negative-result', result.roi < 0);
    byId('roi-arrow').toggleAttribute('hidden', result.roi === null);
    if (result.roi !== null) setIcon(byId('roi-arrow'), result.roi < 0 ? 'down' : 'up');
    setText('roi-caption', result.complete ? 'Każda złotówka ma swój cel.' : 'Uzupełnij dane i przydziel 100% budżetu.');
    setText('profit-label', result.complete ? 'Oczekiwany zysk netto' : 'Zysk przydzielonego budżetu');
    setText('gross-label', result.complete ? 'Oczekiwany zwrot brutto' : 'Zwrot przydzielonego budżetu');
    setText('total-profit', money(result.profit));
    byId('total-profit').className = result.profit < 0 ? 'negative' : 'positive';
    setText('total-gross', money(result.gross));
    setText('allocated-budget', money(result.allocated));
    byId('allocation-progress').style.width = `${Math.max(0, Math.min(result.share ?? 0, 100))}%`;
    byId('allocation-progress').style.background = result.share > 100 ? '#b77936' : '';
    setText('share-status', result.share === null ? 'Sprawdź udziały' : result.share < 100 ? 'Budżet do przydzielenia' : result.share > 100 ? 'Przekroczony budżet' : 'Budżet przydzielony');
    setText('share-percent', percent(result.share));
    byId('summary-error').hidden = result.inputsValid;
    setText('summary-error', !plan.categories.length ? 'Dodaj przynajmniej jedną kategorię.' : 'Uzupełnij lub popraw oznaczone pola, aby otrzymać pełną prognozę.');
    renderDistribution(result);
    savePlan();
  }

  byId('annual-budget').addEventListener('input', event => { plan.budget = event.target.value; update(); });
  byId('add-category').addEventListener('click', () => {
    const id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `channel-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0]}`;
    plan.categories.push({ id, name: 'Nowa kategoria', share: '0', roi: '', color: COLORS[plan.categories.length % COLORS.length], icon: 'social' });
    update();
    rowElements.get(id).inputs.name.focus();
  });
  byId('dismiss-warning').addEventListener('click', () => { byId('load-warning').hidden = true; });
  const dialog = byId('help-dialog');
  byId('open-help').addEventListener('click', () => dialog.showModal());
  byId('close-help').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  update();
})();
