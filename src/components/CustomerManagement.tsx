import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaUser, FaEnvelope, FaPhone, FaHistory } from 'react-icons/fa';
import '../styles/CustomerManagement.css';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  totalBookings: number;
  totalSpent: number;
  lastBooking: string;
  bookingHistory: Booking[];
}

interface Booking {
  _id: string;
  bookingReference: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  totalAmount: number;
  status: string;
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
  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
}

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [error, setError] = useState<string>('');
  const [statistics, setStatistics] = useState({
    totalCustomers: 0,
    totalRevenue: 0,
    averageBookingsPerCustomer: 0,
    topSpenders: []
  });

  // Debounce search to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      fetchCustomers(searchTerm);
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(search);
    return () => {
      debouncedSearch.cancel();
    };
  }, [search, debouncedSearch]);

  useEffect(() => {
    fetchCustomerStatistics();
  }, []);

  const fetchCustomers = async (searchTerm: string) => {
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams();
      if (searchTerm.trim()) {
        queryParams.append('search', searchTerm.trim());
      }

      const response = await fetch(`https://costasbackend.ultrawavelet.me/api/customers?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to fetch customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerStatistics = async () => {
    try {
      const response = await fetch('https://costasbackend.ultrawavelet.me/api/customers/statistics');
      if (!response.ok) {
        throw new Error('Failed to fetch customer statistics');
      }

      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching customer statistics:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const viewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  return (
    <div className="customer-management">
      <div className="customer-header">
        <h2>Customer Management</h2>
        <div className="search-filters">
          <div className="search-bar">
            <FaSearch />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      <div className="statistics-grid">
        <div className="stat-card">
          <h3>Total Customers</h3>
          <p>{statistics.totalCustomers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>₱{statistics.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Avg. Bookings/Customer</h3>
          <p>{Number(statistics.averageBookingsPerCustomer).toFixed(1)}</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading customers...</div>
      ) : customers.length === 0 ? (
        <div className="no-results">No customers found</div>
      ) : (
        <div className="customers-table-container">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Total Bookings</th>
                <th>Total Spent</th>
                <th>Last Booking</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id}>
                  <td>{`${customer.firstName} ${customer.lastName}`}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phoneNumber || 'N/A'}</td>
                  <td>{customer.totalBookings}</td>
                  <td>₱{customer.totalSpent.toLocaleString()}</td>
                  <td>{new Date(customer.lastBooking).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => viewCustomerDetails(customer)} title="View Details">
                        <FaHistory />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDetailsModal && selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Customer Details</h2>
              <button className="close-button" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>

            <div className="customer-details">
              <div className="customer-info">
                <div className="info-group">
                  <FaUser className="info-icon" />
                  <div>
                    <h3>Name</h3>
                    <p>{`${selectedCustomer.firstName} ${selectedCustomer.lastName}`}</p>
                  </div>
                </div>
                <div className="info-group">
                  <FaEnvelope className="info-icon" />
                  <div>
                    <h3>Email</h3>
                    <p>{selectedCustomer.email}</p>
                  </div>
                </div>
                <div className="info-group">
                  <FaPhone className="info-icon" />
                  <div>
                    <h3>Phone</h3>
                    <p>{selectedCustomer.phoneNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="booking-history">
                <h3>Booking History</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Room Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCustomer.bookingHistory.map((booking) => (
                      <tr key={booking._id}>
                        <td>{booking.bookingReference}</td>
                        <td>{new Date(booking.checkInDate).toLocaleDateString()}</td>
                        <td>{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                        <td>{booking.roomType}</td>
                        <td>₱{booking.totalAmount.toLocaleString()}</td>
                        <td>
                          <span className={`status-badge ${booking.status}`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
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

export default CustomerManagement; 