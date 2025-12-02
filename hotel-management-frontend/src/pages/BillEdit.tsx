import { useParams } from "react-router-dom";
import { useState } from "react";
import "../styles/PaymentManagement.css";

const BillEdit = () => {
  const { id } = useParams();

  const [status, setStatus] = useState("Unpaid");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Bill ${id} updated!`);
  };

  return (
    <div className="page-container">
      <h1>Edit Bill #{id}</h1>

      <form className="form-card" onSubmit={handleSave}>
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
        </select>

        <button className="btn-primary">Save Changes</button>
      </form>
    </div>
  );
};

export default BillEdit;
