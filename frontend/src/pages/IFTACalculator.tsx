import { useState, useEffect } from 'react';

interface StateData {
  totalMiles: number;
  totalFuel: number;
  taxRate: number;
  taxOwed: number;
}

interface StateEntry {
  state: string;
  miles: number;
  fuelGallons: number;
}

interface CalculatorInputs {
  tripDate: string;
  truckId: string;
  startOdometer: number;
  endOdometer: number;
  routeDescription: string;
  stateEntries: StateEntry[];
}

export default function IFTACalculator() {
  // IFTA tax rates by state (rates per gallon as of 2024)
  const [stateTaxRates] = useState({
    'AL': 0.19, 'AK': 0.14, 'AZ': 0.19, 'AR': 0.2225, 'CA': 0.40, 'CO': 0.2025,
    'CT': 0.40, 'DE': 0.22, 'FL': 0.14, 'GA': 0.326, 'HI': 0.19, 'ID': 0.33,
    'IL': 0.454, 'IN': 0.54, 'IA': 0.315, 'KS': 0.27, 'KY': 0.236, 'LA': 0.20,
    'ME': 0.316, 'MD': 0.36, 'MA': 0.26, 'MI': 0.316, 'MN': 0.286, 'MS': 0.18,
    'MO': 0.17, 'MT': 0.278, 'NE': 0.295, 'NV': 0.274, 'NH': 0.237, 'NJ': 0.415,
    'NM': 0.188, 'NY': 0.45, 'NC': 0.38, 'ND': 0.23, 'OH': 0.47, 'OK': 0.19,
    'OR': 0.38, 'PA': 0.747, 'RI': 0.35, 'SC': 0.22, 'SD': 0.30, 'TN': 0.27,
    'TX': 0.20, 'UT': 0.295, 'VT': 0.30, 'VA': 0.204, 'WA': 0.494, 'WV': 0.356,
    'WI': 0.329, 'WY': 0.24, 'DC': 0.235
  });

  const [trips] = useState([
    {
      id: 'TRIP-001',
      date: '2024-09-20',
      truck: 'TRK-001',
      driver: 'John Smith',
      startOdometer: 185000,
      endOdometer: 185750,
      totalMiles: 750,
      fuelPurchased: 120,
      stateBreakdown: [
        { state: 'GA', miles: 250, fuelGallons: 40 },
        { state: 'SC', miles: 150, fuelGallons: 24 },
        { state: 'NC', miles: 350, fuelGallons: 56 }
      ],
      route: 'Atlanta, GA → Charlotte, NC'
    },
    {
      id: 'TRIP-002',
      date: '2024-09-21',
      truck: 'TRK-002',
      driver: 'Sarah Johnson',
      startOdometer: 220000,
      endOdometer: 220650,
      totalMiles: 650,
      fuelPurchased: 110,
      stateBreakdown: [
        { state: 'FL', miles: 300, fuelGallons: 48 },
        { state: 'GA', miles: 200, fuelGallons: 32 },
        { state: 'AL', miles: 150, fuelGallons: 30 }
      ],
      route: 'Miami, FL → Birmingham, AL'
    },
    {
      id: 'TRIP-003',
      date: '2024-09-22',
      truck: 'TRK-003',
      driver: 'Mike Wilson',
      startOdometer: 145000,
      endOdometer: 145900,
      totalMiles: 900,
      fuelPurchased: 150,
      stateBreakdown: [
        { state: 'CA', miles: 400, fuelGallons: 65 },
        { state: 'NV', miles: 250, fuelGallons: 40 },
        { state: 'AZ', miles: 250, fuelGallons: 45 }
      ],
      route: 'Los Angeles, CA → Phoenix, AZ'
    }
  ]);

  const [selectedQuarter, setSelectedQuarter] = useState('Q3-2024');
  const [selectedTruck, setSelectedTruck] = useState('all');
  const [showTripDetails, setShowTripDetails] = useState(false);

  // Calculator state
  const [calculatorInputs, setCalculatorInputs] = useState<CalculatorInputs>({
    tripDate: '2024-09-25',
    truckId: 'TRK-001',
    startOdometer: 0,
    endOdometer: 0,
    routeDescription: '',
    stateEntries: [
      { state: 'GA', miles: 0, fuelGallons: 0 },
      { state: 'SC', miles: 0, fuelGallons: 0 },
      { state: 'NC', miles: 0, fuelGallons: 0 }
    ]
  });

  // Quick calculator state
  const [quickCalc, setQuickCalc] = useState({
    selectedState: 'GA',
    miles: 250,
    fuel: 40
  });

  // Live calculation results
  const calculateLiveResults = () => {
    const totalMiles = calculatorInputs.stateEntries.reduce((sum, entry) => sum + entry.miles, 0);
    const totalFuel = calculatorInputs.stateEntries.reduce((sum, entry) => sum + entry.fuelGallons, 0);
    const totalTax = calculatorInputs.stateEntries.reduce((sum, entry) => {
      const rate = stateTaxRates[entry.state] || 0;
      return sum + (entry.fuelGallons * rate);
    }, 0);
    const avgMPG = totalFuel > 0 ? totalMiles / totalFuel : 0;

    return { totalMiles, totalFuel, totalTax, avgMPG };
  };

  const liveResults = calculateLiveResults();

  // Quick calculator functions
  const calculateQuickTax = () => {
    const rate = stateTaxRates[quickCalc.selectedState] || 0;
    return quickCalc.fuel * rate;
  };

  const quickTaxResult = calculateQuickTax();
  const quickMPG = quickCalc.fuel > 0 ? quickCalc.miles / quickCalc.fuel : 0;

  // Update calculator inputs
  const updateCalculatorInput = (field: keyof CalculatorInputs, value: any) => {
    setCalculatorInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateStateEntry = (index: number, field: keyof StateEntry, value: string | number) => {
    setCalculatorInputs(prev => ({
      ...prev,
      stateEntries: prev.stateEntries.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const addStateEntry = () => {
    setCalculatorInputs(prev => ({
      ...prev,
      stateEntries: [...prev.stateEntries, { state: 'AL', miles: 0, fuelGallons: 0 }]
    }));
  };

  const removeStateEntry = (index: number) => {
    if (calculatorInputs.stateEntries.length > 1) {
      setCalculatorInputs(prev => ({
        ...prev,
        stateEntries: prev.stateEntries.filter((_, i) => i !== index)
      }));
    }
  };

  const saveTrip = () => {
    const newTrip = {
      id: `TRIP-${Date.now()}`,
      date: calculatorInputs.tripDate,
      truck: calculatorInputs.truckId,
      startOdometer: calculatorInputs.startOdometer,
      endOdometer: calculatorInputs.endOdometer,
      totalMiles: liveResults.totalMiles,
      fuelPurchased: liveResults.totalFuel,
      stateBreakdown: calculatorInputs.stateEntries.map(entry => ({
        state: entry.state,
        miles: entry.miles,
        fuelGallons: entry.fuelGallons
      })),
      route: calculatorInputs.routeDescription
    };
    
    alert(`Trip saved successfully!\nTotal Tax: $${liveResults.totalTax.toFixed(2)}`);
  };

  // Quick Actions handlers
  const handleExportToExcel = () => {
    // Create CSV content
    let csvContent = "IFTA Tax Report - " + selectedQuarter + "\n\n";
    csvContent += "State,Total Miles,Total Fuel (gal),Tax Rate ($/gal),Tax Owed ($)\n";
    
    sortedStates.forEach(([state, data]) => {
      csvContent += `${state},${data.totalMiles},${data.totalFuel.toFixed(2)},${data.taxRate.toFixed(3)},${data.taxOwed.toFixed(2)}\n`;
    });
    
    csvContent += `\nTOTAL,${totalMiles},${totalFuel.toFixed(2)},,${totalTaxOwed.toFixed(2)}\n`;
    csvContent += `\nAverage MPG: ${averageMPG.toFixed(2)}\n`;
    csvContent += `Total Trips: ${trips.length}\n`;
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `IFTA_Report_${selectedQuarter}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintIFTAForm = () => {
    // Create printable content
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>IFTA Tax Report - ${selectedQuarter}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f3f4f6; font-weight: bold; }
              .total { background-color: #dbeafe; font-weight: bold; }
              .summary { margin: 20px 0; padding: 15px; background-color: #f9fafb; border-left: 4px solid #3b82f6; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>IFTA Tax Report - ${selectedQuarter}</h1>
            <div class="summary">
              <p><strong>Total Miles:</strong> ${totalMiles.toLocaleString()}</p>
              <p><strong>Total Fuel:</strong> ${totalFuel.toFixed(2)} gallons</p>
              <p><strong>Average MPG:</strong> ${averageMPG.toFixed(2)}</p>
              <p><strong>Total Tax Owed:</strong> $${totalTaxOwed.toFixed(2)}</p>
              <p><strong>Total Trips:</strong> ${trips.length}</p>
              <p><strong>States Traveled:</strong> ${Object.keys(stateData).length}</p>
            </div>
            <h2>State-by-State Breakdown</h2>
            <table>
              <thead>
                <tr>
                  <th>State</th>
                  <th>Miles</th>
                  <th>Fuel (gal)</th>
                  <th>Tax Rate ($/gal)</th>
                  <th>Tax Owed ($)</th>
                </tr>
              </thead>
              <tbody>
                ${sortedStates.map(([state, data]) => `
                  <tr>
                    <td>${state}</td>
                    <td>${data.totalMiles.toLocaleString()}</td>
                    <td>${data.totalFuel.toFixed(2)}</td>
                    <td>$${data.taxRate.toFixed(3)}</td>
                    <td>$${data.taxOwed.toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr class="total">
                  <td><strong>TOTAL</strong></td>
                  <td><strong>${totalMiles.toLocaleString()}</strong></td>
                  <td><strong>${totalFuel.toFixed(2)}</strong></td>
                  <td></td>
                  <td><strong>$${totalTaxOwed.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
            <button class="no-print" onclick="window.print()" style="margin: 20px 0; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Print</button>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleAddNewTrip = () => {
    // Reset calculator form to add new trip
    setCalculatorInputs({
      tripDate: new Date().toISOString().split('T')[0],
      truckId: 'TRK-001',
      startOdometer: 0,
      endOdometer: 0,
      routeDescription: '',
      stateEntries: [
        { state: 'GA', miles: 0, fuelGallons: 0 }
      ]
    });
    
    // Scroll to calculator section
    const calculatorSection = document.querySelector('.bg-white.rounded-lg.shadow.p-6.mt-8');
    if (calculatorSection) {
      calculatorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    alert('Ready to add a new trip! Fill in the trip details below.');
  };

  // Calculate total miles and fuel by state
  const calculateStateData = (): Record<string, StateData> => {
    const stateData: Record<string, StateData> = {};
    
    trips.forEach(trip => {
      trip.stateBreakdown.forEach(state => {
        if (!stateData[state.state]) {
          stateData[state.state] = {
            totalMiles: 0,
            totalFuel: 0,
            taxRate: stateTaxRates[state.state] || 0,
            taxOwed: 0
          };
        }
        stateData[state.state].totalMiles += state.miles;
        stateData[state.state].totalFuel += state.fuelGallons;
        stateData[state.state].taxOwed += state.fuelGallons * (stateTaxRates[state.state] || 0);
      });
    });

    return stateData;
  };

  const stateData = calculateStateData();
  const totalTaxOwed = Object.values(stateData).reduce((sum, state) => sum + state.taxOwed, 0);
  const totalMiles = Object.values(stateData).reduce((sum, state) => sum + state.totalMiles, 0);
  const totalFuel = Object.values(stateData).reduce((sum, state) => sum + state.totalFuel, 0);
  const averageMPG = totalMiles / totalFuel;

  const getStateColor = (taxRate) => {
    if (taxRate > 0.4) return 'bg-red-100 text-red-800 border-red-200';
    if (taxRate > 0.3) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const sortedStates = Object.entries(stateData).sort((a, b) => b[1].taxOwed - a[1].taxOwed);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>IFTA Tax Calculator</h1>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>International Fuel Tax Agreement compliance tracking</p>
          </div>
          <div className="flex gap-4">
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Q3-2024">Q3 2024</option>
              <option value="Q2-2024">Q2 2024</option>
              <option value="Q1-2024">Q1 2024</option>
            </select>
            <button 
              type="button"
              onClick={handlePrintIFTAForm}
              className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700"
            >
              📊 Generate IFTA Report
            </button>
          </div>
        </div>

        {/* Quick Calculator Widget */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">⚡ Quick IFTA Calculator</h2>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">Live Calculation</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-1">State</label>
              <select 
                value={quickCalc.selectedState}
                onChange={(e) => setQuickCalc(prev => ({ ...prev, selectedState: e.target.value }))}
                className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md px-3 py-2 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              >
                {Object.keys(stateTaxRates).map(state => (
                  <option key={state} value={state} className="text-gray-900">{state}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-1">Miles Driven</label>
              <input
                type="number"
                value={quickCalc.miles}
                onChange={(e) => setQuickCalc(prev => ({ ...prev, miles: Number(e.target.value) || 0 }))}
                className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md px-3 py-2 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-1">Fuel Used (gal)</label>
              <input
                type="number"
                value={quickCalc.fuel}
                onChange={(e) => setQuickCalc(prev => ({ ...prev, fuel: Number(e.target.value) || 0 }))}
                className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md px-3 py-2 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-1">Tax Rate</label>
              <div className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md px-3 py-2 text-center">
                <span className="text-lg font-bold">${(stateTaxRates[quickCalc.selectedState] || 0).toFixed(3)}</span>
                <span className="text-xs block text-blue-100">/gallon</span>
              </div>
            </div>
            
            <div>
              <div className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md px-3 py-2 text-center">
                <span className="text-xs text-blue-100 block">Tax Owed</span>
                <span className="text-2xl font-bold text-yellow-300">${quickTaxResult.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white border-opacity-20">
            <div className="text-sm text-blue-100">
              <span>MPG: </span>
              <span className="font-semibold text-white">{quickMPG.toFixed(1)}</span>
            </div>
            <button 
              onClick={() => {
                const newEntry = { state: quickCalc.selectedState, miles: quickCalc.miles, fuelGallons: quickCalc.fuel };
                setCalculatorInputs(prev => ({
                  ...prev,
                  stateEntries: [...prev.stateEntries, newEntry]
                }));
                alert('Added to trip calculator below!');
              }}
              className="bg-white text-purple-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition-all"
            >
              Add to Trip Log
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Tax Owed</p>
                <p className="text-2xl font-bold text-red-600">${totalTaxOwed.toFixed(2)}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{selectedQuarter}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Miles</p>
                <p className="text-2xl font-bold text-blue-600">{totalMiles.toLocaleString()}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>All States</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">🛣️</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fuel</p>
                <p className="text-2xl font-bold text-green-600">{totalFuel.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Gallons</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">⛽</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average MPG</p>
                <p className="text-2xl font-bold text-purple-600">{averageMPG.toFixed(1)}</p>
                <p className="text-xs text-gray-500">Fleet Average</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* State Tax Breakdown */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">State-by-State Tax Breakdown</h2>
                <p className="text-sm text-gray-600 mt-1">IFTA tax liability by jurisdiction</p>
              </div>
              
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">State</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Miles</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Fuel (gal)</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Tax Rate</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Tax Owed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sortedStates.map(([state, data]) => (
                        <tr key={state} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{state}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(data.taxRate)}`}>
                                {data.taxRate > 0.4 ? 'High' : data.taxRate > 0.3 ? 'Med' : 'Low'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900">{data.totalMiles.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-gray-900">{data.totalFuel.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-gray-900">${data.taxRate.toFixed(3)}</td>
                          <td className="py-3 px-4 text-right font-semibold text-red-600">${data.taxOwed.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* IFTA Quarter Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Quarter Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Reporting Period:</span>
                  <span className="font-medium text-gray-900">{selectedQuarter}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">States Traveled:</span>
                  <span className="font-medium text-gray-900">{Object.keys(stateData).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Trips:</span>
                  <span className="font-medium text-gray-900">{trips.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Filing Due:</span>
                  <span className="font-medium text-yellow-600">Oct 31, 2024</span>
                </div>
              </div>
            </div>

            {/* Top Tax States */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Highest Tax States</h3>
              <div className="space-y-3">
                {sortedStates.slice(0, 5).map(([state, data]) => (
                  <div key={state} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{state}</span>
                      <span className="text-xs text-gray-500">${data.taxRate.toFixed(3)}/gal</span>
                    </div>
                    <span className="font-semibold text-red-600">${data.taxOwed.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  type="button"
                  onClick={() => setShowTripDetails(!showTripDetails)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  {showTripDetails ? 'Hide' : 'Show'} Trip Details
                </button>
                <button 
                  type="button"
                  onClick={handleExportToExcel}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Export to Excel
                </button>
                <button 
                  type="button"
                  onClick={handlePrintIFTAForm}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-purple-700"
                >
                  Print IFTA Form
                </button>
                <button 
                  type="button"
                  onClick={handleAddNewTrip}
                  className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-yellow-700"
                >
                  Add New Trip
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive IFTA Calculator */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">🧮 Interactive IFTA Calculator</h2>
          
          {/* Calculator Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">📝 Trip Information</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trip Date</label>
                      <input
                        type="date"
                        value={calculatorInputs.tripDate}
                        onChange={(e) => updateCalculatorInput('tripDate', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Truck ID</label>
                      <select 
                        value={calculatorInputs.truckId}
                        onChange={(e) => updateCalculatorInput('truckId', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>TRK-001</option>
                        <option>TRK-002</option>
                        <option>TRK-003</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Starting Odometer</label>
                      <input
                        type="number"
                        value={calculatorInputs.startOdometer || ''}
                        onChange={(e) => updateCalculatorInput('startOdometer', Number(e.target.value) || 0)}
                        placeholder="185000"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ending Odometer</label>
                      <input
                        type="number"
                        value={calculatorInputs.endOdometer || ''}
                        onChange={(e) => updateCalculatorInput('endOdometer', Number(e.target.value) || 0)}
                        placeholder="185750"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Route Description</label>
                    <input
                      type="text"
                      value={calculatorInputs.routeDescription}
                      onChange={(e) => updateCalculatorInput('routeDescription', e.target.value)}
                      placeholder="Atlanta, GA → Charlotte, NC"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* State Mileage Input */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-4">🗺️ State-by-State Breakdown</h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-5 gap-2 text-sm font-medium text-gray-700">
                    <span>State</span>
                    <span>Miles</span>
                    <span>Fuel (gal)</span>
                    <span>Tax Rate</span>
                    <span>Action</span>
                  </div>
                  
                  {/* State Input Rows */}
                  {calculatorInputs.stateEntries.map((entry, index) => (
                    <div key={index} className="grid grid-cols-5 gap-2 items-center">
                      <select 
                        value={entry.state}
                        onChange={(e) => updateStateEntry(index, 'state', e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                      >
                        {Object.keys(stateTaxRates).map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={entry.miles || ''}
                        onChange={(e) => updateStateEntry(index, 'miles', Number(e.target.value) || 0)}
                        placeholder="0"
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                      <input
                        type="number"
                        step="0.1"
                        value={entry.fuelGallons || ''}
                        onChange={(e) => updateStateEntry(index, 'fuelGallons', Number(e.target.value) || 0)}
                        placeholder="0"
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                      <span className="text-xs text-gray-600 font-medium">
                        ${(stateTaxRates[entry.state] || 0).toFixed(3)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeStateEntry(index)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                        disabled={calculatorInputs.stateEntries.length <= 1}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    type="button"
                    onClick={addStateEntry}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 mt-3"
                  >
                    ➕ Add Another State
                  </button>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {/* Live Calculation Results */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">📊 Calculation Results</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600">Total Miles</p>
                      <p className="text-2xl font-bold text-blue-600">{liveResults.totalMiles.toLocaleString()}</p>
                      {calculatorInputs.startOdometer > 0 && calculatorInputs.endOdometer > 0 && (
                        <p className="text-xs text-gray-500">
                          Odometer: {(calculatorInputs.endOdometer - calculatorInputs.startOdometer).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600">Total Fuel</p>
                      <p className="text-2xl font-bold text-green-600">{liveResults.totalFuel.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">gallons</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600">Average MPG</p>
                    <p className="text-2xl font-bold text-purple-600">{liveResults.avgMPG.toFixed(1)}</p>
                    {liveResults.avgMPG < 5 && liveResults.totalFuel > 0 && (
                      <p className="text-xs text-orange-500 mt-1">⚠️ Low fuel efficiency</p>
                    )}
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-red-200">
                    <p className="text-sm text-gray-600">Total IFTA Tax Owed</p>
                    <p className="text-3xl font-bold text-red-600">${liveResults.totalTax.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">Based on current rates</p>
                    {liveResults.totalTax > 100 && (
                      <p className="text-xs text-red-500 mt-1">💰 High tax jurisdiction</p>
                    )}
                  </div>
                </div>
              </div>

              {/* State Breakdown Preview */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4">🏛️ State Tax Breakdown</h3>
                
                <div className="space-y-3">
                  {calculatorInputs.stateEntries
                    .filter(entry => entry.miles > 0 || entry.fuelGallons > 0)
                    .map((entry, index) => {
                      const taxRate = stateTaxRates[entry.state] || 0;
                      const taxOwed = entry.fuelGallons * taxRate;
                      
                      return (
                        <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{entry.state}</span>
                            <span className="text-xs text-gray-500">
                              {entry.miles} mi • {entry.fuelGallons} gal
                            </span>
                            {entry.miles > 0 && entry.fuelGallons > 0 && (
                              <span className="text-xs text-blue-500">
                                {(entry.miles / entry.fuelGallons).toFixed(1)} mpg
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600">${taxOwed.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">@${taxRate.toFixed(3)}/gal</p>
                          </div>
                        </div>
                      );
                    })}
                    
                  {calculatorInputs.stateEntries.every(entry => entry.miles === 0 && entry.fuelGallons === 0) && (
                    <div className="text-center text-gray-500 py-8">
                      <p className="text-sm">Enter miles and fuel data above to see state breakdown</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  type="button"
                  onClick={() => {
                    if (liveResults.totalTax > 0) {
                      alert(`IFTA Tax Calculation Complete!\n\nTotal Miles: ${liveResults.totalMiles.toLocaleString()}\nTotal Fuel: ${liveResults.totalFuel.toLocaleString()} gallons\nAverage MPG: ${liveResults.avgMPG.toFixed(1)}\n\nTotal IFTA Tax Owed: $${liveResults.totalTax.toFixed(2)}`);
                    } else {
                      alert('Please enter trip data to calculate IFTA tax.');
                    }
                  }}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  🧮 Calculate IFTA Tax
                </button>
                <button 
                  type="button"
                  onClick={saveTrip}
                  disabled={liveResults.totalMiles === 0}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  💾 Save Trip Data
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    const reportData = `IFTA Tax Report\n=================\nTrip Date: ${calculatorInputs.tripDate}\nTruck: ${calculatorInputs.truckId}\nRoute: ${calculatorInputs.routeDescription}\n\nState Breakdown:\n${calculatorInputs.stateEntries.map(entry => {
                      const tax = entry.fuelGallons * (stateTaxRates[entry.state] || 0);
                      return `${entry.state}: ${entry.miles} mi, ${entry.fuelGallons} gal, $${tax.toFixed(2)} tax`;
                    }).join('\n')}\n\nTotals:\nMiles: ${liveResults.totalMiles}\nFuel: ${liveResults.totalFuel} gal\nMPG: ${liveResults.avgMPG.toFixed(1)}\nTotal Tax: $${liveResults.totalTax.toFixed(2)}`;
                    
                    navigator.clipboard.writeText(reportData).then(() => {
                      alert('Report copied to clipboard!');
                    }).catch(() => {
                      alert('Report data:\n\n' + reportData);
                    });
                  }}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700"
                >
                  📄 Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Details (Expandable) */}
        {showTripDetails && (
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">🚛 Individual Trip Breakdown</h2>
            <div className="space-y-6">
              {trips.map((trip) => (
                <div key={trip.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{trip.id} - {trip.route}</h3>
                      <p className="text-sm text-gray-600">Driver: {trip.driver} • Truck: {trip.truck} • Date: {trip.date}</p>
                      <p className="text-sm text-gray-600">
                        Total: {trip.totalMiles} miles • Fuel: {trip.fuelPurchased} gallons • 
                        MPG: {(trip.totalMiles / trip.fuelPurchased).toFixed(1)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {trip.stateBreakdown.map((state, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{state.state}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(stateTaxRates[state.state])}`}>
                            ${stateTaxRates[state.state]?.toFixed(3)}/gal
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {state.miles} miles • {state.fuelGallons} gallons
                        </p>
                        <p className="text-sm font-semibold text-red-600">
                          Tax: ${(state.fuelGallons * stateTaxRates[state.state]).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IFTA Compliance Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">💡 IFTA Compliance Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Record Keeping:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Maintain detailed trip logs with state-by-state mileage</li>
                <li>Keep all fuel receipts and purchase records</li>
                <li>Record odometer readings at state borders</li>
                <li>Document fuel purchases with date, location, and gallons</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Filing Requirements:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>File quarterly returns by the last day of the month following the quarter</li>
                <li>Pay taxes owed or claim refunds for overpaid taxes</li>
                <li>Maintain records for at least 4 years</li>
                <li>Report all miles driven and fuel purchased in IFTA jurisdictions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}