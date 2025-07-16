import React from 'react';

function PrivacyPolicyPage() {
  const pageStyles = {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '20px',
    lineHeight: '1.6',
    color: '#333'
  };

  const h1Styles = { color: '#343A40' };
  const h2Styles = { color: '#343A40', borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: '40px' };
  
  return (
    <div style={pageStyles}>
      <h1 style={h1Styles}>Polityka Prywatności Serwisu www.BookTheFoodTruck.eu</h1>
      <p>Ostatnia aktualizacja: 16.07.2025</p>

      <h2 style={h2Styles}>§ 1. Administrator Danych Osobowych</h2>
      <p>
        Administratorem Danych Osobowych (ADO) w rozumieniu Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO) jest 
        <strong>Pakowanko Sp. z o.o.</strong> z siedzibą w Rudzie Śląskiej, adres: ul. Świerkowa 5, 41-706 Ruda Śląska, NIP: 7792529032, REGON: 89567254, KRS: 000914342 (zwana dalej "Operatorem").
      </p>
      <p>
        W sprawach związanych z przetwarzaniem danych osobowych można kontaktować się z Operatorem pod adresem e-mail: <strong>info@bookthefoodtruck.eu</strong>.
      </p>

      <h2 style={h2Styles}>§ 2. Cele i Podstawy Prawne Przetwarzania Danych</h2>
      <p>Operator przetwarza Twoje dane osobowe w następujących celach:</p>
      <ul>
        <li>Świadczenia usług drogą elektroniczną w ramach Serwisu www.BookTheFoodTruck.eu, w tym zakładania i zarządzania kontem, kojarzenia Organizatorów z Właścicielami oraz umożliwienia komunikacji – podstawa prawna: art. 6 ust. 1 lit. b RODO (niezbędność do wykonania umowy).</li>
        <li>Wypełnienia obowiązków prawnych ciążących na Operatorze, w szczególności podatkowych i rachunkowych związanych z wystawianiem faktur za prowizje – podstawa prawna: art. 6 ust. 1 lit. c RODO.</li>
        <li>Dochodzenia lub obrony ewentualnych roszczeń wynikających z umowy – podstawa prawna: art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes Operatora).</li>
        <li>Komunikacji i marketingu bezpośredniego usług własnych Operatora – podstawa prawna: art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes Operatora).</li>
        <li>Wysyłania powiadomień transakcyjnych (e-mail) dotyczących statusu rezerwacji, rejestracji lub wiadomości na czacie – podstawa prawna: art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes Operatora).</li>
      </ul>

      <h2 style={h2Styles}>§ 3. Zakres Przetwarzanych Danych</h2>
      <p>W zależności od roli w Serwisie, Operator przetwarza następujący zakres danych:</p>
      <ul>
        <li><strong>Dane podstawowe:</strong> imię, nazwisko, adres e-mail, zaszyfrowane hasło, numer telefonu.</li>
        <li><strong>Dane firmowe (jeśli podano):</strong> nazwa firmy, NIP, adres działalności.</li>
        <li><strong>Dane profilowe Właścicieli:</strong> opis oferty, zdjęcia, lokalizacja, promień działania.</li>
        <li><strong>Dane transakcyjne:</strong> historia rezerwacji, treść opinii, historia rozmów na czacie.</li>
        <li><strong>Dane zbierane automatycznie:</strong> adres IP, logi systemowe, dane o urządzeniu, pliki cookies.</li>
      </ul>

      <h2 style={h2Styles}>§ 4. Prawa Użytkownika (RODO)</h2>
      <p>W związku z przetwarzaniem Twoich danych osobowych, przysługują Ci następujące prawa:</p>
      <ul>
        <li>Prawo dostępu do swoich danych.</li>
        <li>Prawo do sprostowania (poprawiania) swoich danych.</li>
        <li>Prawo do usunięcia danych (tzw. "prawo do bycia zapomnianym").</li>
        <li>Prawo do ograniczenia przetwarzania danych.</li>
        <li>Prawo do wniesienia sprzeciwu wobec przetwarzania danych opartego na prawnie uzasadnionym interesie.</li>
        <li>Prawo do przenoszenia danych.</li>
        <li>Prawo do wniesienia skargi do organu nadzorczego, tj. Prezesa Urzędu Ochrony Danych Osobowych.</li>
      </ul>

      <h2 style={h2Styles}>§ 5. Odbiorcy Danych</h2>
      <p>Twoje dane osobowe mogą być przekazywane podmiotom przetwarzającym dane na zlecenie Operatora, m.in.:</p>
      <ul>
        <li>Dostawcom usług IT i hostingu (Google Cloud Platform).</li>
        <li>Dostawcom usług płatniczych (Stripe, Inc.).</li>
        <li>Dostawcom systemu do wysyłki wiadomości e-mail (SendGrid).</li>
        <li>Biuru rachunkowemu i kancelariom prawnym.</li>
      </ul>

      <h2 style={h2Styles}>§ 6. Pliki Cookies</h2>
      <p>Serwis wykorzystuje pliki cookies (ciasteczka) w celu zapewnienia poprawnego działania strony, analizy ruchu oraz w celach marketingowych. Możesz zarządzać ustawieniami cookies z poziomu swojej przeglądarki internetowej.</p>
      
      <h2 style={h2Styles}>§ 7. Okres Przechowywania Danych</h2>
      <p>Twoje dane przechowujemy przez czas posiadania przez Ciebie konta w Serwisie oraz po jego usunięciu przez okres wymagany przepisami prawa (np. dla celów rozliczeniowych) lub do czasu przedawnienia ewentualnych roszczeń.</p>
    </div>
  );
}

export default PrivacyPolicyPage;