import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const BillEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [bill, setBill] = useState<any>(null);
  const [status, setStatus] = useState("Unpaid");

  useEffect(() => {
    axios.get(`http://localhost:8000/api/bills/${id}/`)
      .then(res => {
        setBill(res.data);
        setStatus(res.data.status);
      })
      .catch(err => console.error(err));
  }, [id]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    axios.patch(`http://localhost:8000/api/bills/${id}/`, { status })
      .then(() => alert(`Bill ${id} updated!`))
      .catch(err => console.error(err));
  };

  if (!bill) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <h1>Edit Bill #{id}</h1>
      <form className="form-card" onSubmit={handleSave}>
        <label>Status</label>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
        </select>
        <button className="btn-primary">Save Changes</button>
      </form>
    </div>
  );
};

export default BillEdit;
