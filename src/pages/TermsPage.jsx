import React from 'react';
import { Link } from 'react-router-dom';

function TermsPage() {
  const pageStyles = {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '20px',
    lineHeight: '1.6',
    color: '#333'
  };
  
  const h1Styles = { color: '#343A40' };
  const h2Styles = { color: '#343A40', borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: '40px' };
  const h3Styles = { color: '#555', marginTop: '30px' };
  const ulStyles = { paddingLeft: '20px' };

  return (
    <div style={pageStyles}>
      <h1 style={h1Styles}>Regulaminy Serwisu www.BookTheFoodTruck.eu</h1>
      <p>Ostatnia aktualizacja: 16.07.2025</p>

      <h2 style={h2Styles}>Część A: Regulamin dla Organizatorów</h2>
      
      <h3 style={h3Styles}>§ 1. Postanowienia Ogólne i Definicje</h3>
        <p>1.1. Serwis internetowy BookTheFoodTruck (zwany dalej "Serwisem"), działający pod adresem www.BookTheFoodTruck.eu, prowadzony jest przez Pakowanko Sp. z o.o. z siedzibą w Rudzie Śląskiej, adres: ul. Świerkowa 5, 41-706 Ruda Śląska, wpisaną do Rejestru Przedsiębiorców Krajowego Rejestru Sądowego pod numerem KRS: 000914342, NIP: 7792529032, REGON: 89567254 (zwaną dalej "Operatorem").</p>
        <p>1.2. Niniejszy regulamin (zwany dalej "Regulaminem Organizatora") określa zasady i warunki świadczenia usług drogą elektroniczną przez Operatora na rzecz Użytkowników korzystających z Serwisu w roli Organizatora.</p>
        <p>1.3. Akceptacja Regulaminu Organizatora jest dobrowolna, ale konieczna do założenia Konta i korzystania z pełnej funkcjonalności Serwisu.</p>
        <p>1.4. Użyte w regulaminie pojęcia oznaczają:</p>
        <ul style={ulStyles}>
            <li><b>Organizator</b> – Użytkownik, będący osobą fizyczną, osobą prawną lub jednostką organizacyjną nieposiadającą osobowości prawnej, który poszukuje Usługi wynajmu Food Trucka.</li>
            <li><b>Właściciel</b> – Użytkownik, przedsiębiorca, oferujący Usługę wynajmu Food Trucka za pośrednictwem Serwisu.</li>
            <li><b>Usługa</b> – usługa gastronomiczna i wynajmu Food Trucka świadczona przez Właściciela na rzecz Organizatora.</li>
            <li><b>Rezerwacja</b> – umowa o świadczenie Usługi zawierana bezpośrednio pomiędzy Organizatorem a Właścicielem.</li>
        </ul>

      <h3 style={h3Styles}>§ 2. Rola i Odpowiedzialność Serwisu</h3>
        <p>2.1. Serwis jest platformą technologiczną, która pełni rolę pośrednika, umożliwiając kontakt i zawieranie umów Rezerwacji bezpośrednio między Organizatorami a Właścicielami.</p>
        <p>2.2. Operator Serwisu nie jest stroną umów Rezerwacji. Wszelkie roszczenia wynikające z niewykonania lub nienależytego wykonania Usługi (m.in. dotyczące jakości jedzenia, punktualności, zgodności z ofertą, bezpieczeństwa sanitarnego) muszą być kierowane bezpośrednio do Właściciela.</p>
        <p>2.3. Operator dokłada starań w celu weryfikacji Właścicieli, jednak nie ponosi odpowiedzialności za prawdziwość i rzetelność informacji zamieszczonych w ich profilach. Organizator jest zobowiązany do samodzielnej weryfikacji Właściciela.</p>
        <p>2.4. Operator nie ponosi odpowiedzialności za jakiekolwiek szkody (majątkowe i niemajątkowe) powstałe w wyniku realizacji lub braku realizacji Usługi.</p>

      <h3 style={h3Styles}>§ 3. Prawa i Obowiązki Organizatora</h3>
        <p>3.1. Organizator ma prawo do bezpłatnego przeglądania ofert i wysyłania zapytań o Rezerwację.</p>
        <p>3.2. Złożenie zapytania o Rezerwację staje się prawnie wiążącą umową z Właścicielem dopiero po jej formalnym potwierdzeniu przez Właściciela w Serwisie.</p>
        <p>3.3. Organizator zobowiązuje się do podania prawdziwych i kompletnych informacji dotyczących planowanego wydarzenia.</p>
        <p>3.4. Komunikacja: Wszelkie kluczowe ustalenia dotyczące Rezerwacji (zmiana menu, godzin, miejsca) powinny odbywać się za pośrednictwem wbudowanego w Serwis czatu w celu zachowania historii ustaleń. Operator nie ponosi odpowiedzialności za ustalenia dokonane poza Serwisem.</p>
        <p>3.5. Anulowanie Rezerwacji: Organizator przyjmuje do wiadomości, że zasady anulowania potwierdzonej Rezerwacji (np. ewentualne koszty, terminy) są ustalane indywidualnie przez każdego Właściciela. Serwis rekomenduje potwierdzenie tych zasad z Właścicielem przed dokonaniem jakichkolwiek płatności za Usługę.</p>

      <h3 style={h3Styles}>§ 4. Płatności i System Opinii</h3>
        <p>4.1. Wszelkie płatności za Usługę odbywają się bezpośrednio między Organizatorem a Właścicielem. Serwis nie pośredniczy w tej płatności i nie pobiera żadnych opłat od Organizatora.</p>
        <p>4.2. Organizator ma prawo do wystawienia jednej opinii dla każdej zrealizowanej Rezerwacji. Opinia powinna być rzetelna, oparta na faktach i zgodna z zasadami dobrego wychowania. Opinie zawierające wulgaryzmy, oszczerstwa, mowę nienawiści lub treści niezwiązane z oceną Usługi będą usuwane.</p>

      <h3 style={h3Styles}>§ 5. Postanowienia Końcowe</h3>
        <p>5.1. W sprawach nieuregulowanych niniejszym regulaminem zastosowanie mają przepisy prawa polskiego.</p>
        <p>5.2. Informacje na temat przetwarzania danych osobowych znajdują się w dokumencie <Link to="/polityka-prywatnosci">Polityka Prywatności</Link>, dostępnym w Serwisie.</p>
        <p>5.3. Operator zastrzega sobie prawo do wprowadzania zmian w Regulaminie Organizatora. O wszelkich zmianach Użytkownicy zostaną poinformowani drogą elektroniczną.</p>

      <h2 style={h2Styles}>Część B: Regulamin dla Właścicieli Food Trucków</h2>
      
      <h3 style={h3Styles}>§ 1. Postanowienia Ogólne i Definicje</h3>
        <p>1.1. Serwis internetowy BookTheFoodTruck (zwany dalej "Serwisem"), działający pod adresem www.BookTheFoodTruck.eu, prowadzony jest przez Pakowanko Sp. z o.o. z siedzibą w Rudzie Śląskiej, adres: ul. Świerkowa 5, 41-706 Ruda Śląska, wpisaną do Rejestru Przedsiębiorców Krajowego Rejestru Sądowego pod numerem KRS: 000914342, NIP: 7792529032, REGON: 89567254 (zwaną dalej "Operatorem").</p>
        <p>1.2. Niniejszy regulamin (zwany dalej "Regulaminem Właściciela") określa zasady i warunki świadczenia usług drogą elektroniczną przez Operatora na rzecz Użytkowników korzystających z Serwisu w roli Właściciela.</p>
        <p>1.3. Akceptacja Regulaminu Właściciela jest dobrowolna, ale konieczna do założenia Konta i korzystania z pełnej funkcjonalności Serwisu.</p>
        
      <h3 style={h3Styles}>§ 2. Rola i Odpowiedzialność Serwisu</h3>
        <p>2.1. Serwis jest platformą technologiczną, która pełni rolę pośrednika, umożliwiając kontakt i zawieranie umów Rezerwacji bezpośrednio między Organizatorami a Właścicielami.</p>
        <p>2.2. Operator Serwisu nie jest stroną umów Rezerwacji i nie ponosi odpowiedzialności za ich wykonanie.</p>
      
      <h3 style={h3Styles}>§ 3. Prawa i Obowiązki Właściciela</h3>
        <p>3.1. Właściciel zobowiązuje się do utrzymywania rzetelnego, zgodnego z prawdą i aktualnego profilu swojego Food Trucka.</p>
        <p>3.2. Właściciel oświadcza, że prowadzi legalną działalność gospodarczą i posiada wszelkie niezbędne pozwolenia do świadczenia Usług gastronomicznych.</p>
        <p>3.3. Właściciel ponosi pełną odpowiedzialność za jakość i bezpieczeństwo świadczonych Usług.</p>
        <p>3.4. Prawa do Treści: Właściciel, publikując w Serwisie treści (zdjęcia, opisy), oświadcza, że posiada do nich pełne prawa autorskie i udziela Operatorowi niewyłącznej, nieodpłatnej licencji na ich wykorzystanie w celach funkcjonowania i promocji Serwisu.</p>
        <p>3.5. Akceptacja Rezerwacji jest równoznaczna z zawarciem prawnie wiążącej umowy z Organizatorem.</p>
        <p>3.6. Polityka Anulowania Rezerwacji: Wielokrotne odwoływanie potwierdzonych Rezerwacji bez ważnej przyczyny może skutkować zawieszeniem konta.</p>

      <h3 style={h3Styles}>§ 4. Zasady Komercyjne i Obowiązki Biznesowe</h3>
        <p>4.1. Prowizja: Właściciel akceptuje, że za każdą potwierdzoną Rezerwację zawartą za pośrednictwem Serwisu, Operator ma prawo do naliczenia Prowizji. Zasady i wysokość Prowizji określone są w cenniku dostępnym w panelu Właściciela.</p>
        <p>4.2. Zakup Opakowań: Właściciel, akceptując Rezerwację, zobowiązuje się do zaopatrzenia się w niezbędne opakowania jednorazowe na dane wydarzenie za pośrednictwem sklepu internetowego wskazanego przez Operatora pod adresem www.pakowanko.com.</p>
        <p>4.3. Zakaz Omijania Serwisu: Zabronione jest finalizowanie transakcji z Organizatorami poznanymi za pośrednictwem Serwisu poza platformą w celu uniknięcia Prowizji. Naruszenie tej zasady będzie skutkować usunięciem konta.</p>

      <h3 style={h3Styles}>§ 5. Blokowanie i Usuwanie Konta</h3>
        <p>5.1. Operator zastrzega sobie prawo do usunięcia konta Właściciela w przypadku rażącego naruszania postanowień niniejszego regulaminu.</p>

      <h3 style={h3Styles}>§ 6. Postanowienia Końcowe</h3>
        <p>6.1. W sprawach nieuregulowanych niniejszym regulaminem zastosowanie mają przepisy prawa polskiego.</p>
        <p>6.2. Informacje na temat przetwarzania danych osobowych znajdują się w dokumencie <Link to="/polityka-prywatnosci">Polityka Prywatności</Link>.</p>

    </div>
  );
}

export default TermsPage;