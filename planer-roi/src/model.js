(() => {
  'use strict';

  const STORAGE_KEY = 'marketing-roi-plan:v1';
  const COLORS = ['#427c67', '#90b99e', '#c5d9a5', '#e5bd7d', '#a7acc3', '#82b8c5', '#b59ac2', '#d79888'];

  function initialPlan() {
    return {
      version: 1,
      budget: '100000',
      categories: [
        { id: 'social', name: 'Social media', share: '50', roi: '30', color: COLORS[0], icon: 'social' },
        { id: 'web', name: 'WWW', share: '30', roi: '20', color: COLORS[1], icon: 'web' },
        { id: 'radio', name: 'Radio', share: '20', roi: '10', color: COLORS[2], icon: 'radio' },
        { id: 'tv', name: 'Telewizja', share: '0', roi: '0', color: COLORS[3], icon: 'tv' },
        { id: 'press', name: 'Prasa', share: '0', roi: '0', color: COLORS[4], icon: 'press' },
      ],
    };
  }

  function parseNumber(raw, kind) {
    const value = raw.trim();
    if (!value) return { value: null, error: 'Uzupełnij wartość.' };
    if (!/^-?\d+(?:[.,]\d{1,2})?$/.test(value)) {
      return { value: null, error: 'Wpisz liczbę z maks. 2 miejscami po przecinku.' };
    }
    const number = Number(value.replace(',', '.'));
    if (!Number.isFinite(number) || Math.abs(number) > Number.MAX_SAFE_INTEGER / 100) {
      return { value: null, error: 'Wpisz mniejszą wartość.' };
    }
    if (kind === 'budget' && number <= 0) return { value: null, error: 'Budżet musi być większy od zera.' };
    if (kind === 'share' && (number < 0 || number > 100)) return { value: null, error: 'Udział musi wynosić od 0 do 100%.' };
    if (kind === 'roi' && number < -100) return { value: null, error: 'ROI nie może być niższy niż −100%.' };
    return { value: number, error: null };
  }

  function calculatePlan(plan) {
    const budget = parseNumber(plan.budget, 'budget');
    const rows = plan.categories.map(category => {
      const share = parseNumber(category.share, 'share');
      const roi = parseNumber(category.roi, 'roi');
      const nameError = category.name.trim() ? null : 'Wpisz nazwę kategorii.';
      const amount = budget.error || share.error ? null : budget.value * share.value / 100;
      const profit = amount === 0 ? 0 : amount === null || roi.error ? null : amount * roi.value / 100;
      return { ...category, shareInput: share, roiInput: roi, nameError, amount, profit, gross: profit === null ? null : amount + profit };
    });
    const sharesValid = rows.every(row => !row.shareInput.error);
    // Sum in hundredths of a percentage point to avoid false 99.999999% warnings.
    const shareUnits = sharesValid ? rows.reduce((sum, row) => sum + Math.round(row.shareInput.value * 100), 0) : null;
    const share = shareUnits === null ? null : shareUnits / 100;
    const inputsValid = !budget.error && rows.length > 0 && rows.every(row => !row.shareInput.error && !row.roiInput.error && !row.nameError);
    const complete = inputsValid && shareUnits === 10000;
    const allocated = budget.error || share === null ? null : budget.value * share / 100;
    const profit = inputsValid ? rows.reduce((sum, row) => sum + row.profit, 0) : null;
    return { budget, rows, share, allocated, inputsValid, complete, profit, gross: profit === null ? null : allocated + profit, roi: complete ? profit / budget.value * 100 : null, difference: budget.error || share === null ? null : budget.value * (10000 - shareUnits) / 10000 };
  }

  function isSavedPlan(value) {
    return value?.version === 1 && typeof value.budget === 'string' && Array.isArray(value.categories)
      && value.categories.length <= 1000
      && new Set(value.categories.map(row => row?.id)).size === value.categories.length
      && value.categories.every(row => row && ['id', 'name', 'share', 'roi'].every(key => typeof row[key] === 'string')
        && typeof row.color === 'string' && /^#[0-9a-f]{6}$/i.test(row.color));
  }

  function readPlan(storage) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return { plan: initialPlan(), warning: null };
      const saved = JSON.parse(raw);
      if (!isSavedPlan(saved)) throw new Error('Invalid plan');
      return { plan: saved, warning: null };
    } catch {
      return { plan: initialPlan(), warning: 'Nie udało się odczytać zapisanego planu. Wyświetlamy plan przykładowy.' };
    }
  }

  globalThis.ROIModel = Object.freeze({ STORAGE_KEY, COLORS, initialPlan, parseNumber, calculatePlan, isSavedPlan, readPlan });
})();
