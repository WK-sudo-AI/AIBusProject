import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/model.js';
const { calculatePlan, initialPlan, parseNumber, readPlan, STORAGE_KEY } = globalThis.ROIModel;

test('PRD example: weighted ROI 23%, net profit 23,000 PLN, gross 123,000 PLN', () => {
  const result = calculatePlan(initialPlan());
  assert.equal(result.roi, 23);
  assert.equal(result.profit, 23000);
  assert.equal(result.gross, 123000);
  assert.equal(result.complete, true);
});

test('Doubling budget doubles amounts without changing ROI', () => {
  const result = calculatePlan({ ...initialPlan(), budget: '200000' });
  assert.equal(result.roi, 23);
  assert.equal(result.profit, 46000);
  assert.equal(result.gross, 246000);
  assert.equal(result.rows[0].amount, 100000);
});

test('Negative ROI lowers profit and -100% loses the entire channel investment', () => {
  const plan = initialPlan();
  plan.categories[0].roi = '-100';
  const result = calculatePlan(plan);
  assert.equal(result.rows[0].gross, 0);
  assert.equal(result.profit, -42000);
  assert.equal(result.roi, -42);
});

test('90% allocation exposes remaining amount, suppresses final ROI and labels partial gross', () => {
  const plan = initialPlan();
  plan.categories[0].share = '40';
  const result = calculatePlan(plan);
  assert.equal(result.share, 90);
  assert.equal(result.difference, 10000);
  assert.equal(result.roi, null);
  assert.equal(result.profit, 20000);
  assert.equal(result.gross, 110000);
});

test('110% allocation exposes overspend and suppresses final ROI', () => {
  const plan = initialPlan();
  plan.categories[0].share = '60';
  const result = calculatePlan(plan);
  assert.equal(result.share, 110);
  assert.equal(result.difference, -10000);
  assert.equal(result.roi, null);
});

test('Missing ROI is not zero; an explicit zero is valid', () => {
  const plan = initialPlan();
  plan.categories[0].roi = '';
  let result = calculatePlan(plan);
  assert.equal(result.rows[0].profit, null);
  assert.equal(result.profit, null);
  assert.equal(result.roi, null);
  plan.categories[0].roi = '0';
  result = calculatePlan(plan);
  assert.equal(result.roi, 8);
});

test('Zero-share category has zero budget and zero profit, with missing ROI still flagged', () => {
  const plan = initialPlan();
  plan.categories[3].roi = '';
  const result = calculatePlan(plan);
  assert.equal(result.rows[3].amount, 0);
  assert.equal(result.rows[3].profit, 0);
  assert.ok(result.rows[3].roiInput.error);
  assert.equal(result.roi, null);
});

test('Polish decimal input supported; shares total exactly 100% with fractional inputs', () => {
  const plan = initialPlan();
  plan.budget = '100000,25';
  plan.categories = plan.categories.slice(0, 3);
  ['33,33', '33.33', '33,34'].forEach((value, index) => { plan.categories[index].share = value; });
  const result = calculatePlan(plan);
  assert.equal(result.complete, true);
  assert.equal(result.share, 100);
  assert.equal(result.difference, 0);
  assert.ok(Math.abs(result.profit - 19999.0499975) < 1e-7);
});

test('Invalid numeric boundaries and extra decimal places are rejected', () => {
  for (const [value, kind] of [['0', 'budget'], ['-1', 'budget'], ['100,01', 'share'], ['-0,01', 'share'], ['-100,01', 'roi'], ['1,234', 'roi'], ['', 'roi'], ['NaN', 'roi'], ['Infinity', 'roi'], ['1e3', 'budget']]) {
    assert.ok(parseNumber(value, kind).error, `${value} (${kind}) should be invalid`);
  }
  for (const [value, kind] of [['100', 'share'], ['0', 'share'], ['-100', 'roi'], ['0', 'roi'], ['500', 'roi'], ['0,01', 'budget']]) {
    assert.equal(parseNumber(value, kind).error, null);
  }
});

test('Invalid shares or budget do not produce misleading amounts or totals', () => {
  const plan = initialPlan();
  plan.categories[0].share = '150';
  let result = calculatePlan(plan);
  assert.equal(result.share, null);
  assert.equal(result.rows[0].amount, null);
  assert.equal(result.roi, null);
  plan.budget = '0';
  result = calculatePlan(plan);
  assert.ok(result.rows.every(row => row.amount === null));
});

test('Renaming, adding and removing categories are reflected in calculation', () => {
  const plan = initialPlan();
  plan.categories[0].name = 'Nowy kanał';
  plan.categories.push({ id: 'custom', name: 'Podcast', share: '10', roi: '40', color: '#82b8c5' });
  assert.equal(calculatePlan(plan).share, 110);
  assert.equal(calculatePlan(plan).rows[0].name, 'Nowy kanał');
  plan.categories.pop();
  assert.equal(calculatePlan(plan).roi, 23);
  plan.categories[0].name = ' ';
  assert.equal(calculatePlan(plan).complete, false);
  assert.equal(calculatePlan({ ...plan, categories: [] }).roi, null);
});

test('Saved plans restored; corrupt, incompatible or inaccessible storage falls back safely', () => {
  const plan = initialPlan();
  plan.budget = '54321,50';
  const storage = { getItem: key => key === STORAGE_KEY ? JSON.stringify(plan) : null };
  assert.deepEqual(readPlan(storage).plan, plan);
  assert.equal(readPlan(storage).warning, null);
  for (const raw of ['invalid JSON', JSON.stringify({ version: 2 }), JSON.stringify({ ...plan, categories: [plan.categories[0], plan.categories[0]] })]) {
    assert.ok(readPlan({ getItem: () => raw }).warning);
  }
  assert.ok(readPlan({ getItem() { throw new Error('blocked'); } }).warning);
});
