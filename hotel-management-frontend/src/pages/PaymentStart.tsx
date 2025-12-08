import { useEffect, useState } from 'react';
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
}

const PaymentStart = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    axios.get('http://localhost:8000/api/bills/')
      .then(res => setBills(res.data.results.filter((b: Bill) => b.status === 'Unpaid')))
      .catch(err => console.error(err));
  }, []);

  const handlePayment = () => {
    if (!selectedBill) return alert('Select a bill!');
    axios.post('http://localhost:8000/api/payments/', {
      bill: selectedBill.id,
      amount,
      type: paymentMethod,
      date: new Date().toISOString().split('T')[0],
      state: true
    })
    .then(() => {
      axios.patch(`http://localhost:8000/api/bills/${selectedBill.id}/`, { status: 'Paid' })
        .then(() => alert(`Payment completed for Bill #${selectedBill.id}`))
        .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
  };

  const handleOnlineBanking = () => {
    if (!selectedBill) return alert('Select a bill!');
    
    axios.post('http://localhost:8000/api/online-bank-payments/', {

      bill: selectedBill.id,
       amount,
       type: 'bank',
       date: new Date().toISOString().split('T')[0]
     })
     .then(res => {
       alert(`Bank payment successful! Transaction ID: ${res.data.transaction_id}`);
       // Mark bill as paid
       axios.patch(`http://localhost:8000/api/bills/${selectedBill.id}/`, { status: 'Paid' })
         .then(() => setSelectedBill(null))
         .catch(err => console.error(err));
     })
     .catch((err) => {
        console.error(err);
        alert('Bank payment failed');
});

  } ;

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
            <tr key={bill.id} onClick={() => { setSelectedBill(bill); setAmount(bill.amount); }}
              className={selectedBill?.id === bill.id ? 'selected-row' : ''}>
              <td>{bill.id}</td>
              <td>{bill.name}</td>
              <td>{bill.room}</td>
              <td>${bill.amount}</td>
              <td className={bill.status === 'Paid' ? 'status-paid' : 'status-unpaid'}>
                {bill.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>


      {selectedBill && (
        <form className="payment-form" onSubmit={e => { e.preventDefault(); handlePayment(); }}>
          <h3>Selected Bill #{selectedBill.id} - Room {selectedBill.room}</h3>

          <label>Payment Method</label>
          <select className="input-field" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank">Online Banking</option>
          </select>

          <label>Amount</label>
          <input className="input-field" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />

          {paymentMethod === 'bank' && (
            <button type="button" className="submit-btn" onClick={handleOnlineBanking}>
              Connect to Bank
            </button>
          )}

          {paymentMethod !== 'bank' && (
            <button type="submit" className="submit-btn">Submit Payment</button>
          )}
        </form>
      )}


    </div>
  );
};

export default PaymentStart;
