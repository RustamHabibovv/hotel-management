import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/PaymentManagement.css';
import { reservationService } from '../services/reservationService';
import type { Reservation } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const BillCreate = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [room, setRoom] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');
  const [taxes, setTaxes] = useState<number>(21);
  const [reservationId, setReservationId] = useState<number | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Load reservations
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await reservationService.getMyReservations('all', 'check_in_date');
        setReservations(res);
      } catch (err) {
        console.error('Failed to fetch reservations', err);
      }
    };

    fetchReservations();

    // Default due date = +1 month
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setDueDate(nextMonth.toISOString().split('T')[0]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !amount || !room) return alert('Please fill in all required fields');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Not logged in');

      await axios.post(
        `${API_BASE_URL}/bills/`,
        {
          reservation: reservationId,
          name,
          amount,
          room,
          due_date: dueDate,
          taxes,
          status: 'Unpaid',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Bill created successfully!');
      navigate(-1);
    } catch (err: any) {
      console.error('Error creating bill:', err);
      alert(err.response?.data?.detail || 'Failed to create bill. Are you logged in?');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>🧾 Create New Bill</h1>
      </div>

      <form className="payment-form" onSubmit={handleSubmit}>
        <label>Reservation</label>
        <select
          value={reservationId ?? ''}
          onChange={e => setReservationId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">No reservation</option>
          {reservations.map(r => (
            <option key={r.id} value={r.id}>
              {r.id} - {r.numberOfGuests} guests on {r.checkInDate}
            </option>
          ))}
        </select>

        <label>Guest Name</label>
        <input
          className="input-field"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        <label>Total Amount</label>
        <input
          className="input-field"
          type="number"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          required
        />

        <label>Room</label>
        <input
          className="input-field"
          type="number"
          value={room}
          onChange={e => setRoom(Number(e.target.value))}
          required
        />

        <label>Taxes (%)</label>
        <input
          className="input-field"
          type="number"
          value={taxes}
          min={0}
          onChange={e => setTaxes(Number(e.target.value))}
          required
        />

        <label>Due Date</label>
        <input
          className="input-field"
          type="date"
          value={dueDate}
          min={new Date().toISOString().split('T')[0]}
          onChange={e => setDueDate(e.target.value)}
          required
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="submit-btn">
            Create Bill
          </button>
          <button type="button" className="submit-btn" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BillCreate;
