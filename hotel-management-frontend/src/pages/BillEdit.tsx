import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/PaymentManagement.css';

interface Reservation {
  id: number;
  date: string;
  number_of_guests: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const BillEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [room, setRoom] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');
  const [taxes, setTaxes] = useState<number>(21);
  const [status, setStatus] = useState('Unpaid');
  const [reservationId, setReservationId] = useState<number | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const token = localStorage.getItem('access_token');
  const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {};

  // Fetch reservations
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/reservations/`, { headers });
        setReservations(res.data.results || []);
      } catch (err) {
        console.error('Failed to fetch reservations', err);
      }
    };
    fetchReservations();
  }, []);

  // Fetch bill data
  useEffect(() => {
    if (!id) return;

    const fetchBill = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/bills/${id}/`, { headers });
        const data = res.data;
        setName(data.name);
        setAmount(data.amount);
        setRoom(data.room);
        setDueDate(data.due_date);
        setTaxes(data.taxes);
        setStatus(data.status);
        setReservationId(data.reservation);
      } catch (err) {
        console.error('Failed to fetch bill', err);
      }
    };
    fetchBill();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservationId) return alert('Select a reservation!');

    try {
      await axios.patch(
        `${API_BASE_URL}/bills/${id}/`,
        {
          reservation: reservationId,
          name,
          amount,
          room,
          due_date: dueDate,
          taxes,
          status,
        },
        { headers }
      );

      alert(`Bill #${id} updated!`);
      navigate(-1);
    } catch (err: any) {
      console.error('Failed to update bill', err);
      alert(err.response?.data?.detail || 'Failed to update bill. Are you logged in?');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Edit Bill #{id}</h1>
      </div>

      <form className="payment-form" onSubmit={handleSave}>
        <label>Reservation</label>
        <select
          value={reservationId || ''}
          onChange={e => setReservationId(Number(e.target.value))}
          required
        >
          <option value="">Select Reservation</option>
          {reservations.map(r => (
            <option key={r.id} value={r.id}>
              {r.id} - {r.number_of_guests} guests on {r.date}
            </option>
          ))}
        </select>

        <label>Guest Name</label>
        <input className="input-field" value={name} onChange={e => setName(e.target.value)} required />

        <label>Total Amount</label>
        <input className="input-field" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} required />

        <label>Room</label>
        <input className="input-field" type="number" value={room} onChange={e => setRoom(Number(e.target.value))} required />

        <label>Taxes (%)</label>
        <input className="input-field" type="number" value={taxes} min={0} onChange={e => setTaxes(Number(e.target.value))} required />

        <label>Due Date</label>
        <input className="input-field" type="date" value={dueDate} min={new Date().toISOString().split('T')[0]} onChange={e => setDueDate(e.target.value)} required />

        <label>Status</label>
        <select className="input-field" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
        </select>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="submit-btn">Save Changes</button>
          <button type="button" className="submit-btn" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default BillEdit;
