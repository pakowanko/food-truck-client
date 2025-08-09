// src/components/SocialProofPopup.jsx
import React, { useState, useEffect } from 'react';
import './SocialProofPopup.css'; // Ten plik pozostaje bez zmian

// Usunęliśmy listę food trucków, zostawiamy tylko miasta
const CITIES = ["Warszawie", "Krakowie", "Gdańsku", "Poznaniu", "Wrocławiu", "Katowicach", "Szczecinie", "Łodzi"];

// Funkcja do losowania elementu z tablicy
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const SocialProofPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    // Zmieniliśmy stan, żeby przechowywał tylko miasto
    const [city, setCity] = useState('');

    useEffect(() => {
        const hasBeenShown = sessionStorage.getItem('socialProofShown');
        
        if (!hasBeenShown) {
            const timer = setTimeout(() => {
                // Losujemy tylko miasto
                setCity(getRandomItem(CITIES));
                setIsVisible(true);
                
                sessionStorage.setItem('socialProofShown', 'true');

                setTimeout(() => {
                    setIsVisible(false);
                }, 8000);

            }, 4000);

            return () => clearTimeout(timer);
        }
    }, []);

    if (!isVisible) {
        return null;
    }

    return (
        <div className="social-proof-popup">
            <div className="popup-icon">🎉</div>
            <div className="popup-content">
                <p className="popup-title">Świetna wiadomość!</p>
                {/* Zmieniony, uproszczony tekst komunikatu */}
                <p className="popup-text">
                    Jeden z naszych food trucków właśnie otrzymał rezerwację w <strong>{city}</strong>!
                </p>
            </div>
        </div>
    );
};

export default SocialProofPopup;