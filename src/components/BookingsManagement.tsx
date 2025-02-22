import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaFilter, FaPrint, FaEye, FaCheckCircle } from 'react-icons/fa';
import '../styles/BookingsManagement.css';

interface Booking {
  _id: string;
  bookingReference: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  totalAmount: number;
  status: string;
  paymentProofPath?: string;
  addOns: string[];
  adults: number;
  children: number;
  paymentMethod: string;
  numberOfGuests: number;
}

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
) {
  let timeout: NodeJS.Timeout;

  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };

  debounced.cancel = () => {
    clearTimeout(timeout);
  };

  return debounced;
}

const BookingsManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: ''
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [error, setError] = useState<string>('');

  // Debounce search to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      fetchBookings(searchTerm, filters);
    }, 500),
    [filters]
  );

  useEffect(() => {
    debouncedSearch(search);
    return () => {
      debouncedSearch.cancel();
    };
  }, [search, debouncedSearch]);

  useEffect(() => {
    fetchBookings(search, filters);
  }, [filters]);

  const fetchBookings = async (searchTerm: string, currentFilters: typeof filters) => {
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams();
      
      // Add search term if exists
      if (searchTerm.trim()) {
        queryParams.append('search', searchTerm.trim());
      }

      // Add status filter if selected
      if (currentFilters.status) {
        queryParams.append('status', currentFilters.status);
      }

      // Add date filters if both dates are selected
      if (currentFilters.startDate && currentFilters.endDate) {
        queryParams.append('startDate', currentFilters.startDate);
        queryParams.append('endDate', currentFilters.endDate);
      }

      const response = await fetch(`http://localhost:5000/api/bookings?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      startDate: '',
      endDate: ''
    });
    setSearch('');
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchBookings(search, filters);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handlePrint = (booking: Booking) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Booking Receipt - ${booking.bookingReference}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
                color: #333;
              }
              .print-header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #B8860B;
                padding-bottom: 20px;
              }
              .print-header h1 {
                color: #B8860B;
                margin: 0 0 10px 0;
                font-size: 32px;
              }
              .print-header p {
                color: #666;
                margin: 0;
                font-size: 16px;
              }
              .confirmation-icon {
                text-align: center;
                font-size: 48px;
                color: #B8860B;
                margin: 20px 0;
              }
              .reference-container {
                text-align: center;
                background: #f8f9fa;
                padding: 20px;
                border-radius: 12px;
                margin: 20px 0;
              }
              .reference-container h3 {
                color: #666;
                margin: 0 0 10px 0;
              }
              .reference-container strong {
                color: #B8860B;
                font-size: 24px;
              }
              .receipt {
                background: white;
                border-radius: 12px;
                margin-top: 30px;
              }
              .receipt-header {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 12px 12px 0 0;
              }
              .receipt-header h3 {
                margin: 0;
                color: #333;
              }
              .receipt-date {
                color: #666;
                margin: 5px 0 0 0;
              }
              .receipt-main {
                padding: 20px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
              }
              .receipt-section {
                margin-bottom: 20px;
              }
              .receipt-section h4 {
                color: #B8860B;
                margin: 0 0 15px 0;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
              }
              .receipt-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                font-size: 14px;
              }
              .receipt-row span:first-child {
                color: #666;
              }
              .receipt-row span:last-child {
                font-weight: 500;
              }
              .receipt-row.grand-total {
                font-size: 18px;
                font-weight: bold;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 2px solid #eee;
              }
              .receipt-footer {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 0 0 12px 12px;
                text-align: center;
              }
              .contact-info {
                color: #666;
                font-size: 14px;
              }
              .contact-info p {
                margin: 5px 0;
              }
              @media print {
                body {
                  padding: 0;
                }
                .receipt {
                  box-shadow: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="print-header">
              <h1>Costas De Liwa Resort</h1>
              <p>San Felipe, Zambales</p>
            </div>

            <div class="confirmation-icon">✓</div>
            
            <div class="reference-container">
              <h3>Booking Reference</h3>
              <strong>${booking.bookingReference}</strong>
            </div>

            <div class="receipt">
              <div class="receipt-header">
                <h3>BOOKING RECEIPT</h3>
                <p class="receipt-date">Date: ${new Date().toLocaleDateString()}</p>
              </div>

              <div class="receipt-main">
                <div class="receipt-section">
                  <h4>Room Details</h4>
                  <div class="receipt-row">
                    <span>Room Type</span>
                    <span>${booking.roomType}</span>
                  </div>
                  <div class="receipt-row">
                    <span>Check-in Date</span>
                    <span>${new Date(booking.checkInDate).toLocaleDateString()}</span>
                  </div>
                  <div class="receipt-row">
                    <span>Check-out Date</span>
                    <span>${new Date(booking.checkOutDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div class="receipt-section">
                  <h4>Guest Information</h4>
                  <div class="receipt-row">
                    <span>Guest Name</span>
                    <span>${booking.firstName} ${booking.lastName}</span>
                  </div>
                  <div class="receipt-row">
                    <span>Status</span>
                    <span>${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                  </div>
                </div>

                <div class="receipt-section">
                  <h4>Payment Summary</h4>
                  <div class="receipt-row grand-total">
                    <span>Total Amount</span>
                    <span>₱${booking.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div class="receipt-footer">
                <div class="contact-info">
                  <p>For assistance, contact us:</p>
                  <p>Phone: +63 XXX XXX XXXX</p>
                  <p>Email: info@costasdeliwa.com</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const viewBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  return (
    <div className="bookings-management">
      <div className="bookings-header">
        <h2>Manage Bookings</h2>
        <div className="search-filters">
          <div className="search-bar">
            <FaSearch />
            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="filters">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              placeholder="Start Date"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              placeholder="End Date"
              min={filters.startDate}
            />

            <button 
              className={`clear-filters ${!(search || filters.status || filters.startDate || filters.endDate) ? 'disabled' : ''}`}
              onClick={clearFilters}
              disabled={!(search || filters.status || filters.startDate || filters.endDate)}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="no-results">No bookings found</div>
      ) : (
        <div className="bookings-table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest Name</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Room Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.bookingReference}</td>
                  <td>{`${booking.firstName} ${booking.lastName}`}</td>
                  <td>{new Date(booking.checkInDate).toLocaleDateString()}</td>
                  <td>{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                  <td>{booking.roomType}</td>
                  <td>₱{booking.totalAmount.toLocaleString()}</td>
                  <td>
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                      className={`status-select ${booking.status}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => viewBookingDetails(booking)} title="View Details">
                        <FaEye />
                      </button>
                      <button onClick={() => handlePrint(booking)} title="Print Receipt">
                        <FaPrint />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDetailsModal && selectedBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="print-header">
              <h1>Costas De Liwa Resort</h1>
              <p>San Felipe, Zambales</p>
            </div>

            <div className="booking-status">
              <FaCheckCircle className="status-icon" />
              <h2>Booking {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}</h2>
            </div>
            
            <div className="reference-container">
              <h3>Booking Reference</h3>
              <strong>{selectedBooking.bookingReference}</strong>
            </div>

            <div className="receipt">
              <div className="receipt-header">
                <h3>BOOKING DETAILS</h3>
                <p className="receipt-date">Date: {new Date().toLocaleDateString()}</p>
              </div>

              <div className="receipt-main">
                <div className="receipt-section">
                  <h4>Room Details</h4>
                  <div className="receipt-row">
                    <span>Room Type</span>
                    <span>{selectedBooking.roomType}</span>
                  </div>
                  <div className="receipt-row">
                    <span>Check-in Date</span>
                    <span>{new Date(selectedBooking.checkInDate).toLocaleDateString()}</span>
                  </div>
                  <div className="receipt-row">
                    <span>Check-out Date</span>
                    <span>{new Date(selectedBooking.checkOutDate).toLocaleDateString()}</span>
                  </div>
                  <div className="receipt-row">
                    <span>Number of Nights</span>
                    <span>
                      {Math.ceil(
                        (new Date(selectedBooking.checkOutDate).getTime() - 
                        new Date(selectedBooking.checkInDate).getTime()) / 
                        (1000 * 60 * 60 * 24)
                      )}
                    </span>
                  </div>
                </div>

                <div className="receipt-section">
                  <h4>Guest Information</h4>
                  <div className="receipt-row">
                    <span>Guest Name</span>
                    <span>{selectedBooking.firstName} {selectedBooking.lastName}</span>
                  </div>
                  <div className="receipt-row">
                    <span>Email</span>
                    <span>{selectedBooking.email}</span>
                  </div>
                  <div className="receipt-row">
                    <span>Phone</span>
                    <span>{selectedBooking.phone || 'N/A'}</span>
                  </div>
                  <div className="receipt-row">
                    <span>Number of Guests</span>
                    <span>{selectedBooking.adults} Adults, {selectedBooking.children} Children</span>
                  </div>
                </div>

                {selectedBooking.addOns && selectedBooking.addOns.length > 0 && (
                  <div className="receipt-section">
                    <h4>Add-ons</h4>
                    {selectedBooking.addOns.map((addOn, index) => (
                      <div key={index} className="receipt-row">
                        <span>{addOn}</span>
                        <span>Included</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="receipt-section">
                  <h4>Payment Details</h4>
                  <div className="receipt-row">
                    <span>Payment Method</span>
                    <span>{selectedBooking.paymentMethod}</span>
                  </div>
                  <div className="receipt-row">
                    <span>Status</span>
                    <span className={`status-badge ${selectedBooking.status}`}>
                      {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                    </span>
                  </div>
                  <div className="receipt-row grand-total">
                    <span>Total Amount</span>
                    <span>₱{selectedBooking.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {selectedBooking.paymentProofPath && (
                  <div className="receipt-section payment-proof-section">
                    <h4>Payment Proof</h4>
                    <img
                      src={`http://localhost:5000${selectedBooking.paymentProofPath}`}
                      alt="Payment Proof"
                      className="payment-proof-image"
                    />
                  </div>
                )}
              </div>

              <div className="receipt-footer">
                <div className="contact-info">
                  <p>For assistance, contact us:</p>
                  <p>Phone: +63 XXX XXX XXXX</p>
                  <p>Email: info@costasdeliwa.com</p>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-primary" onClick={() => handlePrint(selectedBooking)}>
                Print Receipt
              </button>
              <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsManagement; 