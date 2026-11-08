# Generator Postów

Aplikacja, która z wklejonego tekstu (artykułu, notatki, ogłoszenia) tworzy gotowe posty na media społecznościowe z pomocą Google Gemini. To jeden plik HTML z natywnym JavaScriptem.

- Klucz API: użytkownik podaje własny klucz Google Gemini API (z [Google AI Studio](https://aistudio.google.com/apikey)). Przycisk „Sprawdź” testuje klucz. Klucz można opcjonalnie zapamiętać w pamięci przeglądarki; trafia wyłącznie do API Google, bezpośrednio z przeglądarki.
- Platformy: LinkedIn, Facebook, Instagram, X, Threads, TikTok, YouTube Shorts. Każda ma własne wytyczne (długość, struktura, liczba hashtagów); dla TikToka powstaje scenariusz wideo, dla Instagrama koncepcja grafiki lub karuzeli.
- Ustawienia: ton, język (polski, angielski, niemiecki, hiszpański), grupa docelowa, wezwanie do działania, emoji, hashtagi, model i kreatywność (temperature).
- Wynik: karta dla każdej platformy z tekstem, hashtagami, wskazówką publikacyjną i licznikiem znaków względem limitu platformy. Tekst można poprawić bezpośrednio w karcie, skopiować albo wygenerować ponownie tylko dla jednej platformy. „Kopiuj wszystko” kopiuje komplet postów.
- Model zwraca ustrukturyzowany JSON (`responseSchema`), więc posty zawsze trafiają do właściwych kart. Domyślny model to `gemini-2.5-flash`; w polu „Model” można wpisać inny.

## Uruchomienie

Otwórz `index.html` w przeglądarce albo uruchom serwer statyczny:

```bash
python3 -m http.server 8000
```

Następnie otwórz `http://localhost:8000/`. Nie trzeba instalować pakietów ani niczego kompilować. Działa też na GitHub Pages. Strona nie zadziała jako artefakt w Claude, bo artefakty blokują połączenia z zewnętrznymi API.

Czcionki Bricolage Grotesque, Public Sans i JetBrains Mono ładują się z Google Fonts; bez internetu strona używa czcionek systemowych.

## Pliki

- `index.html`: cała aplikacja (układ, style, prompt i schemat odpowiedzi, wywołania Gemini API, karty wyników).
