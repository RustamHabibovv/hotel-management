import { useEffect, useState } from 'react';
import '../styles/PaymentManagement.css';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface Bill {
  id: number;
  name: string;
  amount: number;
  room: number;
  due_date: string;
  taxes: number;
  status: string;
}

const PaymentStart = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amount, setAmount] = useState(0);

  const token = localStorage.getItem('access_token');
  const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {};

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/bills/`, { headers });
        setBills(res.data.results.filter((b: Bill) => b.status === 'Unpaid'));
      } catch (err) {
        console.error('Failed to fetch bills', err);
      }
    };

    fetchBills();
  }, []);

  const handlePayment = async () => {
    if (!selectedBill) return alert('Select a bill!');
    if (amount <= 0) return alert('Enter a valid payment amount!');
    if (amount > selectedBill.amount) return alert('Payment exceeds remaining bill amount!');
    
    try {
      // Record the payment
      await axios.post(
        `${API_BASE_URL}/payments/`,
        {
          bill: selectedBill.id,
          amount,
          type: paymentMethod,
          date: new Date().toISOString().split('T')[0],
          state: true,
        },
        { headers }
      );
    
      const remainingAmount = selectedBill.amount - amount;
    
      // Only mark bill as paid if full amount is paid
      if (remainingAmount <= 0) {
        await axios.patch(
          `${API_BASE_URL}/bills/${selectedBill.id}/`,
          { status: 'Paid', amount: 0 },
          { headers }
        );
      } else {
        // Update the remaining amount on the bill
        await axios.patch(
          `${API_BASE_URL}/bills/${selectedBill.id}/`,
          { amount: remainingAmount },
          { headers }
        );
      }
    
      alert(`Payment of $${amount} recorded for Bill #${selectedBill.id}. Remaining: $${remainingAmount}`);
    
      // Update local state
      setSelectedBill(null);
      setAmount(0);
    
      // Refresh unpaid bills
      const res = await axios.get(`${API_BASE_URL}/bills/`, { headers });
      setBills(res.data.results.filter((b: Bill) => b.status === 'Unpaid'));
    } catch (err: any) {
      console.error('Payment failed', err);
      alert(err.response?.data?.detail || 'Payment failed. Are you logged in?');
    }
  };



  return (
    <div className="page">
      <div className="page-header">
        <h1>💳 Start Payment</h1>
      </div>

      <table className="table clickable-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Guest</th>
            <th>Room</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bills.map(bill => (
            <tr
              key={bill.id}
              onClick={() => {
                setSelectedBill(bill);
                setAmount(bill.amount);
              }}
              className={selectedBill?.id === bill.id ? 'selected-row' : ''}
            >
              <td>{bill.id}</td>
              <td>{bill.name}</td>
              <td>{bill.room}</td>
              <td>${bill.amount}</td>
              <td className={bill.status === 'Paid' ? 'status-paid' : 'status-unpaid'}>{bill.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedBill && (
        <form className="payment-form" onSubmit={e => { e.preventDefault(); handlePayment(); }}>
          <h3>Selected Bill #{selectedBill.id} - Room {selectedBill.room}</h3>

          <label>Payment Method</label>
          <select
            className="input-field"
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank">Online Banking</option>
          </select>

          <label>Amount</label>
          <input
            className="input-field"
            type="number"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
          />

          <button type="submit" className="submit-btn">Submit Payment</button>
        </form>
      )}
    </div>
  );
};

export default PaymentStart;
