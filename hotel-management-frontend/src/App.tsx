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
import CreateTask from './pages/CreateTask';
import TaskList from './pages/TaskList';
import Planning from './pages/Planning';
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
            <Route path="create-task" element={<CreateTask />} />
            <Route path="/task-list" element={<TaskList />} />
            <Route path="/planning" element={<Planning />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
