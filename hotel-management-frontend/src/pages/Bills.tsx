import { Link } from "react-router-dom";
import "../styles/PaymentManagement.css";

interface Bill {
  id: number;
  guest: string;
  total: number;
  status: "Paid" | "Unpaid";
  dueDate: string;
}

const dummyBills: Bill[] = [
  { id: 1, guest: "John Doe", total: 300, status: "Paid", dueDate: "2025-01-15" },
  { id: 2, guest: "Sarah Kim", total: 180, status: "Unpaid", dueDate: "2025-01-20" },
];

const Bills = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🧾 Bills</h1>
        <p>View and manage all bills</p>
      </div>

      <div className="top-actions">
        <Link to="/payments/bills/new" className="btn-primary">+ Add New Bill</Link>
      </div>

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
          {dummyBills.map(bill => (
            <tr key={bill.id}>
              <td>{bill.id}</td>
              <td>{bill.guest}</td>
              <td>${bill.total}</td>
              <td className={bill.status === "Paid" ? "status-paid" : "status-unpaid"}>
                {bill.status}
              </td>
              <td>{bill.dueDate}</td>
              <td>
                <Link to={`/payments/bills/${bill.id}`} className="table-btn edit">Edit</Link>
                <button className="table-btn delete">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Bills;
