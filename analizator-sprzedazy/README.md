# Analizator sprzedaży

Aplikacja analizuje arkusz sprzedaży w układzie *Financial Sample* (Segment, Country, Product, Discount Band, Units Sold, Manufacturing Price, Sale Price, Gross Sales, Discounts, Sales, COGS, Profit, Date, Month Number, Month Name, Year). To jeden plik HTML z natywnym JavaScriptem, bez bibliotek. Czcionki leżą w `assets/fonts/` obok pliku.

- Wejście: plik `.xlsx`, rozpakowywany w przeglądarce przez `DecompressionStream` i `DOMParser`; plik `.csv`/`.tsv` (separator tabulator, średnik lub przecinek) albo zakres wklejony z Excela. Stary format `.xls` nie jest obsługiwany.
- Nagłówki są rozpoznawane mimo dodatkowych spacji. Liczby obsługują zapis polski i amerykański (`5,8`, `$4,30`, `1 618,5`, `$1,618.50`, `($7 500,00)`, `$-`). Daty obsługują formaty `dd.mm.rrrr`, `rrrr-mm-dd` oraz numer seryjny Excela.
- Analiza: filtry (segment, kraj, produkt, przedział rabatu, rok), KPI, trend miesięczny sprzedaży i zysku, rozbicia według segmentu, kraju i produktu, wpływ rabatów na marżę, automatyczne obserwacje oraz tabela przestawna kopiowana do Excela.
- Raport PDF: przycisk „Pobierz raport PDF” tworzy raport A4 (KPI, trend, obserwacje, rozbicia, tabela przestawna, jakość danych) z uwzględnieniem bieżących filtrów. Strony są rysowane na canvasie i składane w plik PDF natywnym kodem, bez bibliotek; tekst w PDF jest obrazem, więc nie da się go zaznaczać.
- Jakość danych: kontrola formuł `Gross Sales = Units × Sale Price`, `Sales = Gross − Discounts`, `Profit = Sales − COGS` (tolerancja 0,5%), a także nieczytelnych liczb i dat oraz zgodności Month Number i Year z kolumną Date.

## Uruchomienie

Otwórz `index.html` w przeglądarce, zachowując obok niego katalog `assets/`. Działa też przez dowolny serwer statyczny, np. z katalogu `analizator-sprzedazy/`:

```bash
python3 -m http.server 8000
```

Następnie otwórz `http://localhost:8000/`. Analizator nie wymaga instalacji pakietów ani etapu kompilacji.

## Pliki

- `index.html`: cała aplikacja (układ, style, odczyt plików, analiza, raport PDF).
- `assets/fonts/`: czcionki DM Sans i Manrope z licencjami.
