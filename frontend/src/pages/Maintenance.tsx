import { useState } from 'react';

export default function Maintenance() {
  // Sample truck maintenance data with expenses
  const [trucks] = useState([
    {
      id: 'TRK-001',
      model: 'Volvo VNL 760',
      year: 2020,
      mileage: 185000,
      status: 'active',
      lastMaintenance: '2024-08-15',
      nextMaintenance: '2024-10-15',
      expenses: {
        repair: [
          { date: '2024-09-01', description: 'Engine overhaul', cost: 4500, vendor: 'Volvo Service Center' },
          { date: '2024-08-20', description: 'Brake pad replacement', cost: 320, vendor: 'AutoZone' },
          { date: '2024-07-15', description: 'Transmission repair', cost: 2800, vendor: 'Transmission Specialists' }
        ],
        upkeep: [
          { date: '2024-09-10', description: 'Oil change', cost: 180, vendor: 'Quick Lube' },
          { date: '2024-09-05', description: 'Tire rotation', cost: 75, vendor: 'Tire Plus' },
          { date: '2024-08-25', description: 'Air filter replacement', cost: 45, vendor: 'Parts Express' }
        ],
        miscellaneous: [
          { date: '2024-09-08', description: 'Truck wash and detailing', cost: 120, vendor: 'Clean Fleet Services' },
          { date: '2024-08-30', description: 'DOT inspection', cost: 95, vendor: 'Inspection Station' },
          { date: '2024-08-10', description: 'GPS system upgrade', cost: 250, vendor: 'Fleet Tech' }
        ],
        materials: [
          { date: '2024-09-12', description: 'Engine oil (5 gallons)', cost: 85, vendor: 'Bulk Oil Supply' },
          { date: '2024-09-01', description: 'Replacement filters', cost: 65, vendor: 'Filter King' },
          { date: '2024-08-28', description: 'Hydraulic fluid', cost: 40, vendor: 'Fluid Dynamics' }
        ]
      }
    },
    {
      id: 'TRK-002',
      model: 'Peterbilt 579',
      year: 2019,
      mileage: 220000,
      status: 'maintenance',
      lastMaintenance: '2024-09-10',
      nextMaintenance: '2024-11-10',
      expenses: {
        repair: [
          { date: '2024-09-10', description: 'Turbo replacement', cost: 3200, vendor: 'Peterbilt Service' },
          { date: '2024-08-15', description: 'Suspension repair', cost: 1800, vendor: 'Heavy Duty Repair' }
        ],
        upkeep: [
          { date: '2024-09-12', description: 'Scheduled maintenance', cost: 450, vendor: 'Fleet Maintenance' },
          { date: '2024-08-20', description: 'Tire replacement (6 tires)', cost: 1200, vendor: 'Commercial Tire' }
        ],
        miscellaneous: [
          { date: '2024-09-05', description: 'Interior cleaning', cost: 80, vendor: 'Detail Pro' },
          { date: '2024-08-25', description: 'Annual registration', cost: 150, vendor: 'DMV' }
        ],
        materials: [
          { date: '2024-09-11', description: 'Coolant and additives', cost: 95, vendor: 'Chemical Solutions' },
          { date: '2024-08-22', description: 'Windshield wiper blades', cost: 35, vendor: 'Auto Parts Store' }
        ]
      }
    },
    {
      id: 'TRK-003',
      model: 'Freightliner Cascadia',
      year: 2021,
      mileage: 145000,
      status: 'active',
      lastMaintenance: '2024-09-05',
      nextMaintenance: '2024-12-05',
      expenses: {
        repair: [
          { date: '2024-08-30', description: 'A/C compressor replacement', cost: 850, vendor: 'Climate Control Inc' },
          { date: '2024-07-20', description: 'Electrical system repair', cost: 420, vendor: 'Electrical Experts' }
        ],
        upkeep: [
          { date: '2024-09-05', description: 'Preventive maintenance', cost: 380, vendor: 'Freightliner Service' },
          { date: '2024-08-10', description: 'Fuel system cleaning', cost: 125, vendor: 'Fuel Tech' }
        ],
        miscellaneous: [
          { date: '2024-09-01', description: 'Driver comfort upgrades', cost: 200, vendor: 'Truck Accessories' },
          { date: '2024-08-18', description: 'Safety equipment check', cost: 75, vendor: 'Safety First' }
        ],
        materials: [
          { date: '2024-09-07', description: 'DEF fluid (20 gallons)', cost: 60, vendor: 'DEF Supply Co' },
          { date: '2024-08-25', description: 'Cabin air filters', cost: 25, vendor: 'Filter Express' }
        ]
      }
    }
  ]);

  const [selectedTruck, setSelectedTruck] = useState(trucks[0]);
  const [selectedExpenseType, setSelectedExpenseType] = useState('repair');

  const calculateTotalExpenses = (truck) => {
    const categories = ['repair', 'upkeep', 'miscellaneous', 'materials'];
    return categories.reduce((total, category) => {
      return total + truck.expenses[category].reduce((catTotal, expense) => catTotal + expense.cost, 0);
    }, 0);
  };

  const calculateCategoryTotal = (truck, category) => {
    return truck.expenses[category].reduce((total, expense) => total + expense.cost, 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border border-green-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'out_of_service': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'repair': return '🔧';
      case 'upkeep': return '🛠️';
      case 'miscellaneous': return '📋';
      case 'materials': return '📦';
      default: return '💰';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'repair': return 'from-red-50 via-red-50 to-red-100 border-red-200';
      case 'upkeep': return 'from-blue-50 via-blue-50 to-blue-100 border-blue-200';
      case 'miscellaneous': return 'from-purple-50 via-purple-50 to-purple-100 border-purple-200';
      case 'materials': return 'from-green-50 via-green-50 to-green-100 border-green-200';
      default: return 'from-gray-50 via-gray-50 to-gray-100 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Truck Maintenance & Expenses</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
            📊 Generate Report
          </button>
        </div>

        {/* Fleet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Fleet</h3>
            <p className="text-3xl font-bold text-blue-600">{trucks.length}</p>
            <p className="text-sm text-gray-600">Active Trucks</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Expenses</h3>
            <p className="text-3xl font-bold text-red-600">
              ${trucks.reduce((total, truck) => total + calculateTotalExpenses(truck), 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">All Categories</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Avg per Truck</h3>
            <p className="text-3xl font-bold text-purple-600">
              ${Math.round(trucks.reduce((total, truck) => total + calculateTotalExpenses(truck), 0) / trucks.length).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Monthly Average</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">In Maintenance</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {trucks.filter(truck => truck.status === 'maintenance').length}
            </p>
            <p className="text-sm text-gray-600">Currently</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Truck Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🚛 Select Truck</h2>
              <div className="space-y-4">
                {trucks.map((truck) => (
                  <div
                    key={truck.id}
                    onClick={() => setSelectedTruck(truck)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedTruck.id === truck.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-900">{truck.id}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(truck.status)}`}>
                        {truck.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{truck.model} ({truck.year})</p>
                    <p className="text-sm text-gray-600">{truck.mileage.toLocaleString()} miles</p>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-lg font-bold text-green-600">
                        ${calculateTotalExpenses(truck).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">Total Monthly Expenses</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Categories */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">💰 Expense Categories</h2>
              <div className="space-y-3">
                {['repair', 'upkeep', 'miscellaneous', 'materials'].map((category) => (
                  <div
                    key={category}
                    onClick={() => setSelectedExpenseType(category)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedExpenseType === category
                        ? `bg-gradient-to-r ${getCategoryColor(category)} border-current`
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getCategoryIcon(category)}</span>
                        <span className="font-medium text-gray-900 capitalize">{category}</span>
                      </div>
                      <span className="font-bold text-gray-900">
                        ${calculateCategoryTotal(selectedTruck, category).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 ml-7">
                      {selectedTruck.expenses[category].length} entries
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Expense View */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {getCategoryIcon(selectedExpenseType)} {selectedTruck.id} - {selectedExpenseType.charAt(0).toUpperCase() + selectedExpenseType.slice(1)} Expenses
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedTruck.model} • Last Maintenance: {selectedTruck.lastMaintenance}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ${calculateCategoryTotal(selectedTruck, selectedExpenseType).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Category Total</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {selectedTruck.expenses[selectedExpenseType].length > 0 ? (
                  <div className="space-y-4">
                    {selectedTruck.expenses[selectedExpenseType]
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((expense, index) => (
                      <div key={index} className={`p-4 rounded-lg border bg-gradient-to-r ${getCategoryColor(selectedExpenseType)}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{expense.description}</h4>
                            <p className="text-sm text-gray-600 mt-1">📅 {expense.date}</p>
                            <p className="text-sm text-gray-600">🏢 {expense.vendor}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900">${expense.cost.toLocaleString()}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              expense.cost > 1000 ? 'bg-red-100 text-red-800' :
                              expense.cost > 500 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {expense.cost > 1000 ? 'High Cost' :
                               expense.cost > 500 ? 'Medium Cost' :
                               'Low Cost'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No {selectedExpenseType} expenses recorded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Expense Summary for {selectedTruck.id}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['repair', 'upkeep', 'miscellaneous', 'materials'].map((category) => (
                  <div key={category} className={`p-4 rounded-lg bg-gradient-to-r ${getCategoryColor(category)}`}>
                    <div className="text-center">
                      <p className="text-2xl mb-1">{getCategoryIcon(category)}</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${calculateCategoryTotal(selectedTruck, category).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600 capitalize">{category}</p>
                      <p className="text-xs text-gray-500">
                        {selectedTruck.expenses[category].length} entries
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Add New Expense Form */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">➕ Add New Expense</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Truck</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {trucks.map((truck) => (
                  <option key={truck.id} value={truck.id}>{truck.id} - {truck.model}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="repair">🔧 Repair</option>
                <option value="upkeep">🛠️ Upkeep</option>
                <option value="miscellaneous">📋 Miscellaneous</option>
                <option value="materials">📦 Materials</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                placeholder="e.g., Brake pad replacement"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                Add Expense
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
