import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/PaymentManagement.css';

interface Payment {
  id: number;
  bill: number;
  amount: number;
  type: string;
  date: string;
  state: boolean;
}

const PaymentList = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/api/payments/')
      .then(res => setPayments(res.data.results || []))
      .catch(err => console.error(err));
  }, []);

  const handleDelete = (id: number) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;
    axios.delete(`http://localhost:8000/api/payments/${id}/`)
      .then(() => setPayments(payments.filter(p => p.id !== id)))
      .catch(err => console.error(err));
  };

  const filteredPayments = payments.filter(p =>
    p.bill.toString().includes(searchTerm) ||
    p.id.toString().includes(searchTerm)
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>💳 Payments</h1>
      </div>

      <div className="search-form">
        <input
          type="text"
          placeholder="Search by payment ID or bill ID..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Bill ID</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredPayments.map(payment => (
            <tr key={payment.id}>
              <td>{payment.id}</td>
              <td>{payment.bill}</td>
              <td>${payment.amount}</td>
              <td>{payment.type}</td>
              <td>{payment.date}</td>
              <td className={payment.state ? 'status-paid' : 'status-unpaid'}>
                {payment.state ? 'Paid' : 'Pending'}
              </td>
              <td>
                <button className="table-btn delete" onClick={() => handleDelete(payment.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentList;
