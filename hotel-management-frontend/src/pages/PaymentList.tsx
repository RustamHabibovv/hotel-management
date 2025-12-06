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

const PaymentList = () => {
  return (
    <div className="page-container">
      <h1>💳 All Payments</h1>

      <table className="styled-table">
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
          {dummyPayments.map(payment => (
            <tr key={payment.id}>
              <td>{payment.id}</td>
              <td>{payment.guest}</td>
              <td>${payment.amount}</td>
              <td>{payment.method}</td>
              <td>{payment.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentList;
