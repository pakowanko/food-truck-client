import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx';
import API_URL from '../apiConfig.js';

function AddTruckPage() {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    const [truckName, setTruckName] = useState('');
    const [description, setDescription] = useState('');
    const [cuisineTypes, setCuisineTypes] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [radius, setRadius] = useState('');
    const [mainImage, setMainImage] = useState(null);
    
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('truck_name', truckName);
        formData.append('description', description);
        formData.append('cuisine_types', cuisineTypes);
        formData.append('base_postal_code', postalCode);
        formData.append('service_radius_km', radius);
        if (mainImage) {
            formData.append('main_image', mainImage);
        }

        try {
            const response = await fetch(`${API_URL}/api/trucks`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Błąd tworzenia profilu food trucka.');
            setMessage('Profil food trucka został pomyślnie utworzony!');
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div style={{ maxWidth: '700px', margin: '20px auto', padding: '20px' }}>
            <h1>Dodaj swojego Food Trucka</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input value={truckName} onChange={(e) => setTruckName(e.target.value)} placeholder="Nazwa Twojego Food Trucka" required />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opisz swój food truck, menu i to, co Cię wyróżnia." required />
                <input value={cuisineTypes} onChange={(e) => setCuisineTypes(e.target.value)} placeholder="Typy kuchni (np. burgery, pizza, wege)" required />
                <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="Kod pocztowy Twojej bazy" required />
                <input type="number" value={radius} onChange={(e) => setRadius(e.target.value)} placeholder="Zasięg działania w km" required />
                <div>
                    <label>Główne zdjęcie (logo lub zdjęcie food trucka):</label>
                    <input type="file" accept="image/*" onChange={(e) => setMainImage(e.target.files[0])} />
                </div>
                {message && <p style={{ color: message.startsWith('Profil') ? 'green' : 'red' }}>{message}</p>}
                <button type="submit" disabled={loading}>{loading ? 'Zapisywanie...' : 'Dodaj Food Trucka'}</button>
            </form>
        </div>
    );
}

export default AddTruckPage;