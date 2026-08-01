> Read when: asking "how did the old WordPress do this", or migrating data.

## 6. Analiza stanu obecnego

### 6.1 Co jest dzisiaj (audyt body-work.com.pl)

| Obszar           | Stan                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CMS              | WordPress, motyw custom `SoftTone-BodyWork`, strona uruchomiona 2015                                                                                         |
| Sklep            | WooCommerce, slug `/produkt/...`, ~30+ produktów (kursy, masterclassy, ocena funkcjonalna, koszulka, karty podarunkowe), stany magazynowe jako liczba miejsc |
| Płatności        | Przelewy24 + kalkulator rat P24 (`secure.przelewy24.pl/kalkulator_raty`)                                                                                     |
| Wielojęzyczność  | qTranslate-X (porzucona) — znaczniki `[:pl]...[:en]...` **przeciekają do treści i tytułów produktów**                                                        |
| Rezerwacje       | Zewnętrzny eFitness (`bodywork-poznan.cms.efitness.com.pl/kalendarz-zajec`)                                                                                  |
| E-learning       | Zewnętrzna Podia (`alfabetruchu.podia.com`)                                                                                                                  |
| Optymalizacja    | Google PageSpeed Module (przepisane nazwy plików `.pagespeed.ic.`) — objaw walki z wolnym motywem                                                            |
| Marketing        | GTM (`GTM-P4TPSQ5`), Meta Pixel przez PixelYourSite, Google Site Kit                                                                                         |
| Dokumenty prawne | Regulamin i polityka prywatności jako **PDF-y w katalogu motywu** (zły dla SEO i dostępności)                                                                |
| Struktura        | Ok. 40+ stron w jednym drzewie, mieszające B2C i B2B; menu z dwoma niemal identycznymi gałęziami („Kursy" i „Szkolenia")                                     |
| Higiena danych   | Produkty z sufiksami „(Kopia) (Kopia) (Kopia)…" w tytułach — duplikaty w indeksie                                                                            |
| Blog             | Link w menu prowadzi do `http://body-work.com.pl/blog/?setlang=no` (http, parametr martwej wtyczki)                                                          |

### 6.2 Nowy projekt centrum (bodywork.testowe.eu)

Makieta dostarczona przez klienta jest zbudowana w kreatorze stron (zasoby pod `/content/<hash>/...`, canonical wskazujący na inną domenę — czyli szablon). Traktujemy ją **wyłącznie jako referencję wizualną i strukturalną**, nie jako kod źródłowy.

Zidentyfikowana struktura do odtworzenia:

```
/                          hero wideo, "Zrównoważony rozwój sprawności", News (karuzela),
                           "Przyjazna przestrzeń" + galeria, "Dołącz do Bodywork" (6 kafli usług),
                           Zespół, Opinie (karuzela), Kontakt/CTA, Newsletter, Partnerzy, Stopka,
                           sticky promo-bar (2 rotujące paski na dole)
/trening-personalny/       + /trening-indywidualny /trening-w-parze /ocena-funkcjonalna /trenerzy
/fizjoterapia/             + /terapia-manualna /rehabilitacja-ruchowa /zdrowy-brzuch /specjalisci
/trening-grupowy/          + /zajecia-grupowe /plan-zdrowej-zmiany /grafik-zajec(→eFitness) /medicover
/dietetyka/                + profile dietetyków (2)
/bodylab/                  + /technologia-vald /analiza-skladu-ciala
/cennik/  /masaz/  /blog/  /galeria/  /instrukcja/
/polityka-prywatnosci/  /regulamin/  /cookies/
/en/...                    pełna wersja angielska
```

**Wnioski dla wyceny i harmonogramu:**

- To ok. **22 unikalne szablony/strony PL** + wersja EN + blog + aktualności.
- Powtarzalnych układów jest mało — większość podstron usługowych da się złożyć z jednego zestawu bloków.
- Wymagane: **od grafika pliki źródłowe (Figma/Adobe XD) + wideo hero + galeria w oryginalnej rozdzielczości**, a nie tylko podgląd HTML. Bez tego dokładne odwzorowanie typografii i siatki będzie zgadywaniem.

### 6.3 Akademia — czego brakuje

Projekt graficzny akademii **jeszcze nie istnieje**. To główne ryzyko harmonogramu. Do czasu jego dostarczenia można zrealizować backend (produkty, kalendarz, koszyk, płatności) i strukturę informacji — patrz Faza 4 w §13.

---

