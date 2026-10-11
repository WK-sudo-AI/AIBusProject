import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const base = 'http://127.0.0.1:4173';
const server = spawn(process.execPath, ['scripts/serve.mjs', '4173'], { stdio: 'pipe' });
let serverOutput = '';
server.stdout.on('data', chunk => { serverOutput += chunk; });
server.stderr.on('data', chunk => { serverOutput += chunk; });
let browser;
try {
  for (let attempt = 0; attempt < 50; attempt++) {
    if (server.exitCode !== null) throw new Error(`Preview failed: ${serverOutput}`);
    try { if ((await fetch(base)).ok) break; } catch {}
    if (attempt === 49) throw new Error(`Preview timed out: ${serverOutput}`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1060 }, locale: 'pl-PL' });
  const page = await context.newPage();
  const errors = [];
  const externalRequests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!request.url().startsWith(base)) externalRequests.push(request.url()); });
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: true });

  const text = async testId => (await page.getByTestId(testId).innerText()).replace(/[\s\u00a0]/g, '');
  assert.equal(await text('total-roi'), '23%');
  assert.equal(await text('total-profit'), '23000,00zł');
  assert.equal(await text('total-gross'), '123000,00zł');
  await page.getByLabel('Roczny budżet w PLN').fill('200000');
  assert.equal(await text('total-roi'), '23%');
  assert.equal(await text('total-profit'), '46000,00zł');
  await page.getByLabel('Roczny budżet w PLN').fill('100000');

  await page.getByLabel('Udział: Social media', { exact: true }).fill('40');
  assert.equal(await text('total-roi'), '—');
  assert.match(await page.locator('.allocation-note').innerText(), /Pozostało 10%/);
  assert.match((await page.locator('.allocation-note').innerText()).replace(/\s/g, ''), /10000,00/);
  await page.getByLabel('Udział: Social media', { exact: true }).fill('60');
  assert.match(await page.locator('.allocation-note').innerText(), /Przekroczenie o 10%/);
  assert.equal(await text('total-roi'), '—');
  await page.getByLabel('Udział: Social media', { exact: true }).fill('50');
  await page.getByLabel('Oczekiwany ROI: Social media', { exact: true }).fill('-100');
  assert.equal(await text('total-roi'), '-42%');
  await page.getByLabel('Oczekiwany ROI: Social media', { exact: true }).fill('');
  assert.equal(await text('total-roi'), '—');
  assert.equal(await page.getByLabel('Oczekiwany ROI: Social media', { exact: true }).getAttribute('aria-invalid'), 'true');
  await page.getByLabel('Oczekiwany ROI: Social media', { exact: true }).fill('-101');
  assert.match(await page.locator('#roi-social-error').innerText(), /−100%/);
  await page.getByLabel('Oczekiwany ROI: Social media', { exact: true }).fill('30');
  await page.getByLabel('Roczny budżet w PLN').fill('100000,25');
  assert.equal(await text('total-profit'), '23000,06zł');
  await page.getByLabel('Roczny budżet w PLN').fill('0');
  assert.equal(await text('total-roi'), '—');
  assert.match(await page.locator('#annual-budget-error').innerText(), /większy od zera/);
  await page.getByLabel('Roczny budżet w PLN').fill('100000');

  await page.getByRole('button', { name: 'Dodaj kategorię', exact: true }).click();
  assert.equal(await page.evaluate(() => document.activeElement.value), 'Nowa kategoria');
  assert.equal(await text('total-roi'), '—');
  const newName = page.locator('tbody tr').last().locator('[data-field="name"]');
  await newName.fill('');
  await newName.pressSequentially('Podcast');
  assert.equal(await newName.inputValue(), 'Podcast');
  assert.equal(await newName.evaluate(input => input === document.activeElement), true, 'Typing must retain focus across updates');
  await page.getByLabel('Oczekiwany ROI: Podcast', { exact: true }).fill('0');
  assert.equal(await text('total-roi'), '23%');
  await page.reload();
  assert.equal(await page.getByLabel('Nazwa kategorii Podcast', { exact: true }).inputValue(), 'Podcast');
  assert.equal(await page.getByLabel('Oczekiwany ROI: Podcast', { exact: true }).inputValue(), '0');
  assert.equal(await text('total-roi'), '23%');
  await page.getByRole('button', { name: 'Usuń kategorię Podcast', exact: true }).click();
  assert.equal(await page.locator('tbody tr').count(), 5);
  await page.getByRole('button', { name: 'Jak to działa?' }).click();
  assert.equal(await page.getByRole('dialog').isVisible(), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').isVisible(), false);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'No page overflow on mobile');
  assert.equal(await page.getByRole('button', { name: 'Dodaj kategorię', exact: true }).isVisible(), true);
  await page.getByLabel('Roczny budżet w PLN').fill('200000');
  assert.equal(await text('total-profit'), '46000,00zł');
  await page.reload();
  assert.equal(await page.getByLabel('Roczny budżet w PLN').inputValue(), '200000');
  assert.equal(await text('total-roi'), '23%');

  for (const name of ['Social media', 'WWW', 'Radio', 'Telewizja', 'Prasa']) {
    await page.getByRole('button', { name: `Usuń kategorię ${name}`, exact: true }).click();
  }
  assert.equal(await page.locator('.empty-state').isVisible(), true);
  assert.equal(await text('total-roi'), '—');
  await page.getByRole('button', { name: 'Dodaj kategorię', exact: true }).click();
  assert.equal(await page.locator('tbody tr').count(), 1);

  const blocked = await browser.newContext();
  await blocked.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('Storage blocked'); }; });
  const blockedPage = await blocked.newPage();
  await blockedPage.goto(base);
  await blockedPage.getByText('Zapis niedostępny', { exact: true }).waitFor();
  assert.match(await blockedPage.getByRole('alert').innerText(), /Przeglądarka blokuje zapis/);
  await blocked.close();

  // Classic scripts must also work by opening index.html without an HTTP server.
  const localPage = await browser.newPage();
  const localErrors = [];
  localPage.on('pageerror', error => localErrors.push(error.message));
  let directFileOutcome = 'passed';
  try {
    await localPage.goto(pathToFileURL(resolve('index.html')).href);
    assert.equal(await localPage.locator('#total-roi').innerText(), '23%');
    await localPage.getByLabel('Roczny budżet w PLN').fill('200000');
    assert.equal((await localPage.getByTestId('total-profit').innerText()).replace(/\s/g, ''), '46000,00zł');
    await localPage.getByRole('button', { name: 'Dodaj kategorię', exact: true }).click();
    assert.equal(await localPage.locator('tbody tr').count(), 6);
    assert.deepEqual(localErrors, [], 'No errors when opened directly from disk');
  } catch (error) {
    if (!error.message.includes('ERR_BLOCKED_BY_ADMINISTRATOR')) throw error;
    directFileOutcome = 'SKIPPED: browser administrator policy blocks file:// navigation';
  } finally { await localPage.close(); }

  assert.deepEqual(errors, [], 'No browser runtime errors');
  assert.deepEqual(externalRequests, [], 'Application should make no external requests');
  console.log('Browser checks passed over HTTP: acceptance scenarios, validation, editing, persistence, keyboard dialog, mobile layout, blocked storage and no external requests.');
  console.log(`Direct file opening: ${directFileOutcome}`);
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
