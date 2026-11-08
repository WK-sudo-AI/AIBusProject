# Prawnik AI

Aplikacja do przeglądu umów z pomocą AI. Wkleja się albo wczytuje treść umowy, a Claude wskazuje postanowienia niosące ryzyko prawne, zakreśla je bezpośrednio w tekście i ocenia ich wagę. To jeden plik HTML z natywnym JavaScriptem.

- Wejście: tekst wklejony w okno umowy albo plik `.txt`, `.md`, `.pdf` (z warstwą tekstową) lub `.docx`, także przeciągnięty na okno. PDF odczytuje pdf.js 3.11.174, a DOCX mammoth 1.6.0; obie biblioteki ładują się z cdnjs dopiero przy wczytaniu takiego pliku. Skany PDF bez OCR i stary format `.doc` nie są obsługiwane. Limit: 150 000 znaków.
- Ustawienia analizy: strona, którą reprezentuje użytkownik (np. „Wykonawca”; puste pole oznacza ocenę neutralną) oraz dokładność: szybka, standardowa lub dogłębna.
- Wynik: rodzaj umowy, strony, prawo właściwe, wskaźnik ryzyka 0–100 z oceną ogólną, podsumowanie, lista ryzyk w kolejności występowania w tekście oraz brakujące postanowienia. Każde ryzyko ma dosłowny cytat, wagę (krytyczne, wysokie, średnie, niskie), kategorię, stronę, której dotyczy, wyjaśnienie, podstawę prawną, rekomendację i proponowane brzmienie zapisu.
- Zakreślenia: kolor oznacza wagę, a numer odpowiada pozycji na liście. Kliknięcie zakreślenia otwiera opis ryzyka, kliknięcie cytatu przewija do miejsca w umowie. Ryzyka można filtrować według wagi. Cytaty są wyszukiwane dokładnie, a w razie drobnych różnic (cudzysłowy, odstępy, myślniki) wyrażeniem regularnym.
- Raport: przycisk „Kopiuj raport” kopiuje pełny raport w Markdown; w Claude dostępne jest też pobranie pliku `.md`.
- Na start ładuje się przykładowa umowa o świadczenie usług IT z gotową analizą demo (12 ryzyk), oznaczoną jako przykład. Szkic tekstu i ostatnia analiza zapisują się w pamięci przeglądarki.

Aplikacja nie zastępuje porady radcy prawnego ani adwokata.

## Uruchomienie

Analiza AI działa, gdy strona jest otwarta jako artefakt w Claude (claude.ai lub aplikacja Claude). Korzysta wtedy z funkcji `sample` środowiska artefaktów: przy pierwszej analizie Claude prosi o zgodę, a zapytania zużywają limit konta osoby, która analizuje umowę. Tekst umowy jest wysyłany do Claude.

Otwarta lokalnie (`index.html` w przeglądarce albo przez serwer statyczny) aplikacja pokazuje przykładową analizę, wczytuje pliki i pozwala przeglądać wynik demo, ale przycisk „Analizuj ryzyka” wyświetla komunikat, że analiza AI wymaga Claude:

```bash
python3 -m http.server 8000
```

Następnie otwórz `http://localhost:8000/`. Nie trzeba instalować pakietów ani niczego kompilować. Czcionki Newsreader, Instrument Sans i JetBrains Mono ładują się z Google Fonts; bez internetu strona używa czcionek systemowych.

## Pliki

- `index.html`: cała aplikacja (układ, style, wczytywanie plików, prompt dla AI, zakreślanie cytatów, raport).
