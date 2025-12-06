import { useState, useEffect } from "react";
import axios from "axios";

interface Reservation {
  id: number;
  user: number;
  user_name?: string; // optional, populated after fetching user info
  date: string;
}

const BillCreate = () => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [room, setRoom] = useState<number>(0);
  
  const today = new Date();
  const defaultDueDate = new Date();
  defaultDueDate.setMonth(defaultDueDate.getMonth() + 1);

  const [dueDate, setDueDate] = useState(
    defaultDueDate.toISOString().split("T")[0]
  );

  const [taxes, setTaxes] = useState(21);

  const [reservationId, setReservationId] = useState<number | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  

  // Load reservations on mount
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/reservations/")
      .then((res) => {
        setReservations(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    axios
      .post("http://localhost:8000/api/bills/", {
        name,
        amount,
        room,
        due_date: dueDate,
        taxes,
        status: "Unpaid",
        reservation: reservationId, 
      })
      .then(() => alert("Bill created!"))
      .catch((err) => console.error(err));
  };

  return (
    <div className="page-container">
      <h1>Create New Bill</h1>
      <form className="form-card" onSubmit={handleSubmit}>

        {/* Reservation dropdown */}
        <label>Reservation (optional)</label>
        <select
          value={reservationId ?? ""}
          onChange={(e) => setReservationId(Number(e.target.value))}
        >
          <option value="">-- No reservation --</option>
          {reservations.map((r) => (
            <option key={r.id} value={r.id}>
              Reservation #{r.id} — {r.date}
            </option>
          ))}
        </select>

        <label>Guest</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Total Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
        />

        <label>Room</label>
        <input
          type="number"
          value={room}
          onChange={(e) => setRoom(Number(e.target.value))}
          required
        />

        <label>Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
          min={today.toISOString().split("T")[0]}  // prevents past dates
        />

        <label>Taxes</label>
        <input
          type="number"
          value={taxes}
          min={0}
          onChange={(e) => setTaxes(Number(e.target.value))}
          required
        />

        <button className="btn-primary">Create Bill</button>
      </form>
    </div>
  );
};

export default BillCreate;
