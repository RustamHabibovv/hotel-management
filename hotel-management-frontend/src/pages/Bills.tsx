import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

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

  useEffect(() => {
    axios.get("http://localhost:8000/api/bills/")
      .then(res => setBills(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleDelete = (id: number) => {
    axios.delete(`http://localhost:8000/api/bills/${id}/`)
      .then(() => setBills(bills.filter(b => b.id !== id)))
      .catch(err => console.error(err));
  };

  return (
    <div className="page-container">
      <h1>🧾 Bills</h1>
      <Link to="/payments/bills/new" className="btn-primary">+ Add New Bill</Link>

      <table className="styled-table">
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
          {bills.map(bill => (
            <tr key={bill.id}>
              <td>{bill.id}</td>
              <td>{bill.name}</td>
              <td>${bill.amount}</td>
              <td className={bill.status === "Paid" ? "status-paid" : "status-unpaid"}>
                {bill.status}
              </td>
              <td>{bill.due_date}</td>
              <td>
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
