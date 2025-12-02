import { useState } from "react";
import "../styles/PaymentManagement.css";

const BillCreate = () => {
  const [guest, setGuest] = useState("");
  const [total, setTotal] = useState<number>(0);
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Bill created! (Backend not integrated yet)");
  };

  return (
    <div className="page-container">
      <h1>Create New Bill</h1>

      <form className="form-card" onSubmit={handleSubmit}>
        <label>Guest</label>
        <input type="text" value={guest} onChange={(e) => setGuest(e.target.value)} required />

        <label>Total Amount</label>
        <input type="number" value={total} onChange={(e) => setTotal(Number(e.target.value))} required />

        <label>Due Date</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />

        <button className="btn-primary">Create Bill</button>
      </form>
    </div>
  );
};

export default BillCreate;
