import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import MyReservations from './pages/MyReservations';
import ReservationDetail from './pages/ReservationDetail';
import BookNewReservation from './pages/BookNewReservation';
import BookRoomForm from './pages/BookRoomForm';
import UserManagement from './pages/UserManagement';
import ReservationManagement from './pages/ReservationManagement';
import RoomManagement from './pages/RoomManagement';
import WorkerManagement from './pages/WorkerManagement';
import PaymentManagement from './pages/PaymentManagement';
import PaymentList from './pages/PaymentList';
import PaymentStart from './pages/PaymentStart';
import Bills from './pages/Bills';
import BillEdit from './pages/BillEdit';
import BillCreate from './pages/BillCreate';
import './App.css';


function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/my-reservations" element={<MyReservations />} />
            <Route path="/my-reservations/:id" element={<ReservationDetail />} />
            <Route path="/book-new-reservation" element={<BookNewReservation />} />
            <Route path="/book-room" element={<BookRoomForm />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/reservations" element={<ReservationManagement />} />
            <Route path="/rooms" element={<RoomManagement />} />
            <Route path="/workers" element={<WorkerManagement />} />
            <Route path="/payments" element={<PaymentManagement />} />
            <Route path="/payments/all" element={<PaymentList />} />
            <Route path="/payments/new" element={<PaymentStart />} />
            <Route path="/payments/bills" element={<Bills />} />
            <Route path="/payments/bills/new" element={<BillCreate />} />
            <Route path="/payments/bills/:id" element={<BillEdit />} />

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
