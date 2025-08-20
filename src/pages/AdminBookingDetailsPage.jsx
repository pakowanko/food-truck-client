import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../apiConfig.js';
import './AdminBookingDetailsPage.css';

// Funkcja pomocnicza do formatowania daty
const formatDate = (dateObject) => {
    if (!dateObject?._seconds) return 'Invalid Date';
    return new Date(dateObject._seconds * 1000).toLocaleDateString('pl-PL');
};

function AdminBookingDetailsPage() {
    const { requestId } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/admin/bookings/${requestId}`);
                setBooking(response.data);
            } catch (err) {
                setError('Nie udało się pobrać szczegółów rezerwacji.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookingDetails();
    }, [requestId]);

    if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Ładowanie szczegółów rezerwacji...</p>;
    if (error) return <p style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>{error}</p>;
    if (!booking) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Nie znaleziono danych rezerwacji.</p>;

    const bookingStatusMap = {
        pending_owner_approval: { text: 'Oczekuje na akceptację', color: '#ffc107' },
        confirmed: { text: 'Potwierdzona', color: 'green' },
        rejected_by_owner: { text: 'Odrzucona (Właściciel)', color: 'red' },
        cancelled_by_organizer: { text: 'Anulowana (Organizator)', color: '#6c757d' },
        cancelled_by_owner: { text: 'Anulowana (Właściciel)', color: '#6c757d' },
        completed: { text: 'Zakończona', color: 'blue' }
    };
    const statusInfo = bookingStatusMap[booking.status] || { text: booking.status, color: 'black' };

    return (
        <div className="admin-details-container">
            <Link to="/admin" className="back-link">&larr; Powrót do panelu admina</Link>
            <h1>Szczegóły rezerwacji #{booking.request_id}</h1>

            <div className="details-grid">
                <div className="details-card">
                    <h2>Informacje o Wydarzeniu</h2>
                    {/* ✨ POPRAWKA 1: Użycie funkcji pomocniczej do formatowania daty */}
                    <p><strong>Data:</strong> {formatDate(booking.event_start_date)}</p>
                    {/* ✨ POPRAWKA 2: Poprawiono wyświetlanie godzin */}
                    <p><strong>Godziny:</strong> {booking.event_time || 'Nie podano'}</p>
                    <p><strong>Lokalizacja:</strong> {booking.event_location}</p>
                    <p><strong>Liczba gości:</strong> {booking.guest_count}</p>
                    <p><strong>Typ wydarzenia:</strong> {booking.event_type}</p>
                    <p><strong>Dodatkowe ustalenia (opłaty, media itp.):</strong> <span style={{ whiteSpace: 'pre-wrap' }}>{booking.utility_costs || 'Nie podano'}</span></p>
                </div>

                <div className="details-card">
                    <h2>Food Truck</h2>
                    <p><strong>Nazwa:</strong> {booking.food_truck_name}</p>
                    <p><strong>Email właściciela:</strong> <a href={`mailto:${booking.owner_email}`}>{booking.owner_email}</a></p>
                    <p><strong>Telefon właściciela:</strong> {booking.owner_phone || 'Brak'}</p>
                </div>

                <div className="details-card">
                    <h2>Organizator</h2>
                    <p><strong>Imię i nazwisko:</strong> {booking.organizer_first_name} {booking.organizer_last_name}</p>
                    <p><strong>Email:</strong> <a href={`mailto:${booking.organizer_email}`}>{booking.organizer_email}</a></p>
                    <p><strong>Telefon:</strong> {booking.organizer_phone || 'Brak'}</p>
                </div>

                <div className="details-card">
                    <h2>Statusy</h2>
                    <p><strong>Status rezerwacji:</strong> <span style={{ color: statusInfo.color, fontWeight: 'bold' }}>{statusInfo.text}</span></p>
                    <p><strong>Status prowizji:</strong> <span style={{ color: booking.commission_paid ? 'green' : 'red' }}>{booking.commission_paid ? 'Opłacona' : 'Nieopłacona'}</span></p>
                    <p><strong>Status opakowań:</strong> <span style={{ color: booking.packaging_ordered ? 'green' : 'orange' }}>{booking.packaging_ordered ? 'Zamówione' : 'Brak zamówienia'}</span></p>
                </div>

                <div className="details-card full-width">
                    <h2>Wiadomość od organizatora / Opis wydarzenia</h2>
                    {/* ✨ POPRAWKA 3: Zmieniono 'event_description' na 'event_details' */}
                    <p className="organizer-message">{booking.event_details || 'Brak wiadomości.'}</p>
                </div>
            </div>
        </div>
    );
}

export default AdminBookingDetailsPage;