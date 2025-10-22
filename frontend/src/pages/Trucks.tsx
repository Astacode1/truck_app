import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, X } from 'lucide-react'

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
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Trucks</h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Manage your fleet of trucks</p>
        </div>
        <button 
          type="button"
          onClick={openAddModal}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Truck
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plate Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Make & Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mileage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trucks.map((truck) => (
                <tr key={truck.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {truck.plateNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {truck.make} {truck.model} {truck.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {truck.driver}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {truck.mileage.toLocaleString()} mi
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 ${getStatusColor(truck.status)} text-xs rounded-full`}>
                      {truck.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                      type="button"
                      onClick={() => openViewModal(truck)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => openEditModal(truck)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDelete(truck.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Add New Truck' : modalMode === 'edit' ? 'Edit Truck' : 'Truck Details'}
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
                {/* Plate Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plate Number *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === 'view'}
                    value={formData.plateNumber || ''}
                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                {/* VIN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
