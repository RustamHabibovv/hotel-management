import { Link } from "react-router-dom";
import "../styles/PaymentManagement.css";

const PaymentManagement = () => {
  return (
    <div className="subsystem-page">
      <div className="page-header">
        <h1>💳 Payment Management</h1>
        <p>Process payments and manage billing</p>
      </div>

      <div className="page-content grid-links">
        <Link to="/payments/all" className="info-card">
          <h2>Payments</h2>
          <p>View and manage all payment records.</p>
        </Link>

        <Link to="/payments/new" className="info-card">
          <h2>Start new payment</h2>
          <p>Record a new payment for a reservation.</p>
        </Link>

        <Link to="/payments/bills" className="info-card">
          <h2>Bills</h2>
          <p>Generate and view bills.</p>
        </Link>

      </div>
    </div>
  );
};

export default PaymentManagement;
