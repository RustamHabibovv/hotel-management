import { useState } from "react";
import "../styles/PaymentManagement.css";

interface Payment {
  id: number;
  guest: string;
  amount: number;
  method: string;
  date: string;
}

const dummyPayments: Payment[] = [
  { id: 1, guest: "John Doe", amount: 250, method: "Credit Card", date: "2025-01-12" },
  { id: 2, guest: "Sarah Kim", amount: 120, method: "Cash", date: "2025-01-15" }
];

const PaymentStart = () => {
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amount, setAmount] = useState("");

  const handleSubmit = () => {
    if (!selectedPaymentId) {
      alert("Select a payment first!");
      return;
    }

    alert(`Payment submitted:
      Payment ID: ${selectedPaymentId}
      Payment method: ${paymentMethod}
      Amount: ${amount}
    `);
  };

  return (
    <div className="page-container">
      <h1>💳 Start Payment</h1>
        <p>Choose bill to pay.</p>

      {/* Payment selection table */}
      <table className="styled-table clickable-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Guest</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {dummyPayments.map((payment) => (
            <tr 
              key={payment.id}
              className={selectedPaymentId === payment.id ? "selected-row" : ""}
              onClick={() => setSelectedPaymentId(payment.id)}
            >
              <td>{payment.id}</td>
              <td>{payment.guest}</td>
              <td>${payment.amount}</td>
              <td>{payment.method}</td>
              <td>{payment.date}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Payment method and amount inputs */}
      {selectedPaymentId && (
        <div className="payment-form">
          <h2>Complete Payment</h2>

          <label>Payment Method</label>
          <select 
            className="input-field"
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank">Online Banking</option>
          </select>

          <label>Amount to Pay</label>
          <input
            type="number"
            className="input-field"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button className="submit-btn" onClick={handleSubmit}>
            Submit Payment
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentStart;
