import { useState, useEffect } from 'react'
import { 
  RiAddFill as Plus, 
  RiEdit2Fill as Edit2, 
  RiDeleteBin6Fill as Trash2, 
  RiEyeFill as Eye, 
  RiCloseFill as X 
} from 'react-icons/ri'

interface Truck {
  id: number
  plateNumber: string
  make: string
  model: string
  year: number
  vin: string
  driver: string
  status: 'Active' | 'Inactive' | 'Maintenance'
  mileage: number
  lastService: string
  nextService: string
  registrationExp: string
  insuranceExp: string
}

export default function Trucks() {
  // Default trucks data
  const defaultTrucks: Truck[] = [
    {
      id: 1,
      plateNumber: 'ABC-123',
      make: 'Ford',
      model: 'Transit',
      year: 2023,
      vin: '1FTFW1ET5DKE12345',
      driver: 'John Smith',
      status: 'Active',
      mileage: 45000,
      lastService: '2024-08-15',
      nextService: '2024-11-15',
      registrationExp: '2025-06-30',
      insuranceExp: '2025-08-30'
    },
    {
      id: 2,
      plateNumber: 'XYZ-789',
      make: 'Freightliner',
      model: 'Cascadia',
      year: 2022,
      vin: '1FUJGHDV8NLAA1234',
      driver: 'Sarah Johnson',
      status: 'Active',
      mileage: 120000,
      lastService: '2024-09-01',
      nextService: '2024-12-01',
      registrationExp: '2025-04-15',
      insuranceExp: '2025-07-15'
    },
    {
      id: 3,
      plateNumber: 'LMN-456',
      make: 'Kenworth',
      model: 'T680',
      year: 2021,
      vin: '1XKYDP9X0MJ123456',
      driver: 'Unassigned',
      status: 'Maintenance',
      mileage: 185000,
      lastService: '2024-09-20',
      nextService: '2024-12-20',
      registrationExp: '2025-02-28',
      insuranceExp: '2025-05-30'
    }
  ]

  // Load trucks from localStorage or use default data
  const loadTrucksFromStorage = (): Truck[] => {
    try {
      const savedTrucks = localStorage.getItem('truckManagement_trucks');
      if (savedTrucks) {
        return JSON.parse(savedTrucks);
      }
      return defaultTrucks;
    } catch (error) {
      console.error('Error loading trucks from localStorage:', error);
      return defaultTrucks;
    }
  };

  const [trucks, setTrucks] = useState<Truck[]>(loadTrucksFromStorage)

  // Save trucks to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('truckManagement_trucks', JSON.stringify(trucks));
    } catch (error) {
      console.error('Error saving trucks to localStorage:', error);
    }
  }, [trucks]);

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add')
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null)
  const [formData, setFormData] = useState<Partial<Truck>>({
    plateNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    driver: '',
    status: 'Active',
    mileage: 0,
    lastService: '',
    nextService: '',
    registrationExp: '',
    insuranceExp: ''
  })

  const openAddModal = () => {
    setModalMode('add')
    setFormData({
      plateNumber: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      vin: '',
      driver: '',
      status: 'Active',
      mileage: 0,
      lastService: '',
      nextService: '',
      registrationExp: '',
      insuranceExp: ''
    })
    setShowModal(true)
  }

  const openEditModal = (truck: Truck) => {
    setModalMode('edit')
    setSelectedTruck(truck)
    setFormData(truck)
    setShowModal(true)
  }

  const openViewModal = (truck: Truck) => {
    setModalMode('view')
    setSelectedTruck(truck)
    setFormData(truck)
    setShowModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (modalMode === 'add') {
      const newTruck: Truck = {
        id: trucks.length + 1,
        ...formData as Truck
      }
      setTrucks([...trucks, newTruck])
    } else if (modalMode === 'edit' && selectedTruck) {
      setTrucks(trucks.map(truck => 
        truck.id === selectedTruck.id ? { ...truck, ...formData } : truck
      ))
    }
    
    setShowModal(false)
    setSelectedTruck(null)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this truck?')) {
      setTrucks(trucks.filter(truck => truck.id !== id))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Inactive':
        return 'bg-gray-100 text-gray-800'
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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
                <h1 className="text-3xl font-bold text-white tracking-tight">Trucks Management</h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{
                  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(129, 140, 248, 0.2) 100%)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  color: '#22d3ee',
                  letterSpacing: '0.15em'
                }}>
                  ATONDA
                </span>
              </div>
              <p className="text-sm" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>Manage your fleet of trucks</p>
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
              Add New Truck
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        {/* Glassy Table Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(34, 211, 238, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }} className="rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                    Plate Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                    Make & Model
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                    Mileage
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {trucks.map((truck) => (
                  <tr key={truck.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }} className="hover:bg-white hover:bg-opacity-5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                      {truck.plateNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'rgba(148, 163, 184, 0.9)' }}>
                      {truck.make} {truck.model} {truck.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'rgba(148, 163, 184, 0.9)' }}>
                      {truck.driver}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'rgba(148, 163, 184, 0.9)' }}>
                      {truck.mileage.toLocaleString()} mi
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span style={{
                        background: truck.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : truck.status === 'Maintenance' ? 'rgba(251, 146, 60, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                        color: truck.status === 'Active' ? '#10b981' : truck.status === 'Maintenance' ? '#fb923c' : 'rgba(148, 163, 184, 0.9)',
                        border: `1px solid ${truck.status === 'Active' ? 'rgba(16, 185, 129, 0.3)' : truck.status === 'Maintenance' ? 'rgba(251, 146, 60, 0.3)' : 'rgba(148, 163, 184, 0.3)'}`
                      }} className="px-3 py-1 text-xs font-semibold rounded-full">
                        {truck.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={() => openViewModal(truck)}
                          className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                          style={{ color: '#22d3ee' }}
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => openEditModal(truck)}
                          className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                          style={{ color: '#22d3ee' }}
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDelete(truck.id)}
                          className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                          style={{ color: '#fb923c' }}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Glassy Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(34, 211, 238, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }} className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 px-6 py-4 flex justify-between items-center" style={{ 
              background: 'rgba(15, 23, 42, 0.95)', 
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(34, 211, 238, 0.2)' 
            }}>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">
                  {modalMode === 'add' ? 'Add New Truck' : modalMode === 'edit' ? 'Edit Truck' : 'Truck Details'}
                </h2>
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{
                  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(129, 140, 248, 0.2) 100%)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  color: '#22d3ee',
                  letterSpacing: '0.1em'
                }}>
                  ATONDA
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                style={{ color: 'rgba(148, 163, 184, 0.8)' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plate Number */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#22d3ee' }}>
                    Plate Number *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === 'view'}
                    value={formData.plateNumber || ''}
                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                      color: 'white'
                    }}
                    className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                  />
                </div>

                {/* VIN */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#22d3ee' }}>
                    VIN *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === 'view'}
                    value={formData.vin || ''}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                {/* Make */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Make *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === 'view'}
                    value={formData.make || ''}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === 'view'}
                    value={formData.model || ''}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <input
                    type="number"
                    required
                    disabled={modalMode === 'view'}
                    value={formData.year || ''}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                {/* Driver */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Driver
                  </label>
                  <input
                    type="text"
                    disabled={modalMode === 'view'}
                    value={formData.driver || ''}
                    onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
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
                    value={formData.status || 'Active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Truck['status'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                {/* Mileage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mileage *
                  </label>
                  <input
                    type="number"
                    required
                    disabled={modalMode === 'view'}
                    value={formData.mileage || ''}
                    onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                {/* Last Service */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Service Date
                  </label>
                  <input
                    type="date"
                    disabled={modalMode === 'view'}
                    value={formData.lastService || ''}
                    onChange={(e) => setFormData({ ...formData, lastService: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                {/* Next Service */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Next Service Date
                  </label>
                  <input
                    type="date"
                    disabled={modalMode === 'view'}
                    value={formData.nextService || ''}
                    onChange={(e) => setFormData({ ...formData, nextService: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                {/* Registration Expiry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Expiry
                  </label>
                  <input
                    type="date"
                    disabled={modalMode === 'view'}
                    value={formData.registrationExp || ''}
                    onChange={(e) => setFormData({ ...formData, registrationExp: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                {/* Insurance Expiry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Expiry
                  </label>
                  <input
                    type="date"
                    disabled={modalMode === 'view'}
                    value={formData.insuranceExp || ''}
                    onChange={(e) => setFormData({ ...formData, insuranceExp: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
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
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    {modalMode === 'add' ? 'Add Truck' : 'Save Changes'}
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
    </div>
  )
}
