import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, X, MapPin, Package, Building2, Calendar } from 'lucide-react'

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
      case 'available': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Trip Management</h1>
          <button 
            type="button"
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Add New Trip
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="assigned">Assigned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Trips</label>
              <input
                type="text"
                placeholder="Search by location, cargo, or company..."
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold text-gray-900">Quick Add</h3>
            <p className="text-sm text-gray-600 mb-3">Create a new trip</p>
            <button 
              type="button"
              onClick={openAddModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
            >
              Add Trip
            </button>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold text-gray-900">Load Board</h3>
            <p className="text-sm text-gray-600 mb-3">Browse available loads</p>
            <button 
              type="button"
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
            >
              Browse Loads
            </button>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold text-gray-900">Route Planner</h3>
            <p className="text-sm text-gray-600 mb-3">Plan optimal routes</p>
            <button 
              type="button"
              className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700"
            >
              Plan Route
            </button>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
            <p className="text-sm text-gray-600 mb-3">View trip analytics</p>
            <button 
              type="button"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
            >
              View Stats
            </button>
          </div>
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                  {trip.status.replace('-', ' ').toUpperCase()}
                </span>
                <span className="text-lg font-bold text-green-600">${trip.rate.toLocaleString()}</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Route</p>
                  <p className="font-medium text-gray-900">
                    📍 {trip.startingPoint}
                  </p>
                  <p className="font-medium text-gray-900">
                    🏁 {trip.destination}
                  </p>
                  <p className="text-sm text-gray-500">{trip.distance} miles • {trip.estimatedDuration}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Cargo Details</p>
                  <p className="font-medium text-gray-900">📦 {trip.cargoType}</p>
                  <p className="text-sm text-gray-500">⚖️ {trip.weight.toLocaleString()} lbs</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-medium text-gray-900">🏢 {trip.company}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Pickup Date</p>
                    <p className="text-sm font-medium text-gray-900">📅 {trip.pickupDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivery Date</p>
                    <p className="text-sm font-medium text-gray-900">📅 {trip.deliveryDate}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => openViewModal(trip)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-1"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button 
                    type="button"
                    onClick={() => openEditModal(trip)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-1"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleDelete(trip.id)}
                    className="bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalMode === 'add' ? '➕ Add New Trip' : modalMode === 'edit' ? '✏️ Edit Trip' : '👁️ Trip Details'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Starting Point */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <MapPin size={16} />
                      Starting Point *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={modalMode === 'view'}
                      value={formData.startingPoint || ''}
                      onChange={(e) => setFormData({ ...formData, startingPoint: e.target.value })}
                      placeholder="e.g., Los Angeles, CA"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <MapPin size={16} />
                      Destination *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={modalMode === 'view'}
                      value={formData.destination || ''}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      placeholder="e.g., Phoenix, AZ"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  {/* Cargo Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Package size={16} />
                      Cargo Type *
                    </label>
                    <select
                      required
                      disabled={modalMode === 'view'}
                      value={formData.cargoType || ''}
                      onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">Select cargo type</option>
                      <option value="Electronics">📱 Electronics</option>
                      <option value="Automotive Parts">🔧 Automotive Parts</option>
                      <option value="Food & Beverages">🍎 Food & Beverages</option>
                      <option value="Construction Materials">🏗️ Construction Materials</option>
                      <option value="Chemicals">⚗️ Chemicals</option>
                      <option value="General Freight">📦 General Freight</option>
                    </select>
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (lbs) *
                    </label>
                    <input
                      type="number"
                      required
                      disabled={modalMode === 'view'}
                      value={formData.weight || ''}
                      onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                      placeholder="15000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Building2 size={16} />
                      Company *
                    </label>
                    <select
                      required
                      disabled={modalMode === 'view'}
                      value={formData.company || ''}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">Select company</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.name}>{company.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate ($) *
                    </label>
                    <input
                      type="number"
                      required
                      disabled={modalMode === 'view'}
                      value={formData.rate || ''}
                      onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                      placeholder="2500"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  {/* Distance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Distance (miles) *
                    </label>
                    <input
                      type="number"
                      required
                      disabled={modalMode === 'view'}
                      value={formData.distance || ''}
                      onChange={(e) => setFormData({ ...formData, distance: Number(e.target.value) })}
                      placeholder="372"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  {/* Estimated Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Duration *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={modalMode === 'view'}
                      value={formData.estimatedDuration || ''}
                      onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                      placeholder="6 hours"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  {/* Pickup Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar size={16} />
                      Pickup Date *
                    </label>
                    <input
                      type="date"
                      required
                      disabled={modalMode === 'view'}
                      value={formData.pickupDate || ''}
                      onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  {/* Delivery Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar size={16} />
                      Delivery Date *
                    </label>
                    <input
                      type="date"
                      required
                      disabled={modalMode === 'view'}
                      value={formData.deliveryDate || ''}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      required
                      disabled={modalMode === 'view'}
                      value={formData.status || 'available'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Trip['status'] })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="available">Available</option>
                      <option value="assigned">Assigned</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Driver (optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned Driver
                    </label>
                    <input
                      type="text"
                      disabled={modalMode === 'view'}
                      value={formData.driver || ''}
                      onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                      placeholder="Driver name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      disabled={modalMode === 'view'}
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional trip notes..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {modalMode !== 'view' && (
                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🤝 Partner Companies Offering Loads</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <div key={company.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">🏢 {company.name}</h3>
                  <div className="flex items-center">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm text-gray-600 ml-1">{company.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">📊 {company.totalLoads} loads completed</p>
                <p className="text-sm text-gray-500 mb-3">📧 {company.contactInfo}</p>
                <div className="space-y-2">
                  <button 
                    type="button"
                    className="w-full bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-sm hover:bg-blue-200"
                  >
                    📋 View Available Loads
                  </button>
                  <button 
                    type="button"
                    className="w-full bg-green-100 text-green-700 py-2 px-3 rounded-md text-sm hover:bg-green-200"
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
  );
}