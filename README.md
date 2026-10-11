# Planer ROI

MVP planera budżetu marketingowego zgodnie z [PRD](docs/PRD.md). Aplikacja używa wyłącznie natywnego **HTML i JavaScript**. Style są osadzone w HTML, ikony to SVG, czcionki są lokalne. Nie ma Reacta, Vite, bibliotek aplikacyjnych ani etapu kompilacji. Obliczenia i zapis w `localStorage` wykonuje przeglądarka.

## Uruchomienie

Otwórz `index.html` w przeglądarce, zachowując obok niego katalogi `src/` i `assets/`. Kod używa zwykłych skryptów, bez modułów ES i pobierania danych przez `fetch`. Obsługa zapisu dla adresów `file://` zależy od przeglądarki. Przeglądarka zarządzana w tym środowisku blokuje nawigację `file://`; tutaj zweryfikowano uruchomienie przez serwer statyczny.

Opcjonalny serwer wykorzystuje wyłącznie bibliotekę standardową Node.js — nie trzeba instalować zależności:

```bash
cd /workspace/AIBusProject
node scripts/serve.mjs 5173
```

Alternatywnie: `npm run dev` (również bez wcześniejszego `npm install`). Port można zmienić, np. `npm run dev -- 8080`.

Do hostowania wystarczą `index.html`, `src/app.js`, `src/model.js` i `assets/fonts/`. Pliki `package.json`, testy i skrypt serwera nie są potrzebne w przeglądarce.

## Weryfikacja

Testy logiki używają wbudowanego runnera Node.js, bez instalacji pakietów:

```bash
node --test tests/model.test.mjs
```

Testy w przeglądarce wymagają Node.js 20+, pakietu Playwright (jedyna zależność developerska) oraz Chromium:

```bash
npm ci --cache /workspace/.npm-cache
npm run test:browser
```

Poza środowiskiem chmurowym można pominąć `--cache`. Test sam uruchamia i zatrzymuje serwer statyczny na porcie 4173. Chromium jest domyślnie odczytywane z `/usr/bin/chromium`; dla innej lokalizacji ustaw `CHROMIUM_PATH`. Test sprawdza scenariusze akceptacyjne, walidację, edycję, zapis i przywracanie planu, dialog obsługiwany klawiaturą, układ mobilny i brak żądań do zewnętrznych usług. Zrzuty zapisuje w ignorowanym katalogu `test-results/`. Dodatkowy test bezpośredniego otwarcia pliku raportuje pominięcie wyłącznie wtedy, gdy blokuje go polityka administratora przeglądarki; inne błędy powodują niepowodzenie.

Każde zadanie chmurowe ma już izolowane środowisko. Używaj istniejącego checkoutu; nie twórz dodatkowego Git worktree bez wyraźnej prośby użytkownika.

## Pliki aplikacji

- `index.html`: układ, style oraz szablon wiersza kategorii.
- `src/app.js`: zdarzenia formularza, aktualizacja DOM, wykres, dialog i zapis planu.
- `src/model.js`: walidacja, obliczenia i odczyt zapisu.
- `assets/fonts/`: czcionki i ich licencje.

## Model obliczeń

- Budżet kategorii = roczny budżet × udział / 100.
- Zysk netto = budżet kategorii × ROI / 100.
- Zwrot brutto = budżet kategorii + zysk netto.
- Końcowy ROI = suma zysków / roczny budżet × 100; pojawia się po przydzieleniu dokładnie 100% i uzupełnieniu wszystkich pól.

Przy niepełnym lub przekroczonym podziale kwoty podsumowania dotyczą **przydzielonego budżetu**, a końcowy ROI jest ukryty. Brak ROI nie oznacza 0%. Udziały sumowane są w setnych częściach punktu procentowego, aby uniknąć fałszywych ostrzeżeń wynikających z arytmetyki zmiennoprzecinkowej. Kwoty obliczane są bez pośredniego zaokrąglania; formatowanie następuje przy wyświetlaniu.

Plan przykładowy: 100 000 zł, social media 50% przy ROI 30%, WWW 30% przy ROI 20%, radio 20% przy ROI 10%. Wynik: **ROI 23%, zysk 23 000 zł, zwrot brutto 123 000 zł**. Telewizja i prasa mają początkowo udział 0%.

## Zapis lokalny

Plan jest zapisywany pod kluczem `marketing-roi-plan:v1`, również podczas edycji niepoprawnych lub pustych pól. Odświeżenie przywraca wartości. Inna przeglądarka, inny adres witryny lub wyczyszczenie danych witryny nie zachowują tego zapisu. Przy niedostępnym magazynie aplikacja nadal działa i wyświetla informację o braku zapisu. Uszkodzony lub niezgodny zapis zastępowany jest planem przykładowym z widocznym komunikatem.

Format i klucz zapisu pozostały zgodne z wcześniejszą wersją React. Plan będzie przywrócony, jeśli aplikacja jest otwierana w tej samej przeglądarce i pod tym samym adresem.
