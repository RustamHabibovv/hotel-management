import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/PaymentManagement.css';

interface Reservation {
  id: number;
  date: string;
  number_of_guests: number;
}

const BillCreate = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [room, setRoom] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');
  const [taxes, setTaxes] = useState<number>(21);
  const [reservationId, setReservationId] = useState<number | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/reservations/')
      .then(res => setReservations(res.data.results || []))
      .catch(err => console.error(err));

    // Set default due date to +1 month
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setDueDate(nextMonth.toISOString().split('T')[0]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservationId) return alert('Select a reservation!');

    axios.post('http://localhost:8000/api/bills/', {
      reservation: reservationId,
      name,
      amount,
      room,
      due_date: dueDate,
      taxes,
      status: 'Unpaid',
    })
    .then(() => {
      alert('Bill created!');
      navigate(-1); // Go back after creating
    })
    .catch(err => console.error(err));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>🧾 Create New Bill</h1>
      </div>

      <form className="payment-form" onSubmit={handleSubmit}>
        <label>Reservation</label>
        <select value={reservationId || ''} onChange={e => setReservationId(Number(e.target.value))} required>
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

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="submit-btn">Create Bill</button>
          <button type="button" className="submit-btn" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default BillCreate;
