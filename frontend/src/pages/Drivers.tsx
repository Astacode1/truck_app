import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Drivers() {
  const navigate = useNavigate();
  // Initial default drivers data
  const defaultDrivers = [
    {
      id: 1,
      name: "John Martinez",
      licenseNumber: "DL123456789",
      phone: "(555) 123-4567",
      email: "john.martinez@email.com",
      status: "active",
      experience: "8 years",
      currentTruck: "TRK-001",
      location: "Los Angeles, CA",
      rating: 4.8,
      totalTrips: 342,
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      qualifications: [
        { type: "CDL Class A", issueDate: "2019-03-15", expiryDate: "2027-03-15", status: "valid" },
        { type: "Hazmat Endorsement", issueDate: "2020-01-10", expiryDate: "2026-01-10", status: "valid" },
        { type: "DOT Medical Certificate", issueDate: "2024-06-01", expiryDate: "2026-06-01", status: "valid" },
        { type: "Defensive Driving", issueDate: "2024-01-15", expiryDate: "2025-01-15", status: "expiring_soon" }
      ],
      emergencyContact: {
        name: "Maria Martinez",
        relationship: "Spouse",
        phone: "(555) 123-4568"
      }
    },
    {
      id: 2,
      name: "Sarah Johnson",
      licenseNumber: "DL987654321",
      phone: "(555) 234-5678",
      email: "sarah.johnson@email.com",
      status: "active",
      experience: "12 years",
      currentTruck: "TRK-003",
      location: "Phoenix, AZ",
      rating: 4.9,
      totalTrips: 587,
      profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b1c8?w=150&h=150&fit=crop&crop=face",
      qualifications: [
        { type: "CDL Class A", issueDate: "2015-08-20", expiryDate: "2027-08-20", status: "valid" },
        { type: "Passenger Endorsement", issueDate: "2018-04-12", expiryDate: "2026-04-12", status: "valid" },
        { type: "DOT Medical Certificate", issueDate: "2024-03-15", expiryDate: "2026-03-15", status: "valid" },
        { type: "Safety Training", issueDate: "2024-09-01", expiryDate: "2025-09-01", status: "valid" }
      ],
      emergencyContact: {
        name: "Robert Johnson",
        relationship: "Father",
        phone: "(555) 234-5679"
      }
    },
    {
      id: 3,
      name: "Mike Thompson",
      licenseNumber: "DL456789123",
      phone: "(555) 345-6789",
      email: "mike.thompson@email.com",
      status: "on_leave",
      experience: "5 years",
      currentTruck: "Unassigned",
      location: "Dallas, TX",
      rating: 4.6,
      totalTrips: 198,
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      qualifications: [
        { type: "CDL Class A", issueDate: "2021-11-30", expiryDate: "2029-11-30", status: "valid" },
        { type: "DOT Medical Certificate", issueDate: "2023-12-01", expiryDate: "2025-12-01", status: "valid" },
        { type: "First Aid Certification", issueDate: "2024-02-14", expiryDate: "2026-02-14", status: "valid" }
      ],
      emergencyContact: {
        name: "Linda Thompson",
        relationship: "Wife",
        phone: "(555) 345-6790"
      }
    }
  ];

  // Load drivers from localStorage or use default data
  const loadDriversFromStorage = () => {
    try {
      const savedDrivers = localStorage.getItem('truckManagement_drivers');
      if (savedDrivers) {
        return JSON.parse(savedDrivers);
      }
      return defaultDrivers;
    } catch (error) {
      console.error('Error loading drivers from localStorage:', error);
      return defaultDrivers;
    }
  };

  // Initialize state with data from localStorage
  const [drivers, setDrivers] = useState(loadDriversFromStorage);

  // Reload drivers from localStorage when component mounts or window gains focus
  useEffect(() => {
    const reloadDrivers = () => {
      const updated = loadDriversFromStorage();
      setDrivers(updated);
    };

    // Reload on mount
    reloadDrivers();

    // Reload when window gains focus (e.g., navigating back)
    window.addEventListener('focus', reloadDrivers);
    
    // Reload when visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        reloadDrivers();
      }
    });

    return () => {
      window.removeEventListener('focus', reloadDrivers);
      document.removeEventListener('visibilitychange', reloadDrivers);
    };
  }, []);

  // Save drivers to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('truckManagement_drivers', JSON.stringify(drivers));
    } catch (error) {
      console.error('Error saving drivers to localStorage:', error);
    }
  }, [drivers]);

  // State management
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showEditDriverModal, setShowEditDriverModal] = useState(false);
  const [showViewProfileModal, setShowViewProfileModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [notification, setNotification] = useState<any>(null);

  // Form data state for adding driver
  const [newDriverForm, setNewDriverForm] = useState({
    name: '',
    licenseNumber: '',
    phone: '',
    email: '',
    experience: '',
    location: '',
    cdlClass: '',
    cdlExpiry: '',
    dotMedicalExpiry: '',
    endorsement: '',
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: ''
  });

  // Form data state for editing driver
  const [editDriverForm, setEditDriverForm] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    status: 'active',
    currentTruck: ''
  });

  // Show notification
  const showNotification = (message: string, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle input change for new driver form
  const handleNewDriverInputChange = (e: any) => {
    const { name, value } = e.target;
    setNewDriverForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle input change for edit driver form
  const handleEditDriverInputChange = (e: any) => {
    const { name, value } = e.target;
    setEditDriverForm(prev => ({ ...prev, [name]: value }));
  };

  // Add new driver
  const handleAddDriver = (e: any) => {
    e.preventDefault();
    
    const newDriver: any = {
      id: drivers.length + 1,
      name: newDriverForm.name,
      licenseNumber: newDriverForm.licenseNumber,
      phone: newDriverForm.phone,
      email: newDriverForm.email,
      status: 'active',
      experience: newDriverForm.experience,
      currentTruck: 'Unassigned',
      location: newDriverForm.location,
      rating: 0,
      totalTrips: 0,
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      qualifications: [
        { 
          type: `CDL Class ${newDriverForm.cdlClass}`, 
          issueDate: new Date().toISOString().split('T')[0], 
          expiryDate: newDriverForm.cdlExpiry, 
          status: 'valid' 
        },
        { 
          type: "DOT Medical Certificate", 
          issueDate: new Date().toISOString().split('T')[0], 
          expiryDate: newDriverForm.dotMedicalExpiry, 
          status: 'valid' 
        }
      ],
      emergencyContact: {
        name: newDriverForm.emergencyName,
        relationship: newDriverForm.emergencyRelationship,
        phone: newDriverForm.emergencyPhone
      }
    };

    if (newDriverForm.endorsement) {
      newDriver.qualifications.push({
        type: newDriverForm.endorsement,
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0],
        status: 'valid'
      });
    }

    setDrivers(prev => [...prev, newDriver]);
    showNotification(`Driver ${newDriverForm.name} hired successfully!`);
    setShowAddDriverModal(false);
    
    // Reset form
    setNewDriverForm({
      name: '',
      licenseNumber: '',
      phone: '',
      email: '',
      experience: '',
      location: '',
      cdlClass: '',
      cdlExpiry: '',
      dotMedicalExpiry: '',
      endorsement: '',
      emergencyName: '',
      emergencyRelationship: '',
      emergencyPhone: ''
    });
  };

  // Edit driver
  const handleEditDriver = (driver: any) => {
    setSelectedDriver(driver);
    setEditDriverForm({
      name: driver.name,
      phone: driver.phone,
      email: driver.email,
      location: driver.location,
      status: driver.status,
      currentTruck: driver.currentTruck
    });
    setShowEditDriverModal(true);
  };

  // Save driver edits
  const handleSaveDriverEdit = (e: any) => {
    e.preventDefault();
    
    setDrivers(prev => prev.map(driver => {
      if (driver.id === selectedDriver.id) {
        return {
          ...driver,
          name: editDriverForm.name,
          phone: editDriverForm.phone,
          email: editDriverForm.email,
          location: editDriverForm.location,
          status: editDriverForm.status,
          currentTruck: editDriverForm.currentTruck
        };
      }
      return driver;
    }));

    showNotification(`Driver ${editDriverForm.name} updated successfully!`);
    setShowEditDriverModal(false);
    setSelectedDriver(null);
  };

  // Delete driver
  const handleDeleteDriver = (driverId: number, driverName: string) => {
    if (confirm(`Are you sure you want to remove ${driverName} from the system?`)) {
      setDrivers(prev => prev.filter(driver => driver.id !== driverId));
      showNotification(`Driver ${driverName} removed successfully`);
      setShowViewProfileModal(false);
    }
  };

  // View driver profile
  const handleViewProfile = (driver: any) => {
    // Navigate to driver profile page
    navigate(`/driver/${driver.id}`);
  };

  // Update driver status
  const updateDriverStatus = (driverId: number, newStatus: string) => {
    setDrivers(prev => prev.map(driver => 
      driver.id === driverId ? { ...driver, status: newStatus } : driver
    ));
    showNotification(`Driver status updated to ${newStatus}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualificationStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'expiring_soon': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get card color theme based on driver status and rating
  const getCardTheme = (driver: any) => {
    const { status, rating } = driver;
    
    if (status === 'active' && rating >= 4.8) {
      return {
        background: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50',
        border: 'border-emerald-200 hover:border-emerald-300',
        shadow: 'shadow-lg hover:shadow-emerald-200/50',
        glow: 'hover:shadow-2xl hover:shadow-emerald-500/20',
        accent: 'border-l-4 border-l-emerald-500'
      };
    } else if (status === 'active' && rating >= 4.5) {
      return {
        background: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
        border: 'border-blue-200 hover:border-blue-300',
        shadow: 'shadow-lg hover:shadow-blue-200/50',
        glow: 'hover:shadow-2xl hover:shadow-blue-500/20',
        accent: 'border-l-4 border-l-blue-500'
      };
    } else if (status === 'active') {
      return {
        background: 'bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50',
        border: 'border-cyan-200 hover:border-cyan-300',
        shadow: 'shadow-lg hover:shadow-cyan-200/50',
        glow: 'hover:shadow-2xl hover:shadow-cyan-500/20',
        accent: 'border-l-4 border-l-cyan-500'
      };
    } else if (status === 'on_leave') {
      return {
        background: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50',
        border: 'border-amber-200 hover:border-amber-300',
        shadow: 'shadow-lg hover:shadow-amber-200/50',
        glow: 'hover:shadow-2xl hover:shadow-amber-500/20',
        accent: 'border-l-4 border-l-amber-500'
      };
    } else {
      return {
        background: 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100',
        border: 'border-gray-200 hover:border-gray-300',
        shadow: 'shadow-lg hover:shadow-gray-200/50',
        glow: 'hover:shadow-2xl hover:shadow-gray-500/20',
        accent: 'border-l-4 border-l-gray-400'
      };
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}>
      {/* Notification */}
      {notification && (
        <div style={{
          background: notification.type === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }} className="fixed top-4 right-4 px-6 py-3 rounded-xl z-50 text-white animate-fade-in font-semibold">
          {notification.message}
        </div>
      )}

      {/* Professional Header */}
      <div style={{ 
        background: 'rgba(15, 23, 42, 0.8)', 
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(34, 211, 238, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }} className="mb-8">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Driver Management</h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{
                  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(129, 140, 248, 0.2) 100%)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  color: '#22d3ee',
                  letterSpacing: '0.15em'
                }}>
                  ATONDA
                </span>
              </div>
              <p className="text-sm" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>Manage your driver team</p>
            </div>
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => navigate('/driver/new')}
                style={{
                  background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
                  boxShadow: '0 4px 15px rgba(34, 211, 238, 0.4)'
                }}
                className="px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 hover:scale-105 transition-transform"
              >
                📸 Add Driver with Photo
              </button>
              <button 
                type="button"
                onClick={() => setShowAddDriverModal(true)}
                style={{
                  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(129, 140, 248, 0.2) 100%)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  color: '#22d3ee'
                }}
                className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
              >
                🚛 Quick Add Driver
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="mx-auto max-w-7xl">

        {/* Driver Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(34, 211, 238, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }} className="p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-white">Total Drivers</h3>
            <p className="text-2xl font-bold text-primary">{drivers.length}</p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }} className="p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-white">Active Drivers</h3>
            <p className="text-2xl font-bold" style={{ color: '#10b981' }}>
              {drivers.filter(d => d.status === 'active').length}
            </p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(251, 146, 60, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }} className="p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-white">On Leave</h3>
            <p className="text-2xl font-bold" style={{ color: '#fb923c' }}>
              {drivers.filter(d => d.status === 'on_leave').length}
            </p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(129, 140, 248, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }} className="p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-white">Avg Rating</h3>
            <p className="text-2xl font-bold" style={{ color: '#818cf8' }}>
              {(drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1)}
            </p>
          </div>
        </div>

        {/* Driver Profiles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {drivers.map((driver) => {
            const cardTheme = getCardTheme(driver);
            return (
              <div 
                key={driver.id} 
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(34, 211, 238, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                }}
                className="rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Holographic Profile Header */}
                <div className="flex items-start mb-6 relative z-10">
                  {/* Holographic Avatar Container */}
                  <div className="relative mr-6">
                    {/* Holographic Glow Effect */}
                    <div className="absolute inset-0 rounded-full animate-pulse" style={{
                      background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.3) 0%, rgba(129, 140, 248, 0.3) 50%, rgba(251, 146, 60, 0.3) 100%)',
                      filter: 'blur(20px)',
                      transform: 'scale(1.2)'
                    }}></div>
                    
                    {/* Rotating Holographic Ring */}
                    <div className="absolute inset-0 rounded-full" style={{
                      background: 'linear-gradient(135deg, transparent 0%, rgba(34, 211, 238, 0.5) 25%, transparent 50%, rgba(129, 140, 248, 0.5) 75%, transparent 100%)',
                      animation: 'spin 3s linear infinite',
                      padding: '3px'
                    }}>
                      <div className="w-full h-full rounded-full" style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                      }}></div>
                    </div>
                    
                    {/* Avatar Image with Holographic Border */}
                    <div className="relative" style={{
                      width: '96px',
                      height: '96px'
                    }}>
                      <img
                        src={driver.profileImage}
                        alt={driver.name}
                        className="rounded-full object-cover relative z-10"
                        style={{ 
                          width: '96px',
                          height: '96px',
                          border: '3px solid rgba(34, 211, 238, 0.4)',
                          boxShadow: '0 0 30px rgba(34, 211, 238, 0.5), inset 0 0 20px rgba(34, 211, 238, 0.2)'
                        }}
                      />
                      
                      {/* Status Indicator with Glow */}
                      <div style={{
                        background: driver.status === 'active' 
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                          : driver.status === 'on_leave' 
                          ? 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)' 
                          : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        boxShadow: driver.status === 'active' 
                          ? '0 0 20px rgba(16, 185, 129, 0.8), 0 0 40px rgba(16, 185, 129, 0.4)' 
                          : driver.status === 'on_leave'
                          ? '0 0 20px rgba(251, 146, 60, 0.8)'
                          : '0 0 20px rgba(239, 68, 68, 0.8)'
                      }} className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-3 border-gray-900 z-20 flex items-center justify-center ${driver.status === 'active' ? 'animate-pulse' : ''}`}>
                        <span className="text-white text-xs font-bold">
                          {driver.status === 'active' ? '✓' : driver.status === 'on_leave' ? '⏸' : '✕'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Driver Info */}
                  <div className="flex-1">
                    <div className="mb-3">
                      <h3 className="text-2xl font-bold text-white mb-1" style={{
                        textShadow: '0 0 20px rgba(34, 211, 238, 0.5)'
                      }}>{driver.name}</h3>
                      <p className="text-sm flex items-center gap-2" style={{ color: 'rgba(148, 163, 184, 0.9)' }}>
                        <span style={{
                          background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontWeight: '600'
                        }}>📍 {driver.location}</span>
                      </p>
                    </div>
                    
                    {/* Rating with Holographic Effect */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-full" style={{
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)',
                        border: '1px solid rgba(251, 191, 36, 0.3)',
                        boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)'
                      }}>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span 
                              key={i} 
                              className="text-base"
                              style={{
                                color: i < Math.floor(driver.rating) ? '#fbbf24' : 'rgba(148, 163, 184, 0.3)',
                                filter: i < Math.floor(driver.rating) ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))' : 'none'
                              }}
                            >
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span className="text-sm font-bold ml-2" style={{
                          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>{driver.rating}</span>
                      </div>
                      
                      <div className="px-3 py-1.5 rounded-full" style={{
                        background: 'rgba(34, 211, 238, 0.1)',
                        border: '1px solid rgba(34, 211, 238, 0.3)'
                      }}>
                        <span className="text-xs font-semibold text-primary">{driver.totalTrips} trips</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Driver Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(148, 163, 184, 0.2)'
                  }} className="rounded-lg p-3">
                    <p className="text-xs uppercase tracking-wide" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>License</p>
                    <p className="text-sm font-medium text-white">{driver.licenseNumber}</p>
                    <p className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>Valid CDL</p>
                  </div>
                  
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(148, 163, 184, 0.2)'
                  }} className="rounded-lg p-3">
                    <p className="text-xs uppercase tracking-wide" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>Experience</p>
                    <p className="text-sm font-medium text-white">{driver.experience}</p>
                    <p className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>Commercial driving</p>
                  </div>
                  
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(148, 163, 184, 0.2)'
                  }} className="rounded-lg p-3">
                    <p className="text-xs uppercase tracking-wide" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>Status</p>
                    <span style={{
                      background: driver.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : driver.status === 'on_leave' ? 'rgba(251, 146, 60, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: driver.status === 'active' ? '#10b981' : driver.status === 'on_leave' ? '#fb923c' : '#ef4444',
                      border: `1px solid ${driver.status === 'active' ? 'rgba(16, 185, 129, 0.3)' : driver.status === 'on_leave' ? 'rgba(251, 146, 60, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                    }} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {driver.status === 'active' ? '🟢 Active' : 
                       driver.status === 'on_leave' ? '🟡 On Leave' : '🔴 Inactive'}
                    </span>
                  </div>
                  
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(148, 163, 184, 0.2)'
                  }} className="rounded-lg p-3">
                    <p className="text-xs uppercase tracking-wide" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>Phone</p>
                    <p className="text-sm font-medium text-white">{driver.phone}</p>
                    <button 
                      type="button"
                      onClick={() => window.location.href = `tel:${driver.phone}`}
                      className="text-xs text-primary hover:text-primary-light transition-colors"
                    >
                      📞 Call
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 relative z-10">
                  <button 
                    type="button"
                    onClick={() => handleViewProfile(driver)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors shadow-lg hover:shadow-xl"
                  >
                    👁️ View
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleEditDriver(driver)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors shadow-lg hover:shadow-xl"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleDeleteDriver(driver.id, driver.name)}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors shadow-lg hover:shadow-xl"
                    title="Delete Driver"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Driver Modal */}
        {showAddDriverModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">🚛 Hire New Driver</h2>
              </div>
              
              <form onSubmit={handleAddDriver} className="p-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newDriverForm.name}
                        onChange={handleNewDriverInputChange}
                        placeholder="e.g., John Smith"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={newDriverForm.phone}
                        onChange={handleNewDriverInputChange}
                        placeholder="(555) 123-4567"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={newDriverForm.email}
                        onChange={handleNewDriverInputChange}
                        placeholder="john.smith@email.com"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        License Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={newDriverForm.licenseNumber}
                        onChange={handleNewDriverInputChange}
                        placeholder="DL123456789"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Years of Experience <span className="text-red-500">*</span>
                      </label>
                      <select 
                        name="experience"
                        value={newDriverForm.experience}
                        onChange={handleNewDriverInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select experience</option>
                        <option value="1-2 years">1-2 years</option>
                        <option value="3-5 years">3-5 years</option>
                        <option value="6-10 years">6-10 years</option>
                        <option value="10+ years">10+ years</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={newDriverForm.location}
                        onChange={handleNewDriverInputChange}
                        placeholder="e.g., Los Angeles, CA"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Qualifications */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Required Qualifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CDL Class <span className="text-red-500">*</span>
                      </label>
                      <select 
                        name="cdlClass"
                        value={newDriverForm.cdlClass}
                        onChange={handleNewDriverInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select CDL class</option>
                        <option value="A">Class A</option>
                        <option value="B">Class B</option>
                        <option value="C">Class C</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CDL Expiry Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="cdlExpiry"
                        value={newDriverForm.cdlExpiry}
                        onChange={handleNewDriverInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        DOT Medical Expiry <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dotMedicalExpiry"
                        value={newDriverForm.dotMedicalExpiry}
                        onChange={handleNewDriverInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Endorsements
                      </label>
                      <select 
                        name="endorsement"
                        value={newDriverForm.endorsement}
                        onChange={handleNewDriverInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select endorsement</option>
                        <option value="Hazmat">Hazmat</option>
                        <option value="Passenger">Passenger</option>
                        <option value="School Bus">School Bus</option>
                        <option value="Tanker">Tanker</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🚨 Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="emergencyName"
                        value={newDriverForm.emergencyName}
                        onChange={handleNewDriverInputChange}
                        placeholder="e.g., Jane Smith"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relationship <span className="text-red-500">*</span>
                      </label>
                      <select 
                        name="emergencyRelationship"
                        value={newDriverForm.emergencyRelationship}
                        onChange={handleNewDriverInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select relationship</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Parent">Parent</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Child">Child</option>
                        <option value="Friend">Friend</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="emergencyPhone"
                        value={newDriverForm.emergencyPhone}
                        onChange={handleNewDriverInputChange}
                        placeholder="(555) 123-4567"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddDriverModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ✅ Hire Driver
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Driver Modal */}
        {showEditDriverModal && selectedDriver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">✏️ Edit Driver - {selectedDriver.name}</h2>
              </div>
              
              <form onSubmit={handleSaveDriverEdit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editDriverForm.name}
                      onChange={handleEditDriverInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={editDriverForm.phone}
                      onChange={handleEditDriverInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editDriverForm.email}
                      onChange={handleEditDriverInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={editDriverForm.location}
                      onChange={handleEditDriverInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={editDriverForm.status}
                      onChange={handleEditDriverInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="on_leave">On Leave</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Truck
                    </label>
                    <input
                      type="text"
                      name="currentTruck"
                      value={editDriverForm.currentTruck}
                      onChange={handleEditDriverInputChange}
                      placeholder="TRK-001"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowEditDriverModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Profile Modal */}
        {showViewProfileModal && selectedDriver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedDriver.profileImage}
                    alt={selectedDriver.name}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-lg"
                  />
                  <div className="text-white">
                    <h2 className="text-2xl font-bold">{selectedDriver.name}</h2>
                    <p className="text-blue-100">{selectedDriver.location}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-300">⭐ {selectedDriver.rating}</span>
                      <span className="text-blue-100 ml-3">({selectedDriver.totalTrips} trips)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">License Number</p>
                      <p className="font-semibold text-gray-900">{selectedDriver.licenseNumber}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-semibold text-gray-900">{selectedDriver.phone}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-semibold text-gray-900">{selectedDriver.email}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Experience</p>
                      <p className="font-semibold text-gray-900">{selectedDriver.experience}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Current Truck</p>
                      <p className="font-semibold text-gray-900">{selectedDriver.currentTruck}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedDriver.status)}`}>
                        {selectedDriver.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Qualifications */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🏆 Qualifications</h3>
                  <div className="space-y-2">
                    {selectedDriver.qualifications.map((qual: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900">{qual.type}</p>
                          <p className="text-xs text-gray-600">
                            Issued: {qual.issueDate} • Expires: {qual.expiryDate}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getQualificationStatusColor(qual.status)}`}>
                          {qual.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🚨 Emergency Contact</h3>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="font-semibold text-gray-900">{selectedDriver.emergencyContact.name}</p>
                    <p className="text-sm text-gray-600">{selectedDriver.emergencyContact.relationship}</p>
                    <p className="text-sm text-gray-900 font-medium">{selectedDriver.emergencyContact.phone}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => handleDeleteDriver(selectedDriver.id, selectedDriver.name)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    🗑️ Remove Driver
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowViewProfileModal(false);
                      handleEditDriver(selectedDriver);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ✏️ Edit Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowViewProfileModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
