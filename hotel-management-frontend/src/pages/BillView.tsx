import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/PaymentManagement.css';

interface Bill {
  id: number;
  name: string;
  amount: number;
  room: number;
  due_date: string;
  taxes: number;
  status: string;
  reservation: number;
}

const BillView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState<Bill | null>(null);

  useEffect(() => {
    axios.get(`http://localhost:8000/api/bills/${id}/`)
      .then(res => setBill(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!bill) return <p>Loading...</p>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>View Bill #{bill.id}</h1>
      </div>

      <div className="payment-form">
        <p><strong>Guest:</strong> {bill.name}</p>
        <p><strong>Total Amount:</strong> ${bill.amount}</p>
        <p><strong>Room:</strong> {bill.room}</p>
        <p><strong>Taxes:</strong> {bill.taxes}%</p>
        <p><strong>Due Date:</strong> {bill.due_date}</p>
        <p><strong>Status:</strong> {bill.status}</p>
        <p><strong>Reservation ID:</strong> {bill.reservation}</p>

        <button className="submit-btn" onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );
};

export default BillView;
