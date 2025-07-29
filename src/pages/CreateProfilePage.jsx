import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx';
import { api } from '../apiConfig.js';
import imageCompression from 'browser-image-compression';

const offerOptions = {
  dishes: [
    "Burgery", "Churros", "Frytki belgijskie", "Gofry", "Granita", "Hot-dogi", 
    "Kebab", "Kuchnia azjatycka", "Kuchnia meksykańska", "Kuchnia polska", 
    "Lody", "Nachos", "Pizza", "Słodkie wypieki", "Zakręcony ziemniak", "Zapiekanki"
  ],
  drinks: ["Kawa", "Lemoniada", "Napoje bezalkoholowe", "Piwo kraftowe"],
  dietary: ["Opcje wegetariańskie", "Opcje wegańskie", "Opcje bezglutenowe"]
};

function CreateProfilePage() {
  const { profileId } = useParams();
  const isEditMode = Boolean(profileId);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [foodTruckName, setFoodTruckName] = useState('');
  const [description, setDescription] = useState('');
  const [baseLocation, setBaseLocation] = useState('');
  const [operationRadius, setOperationRadius] = useState('');
  const [offer, setOffer] = useState({ dishes: [], drinks: [], dietary: [] });
  const [photos, setPhotos] = useState(null);
  const [longTermRental, setLongTermRental] = useState(false);

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!isEditMode) {
        setFoodTruckName(user?.company_name || '');
        return;
      }
      setLoading(true);
      try {
        const { data } = await api.get(`/profiles/${profileId}`);
        setFoodTruckName(data.food_truck_name || '');
        setDescription(data.food_truck_description || '');
        setBaseLocation(data.base_location || '');
        setOperationRadius(data.operation_radius_km || '');
        setOffer(data.offer || { dishes: [], drinks: [], dietary: [] });
        setLongTermRental(data.long_term_rental_available || false);
      } catch (error) {
        setMessage(error.response?.data?.message || "Nie udało się pobrać danych profilu do edycji.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
        loadProfileData();
    }
  }, [profileId, isEditMode, token, user]);

  const handleOfferChange = (category, value, checked) => {
    setOffer(prevOffer => {
      const currentCategoryItems = prevOffer[category] || [];
      const updatedCategoryItems = checked 
        ? [...currentCategoryItems, value]
        : currentCategoryItems.filter(item => item !== value);
      return { ...prevOffer, [category]: updatedCategoryItems };
    });
  };
  
  const handlePhotoChange = async (event) => {
    const imageFiles = Array.from(event.target.files);
    if (!imageFiles.length) return;

    setMessage('Kompresowanie zdjęć, proszę czekać...');
    setLoading(true);

    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
    };

    try {
        const compressedFilesPromises = imageFiles.map(file => {
            console.log(`Kompresowanie pliku: ${file.name}, rozmiar: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
            return imageCompression(file, options);
        });
        
        const compressedFiles = await Promise.all(compressedFilesPromises);
        
        compressedFiles.forEach(file => {
            console.log(`Skompresowany plik: ${file.name}, nowy rozmiar: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        });

        setPhotos(compressedFiles);
        setMessage(`Gotowe! Załadowano ${compressedFiles.length} zdjęć.`);
    } catch (error) {
        setMessage('Błąd podczas kompresji zdjęć.');
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('food_truck_name', foodTruckName);
    formData.append('food_truck_description', description);
    formData.append('base_location', baseLocation);
    formData.append('operation_radius_km', operationRadius);
    formData.append('offer', JSON.stringify(offer));
    formData.append('long_term_rental_available', longTermRental);

    if (photos) {
      for (let i = 0; i < photos.length; i++) {
        formData.append('gallery_photos', photos[i]);
      }
    }
    
    const method = isEditMode ? 'put' : 'post';
    const url = isEditMode ? `/profiles/${profileId}` : '/profiles';

    try {
      await api[method](url, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(isEditMode ? 'Profil zaktualizowany!' : 'Profil utworzony pomyślnie!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Wystąpił błąd.');
    } finally {
      setLoading(false);
    }
  };
  
  const styles = {
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { width: '100%', padding: '12px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #ccc' },
    fieldset: { border: '1px solid #eee', padding: '20px', borderRadius: '8px' },
    checkboxGroup: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' },
  };

  if (loading && isEditMode) return <p>Wczytywanie danych do edycji...</p>;

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto', padding: '2rem' }}>
      <h1>{isEditMode ? 'Edytuj Swój Profil Food Trucka' : 'Utwórz Swój Profil Food Trucka'}</h1>
      <p>Uzupełnij poniższe informacje, aby organizatorzy mogli Cię znaleźć.</p>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <fieldset style={styles.fieldset}>
          <legend>Podstawowe informacje</legend>
          <input value={foodTruckName} onChange={(e) => setFoodTruckName(e.target.value)} placeholder="Nazwa Twojego food trucka" required style={styles.input} />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Krótki opis, czym się wyróżniacie..." required style={{...styles.input, minHeight: '100px', marginTop: '15px'}} />
        </fieldset>

        <fieldset style={styles.fieldset}>
          <legend>Obszar działania</legend>
          <input value={baseLocation} onChange={(e) => setBaseLocation(e.target.value)} placeholder="Główna lokalizacja (np. Warszawa)" required style={styles.input} />
          <input type="number" value={operationRadius} onChange={(e) => setOperationRadius(e.target.value)} placeholder="Promień działania w km (np. 100)" required style={{...styles.input, marginTop: '15px'}} />
        </fieldset>

        <fieldset style={styles.fieldset}>
            <legend>Oferta</legend>
            <h4>Dania i przekąski:</h4>
            <div style={styles.checkboxGroup}>
                {offerOptions.dishes.map(item => (
                    <label key={item}><input type="checkbox" checked={offer.dishes?.includes(item)} onChange={(e) => handleOfferChange('dishes', item, e.target.checked)} /> {item}</label>
                ))}
            </div>
            <h4 style={{marginTop: '20px'}}>Napoje:</h4>
            <div style={styles.checkboxGroup}>
                {offerOptions.drinks.map(item => (
                    <label key={item}><input type="checkbox" checked={offer.drinks?.includes(item)} onChange={(e) => handleOfferChange('drinks', item, e.target.checked)} /> {item}</label>
                ))}
            </div>
            <h4 style={{marginTop: '20px'}}>Opcje dietetyczne:</h4>
            <div style={styles.checkboxGroup}>
                {offerOptions.dietary.map(item => (
                    <label key={item}><input type="checkbox" checked={offer.dietary?.includes(item)} onChange={(e) => handleOfferChange('dietary', item, e.target.checked)} /> {item}</label>
                ))}
            </div>
        </fieldset>

        <fieldset style={styles.fieldset}>
            <legend>Opcje dodatkowe</legend>
            <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <input 
                    type="checkbox" 
                    checked={longTermRental} 
                    onChange={(e) => setLongTermRental(e.target.checked)} 
                />
                Oferuję możliwość wynajmu długoterminowego (np. na kilka tygodni/miesięcy)
            </label>
        </fieldset>
        
        <fieldset style={styles.fieldset}>
            <legend>Galeria Zdjęć (max 10)</legend>
            <p>Zdjęcia zostaną automatycznie skompresowane. Uwaga: ponowne dodanie zdjęć w trybie edycji zastąpi istniejącą galerię.</p>
            <input type="file" multiple accept="image/*" onChange={handlePhotoChange} style={styles.input} />
        </fieldset>

        {message && <p style={{ color: message.startsWith('Profil') || message.startsWith('Gotowe') ? 'green' : 'red', textAlign: 'center' }}>{message}</p>}

        <button type="submit" disabled={loading} style={{ padding: '15px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', border: 'none', borderRadius: '5px', backgroundColor: 'var(--primary-red)', color: 'white' }}>
          {loading ? 'Przetwarzanie...' : (isEditMode ? 'Zapisz zmiany' : 'Utwórz profil')}
        </button>
      </form>
    </div>
  );
}

export default CreateProfilePage;
