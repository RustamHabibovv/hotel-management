import { useEffect, useState } from 'react';
import axios from 'axios';

interface Bill {
  id: number;
  name: string;
  amount: number;
  room: number;
  due_date: string;
  taxes: number;
  status: string;
}

interface Payment {
  bill: number;
  amount: number;
  type: string;
  date: string;
  state: boolean;
}

const PaymentStart = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    axios
      .get<Bill[]>("http://localhost:8000/api/bills/")
      .then((res) => {
        const unpaid = res.data.filter((b) => b.status === "Unpaid");
        setBills(unpaid);
      })
      .catch((err) => console.error(err));
  }, []);

  const handlePayment = () => {
    if (!selectedBill) return alert("Select a bill!");

    const paymentData: Payment = {
      bill: selectedBill.id,
      amount,
      type: paymentMethod,
      date: new Date().toISOString().split("T")[0],
      state: true,
    };

    axios
      .post("http://localhost:8000/api/payments/", paymentData)
      .then(() => {
        axios
          .patch(`http://localhost:8000/api/bills/${selectedBill.id}/`, {
            status: "Paid",
          })
          .then(() => alert(`Payment completed for Bill #${selectedBill.id}`))
          .catch((err) => console.error(err));
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="page-container">
      <h1>💳 Start Payment</h1>

      <table className="styled-table clickable-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Guest</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill) => (
            <tr
              key={bill.id}
              onClick={() => {
                setSelectedBill(bill);
                setAmount(bill.amount);
              }}
              className={selectedBill?.id === bill.id ? "selected-row" : ""}
            >
              <td>{bill.id}</td>
              <td>{bill.name}</td>
              <td>${bill.amount}</td>
              <td>{bill.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedBill && (
        <div className="payment-form">
          <h3>Selected Bill #{selectedBill.id}</h3>

          <label>Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank">Online Banking</option>
          </select>

          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />

          <button onClick={handlePayment}>Submit Payment</button>
        </div>
      )}
    </div>
  );
};

export default PaymentStart;
