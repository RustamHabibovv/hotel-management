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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const Bills = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper to get headers with access token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Load bills
  const fetchBills = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/bills/`, { headers: getAuthHeaders() });
      setBills(res.data.results || []);
    } catch (err) {
      console.error('Failed to load bills', err);
      alert('Failed to load bills. Are you logged in?');
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // Delete bill
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/bills/${id}/`, { headers: getAuthHeaders() });
      setBills(bills.filter(b => b.id !== id));
      alert(`Bill #${id} deleted`);
    } catch (err: any) {
      console.error('Failed to delete bill', err);
      alert(err.response?.data?.detail || 'Failed to delete bill. Are you logged in?');
    }
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
