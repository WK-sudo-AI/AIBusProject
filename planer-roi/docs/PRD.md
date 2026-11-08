# PRD — Planer budżetu marketingowego i ROI

**Wersja:** 1.0

**Zakres:** MVP aplikacji webowej

## 1. Cel produktu

Aplikacja pozwala zaplanować roczny budżet marketingowy, podzielić go między kanały i obliczyć oczekiwany ROI całego planu.

Użytkownik podaje roczny budżet oraz udział procentowy i oczekiwany ROI każdej kategorii, np. social media, WWW, radio, telewizja czy prasa. Wyniki aktualizują się automatycznie po zmianie danych.

## 2. Użytkownicy i potrzeby

Produkt jest przeznaczony dla właścicieli firm, marketerów i osób odpowiedzialnych za planowanie wydatków marketingowych.

Główna potrzeba: „Chcę sprawdzić, jaki wynik finansowy może przynieść mój plan i jak zmieni się on po przesunięciu budżetu między kanałami”.

## 3. Definicja ROI

W aplikacji ROI oznacza **zysk netto z inwestycji podzielony przez koszt inwestycji**, wyrażony procentowo:

**ROI = (zwrot brutto − koszt inwestycji) / koszt inwestycji × 100%**

Przykład: inwestycja 10 000 zł przy ROI 20% oznacza oczekiwany zysk 2 000 zł i zwrot brutto 12 000 zł.

Przy polu ROI należy wyświetlić krótkie wyjaśnienie tej definicji, aby użytkownik nie pomylił ROI z przychodem lub ROAS.

## 4. Główny przebieg użytkownika

1. Użytkownik wpisuje roczny budżet w PLN.
2. Dodaje lub wybiera kategorie marketingowe.
3. Dla każdej kategorii podaje:
   - procent rocznego budżetu;
   - oczekiwany ROI w procentach.
4. Aplikacja wylicza kwotę budżetu i oczekiwany zysk każdej kategorii.
5. Po rozdzieleniu 100% budżetu użytkownik widzi oczekiwany wynik całego planu.
6. Użytkownik zmienia udziały lub ROI i od razu obserwuje wpływ na wynik.

## 5. Wymagania funkcjonalne

| Obszar | Wymaganie |
|---|---|
| Budżet | Użytkownik może podać i zmienić roczny budżet w PLN. |
| Kategorie | Dostępne są przykładowe kategorie: social media, WWW, radio, telewizja i prasa. |
| Edycja kategorii | Użytkownik może dodawać, usuwać i zmieniać nazwy kategorii. |
| Udział w budżecie | Każda kategoria ma edytowalny udział procentowy od 0% do 100%. |
| Oczekiwany ROI | Każda kategoria ma edytowalny ROI, również ujemny lub równy 0%. |
| Wyniki kategorii | Aplikacja pokazuje przydzielony budżet, oczekiwany zysk netto i zwrot brutto. |
| Podsumowanie | Aplikacja pokazuje sumę udziałów, oczekiwany zysk netto, zwrot brutto i ROI całego planu. |
| Przeliczanie | Wyniki aktualizują się automatycznie, bez przycisku „Oblicz”. |
| Zachowanie planu | Ostatni plan jest zapisywany lokalnie w przeglądarce i przywracany po odświeżeniu. |

## 6. Logika obliczeń

Dla kategorii `i`:

- **Budżet kategorii** = roczny budżet × udział kategorii / 100
- **Oczekiwany zysk netto** = budżet kategorii × ROI kategorii / 100
- **Oczekiwany zwrot brutto** = budżet kategorii + oczekiwany zysk netto

Dla kompletnego planu, w którym suma udziałów wynosi 100%:

- **Łączny zysk netto** = suma zysków wszystkich kategorii
- **Łączny zwrot brutto** = roczny budżet + łączny zysk netto
- **Łączny ROI** = łączny zysk netto / roczny budżet × 100%

Łączny ROI jest średnią ważoną ROI kategorii według ich udziałów w budżecie. Nie jest sumą ani zwykłą średnią wartości ROI.

### Przykład

Roczny budżet: **100 000 zł**

| Kategoria | Udział | Budżet | Oczekiwany ROI | Oczekiwany zysk |
|---|---:|---:|---:|---:|
| Social media | 50% | 50 000 zł | 30% | 15 000 zł |
| WWW | 30% | 30 000 zł | 20% | 6 000 zł |
| Radio | 20% | 20 000 zł | 10% | 2 000 zł |
| **Razem** | **100%** | **100 000 zł** | **23%** | **23 000 zł** |

**Oczekiwany zwrot brutto: 123 000 zł.**

## 7. Walidacja i sytuacje brzegowe

- Roczny budżet musi być większy od zera.
- Pola liczbowe obsługują maksymalnie dwa miejsca po przecinku oraz polski separator dziesiętny.
- Udział kategorii musi mieścić się w zakresie 0–100%.
- ROI może wynosić od −100% wzwyż. ROI −100% oznacza utratę całej inwestycji w danej kategorii.
- Brak wartości ROI nie jest traktowany jako 0%. Użytkownik otrzymuje informację o brakujących danych.
- Gdy suma udziałów jest mniejsza niż 100%, aplikacja pokazuje pozostały procent i kwotę do przydzielenia.
- Gdy suma przekracza 100%, aplikacja pokazuje przekroczenie procentowe i kwotowe.
- Przy sumie innej niż 100% wyniki kategorii pozostają widoczne, ale końcowy ROI całego planu nie jest prezentowany.
- Kategoria z udziałem 0% ma budżet i zysk równe zero.
- Obliczenia korzystają z pełnej precyzji; zaokrąglenie do dwóch miejsc następuje przy wyświetlaniu.

## 8. Interfejs

Główny widok zawiera trzy sekcje:

1. **Roczny budżet** — pole kwoty w PLN.
2. **Podział budżetu** — tabela kategorii z edytowalną nazwą, udziałem i ROI oraz wyliczonym budżetem i zyskiem.
3. **Podsumowanie planu** — suma udziałów, łączny ROI, zysk netto i zwrot brutto.

Pod tabelą znajduje się przycisk „Dodaj kategorię”. Każdy wiersz można usunąć.

Podsumowanie zawiera opis: „Prognoza na podstawie podanych wartości ROI”. Wykres podziału budżetu może uzupełniać tabelę, ale nie jest wymagany w MVP.

## 9. Wymagania niefunkcjonalne

- Aplikacja działa na komputerach i telefonach.
- Formularz można obsłużyć klawiaturą; pola mają czytelne etykiety.
- Błędy są wyjaśniane tekstowo, a nie wyłącznie kolorem.
- Wyniki aktualizują się w ciągu 200 ms po zmianie poprawnych danych.
- MVP nie wymaga konta użytkownika ani serwera do wykonywania obliczeń.

## 10. Poza zakresem MVP

- Integracje z platformami reklamowymi.
- Automatyczne prognozowanie ROI na podstawie danych rynkowych.
- Raportowanie rzeczywistych wyników kampanii.
- Optymalizacja podziału budżetu.
- Planowanie miesięczne, wiele walut i współpraca zespołowa.
- Porównywanie oraz eksport wielu scenariuszy.

## 11. Kryteria akceptacji

1. Dla przykładu z sekcji 6 aplikacja pokazuje ROI 23%, zysk 23 000 zł i zwrot brutto 123 000 zł.
2. Zmiana budżetu ze 100 000 zł na 200 000 zł podwaja kwoty, a łączny ROI pozostaje równy 23%.
3. Ujemny ROI kategorii obniża łączny oczekiwany zysk.
4. Suma udziałów 90% wyświetla informację o brakujących 10% i odpowiadającej im kwocie.
5. Suma udziałów 110% wyświetla informację o przekroczeniu o 10%.
6. Końcowy ROI planu pojawia się dopiero po przydzieleniu 100% budżetu i uzupełnieniu wymaganych danych.
7. Dodanie, usunięcie i edycja kategorii aktualizują wyniki automatycznie.
8. Odświeżenie strony przywraca ostatni zapisany lokalnie plan.

## 12. Założenia modelu

ROI każdej kategorii dotyczy tego samego rocznego okresu i uwzględnia wszystkie koszty przypisane do tej kategorii. Model zakłada, że wyniki kategorii można sumować bez podwójnego przypisywania tego samego zysku do kilku kanałów.
