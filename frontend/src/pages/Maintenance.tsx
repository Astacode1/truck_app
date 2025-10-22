import { useState } from 'react';
import { useTranslation } from '../contexts/TranslationContext';

export default function Maintenance() {
  const { t } = useTranslation();
  // Sample truck maintenance data with expenses
  const [trucks, setTrucks] = useState([
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
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showEditTruckModal, setShowEditTruckModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Form state for adding expenses
  const [expenseFormData, setExpenseFormData] = useState({
    truckId: '',
    category: 'repair',
    date: new Date().toISOString().split('T')[0],
    description: '',
    cost: '',
    vendor: ''
  });

  // Form state for editing truck
  const [truckFormData, setTruckFormData] = useState({
    model: '',
    year: '',
    mileage: '',
    status: 'active',
    lastMaintenance: '',
    nextMaintenance: ''
  });

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle expense form input
  const handleExpenseInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle truck form input
  const handleTruckInputChange = (e) => {
    const { name, value } = e.target;
    setTruckFormData(prev => ({ ...prev, [name]: value }));
  };

  // Add new expense
  const handleAddExpense = (e) => {
    e.preventDefault();
    
    const newExpense = {
      date: expenseFormData.date,
      description: expenseFormData.description,
      cost: parseFloat(expenseFormData.cost),
      vendor: expenseFormData.vendor
    };

    setTrucks(prev => prev.map(truck => {
      if (truck.id === expenseFormData.truckId) {
        return {
          ...truck,
          expenses: {
            ...truck.expenses,
            [expenseFormData.category]: [...truck.expenses[expenseFormData.category], newExpense]
          }
        };
      }
      return truck;
    }));

    // Update selected truck if it's the one being modified
    if (selectedTruck.id === expenseFormData.truckId) {
      setSelectedTruck(prev => ({
        ...prev,
        expenses: {
          ...prev.expenses,
          [expenseFormData.category]: [...prev.expenses[expenseFormData.category], newExpense]
        }
      }));
    }

    showNotification('Expense added successfully!');
    setShowAddExpenseModal(false);
    
    // Reset form
    setExpenseFormData({
      truckId: '',
      category: 'repair',
      date: new Date().toISOString().split('T')[0],
      description: '',
      cost: '',
      vendor: ''
    });
  };

  // Delete expense
  const deleteExpense = (truckId, category, index) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      setTrucks(prev => prev.map(truck => {
        if (truck.id === truckId) {
          return {
            ...truck,
            expenses: {
              ...truck.expenses,
              [category]: truck.expenses[category].filter((_, i) => i !== index)
            }
          };
        }
        return truck;
      }));

      if (selectedTruck.id === truckId) {
        setSelectedTruck(prev => ({
          ...prev,
          expenses: {
            ...prev.expenses,
            [category]: prev.expenses[category].filter((_, i) => i !== index)
          }
        }));
      }

      showNotification('Expense deleted successfully');
    }
  };

  // Update truck status
  const updateTruckStatus = (truckId, newStatus) => {
    setTrucks(prev => prev.map(truck => 
      truck.id === truckId ? { ...truck, status: newStatus } : truck
    ));
    
    if (selectedTruck.id === truckId) {
      setSelectedTruck(prev => ({ ...prev, status: newStatus }));
    }
    
    showNotification(`Truck status updated to ${newStatus}`);
  };

  // Schedule maintenance
  const scheduleMaintenance = (truckId) => {
    const nextMaintenanceDate = new Date();
    nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + 3);
    
    setTrucks(prev => prev.map(truck => {
      if (truck.id === truckId) {
        return {
          ...truck,
          nextMaintenance: nextMaintenanceDate.toISOString().split('T')[0]
        };
      }
      return truck;
    }));

    if (selectedTruck.id === truckId) {
      setSelectedTruck(prev => ({
        ...prev,
        nextMaintenance: nextMaintenanceDate.toISOString().split('T')[0]
      }));
    }

    showNotification('Maintenance scheduled successfully!');
  };

  // Edit truck details
  const handleEditTruck = (truck) => {
    setTruckFormData({
      model: truck.model,
      year: truck.year.toString(),
      mileage: truck.mileage.toString(),
      status: truck.status,
      lastMaintenance: truck.lastMaintenance,
      nextMaintenance: truck.nextMaintenance
    });
    setShowEditTruckModal(true);
  };

  // Save truck edits
  const handleSaveTruckEdit = (e) => {
    e.preventDefault();
    
    setTrucks(prev => prev.map(truck => {
      if (truck.id === selectedTruck.id) {
        return {
          ...truck,
          model: truckFormData.model,
          year: parseInt(truckFormData.year),
          mileage: parseInt(truckFormData.mileage),
          status: truckFormData.status,
          lastMaintenance: truckFormData.lastMaintenance,
          nextMaintenance: truckFormData.nextMaintenance
        };
      }
      return truck;
    }));

    setSelectedTruck(prev => ({
      ...prev,
      model: truckFormData.model,
      year: parseInt(truckFormData.year),
      mileage: parseInt(truckFormData.mileage),
      status: truckFormData.status,
      lastMaintenance: truckFormData.lastMaintenance,
      nextMaintenance: truckFormData.nextMaintenance
    }));

    setShowEditTruckModal(false);
    showNotification('Truck details updated successfully!');
  };

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
          <h1 className="text-3xl font-bold text-gray-900">{t('maintenance.title')}</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
            📊 {t('maintenance.generateReport')}
          </button>
        </div>

        {/* Fleet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('maintenance.totalFleet')}</h3>
            <p className="text-3xl font-bold text-blue-600">{trucks.length}</p>
            <p className="text-sm text-gray-600">{t('maintenance.activeTrucks')}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('maintenance.monthlyExpenses')}</h3>
            <p className="text-3xl font-bold text-red-600">
              ${trucks.reduce((total, truck) => total + calculateTotalExpenses(truck), 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">{t('maintenance.allCategories')}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('maintenance.avgPerTruck')}</h3>
            <p className="text-3xl font-bold text-purple-600">
              ${Math.round(trucks.reduce((total, truck) => total + calculateTotalExpenses(truck), 0) / trucks.length).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">{t('maintenance.monthlyAverage')}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('maintenance.inMaintenance')}</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {trucks.filter(truck => truck.status === 'maintenance').length}
            </p>
            <p className="text-sm text-gray-600">{t('maintenance.currently')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Truck Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🚛 {t('maintenance.selectTruck')}</h2>
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
                        {truck.status === 'active' ? t('maintenance.active').toUpperCase() : 
                         truck.status === 'maintenance' ? t('maintenance.maintenanceStatus').toUpperCase() :
                         truck.status === 'inactive' ? t('maintenance.inactive').toUpperCase() : 
                         truck.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{truck.model} ({truck.year})</p>
                    <p className="text-sm text-gray-600">{truck.mileage.toLocaleString()} {t('maintenance.miles')}</p>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-lg font-bold text-green-600">
                        ${calculateTotalExpenses(truck).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{t('maintenance.totalMonthlyExpenses')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Categories */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">💰 {t('maintenance.expenseCategories')}</h2>
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
                      {getCategoryIcon(selectedExpenseType)} {selectedTruck.id} - {selectedExpenseType.charAt(0).toUpperCase() + selectedExpenseType.slice(1)} {t('maintenance.expenses')}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedTruck.model} • {t('maintenance.lastMaintenance')}: {selectedTruck.lastMaintenance}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ${calculateCategoryTotal(selectedTruck, selectedExpenseType).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">{t('maintenance.categoryTotal')}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {selectedTruck.expenses[selectedExpenseType].length > 0 ? (
                  <div className="space-y-4">
                    {selectedTruck.expenses[selectedExpenseType]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((expense, index) => (
                      <div key={index} className={`p-4 rounded-lg border bg-gradient-to-r ${getCategoryColor(selectedExpenseType)}`}>
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{expense.description}</h4>
                            <p className="text-sm text-gray-600 mt-1">📅 {expense.date}</p>
                            <p className="text-sm text-gray-600">🏢 {expense.vendor}</p>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <p className="text-xl font-bold text-gray-900">${expense.cost.toLocaleString()}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              expense.cost > 1000 ? 'bg-red-100 text-red-800' :
                              expense.cost > 500 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {expense.cost > 1000 ? t('maintenance.highCost') :
                               expense.cost > 500 ? t('maintenance.mediumCost') :
                               t('maintenance.lowCost')}
                            </span>
                            <button
                              onClick={() => deleteExpense(selectedTruck.id, selectedExpenseType, index)}
                              className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                              title={t('maintenance.deleteExpense')}
                            >
                              🗑️ {t('maintenance.delete')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">{t('maintenance.noExpenses')} {selectedExpenseType} {t('maintenance.expensesRecorded')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 {t('maintenance.expenseSummary')} {selectedTruck.id}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['repair', 'upkeep', 'miscellaneous', 'materials'].map((category) => (
                  <div 
                    key={category} 
                    className={`p-4 rounded-lg bg-gradient-to-r ${getCategoryColor(category)} cursor-pointer hover:shadow-lg transition-all border-2 ${
                      expandedCategory === category ? 'border-blue-500 shadow-lg scale-105' : 'border-transparent'
                    }`}
                    onClick={() => {
                      console.log('Clicked category:', category);
                      setExpandedCategory(expandedCategory === category ? null : category);
                    }}
                  >
                    <div className="text-center">
                      <p className="text-2xl mb-1">{getCategoryIcon(category)}</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${calculateCategoryTotal(selectedTruck, category).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600 capitalize font-semibold">{category}</p>
                      <p className="text-xs text-gray-500">
                        {selectedTruck.expenses[category].length} {t('maintenance.entries')}
                      </p>
                      <button className={`text-xs mt-2 px-3 py-1 rounded-full font-semibold transition-colors ${
                        expandedCategory === category 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-blue-600 border border-blue-600'
                      }`}>
                        {expandedCategory === category ? `▲ ${t('maintenance.hideDetails')}` : `▼ ${t('maintenance.showDetails')}`}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed Breakdown - Expandable */}
              {expandedCategory && (
                <div className="mt-6 border-t pt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    {getCategoryIcon(expandedCategory)}
                    <span className="capitalize">{expandedCategory}</span> - {t('maintenance.detailedBreakdown')}
                    <span className="ml-auto text-blue-600">
                      {t('maintenance.total')}: ${calculateCategoryTotal(selectedTruck, expandedCategory).toLocaleString()}
                    </span>
                  </h4>
                  
                  {selectedTruck.expenses[expandedCategory].length > 0 ? (
                    <div className="space-y-2">
                      {selectedTruck.expenses[expandedCategory]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((expense, index) => (
                        <div 
                          key={index} 
                          className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <span className="text-lg">{index + 1}.</span>
                              <div>
                                <p className="font-medium text-gray-900">{expense.description}</p>
                                <div className="flex gap-4 text-xs text-gray-600 mt-1">
                                  <span>📅 {expense.date}</span>
                                  <span>🏢 {expense.vendor}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                ${expense.cost.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {((expense.cost / calculateCategoryTotal(selectedTruck, expandedCategory)) * 100).toFixed(1)}% {t('maintenance.ofTotal')}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteExpense(selectedTruck.id, expandedCategory, index);
                              }}
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                              title="Delete expense"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {/* Total Row */}
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded border-2 border-blue-300 font-bold">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600">TOTAL</span>
                          <span className="text-gray-600 text-sm font-normal">
                            ({selectedTruck.expenses[expandedCategory].length} {selectedTruck.expenses[expandedCategory].length === 1 ? 'entry' : 'entries'})
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xl text-blue-600">
                            ${calculateCategoryTotal(selectedTruck, expandedCategory).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">No expenses in this category</p>
                  )}
                </div>
              )}
            </div>

            {/* Grand Total Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-lg p-6 mt-6 border-2 border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">💰 Grand Total Summary - {selectedTruck.id}</h3>
              <div className="space-y-3">
                {['repair', 'upkeep', 'miscellaneous', 'materials'].map((category) => {
                  const total = calculateCategoryTotal(selectedTruck, category);
                  const grandTotal = calculateTotalExpenses(selectedTruck);
                  const percentage = grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(1) : 0;
                  
                  return (
                    <div key={category} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCategoryIcon(category)}</span>
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">{category}</p>
                          <p className="text-xs text-gray-500">{selectedTruck.expenses[category].length} entries</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">${total.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">{percentage}% of total</p>
                      </div>
                    </div>
                  );
                })}
                
                {/* Grand Total */}
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md mt-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">💵</span>
                    <div>
                      <p className="font-bold text-white text-lg">{t('maintenance.grandTotal')}</p>
                      <p className="text-xs text-blue-100">{t('maintenance.allExpensesCombined')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      ${calculateTotalExpenses(selectedTruck).toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-100">
                      {String(Object.values(selectedTruck.expenses).reduce((sum: number, arr: any) => sum + arr.length, 0))} {t('maintenance.totalEntries')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* All Entries View - Complete Itemized List */}
            <div className="bg-white rounded-lg shadow-lg p-6 mt-6 border-t-4 border-blue-600">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">📋 {t('maintenance.allEntries')}</h3>
                <span className="text-sm text-gray-600">
                  {String(Object.values(selectedTruck.expenses).reduce((sum: number, arr: any) => sum + arr.length, 0))} {t('maintenance.totalEntries')}
                </span>
              </div>
              
              {/* All Categories Combined */}
              <div className="space-y-6">
                {['repair', 'upkeep', 'miscellaneous', 'materials'].map((category) => {
                  const categoryExpenses = selectedTruck.expenses[category];
                  if (categoryExpenses.length === 0) return null;
                  
                  return (
                    <div key={category} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          {getCategoryIcon(category)}
                          <span className="capitalize">{category}</span>
                        </h4>
                        <span className="text-sm font-bold text-blue-600">
                          ${calculateCategoryTotal(selectedTruck, category).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {categoryExpenses
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((expense, index) => (
                          <div 
                            key={index}
                            className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all"
                          >
                            <div className="flex-1">
                              <div className="flex items-start gap-2">
                                <span className="text-sm font-semibold text-gray-500 min-w-[30px]">
                                  #{index + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{expense.description}</p>
                                  <div className="flex flex-wrap gap-3 text-xs text-gray-600 mt-1">
                                    <span className="flex items-center gap-1">
                                      📅 {expense.date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      🏢 {expense.vendor}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      🏷️ <span className="capitalize">{category}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">
                                  ${expense.cost.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {((expense.cost / calculateTotalExpenses(selectedTruck)) * 100).toFixed(1)}% of total
                                </p>
                              </div>
                              <button
                                onClick={() => deleteExpense(selectedTruck.id, category, index)}
                                className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors flex-shrink-0"
                                title="Delete expense"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Category Subtotal */}
                      <div className="flex justify-between items-center mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <span className="text-sm font-semibold text-blue-900">
                          {category === 'repair' ? t('maintenance.repair') :
                           category === 'upkeep' ? t('maintenance.upkeep') :
                           category === 'miscellaneous' ? t('maintenance.miscellaneous') :
                           category === 'materials' ? t('maintenance.materials') :
                           category.charAt(0).toUpperCase() + category.slice(1)} {t('maintenance.subtotal')} ({categoryExpenses.length} {t('maintenance.entries')})
                        </span>
                        <span className="text-sm font-bold text-blue-900">
                          ${calculateCategoryTotal(selectedTruck, category).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
                
                {/* Final Grand Total */}
                <div className="border-t-2 border-gray-300 pt-4 mt-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">💰</span>
                      <div>
                        <p className="font-bold text-white text-lg">GRAND TOTAL - ALL CATEGORIES</p>
                        <p className="text-xs text-green-100">
                          {String(Object.values(selectedTruck.expenses).reduce((sum: number, arr: any) => sum + arr.length, 0))} total entries • {selectedTruck.id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white">
                        ${calculateTotalExpenses(selectedTruck).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add New Expense Form */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">➕ {t('maintenance.quickActions')}</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>➕</span> {t('maintenance.addExpense')}
            </button>
            <button
              onClick={() => handleEditTruck(selectedTruck)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <span>✏️</span> {t('maintenance.editTruck')}
            </button>
            <button
              onClick={() => scheduleMaintenance(selectedTruck.id)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <span>📅</span> {t('maintenance.scheduleMaintenance')}
            </button>
            {selectedTruck.status === 'active' ? (
              <button
                onClick={() => updateTruckStatus(selectedTruck.id, 'maintenance')}
                className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center gap-2"
              >
                <span>🔧</span> {t('maintenance.markInMaintenance')}
              </button>
            ) : (
              <button
                onClick={() => updateTruckStatus(selectedTruck.id, 'active')}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <span>✅</span> {t('maintenance.markActive')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white animate-fade-in`}>
          {notification.message}
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{t('maintenance.addNewExpense')}</h2>
            </div>
            
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('maintenance.truck')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="truckId"
                    value={expenseFormData.truckId}
                    onChange={handleExpenseInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('maintenance.selectTruck')}</option>
                    {trucks.map((truck) => (
                      <option key={truck.id} value={truck.id}>
                        {truck.id} - {truck.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('maintenance.category')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={expenseFormData.category}
                    onChange={handleExpenseInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="repair">🔧 {t('maintenance.repair')}</option>
                    <option value="upkeep">🛠️ {t('maintenance.upkeep')}</option>
                    <option value="miscellaneous">📋 {t('maintenance.miscellaneous')}</option>
                    <option value="materials">📦 {t('maintenance.materials')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('maintenance.date')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={expenseFormData.date}
                    onChange={handleExpenseInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('maintenance.cost')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="cost"
                    value={expenseFormData.cost}
                    onChange={handleExpenseInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('maintenance.description')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={expenseFormData.description}
                    onChange={handleExpenseInputChange}
                    placeholder={t('maintenance.descriptionPlaceholder')}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('maintenance.vendor')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="vendor"
                    value={expenseFormData.vendor}
                    onChange={handleExpenseInputChange}
                    placeholder={t('maintenance.vendorPlaceholder')}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('maintenance.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('maintenance.addExpense')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Truck Modal */}
      {showEditTruckModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{t('maintenance.editTruckDetails')} - {selectedTruck.id}</h2>
            </div>
            
            <form onSubmit={handleSaveTruckEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('maintenance.model')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={truckFormData.model}
                    onChange={handleTruckInputChange}
                    placeholder={t('maintenance.modelPlaceholder')}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('maintenance.year')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={truckFormData.year}
                    onChange={handleTruckInputChange}
                    placeholder="2020"
                    min="1990"
                    max="2030"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('maintenance.mileage')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="mileage"
                    value={truckFormData.mileage}
                    onChange={handleTruckInputChange}
                    placeholder="185000"
                    min="0"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('maintenance.status')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={truckFormData.status}
                    onChange={handleTruckInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">{t('maintenance.active')}</option>
                    <option value="maintenance">{t('maintenance.maintenanceStatus')}</option>
                    <option value="inactive">{t('maintenance.inactive')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('maintenance.lastMaintenance')}
                  </label>
                  <input
                    type="date"
                    name="lastMaintenance"
                    value={truckFormData.lastMaintenance}
                    onChange={handleTruckInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('maintenance.nextMaintenance')}
                  </label>
                  <input
                    type="date"
                    name="nextMaintenance"
                    value={truckFormData.nextMaintenance}
                    onChange={handleTruckInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditTruckModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('maintenance.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {t('maintenance.saveChanges')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
