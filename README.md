# AIBusProject

Projekty ze studiów podyplomowych Biznes.AI (Akademia Leona Koźmińskiego). Każda aplikacja leży w osobnym katalogu, ma własny `README.md` i własne zasoby, więc można ją uruchomić, skopiować albo usunąć niezależnie od pozostałych.

| Aplikacja | Katalog | Opis |
|---|---|---|
| Planer ROI | [`planer-roi/`](planer-roi/) | Planer budżetu marketingowego: podział budżetu na kanały, ROI, zwrot brutto, zapis planu w przeglądarce. |
| Analizator sprzedaży | [`analizator-sprzedazy/`](analizator-sprzedazy/) | Analiza arkusza sprzedaży z pliku .xlsx, CSV lub wklejki: KPI, trendy, rabaty, tabela przestawna, kontrola formuł i raport PDF. |

## Zasady porządku

- Nowa aplikacja to nowy katalog w głównym folderze repozytorium, nazwany po polsku małymi literami z myślnikami, np. `kalkulator-marzy/`.
- Wszystko, czego aplikacja potrzebuje (HTML, skrypty, czcionki, dokumentacja, testy, `package.json`), leży w jej katalogu. Aplikacje nie odwołują się do plików innych aplikacji.
- W głównym folderze zostają tylko ten spis, `.gitignore` i katalogi aplikacji.
- Po dodaniu aplikacji dopisz wiersz do tabeli powyżej.
