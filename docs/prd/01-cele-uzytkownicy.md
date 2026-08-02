> Read when: you are building a feature and need to know WHO it is for. Business goals, personas, roles.

## 1. Executive Summary

BODYWORK to poznańskie centrum zdrowia i ruchu (trening personalny, trening grupowy, fizjoterapia, dietetyka, masaż, diagnostyka BodyLab) prowadzące równolegle działalność B2B: akademię szkoleniową dla trenerów i fizjoterapeutów (kursy TP/TM/TF/PM, masterclassy, warsztaty) sprzedawaną online w modelu e-commerce.

Obecnie całość działa na jednym, przeciążonym WordPressie z 2015 r.: motyw szyty na miarę (SoftTone-BodyWork), WooCommerce, porzucona wtyczka wielojęzyczna qTranslate-X (widoczne w treściach artefakty `[:pl]...[:en]...`, m.in. w nazwach produktów), PageSpeed Module, GTM, PixelYourSite, Site Kit. Efekt: niska wydajność, koszty utrzymania wtyczek, treści zanieczyszczone znacznikami, brak spójności marki między częścią B2C a B2B.

Projekt zastępuje to **jednym self-hostowanym systemem w Next.js 16 (16.2.11 lub nowszy) + Payload CMS 3**, obsługującym cztery domeny z jednego repozytorium i jednej bazy danych:

| Domena                  | Rola                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| `body-work.pl`          | Hub: prosty landing rozdzielający ruch na trzy marki                                     |
| `centrum.body-work.pl`  | Klub fitness (B2C): usługi, zespół, cennik, galeria, blog, aktualności, zapisy → eFitness |
| `akademia.body-work.pl` | Akademia szkoleniowa (B2B): kursy, kalendarz szkoleń, **sklep e-commerce**, blog          |
| `dash.body-work.pl`     | Wspólny panel CMS dla redaktorów i adminów (treści + produkty + zamówienia)               |

Alfabet Ruchu pozostaje zewnętrznym produktem na podia.com: na hubie i w akademii obsługiwany wyłącznie jako przekierowanie/link wychodzący.

**Zasada naczelna projektu: zero abonamentów SaaS tam, gdzie istnieje dojrzała alternatywa open-source.** CMS, wielojęzyczność, formularze, newsletter, analityka, wyszukiwarka, hosting mediów, monitoring: wszystko self-hosted na jednym VPS. Płatne pozostają wyłącznie usługi, których fizycznie nie da się samodzielnie hostować: bramka płatnicza (Przelewy24), relay SMTP dla poczty transakcyjnej, domeny/VPS oraz system rezerwacji zajęć (eFitness: decyzja klienta, poza zakresem).

**Cel MVP:** działający produkcyjnie ekosystem trzech stron plus panel CMS, z pełną migracją treści i map 301 ze starej domeny, oddany w sześciu fazach: od fundamentu i huba, przez centrum, akademię i sklep, po migrację i przekazanie.

---

## 2. Misja i cele biznesowe

**Misja:** Dać BODYWORK szybką, samodzielnie edytowalną i tanią w utrzymaniu obecność online, w której marketing (redaktorzy) nie potrzebuje programisty do codziennej pracy, a właściciel nie płaci co roku za wtyczki, które kiedyś działały.

### Cele biznesowe (mierzalne)

| #   | Cel                                           | Miara sukcesu                                                                                                                             |
| --- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Obniżenie kosztów rocznych utrzymania         | Redukcja stałych opłat licencyjnych/wtyczkowych do 0 zł; łączny koszt infrastruktury ≤ ~1 000–1 500 zł/rok (VPS + backup + SMTP + domeny) |
| C2  | Wydajność i SEO                               | Core Web Vitals „dobre" dla ≥ 90% ruchu; Lighthouse Performance ≥ 95 (mobile) na stronach publicznych                                     |
| C3  | Zachowanie pozycji w wyszukiwarce po migracji | Spadek ruchu organicznego ≤ 15% w miesiąc po migracji, powrót do bazy w ≤ 3 miesiące                                                      |
| C4  | Samodzielność redakcyjna                      | Redaktor bez wiedzy technicznej tworzy nową podstronę z bloków i publikuje wpis blogowy bez kontaktu z wykonawcą                          |
| C5  | Sprzedaż szkoleń                              | Konwersja koszyk → płatność nie gorsza niż obecna w WooCommerce; wsparcie płatności ratalnych P24                                         |
| C6  | Higiena treści                                | Zero artefaktów `[:pl][:en]` i zero duplikatów „(Kopia)" w produkcyjnym katalogu produktów                                                |

### Zasady projektowe

1. **Self-hosted first**: SaaS tylko tam, gdzie nie ma sensownej alternatywy (płatności, SMTP).
2. **Jedna baza, jeden panel**: redaktor nie loguje się do trzech systemów.
3. **Statyczne gdzie się da**: ISR/SSG dla treści, SSR tylko dla koszyka i panelu.
4. **Treść należy do klienta**: brak vendor lock-inu, eksport do JSON/SQL w każdej chwili.
5. **Klocki, nie kod**: nowe podstrony powstają z gotowych bloków, a nie z HTML-a wklejanego do edytora.

---

## 3. Użytkownicy

### Persona 1: Klient klubu (B2C): „Ania, 34 lata, Poznań-Ogrody"

- Szuka: cennika, grafiku zajęć, kto jest trenerem, jak wygląda przestrzeń, jak się zapisać.
- Wchodzi z telefonu, z Google Maps albo Instagrama.
- Potrzebuje: szybkiej strony, klikalnego telefonu, galerii, jednego wyraźnego CTA („zapisz się na bezpłatne zajęcia").

### Persona 2: Specjalista/kursant (B2B): „Marek, fizjoterapeuta, Warszawa"

- Szuka: terminów kursów, programu, ceny, możliwości rat i dofinansowania z BUR.
- Porównuje oferty, wraca kilka razy przed zakupem, kupuje z desktopa produkt za 8 000–9 000 zł.
- Potrzebuje: wiarygodności, kompletu informacji organizacyjnych, faktury, jasnego regulaminu, bezpiecznej płatności.

### Persona 3: Redaktor / marketing BODYWORK

- Kompetencje techniczne: niskie. Zna WordPressa na poziomie „dodaj wpis, wgraj zdjęcie".
- Zadania: aktualności, wpisy blogowe, nowe terminy kursów, zmiana cennika, wymiana zdjęć, nowe podstrony landingowe pod kampanie.
- Potrzebuje: podglądu przed publikacją, wersji roboczych, bloków zamiast kodu, PL/EN obok siebie.

### Persona 4: Administrator / obsługa szkoleń

- Zadania: obsługa zamówień, listy uczestników, limity miejsc, zwroty, korespondencja, faktury.
- Potrzebuje: eksportu listy uczestników do CSV, statusów płatności, ręcznego dopisania uczestnika (przelew tradycyjny, dofinansowanie BUR).

### Persona 5: Wykonawcy i ich następcy

- Potrzebuje: TypeScript strict, jednego repozytorium, powtarzalnego deployu, backupów, dokumentacji przekazania.

---

