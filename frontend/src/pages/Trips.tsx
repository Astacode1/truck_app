import { useState, useEffect } from 'react'
import { 
  RiAddFill as Plus, 
  RiEdit2Fill as Edit2, 
  RiDeleteBin6Fill as Trash2, 
  RiEyeFill as Eye, 
  RiCloseFill as X, 
  RiMapPinFill as MapPin, 
  RiInboxFill as Package, 
  RiBuildingFill as Building2, 
  RiCalendarFill as Calendar 
} from 'react-icons/ri'

interface Trip {
  id: string
  startingPoint: string
  destination: string
  cargoType: string
  weight: number
  company: string
  rate: number
  distance: number
  estimatedDuration: string
  status: 'available' | 'assigned' | 'in-progress' | 'completed'
  pickupDate: string
  deliveryDate: string
  driver?: string
  notes?: string
}

export default function Trips() {
  // Default trips data
  const defaultTrips: Trip[] = [
    {
      id: '1',
      startingPoint: 'Los Angeles, CA',
      destination: 'Phoenix, AZ',
      cargoType: 'Electronics',
      weight: 15000,
      company: 'TechCorp Logistics',
      rate: 2500,
      distance: 372,
      estimatedDuration: '6 hours',
      status: 'available',
      pickupDate: '2025-09-25',
      deliveryDate: '2025-09-26'
    },
    {
      id: '2',
      startingPoint: 'Houston, TX',
      destination: 'Dallas, TX',
      cargoType: 'Automotive Parts',
      weight: 22000,
      company: 'AutoFreight Inc',
      rate: 1800,
      distance: 239,
      estimatedDuration: '4 hours',
      status: 'in-progress',
      pickupDate: '2025-09-23',
      deliveryDate: '2025-09-24'
    },
    {
      id: '3',
      startingPoint: 'Miami, FL',
      destination: 'Atlanta, GA',
      cargoType: 'Food & Beverages',
      weight: 18500,
      company: 'Fresh Foods Transport',
      rate: 3200,
      distance: 663,
      estimatedDuration: '10 hours',
      status: 'available',
      pickupDate: '2025-09-26',
      deliveryDate: '2025-09-27'
    }
  ]

  // Load trips from localStorage or use default data
  const loadTripsFromStorage = (): Trip[] => {
    try {
      const savedTrips = localStorage.getItem('truckManagement_trips');
      if (savedTrips) {
        return JSON.parse(savedTrips);
      }
      return defaultTrips;
    } catch (error) {
      console.error('Error loading trips from localStorage:', error);
      return defaultTrips;
    }
  };

  const [trips, setTrips] = useState<Trip[]>(loadTripsFromStorage)

  // Save trips to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('truckManagement_trips', JSON.stringify(trips));
    } catch (error) {
      console.error('Error saving trips to localStorage:', error);
    }
  }, [trips]);

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add')
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [formData, setFormData] = useState<Partial<Trip>>({
    startingPoint: '',
    destination: '',
    cargoType: '',
    weight: 0,
    company: '',
    rate: 0,
    distance: 0,
    estimatedDuration: '',
    status: 'available',
    pickupDate: '',
    deliveryDate: '',
    driver: '',
    notes: ''
  })

  const companies = [
    { id: '1', name: 'TechCorp Logistics', rating: 4.8, totalLoads: 150, contactInfo: 'contact@techcorp.com' },
    { id: '2', name: 'AutoFreight Inc', rating: 4.5, totalLoads: 89, contactInfo: 'logistics@autofreight.com' },
    { id: '3', name: 'Fresh Foods Transport', rating: 4.9, totalLoads: 200, contactInfo: 'dispatch@freshfoods.com' },
    { id: '4', name: 'BuildMat Haulers', rating: 4.3, totalLoads: 75, contactInfo: 'ops@buildmat.com' },
    { id: '5', name: 'ChemSafe Logistics', rating: 4.7, totalLoads: 120, contactInfo: 'safety@chemsafe.com' }
  ]

  const openAddModal = () => {
    setModalMode('add')
    setFormData({
      startingPoint: '',
      destination: '',
      cargoType: '',
      weight: 0,
      company: '',
      rate: 0,
      distance: 0,
      estimatedDuration: '',
      status: 'available',
      pickupDate: '',
      deliveryDate: '',
      driver: '',
      notes: ''
    })
    setShowModal(true)
  }

  const openEditModal = (trip: Trip) => {
    setModalMode('edit')
    setSelectedTrip(trip)
    setFormData(trip)
    setShowModal(true)
  }

  const openViewModal = (trip: Trip) => {
    setModalMode('view')
    setSelectedTrip(trip)
    setFormData(trip)
    setShowModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (modalMode === 'add') {
      const newTrip: Trip = {
        id: String(Date.now()),
        ...formData as Trip
      }
      setTrips([...trips, newTrip])
    } else if (modalMode === 'edit' && selectedTrip) {
      setTrips(trips.map(trip => 
        trip.id === selectedTrip.id ? { ...trip, ...formData } : trip
      ))
    }
    
    setShowModal(false)
    setSelectedTrip(null)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      setTrips(trips.filter(trip => trip.id !== id))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': 
        return {
          bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#10b981'
        };
      case 'assigned': 
        return {
          bg: 'linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(249, 115, 22, 0.2) 100%)',
          border: '1px solid rgba(251, 146, 60, 0.4)',
          color: '#fb923c'
        };
      case 'in-progress': 
        return {
          bg: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(129, 140, 248, 0.2) 100%)',
          border: '1px solid rgba(34, 211, 238, 0.4)',
          color: '#22d3ee'
        };
      case 'completed': 
        return {
          bg: 'linear-gradient(135deg, rgba(148, 163, 184, 0.2) 0%, rgba(100, 116, 139, 0.2) 100%)',
          border: '1px solid rgba(148, 163, 184, 0.4)',
          color: '#94a3b8'
        };
      default: 
        return {
          bg: 'linear-gradient(135deg, rgba(148, 163, 184, 0.2) 0%, rgba(100, 116, 139, 0.2) 100%)',
          border: '1px solid rgba(148, 163, 184, 0.4)',
          color: '#94a3b8'
        };
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}>
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
                <h1 className="text-3xl font-bold text-white tracking-tight">Trip Management</h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{
                  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(129, 140, 248, 0.2) 100%)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  color: '#22d3ee',
                  letterSpacing: '0.15em'
                }}>
                  ATONDA
                </span>
              </div>
              <p className="text-sm" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>Manage and track all trips</p>
            </div>
            <button 
              type="button"
              onClick={openAddModal}
              style={{
                background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                boxShadow: '0 4px 15px rgba(34, 211, 238, 0.4)'
              }}
              className="px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Plus size={20} />
              Add New Trip
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="mx-auto max-w-7xl">

        {/* Glassy Filters and Search */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(34, 211, 238, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }} className="p-6 rounded-2xl mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Filter by Status</label>
                <select style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: 'white'
                }} className="rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="assigned">Assigned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Search Trips</label>
              <input
                type="text"
                placeholder="Search by location, cargo, or company..."
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: 'white'
                }}
                className="rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-80 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(34, 211, 238, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }} className="p-4 rounded-xl text-center hover:scale-105 transition-transform">
            <h3 className="text-lg font-semibold text-white">Quick Add</h3>
            <p className="text-sm mb-3" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>Create a new trip</p>
            <button 
              type="button"
              onClick={openAddModal}
              style={{
                background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                boxShadow: '0 2px 10px rgba(34, 211, 238, 0.3)'
              }}
              className="px-4 py-2 rounded-lg text-sm text-white font-semibold hover:scale-105 transition-transform"
            >
              Add Trip
            </button>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }} className="p-4 rounded-xl text-center hover:scale-105 transition-transform">
            <h3 className="text-lg font-semibold text-white">Load Board</h3>
            <p className="text-sm mb-3" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>Browse available loads</p>
            <button 
              type="button"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
              }}
              className="px-4 py-2 rounded-lg text-sm text-white font-semibold hover:scale-105 transition-transform"
            >
              Browse Loads
            </button>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(129, 140, 248, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }} className="p-4 rounded-xl text-center hover:scale-105 transition-transform">
            <h3 className="text-lg font-semibold text-white">Route Planner</h3>
            <p className="text-sm mb-3" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>Plan optimal routes</p>
            <button 
              type="button"
              style={{
                background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
                boxShadow: '0 2px 10px rgba(129, 140, 248, 0.3)'
              }}
              className="px-4 py-2 rounded-lg text-sm text-white font-semibold hover:scale-105 transition-transform"
            >
              Plan Route
            </button>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(251, 146, 60, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }} className="p-4 rounded-xl text-center hover:scale-105 transition-transform">
            <h3 className="text-lg font-semibold text-white">Analytics</h3>
            <p className="text-sm mb-3" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>View trip analytics</p>
            <button 
              type="button"
              style={{
                background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                boxShadow: '0 2px 10px rgba(251, 146, 60, 0.3)'
              }}
              className="px-4 py-2 rounded-lg text-sm text-white font-semibold hover:scale-105 transition-transform"
            >
              View Stats
            </button>
          </div>
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {trips.map((trip) => {
            const statusStyle = getStatusColor(trip.status);
            return (
            <div key={trip.id} style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }} className="rounded-2xl p-6 hover:scale-105 transition-transform">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{
                  background: statusStyle.bg,
                  border: statusStyle.border,
                  color: statusStyle.color,
                  letterSpacing: '0.05em'
                }}>
                  {trip.status.replace('-', ' ').toUpperCase()}
                </span>
                <span className="text-xl font-black" style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>${trip.rate.toLocaleString()}</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold mb-1" style={{ 
                    color: 'rgba(148, 163, 184, 0.7)',
                    letterSpacing: '0.05em'
                  }}>ROUTE</p>
                  <div className="flex items-start gap-2 mb-1">
                    <span style={{ color: '#22d3ee' }}>📍</span>
                    <p className="font-semibold text-white text-sm">{trip.startingPoint}</p>
                  </div>
                  <div className="flex items-start gap-2 mb-2">
                    <span style={{ color: '#818cf8' }}>🏁</span>
                    <p className="font-semibold text-white text-sm">{trip.destination}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>
                    <span className="px-2 py-1 rounded" style={{
                      background: 'rgba(34, 211, 238, 0.1)',
                      border: '1px solid rgba(34, 211, 238, 0.2)',
                      color: '#22d3ee'
                    }}>🛣️ {trip.distance} mi</span>
                    <span className="px-2 py-1 rounded" style={{
                      background: 'rgba(129, 140, 248, 0.1)',
                      border: '1px solid rgba(129, 140, 248, 0.2)',
                      color: '#818cf8'
                    }}>⏱️ {trip.estimatedDuration}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-bold mb-1" style={{ 
                    color: 'rgba(148, 163, 184, 0.7)',
                    letterSpacing: '0.05em'
                  }}>CARGO DETAILS</p>
                  <p className="font-semibold text-white text-sm flex items-center gap-2">
                    <span style={{ color: '#fb923c' }}>📦</span>
                    {trip.cargoType}
                  </p>
                  <p className="text-xs mt-1 px-2 py-1 inline-block rounded" style={{ 
                    background: 'rgba(251, 146, 60, 0.1)',
                    border: '1px solid rgba(251, 146, 60, 0.2)',
                    color: '#fb923c'
                  }}>⚖️ {trip.weight.toLocaleString()} lbs</p>
                </div>
                
                <div>
                  <p className="text-xs font-bold mb-1" style={{ 
                    color: 'rgba(148, 163, 184, 0.7)',
                    letterSpacing: '0.05em'
                  }}>COMPANY</p>
                  <p className="font-semibold text-white text-sm flex items-center gap-2">
                    <span style={{ color: '#10b981' }}>🏢</span>
                    {trip.company}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 rounded-lg" style={{
                    background: 'rgba(34, 211, 238, 0.05)',
                    border: '1px solid rgba(34, 211, 238, 0.2)'
                  }}>
                    <p className="text-xs font-bold mb-1" style={{ color: '#22d3ee' }}>PICKUP</p>
                    <p className="text-xs font-semibold text-white">📅 {trip.pickupDate}</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{
                    background: 'rgba(129, 140, 248, 0.05)',
                    border: '1px solid rgba(129, 140, 248, 0.2)'
                  }}>
                    <p className="text-xs font-bold mb-1" style={{ color: '#818cf8' }}>DELIVERY</p>
                    <p className="text-xs font-semibold text-white">📅 {trip.deliveryDate}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 space-y-2" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => openViewModal(trip)}
                    style={{
                      background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                      boxShadow: '0 2px 10px rgba(34, 211, 238, 0.3)'
                    }}
                    className="flex-1 text-white py-2 px-4 rounded-lg text-sm font-bold hover:scale-105 transition-transform flex items-center justify-center gap-1"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button 
                    type="button"
                    onClick={() => openEditModal(trip)}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
                    }}
                    className="flex-1 text-white py-2 px-4 rounded-lg text-sm font-bold hover:scale-105 transition-transform flex items-center justify-center gap-1"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleDelete(trip.id)}
                    style={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      boxShadow: '0 2px 10px rgba(239, 68, 68, 0.3)'
                    }}
                    className="text-white py-2 px-4 rounded-lg text-sm font-bold hover:scale-105 transition-transform"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          )})}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)'
          }}>
            <div className="rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)',
              border: '1px solid rgba(34, 211, 238, 0.3)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
            }}>
              <div className="sticky top-0 px-6 py-4 flex justify-between items-center" style={{
                background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(129, 140, 248, 0.15) 100%)',
                borderBottom: '1px solid rgba(34, 211, 238, 0.2)'
              }}>
                <h2 className="text-2xl font-black" style={{
                  background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {modalMode === 'add' ? '➕ Add New Trip' : modalMode === 'edit' ? '✏️ Edit Trip' : '👁️ Trip Details'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5'
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Starting Point */}
                  <div>
                    <label className="block text-sm font-bold mb-2 flex items-center gap-2" style={{ 
                      color: '#22d3ee',
                      letterSpacing: '0.05em'
                    }}>
                      <MapPin size={16} />
                      STARTING POINT *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={modalMode === 'view'}
                      value={formData.startingPoint || ''}
                      onChange={(e) => setFormData({ ...formData, startingPoint: e.target.value })}
                      placeholder="e.g., Los Angeles, CA"
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        color: 'white',
                        focusRing: '2px solid #22d3ee'
                      }}
                    />
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="block text-sm font-bold mb-2 flex items-center gap-2" style={{ 
                      color: '#818cf8',
                      letterSpacing: '0.05em'
                    }}>
                      <MapPin size={16} />
                      DESTINATION *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={modalMode === 'view'}
                      value={formData.destination || ''}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      placeholder="e.g., Phoenix, AZ"
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        color: 'white'
                      }}
                    />
                  </div>

                  {/* Cargo Type */}
                  <div>
                    <label className="block text-sm font-bold mb-2 flex items-center gap-2" style={{ 
                      color: '#fb923c',
                      letterSpacing: '0.05em'
                    }}>
                      <Package size={16} />
                      CARGO TYPE *
                    </label>
                    <select
                      required
                      disabled={modalMode === 'view'}
                      value={formData.cargoType || ''}
                      onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        color: 'white'
                      }}
                    >
                      <option value="" style={{ background: '#1e293b' }}>Select cargo type</option>
                      <option value="Electronics" style={{ background: '#1e293b' }}>📱 Electronics</option>
                      <option value="Automotive Parts" style={{ background: '#1e293b' }}>🔧 Automotive Parts</option>
                      <option value="Food & Beverages" style={{ background: '#1e293b' }}>🍎 Food & Beverages</option>
                      <option value="Construction Materials" style={{ background: '#1e293b' }}>🏗️ Construction Materials</option>
                      <option value="Chemicals" style={{ background: '#1e293b' }}>⚗️ Chemicals</option>
                      <option value="General Freight" style={{ background: '#1e293b' }}>📦 General Freight</option>
                    </select>
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ 
                      color: '#10b981',
                      letterSpacing: '0.05em'
                    }}>
                      WEIGHT (LBS) *
                    </label>
                    <input
                      type="number"
                      required
                      disabled={modalMode === 'view'}
                      value={formData.weight || ''}
                      onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                      placeholder="15000"
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        color: 'white'
                      }}
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-sm font-bold mb-2 flex items-center gap-2" style={{ 
                      color: '#22d3ee',
                      letterSpacing: '0.05em'
                    }}>
                      <Building2 size={16} />
                      COMPANY *
                    </label>
                    <select
                      required
                      disabled={modalMode === 'view'}
                      value={formData.company || ''}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        color: 'white'
                      }}
                    >
                      <option value="" style={{ background: '#1e293b' }}>Select company</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.name} style={{ background: '#1e293b' }}>{company.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Rate */}
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ 
                      color: '#10b981',
                      letterSpacing: '0.05em'
                    }}>
                      RATE ($) *
                    </label>
                    <input
                      type="number"
                      required
                      disabled={modalMode === 'view'}
                      value={formData.rate || ''}
                      onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                      placeholder="2500"
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        color: 'white'
                      }}
                    />
                  </div>

                  {/* Distance */}
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ 
                      color: '#818cf8',
                      letterSpacing: '0.05em'
                    }}>
                      DISTANCE (MILES) *
                    </label>
                    <input
                      type="number"
                      required
                      disabled={modalMode === 'view'}
                      value={formData.distance || ''}
                      onChange={(e) => setFormData({ ...formData, distance: Number(e.target.value) })}
                      placeholder="372"
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        color: 'white'
                      }}
                    />
                  </div>

                  {/* Estimated Duration */}
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ 
                      color: '#fb923c',
                      letterSpacing: '0.05em'
                    }}>
                      ESTIMATED DURATION *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={modalMode === 'view'}
                      value={formData.estimatedDuration || ''}
                      onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                      placeholder="6 hours"
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        color: 'white'
                      }}
                    />
                  </div>

                  {/* Pickup Date */}
                  <div>
                    <label className="block text-sm font-bold mb-2 flex items-center gap-2" style={{ 
                      color: '#22d3ee',
                      letterSpacing: '0.05em'
                    }}>
                      <Calendar size={16} />
                      PICKUP DATE *
                    </label>
                    <input
                      type="date"
                      required
                      disabled={modalMode === 'view'}
                      value={formData.pickupDate || ''}
                      onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        color: 'white',
                        colorScheme: 'dark'
                      }}
                    />
                  </div>

                  {/* Delivery Date */}
                  <div>
                    <label className="block text-sm font-bold mb-2 flex items-center gap-2" style={{ 
                      color: '#818cf8',
                      letterSpacing: '0.05em'
                    }}>
                      <Calendar size={16} />
                      DELIVERY DATE *
                    </label>
                    <input
                      type="date"
                      required
                      disabled={modalMode === 'view'}
                      value={formData.deliveryDate || ''}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        color: 'white',
                        colorScheme: 'dark'
                      }}
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ 
                      color: '#10b981',
                      letterSpacing: '0.05em'
                    }}>
                      STATUS *
                    </label>
                    <select
                      required
                      disabled={modalMode === 'view'}
                      value={formData.status || 'available'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Trip['status'] })}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        color: 'white'
                      }}
                    >
                      <option value="available" style={{ background: '#1e293b' }}>Available</option>
                      <option value="assigned" style={{ background: '#1e293b' }}>Assigned</option>
                      <option value="in-progress" style={{ background: '#1e293b' }}>In Progress</option>
                      <option value="completed" style={{ background: '#1e293b' }}>Completed</option>
                    </select>
                  </div>

                  {/* Driver (optional) */}
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ 
                      color: '#fb923c',
                      letterSpacing: '0.05em'
                    }}>
                      ASSIGNED DRIVER
                    </label>
                    <input
                      type="text"
                      disabled={modalMode === 'view'}
                      value={formData.driver || ''}
                      onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                      placeholder="Driver name"
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        color: 'white'
                      }}
                    />
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-2" style={{ 
                      color: '#22d3ee',
                      letterSpacing: '0.05em'
                    }}>
                      NOTES
                    </label>
                    <textarea
                      disabled={modalMode === 'view'}
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional trip notes..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        color: 'white'
                      }}
                    />
                  </div>
                </div>

                {modalMode !== 'view' && (
                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.2) 0%, rgba(100, 116, 139, 0.2) 100%)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        color: '#94a3b8'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(34, 211, 238, 0.4)'
                      }}
                    >
                      {modalMode === 'add' ? 'Create Trip' : 'Save Changes'}
                    </button>
                  </div>
                )}

                {modalMode === 'view' && (
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(34, 211, 238, 0.4)'
                      }}
                    >
                      Close
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Remove the static form - it's now in the modal */}

        {/* Companies Section */}
        <div className="rounded-2xl shadow-xl p-6" style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(34, 211, 238, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <h2 className="text-2xl font-black mb-6" style={{
            background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>🤝 Partner Companies Offering Loads</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <div key={company.id} className="rounded-xl p-5 transition-all duration-300 hover:scale-105" style={{
                background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.08) 0%, rgba(129, 140, 248, 0.08) 100%)',
                border: '1px solid rgba(34, 211, 238, 0.2)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
              }}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <span style={{ color: '#10b981' }}>🏢</span>
                    {company.name}
                  </h3>
                  <div className="flex items-center px-2 py-1 rounded" style={{
                    background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(249, 115, 22, 0.2) 100%)',
                    border: '1px solid rgba(251, 146, 60, 0.3)'
                  }}>
                    <span style={{ color: '#fb923c' }}>⭐</span>
                    <span className="text-sm font-bold ml-1" style={{ color: '#fb923c' }}>{company.rating}</span>
                  </div>
                </div>
                <p className="text-sm mb-2 flex items-center gap-2" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>
                  <span style={{ color: '#22d3ee' }}>📊</span>
                  {company.totalLoads} loads completed
                </p>
                <p className="text-sm mb-4 flex items-center gap-2" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
                  <span style={{ color: '#818cf8' }}>📧</span>
                  {company.contactInfo}
                </p>
                <div className="space-y-2">
                  <button 
                    type="button"
                    className="w-full py-2 px-3 rounded-lg text-sm font-bold transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(129, 140, 248, 0.2) 100%)',
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                      color: '#22d3ee'
                    }}
                  >
                    📋 View Available Loads
                  </button>
                  <button 
                    type="button"
                    className="w-full py-2 px-3 rounded-lg text-sm font-bold transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10b981'
                    }}
                  >
                    📞 Contact Company
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}