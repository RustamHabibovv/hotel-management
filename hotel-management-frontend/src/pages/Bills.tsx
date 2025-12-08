import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
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

const Bills = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/api/bills/')
      .then(res => setBills(res.data.results || []))
      .catch(err => console.error(err));
  }, []);

  const handleDelete = (id: number) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;
    axios.delete(`http://localhost:8000/api/bills/${id}/`)
      .then(() => setBills(bills.filter(b => b.id !== id)))
      .catch(err => console.error(err));
  };

  const filteredBills = bills.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.id.toString().includes(searchTerm)
  );

  return (
    <div className="page">
      <div className="page-header">
      <h1>🧾 Bills</h1>

      <div className="header-actions">
        <input
          type="text"
          placeholder="Search by guest, ID..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <a href="/payments/bills/new" className="btn-small">+ Add New Bill</a>
      </div>
    </div>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Guest</th>
            <th>Total</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredBills.map(bill => (
            <tr key={bill.id}>
              <td>{bill.id}</td>
              <td>{bill.name}</td>
              <td>${bill.amount}</td>
              <td className={bill.status === 'Paid' ? 'status-paid' : 'status-unpaid'}>
                {bill.status}
              </td>
              <td>{bill.due_date}</td>
              <td>
                <Link to={`/payments/bills/view/${bill.id}`} className="table-btn view">View</Link>
                <Link to={`/payments/bills/${bill.id}`} className="table-btn edit">Edit</Link>
                <button className="table-btn delete" onClick={() => handleDelete(bill.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Bills;
