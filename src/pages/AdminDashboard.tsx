import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import BookingsManagement from '../components/BookingsManagement';
import CustomerManagement from '../components/CustomerManagement';

// Import icons from react-icons
import { FaHome, FaUsers, FaBookmark, FaChartBar, FaSignOutAlt, FaRobot } from 'react-icons/fa';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [statistics, setStatistics] = useState({
    roomTypeStats: {},
    monthlyRevenue: {},
    totalBookings: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated');
    if (!isAuthenticated) {
      navigate('/admin');
    }

    // Fetch statistics
    fetchStatistics();
  }, [navigate]);

  const fetchStatistics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings/statistics');
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    navigate('/admin');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="dashboard-overview">
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Bookings</h3>
                <p>{statistics.totalBookings}</p>
              </div>
              <div className="stat-card">
                <h3>Total Revenue</h3>
                <p>₱{statistics.totalRevenue?.toLocaleString()}</p>
              </div>
              <div className="stat-card">
                <h3>Most Booked Room</h3>
                <p>{getMostBookedRoom()}</p>
              </div>
              <div className="stat-card">
                <h3>Monthly Average</h3>
                <p>₱{calculateMonthlyAverage()}</p>
              </div>
            </div>

            <div className="stats-charts">
              <div className="chart-card">
                <h3>Room Type Distribution</h3>
                <div className="room-type-stats">
                  {Object.entries(statistics.roomTypeStats || {}).map(([type, count]) => (
                    <div key={type} className="stat-bar">
                      <div className="stat-label">{type}</div>
                      <div className="stat-bar-container">
                        <div 
                          className="stat-bar-fill" 
                          style={{ 
                            width: `${(Number(count) / statistics.totalBookings * 100)}%`
                          }}
                        />
                      </div>
                      <div className="stat-value">{count}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-card">
                <h3>Monthly Revenue</h3>
                <div className="monthly-revenue">
                  {Object.entries(statistics.monthlyRevenue || {}).map(([month, revenue]) => (
                    <div key={month} className="revenue-bar">
                      <div className="revenue-label">
                        {new Date(2024, Number(month)).toLocaleString('default', { month: 'short' })}
                      </div>
                      <div className="revenue-bar-container">
                        <div 
                          className="revenue-bar-fill" 
                          style={{ 
                            height: `${(Number(revenue) / Math.max(...Object.values(statistics.monthlyRevenue || {})) * 100)}%`
                          }}
                        />
                      </div>
                      <div className="revenue-value">₱{Number(revenue).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'bookings':
        return <BookingsManagement />;
      
      case 'customers':
        return <CustomerManagement />;
      
      case 'analytics':
        return (
          <div className="dashboard-section">
            <h2>Analytics</h2>
            <p>Coming soon...</p>
          </div>
        );

      case 'ai-knowledgebase':
        return (
          <div className="dashboard-section">
            <h2>AI Knowledgebase</h2>
            <div className="ai-knowledgebase">
              <div className="kb-section">
                <h3>Common Questions</h3>
                <div className="kb-content">
                  <p>Train the AI to answer common guest questions about:</p>
                  <ul>
                    <li>Room types and amenities</li>
                    <li>Booking policies</li>
                    <li>Check-in/out procedures</li>
                    <li>Payment methods</li>
                    <li>Cancellation policies</li>
                  </ul>
                </div>
              </div>
              <div className="kb-section">
                <h3>Response Management</h3>
                <div className="kb-content">
                  <p>Manage and customize AI responses for:</p>
                  <ul>
                    <li>Booking confirmations</li>
                    <li>Guest inquiries</li>
                    <li>Special requests</li>
                    <li>Emergency situations</li>
                  </ul>
                </div>
              </div>
              <div className="kb-section">
                <h3>Training Data</h3>
                <div className="kb-content">
                  <p>Upload and manage training data:</p>
                  <ul>
                    <li>FAQ documents</li>
                    <li>Policy documents</li>
                    <li>Guest feedback</li>
                    <li>Common scenarios</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Select a tab</div>;
    }
  };

  const getMostBookedRoom = () => {
    if (!statistics.roomTypeStats) return 'N/A';
    const entries = Object.entries(statistics.roomTypeStats);
    if (entries.length === 0) return 'N/A';
    return entries.reduce((a, b) => Number(b[1]) > Number(a[1]) ? b : a)[0];
  };

  const calculateMonthlyAverage = () => {
    if (!statistics.monthlyRevenue) return 0;
    const revenues = Object.values(statistics.monthlyRevenue);
    if (revenues.length === 0) return 0;
    const total = revenues.reduce((sum, revenue) => sum + Number(revenue), 0);
    return Math.round(total / revenues.length).toLocaleString();
  };

  return (
    <div className="admin-dashboard">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaHome /> Overview
          </button>
          <button
            className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <FaBookmark /> Bookings
          </button>
          <button
            className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <FaUsers /> Customers
          </button>
          <button
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <FaChartBar /> Analytics
          </button>
          <button
            className={`nav-item ${activeTab === 'ai-knowledgebase' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai-knowledgebase')}
          >
            <FaRobot /> AI Knowledgebase
          </button>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      <main className="dashboard-main">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard; 