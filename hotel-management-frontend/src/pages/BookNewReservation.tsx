import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import roomService, { type Room } from '../services/roomService';
import '../styles/BookNewReservation.css';

const BookNewReservation = () => {
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    roomType: 'all'
  });

  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async (withFilters = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build filters object
      const filters: any = {};
      
      if (withFilters) {
        // Only pass date filters if both dates are selected
        if (searchFilters.checkIn && searchFilters.checkOut) {
          filters.checkIn = searchFilters.checkIn;
          filters.checkOut = searchFilters.checkOut;
        }
        
        if (searchFilters.roomType && searchFilters.roomType !== 'all') {
          filters.roomType = searchFilters.roomType;
        }
      }
      
      const rooms = await roomService.getAvailableRooms(Object.keys(filters).length > 0 ? filters : undefined);
      
      // Apply client-side capacity filter
      let filtered = rooms.filter(room => room.isAvailable);
      if (withFilters && searchFilters.guests > 0) {
        filtered = filtered.filter(room => room.capacity >= searchFilters.guests);
      }
      
      setAllRooms(rooms);
      setFilteredRooms(filtered);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load available rooms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Fetch rooms with filters from backend
    fetchRooms(true);
  };

  const handleBookRoom = (room: Room) => {
    // Navigate to booking form with room data
    navigate('/book-room', { 
      state: { 
        room,
        checkIn: searchFilters.checkIn,
        checkOut: searchFilters.checkOut,
        guests: searchFilters.guests
      } 
    });
  };

  const calculateNights = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const nights = calculateNights(searchFilters.checkIn, searchFilters.checkOut);

  if (loading) {
    return (
      <div className="book-new-reservation">
        <div className="booking-header">
          <button className="back-button" onClick={() => navigate('/my-reservations')}>
            ← Back to My Reservations
          </button>
          <h1>🏨 Book a New Reservation</h1>
        </div>
        <div className="loading-container" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="loading-spinner">Loading available rooms...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="book-new-reservation">
        <div className="booking-header">
          <button className="back-button" onClick={() => navigate('/my-reservations')}>
            ← Back to My Reservations
          </button>
          <h1>🏨 Book a New Reservation</h1>
        </div>
        <div className="error-container" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#e74c3c', fontSize: '1.1rem' }}>{error}</p>
          <button 
            onClick={fetchRooms}
            style={{ 
              marginTop: '1rem', 
              padding: '0.75rem 1.5rem',
              backgroundColor: '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-new-reservation">
      <div className="booking-header">
        <button className="back-button" onClick={() => navigate('/my-reservations')}>
          ← Back to My Reservations
        </button>
        <h1>🏨 Book a New Reservation</h1>
        <p className="subtitle">Find your perfect room from our available accommodations</p>
      </div>

      {/* Search Filters */}
      <div className="search-section">
        <div className="search-card">
          <div className="search-row">
            <div className="search-field">
              <label htmlFor="checkIn">Check-in Date</label>
              <input
                type="date"
                id="checkIn"
                value={searchFilters.checkIn}
                onChange={(e) => setSearchFilters({ ...searchFilters, checkIn: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="search-field">
              <label htmlFor="checkOut">Check-out Date</label>
              <input
                type="date"
                id="checkOut"
                value={searchFilters.checkOut}
                onChange={(e) => setSearchFilters({ ...searchFilters, checkOut: e.target.value })}
                min={searchFilters.checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="search-field">
              <label htmlFor="guests">Number of Guests</label>
              <input
                type="number"
                id="guests"
                value={searchFilters.guests}
                onChange={(e) => setSearchFilters({ ...searchFilters, guests: parseInt(e.target.value) || 1 })}
                min="1"
                max="10"
              />
            </div>

            <div className="search-field">
              <label htmlFor="roomType">Room Type</label>
              <select
                id="roomType"
                value={searchFilters.roomType}
                onChange={(e) => setSearchFilters({ ...searchFilters, roomType: e.target.value })}
              >
                <option value="all">All Types</option>
                <option value="standard">Standard</option>
                <option value="deluxe">Deluxe</option>
                <option value="suite">Suite</option>
                <option value="executive">Executive</option>
                <option value="presidential">Presidential</option>
              </select>
            </div>

            <button className="search-button" onClick={handleSearch}>
              🔍 Search Rooms
            </button>
          </div>

          {nights > 0 && (
            <div className="search-info">
              <span className="info-text">
                📅 {nights} {nights === 1 ? 'night' : 'nights'} selected
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Rooms List */}
      <div className="rooms-section">
        <div className="section-header">
          <h2>Available Rooms ({filteredRooms.length})</h2>
        </div>

        {filteredRooms.length === 0 ? (
          <div className="no-rooms">
            <div className="no-rooms-icon">🔍</div>
            <h3>No rooms found</h3>
            <p>Try adjusting your search criteria to find available rooms</p>
          </div>
        ) : (
          <div className="rooms-grid">
            {filteredRooms.map((room) => (
              <div key={room.id} className="room-card">
                <div className="room-image">
                  <div style={{ 
                    width: '100%', 
                    height: '200px', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    color: 'white'
                  }}>
                    🏨
                  </div>
                  {!room.isAvailable && (
                    <div className="unavailable-badge">Not Available</div>
                  )}
                </div>

                <div className="room-content">
                  <div className="room-header">
                    <h3>{room.roomType}</h3>
                    <div className="room-number">Room {room.roomNumber}</div>
                  </div>

                  <p className="room-description">
                    {room.amenities || 'Comfortable room with modern amenities'}
                    {room.scenery && ` • ${room.scenery} view`}
                  </p>

                  <div className="room-details">
                    <div className="detail-item">
                      <span className="detail-icon">🛏️</span>
                      <span>{room.roomType}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">👥</span>
                      <span>Up to {room.capacity} guests</span>
                    </div>
                    {room.scenery && (
                      <div className="detail-item">
                        <span className="detail-icon">🌅</span>
                        <span>{room.scenery}</span>
                      </div>
                    )}
                  </div>

                  <div className="room-amenities">
                    {room.amenities && room.amenities.split(',').slice(0, 4).map((amenity, index) => (
                      <span key={index} className="amenity-tag">
                        ✓ {amenity.trim()}
                      </span>
                    ))}
                  </div>

                  <div className="room-footer">
                    <div className="room-price">
                      <div className="price-per-night">
                        <span className="price-amount">${room.pricePerNight.toFixed(2)}</span>
                        <span className="price-label">/ night</span>
                      </div>
                      {nights > 0 && (
                        <div className="total-price">
                          Total: ${(room.pricePerNight * nights).toFixed(2)}
                        </div>
                      )}
                    </div>

                    <button
                      className="book-button"
                      onClick={() => handleBookRoom(room)}
                      disabled={!room.isAvailable}
                    >
                      {room.isAvailable ? '📝 Book Now' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookNewReservation;
