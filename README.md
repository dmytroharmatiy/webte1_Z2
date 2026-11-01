# Obedové menu v okolí fakulty (Zadanie 2)

- **Meno a priezvisko:** Dmytro Harmatii
- **Krúžok:** 3. ročník FEI B-API-MSUS den
- **Predmet:** WEBTE1
- **Odkaz na školský server:** [webte1.fei.stuba.sk/~xharmatii](https://webte1.fei.stuba.sk/~xharmatii/)

## Popis webu

Webová aplikácia zobrazuje obedové menu reštaurácií FiitFood (FIIT STU), Eat & Meet a DRAG v okolí fakulty FEI STU. Používateľ si môže vybrať deň v týždni, zobraziť celý týždeň alebo porovnávať ponuku vybraných reštaurácií. Rozhranie je responzívne a prispôsobuje sa veľkosti obrazovky.

## Načítavanie a spracovanie údajov

Aplikácia pracuje výlučne na strane klienta pomocou HTML, CSS a JavaScriptu. Podľa spresnenia zadania sa načítavajú iba lokálne HTML kópie stránok uložené v priečinku `data/`. Proxy ani prepínač medzi živými a lokálnymi údajmi sa nepoužívajú.

Súbory sa načítavajú asynchrónne pomocou Fetch API. HTML sa spracováva cez DOMParser a DOM selektory. Každá reštaurácia má vlastnú funkciu na spracovanie údajov, ktorá vracia dáta v jednotnej štruktúre. Do stránky sa vkladajú iba vybrané textové údaje, nie pôvodný HTML kód reštaurácií.

Spracované menu a čas načítania sa ukladajú do localStorage. Ak sú uložené údaje z aktuálneho dňa, aplikácia ich použije bez opätovného načítania súborov. Tlačidlo „Aktualizovať menu“ znovu načíta lokálne kópie a tlačidlo „Vymazať údaje“ odstráni uložené menu. Chyba jedného zdroja nebráni zobrazeniu ostatných reštaurácií.

Dátumy a ponuka jedál zodpovedajú uloženým HTML kópiám. Aktualizácia v aplikácii nesťahuje nové menu z internetu; na zmenu ponuky je potrebné aktualizovať súbory v priečinku `data/`.

## Spustenie

Projekt otvorte cez lokálny webový server, napríklad pomocou rozšírenia Live Server vo VS Code, alebo ho nahrajte na školský server. Pri otvorení `index.html` priamo cez `file://` nemusí Fetch API umožniť načítanie lokálnych HTML súborov.

Bootstrap a Day.js sa načítavajú z CDN, preto je na ich načítanie potrebné internetové pripojenie. Font Roboto je priložený lokálne.

## Zoznam zdrojov

### Zdroje obedového menu

- **FiitFood (FIIT STU):** [FreeFood – menu](http://www.freefood.sk/menu/#fiit-food), lokálna kópia `data/freefood.html`; spracováva sa iba sekcia `#fiit-food`.
- **Eat & Meet:** [Týždenné menu](https://eatandmeet.sk/tyzdenne-menu), lokálna kópia `data/eatandmeet.html`.
- **Reštaurácia DRAG:** [Denné menu](https://www.restauracia-drag.sk/denne-menu), lokálna kópia `data/drag.html`.

### Knižnice a font

- **CSS knižnica:** [Bootstrap 5.3.8](https://getbootstrap.com/) — [MIT License](https://github.com/twbs/bootstrap/blob/v5.3.8/LICENSE).
- **JavaScriptová knižnica:** [Day.js 1.11.13](https://day.js.org/) — [MIT License](https://github.com/iamkun/dayjs/blob/v1.11.13/LICENSE). Používa sa na výber aktuálneho dňa, kontrolu aktuálnosti údajov v localStorage, vytvorenie časovej pečiatky a formátovanie času poslednej aktualizácie.
- **Font:** [Roboto](https://fonts.google.com/specimen/Roboto), súbor `fonts/roboto-v51-latin_latin-ext-regular.woff2`, pripojený cez `@font-face` — [SIL Open Font License 1.1](https://github.com/google/fonts/blob/main/ofl/roboto/OFL.txt). Licenčný odkaz vo vložených metadátach fontu smeruje na [openfontlicense.org](https://openfontlicense.org/).

Fetch API, DOMParser a localStorage sú štandardné rozhrania prehliadača, nie externé JavaScriptové knižnice.

## Štruktúra projektu

- `index.html` — hlavná stránka a sekcia O projekte.
- `css/style.css` — vlastné štýly a farebná paleta.
- `js/script.js` — načítanie, spracovanie, ukladanie a zobrazenie menu.
- `data/` — lokálne HTML kópie stránok reštaurácií.
- `fonts/` — lokálny font Roboto.
- `favicon.ico` — ikona stránky.

## Použitie AI

Pri vypracovaní zadania som využil nástroj OpenAI Codex na vysvetlenie požiadaviek zadania, návrh a úpravy HTML, CSS a JavaScriptu, implementáciu spracovania menu a pomoc pri testovaní.
