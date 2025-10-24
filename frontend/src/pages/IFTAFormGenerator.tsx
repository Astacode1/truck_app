import { useState } from 'react';

interface IFTAFormData {
  quarter: string;
  year: string;
  licenseeInfo: {
    name: string;
    account: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
  };
  fleetInfo: {
    totalVehicles: number;
    qualifiedVehicles: number;
    totalMiles: number;
    totalFuel: number;
  };
  jurisdictionData: {
    state: string;
    miles: number;
    taxPaidFuel: number;
    taxFreeFuel: number;
    averageMPG: number;
    computedFuel: number;
    taxRate: number;
    grossTax: number;
    netTax: number;
    fuelTaxPaid: number;
    taxDue: number;
    refundDue: number;
  }[];
}

export default function IFTAFormGenerator() {
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

  const [formData, setFormData] = useState<IFTAFormData>({
    quarter: 'Q3',
    year: '2024',
    licenseeInfo: {
      name: 'ABC Trucking Company',
      account: 'GA123456789',
      address: '123 Trucking Lane',
      city: 'Atlanta',
      state: 'GA',
      zip: '30309',
      phone: '(404) 555-0123'
    },
    fleetInfo: {
      totalVehicles: 15,
      qualifiedVehicles: 12,
      totalMiles: 125000,
      totalFuel: 18750
    },
    jurisdictionData: [
      {
        state: 'GA',
        miles: 35000,
        taxPaidFuel: 5250,
        taxFreeFuel: 0,
        averageMPG: 6.67,
        computedFuel: 5250,
        taxRate: 0.326,
        grossTax: 1711.50,
        netTax: 1711.50,
        fuelTaxPaid: 1500.00,
        taxDue: 211.50,
        refundDue: 0
      },
      {
        state: 'FL',
        miles: 28000,
        taxPaidFuel: 4200,
        taxFreeFuel: 0,
        averageMPG: 6.67,
        computedFuel: 4200,
        taxRate: 0.14,
        grossTax: 588.00,
        netTax: 588.00,
        fuelTaxPaid: 650.00,
        taxDue: 0,
        refundDue: 62.00
      },
      {
        state: 'SC',
        miles: 22000,
        taxPaidFuel: 3300,
        taxFreeFuel: 0,
        averageMPG: 6.67,
        computedFuel: 3300,
        taxRate: 0.22,
        grossTax: 726.00,
        netTax: 726.00,
        fuelTaxPaid: 700.00,
        taxDue: 26.00,
        refundDue: 0
      },
      {
        state: 'NC',
        miles: 25000,
        taxPaidFuel: 3750,
        taxFreeFuel: 0,
        averageMPG: 6.67,
        computedFuel: 3750,
        taxRate: 0.38,
        grossTax: 1425.00,
        netTax: 1425.00,
        fuelTaxPaid: 1400.00,
        taxDue: 25.00,
        refundDue: 0
      },
      {
        state: 'AL',
        miles: 15000,
        taxPaidFuel: 2250,
        taxFreeFuel: 0,
        averageMPG: 6.67,
        computedFuel: 2250,
        taxRate: 0.19,
        grossTax: 427.50,
        netTax: 427.50,
        fuelTaxPaid: 450.00,
        taxDue: 0,
        refundDue: 22.50
      }
    ]
  });

  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('company');

  const updateCompanyInfo = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      licenseeInfo: {
        ...prev.licenseeInfo,
        [field]: value
      }
    }));
  };

  const updateFleetInfo = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      fleetInfo: {
        ...prev.fleetInfo,
        [field]: value
      }
    }));
  };

  const addJurisdiction = () => {
    const newJurisdiction = {
      state: 'AL',
      miles: 0,
      taxPaidFuel: 0,
      taxFreeFuel: 0,
      averageMPG: 6.67,
      computedFuel: 0,
      taxRate: stateTaxRates['AL'],
      grossTax: 0,
      netTax: 0,
      fuelTaxPaid: 0,
      taxDue: 0,
      refundDue: 0
    };

    setFormData(prev => ({
      ...prev,
      jurisdictionData: [...prev.jurisdictionData, newJurisdiction]
    }));
  };

  const updateJurisdiction = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      jurisdictionData: prev.jurisdictionData.map((jurisdiction, i) => {
        if (i === index) {
          const updated = { ...jurisdiction, [field]: value };
          
          // Recalculate dependent fields
          if (field === 'state') {
            updated.taxRate = stateTaxRates[value as string] || 0;
          }
          
          if (field === 'miles' || field === 'averageMPG') {
            updated.computedFuel = updated.miles / updated.averageMPG;
          }
          
          if (field === 'computedFuel' || field === 'taxRate') {
            updated.grossTax = updated.computedFuel * updated.taxRate;
            updated.netTax = updated.grossTax;
          }
          
          if (field === 'grossTax' || field === 'fuelTaxPaid') {
            const difference = updated.grossTax - updated.fuelTaxPaid;
            if (difference > 0) {
              updated.taxDue = difference;
              updated.refundDue = 0;
            } else {
              updated.taxDue = 0;
              updated.refundDue = Math.abs(difference);
            }
          }
          
          return updated;
        }
        return jurisdiction;
      })
    }));
  };

  const removeJurisdiction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      jurisdictionData: prev.jurisdictionData.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const totalTaxDue = formData.jurisdictionData.reduce((sum, j) => sum + j.taxDue, 0);
    const totalRefundDue = formData.jurisdictionData.reduce((sum, j) => sum + j.refundDue, 0);
    const totalGrossTax = formData.jurisdictionData.reduce((sum, j) => sum + j.grossTax, 0);
    const totalFuelTaxPaid = formData.jurisdictionData.reduce((sum, j) => sum + j.fuelTaxPaid, 0);
    const netBalance = totalTaxDue - totalRefundDue;

    return { totalTaxDue, totalRefundDue, totalGrossTax, totalFuelTaxPaid, netBalance };
  };

  const totals = calculateTotals();

  const generateReport = () => {
    const report = `
INTERNATIONAL FUEL TAX AGREEMENT
QUARTERLY FUEL TAX RETURN
===============================================

REPORTING PERIOD: ${formData.quarter} ${formData.year}
DUE DATE: ${formData.quarter === 'Q1' ? 'April 30' : formData.quarter === 'Q2' ? 'July 31' : formData.quarter === 'Q3' ? 'October 31' : 'January 31'}

LICENSEE INFORMATION:
Company Name: ${formData.licenseeInfo.name}
IFTA Account: ${formData.licenseeInfo.account}
Address: ${formData.licenseeInfo.address}
City, State ZIP: ${formData.licenseeInfo.city}, ${formData.licenseeInfo.state} ${formData.licenseeInfo.zip}
Phone: ${formData.licenseeInfo.phone}

FLEET SUMMARY:
Total Vehicles: ${formData.fleetInfo.totalVehicles}
Qualified Vehicles: ${formData.fleetInfo.qualifiedVehicles}
Total Miles: ${formData.fleetInfo.totalMiles.toLocaleString()}
Total Fuel: ${formData.fleetInfo.totalFuel.toLocaleString()} gallons

JURISDICTION DETAILS:
===============================================
State | Miles    | Fuel(gal) | Tax Rate | Gross Tax | Tax Paid | Tax Due | Refund
------|----------|-----------|----------|-----------|----------|---------|--------
${formData.jurisdictionData.map(j => 
  `${j.state.padEnd(5)} | ${j.miles.toLocaleString().padEnd(8)} | ${j.computedFuel.toFixed(0).padEnd(9)} | $${j.taxRate.toFixed(3).padEnd(7)} | $${j.grossTax.toFixed(2).padEnd(8)} | $${j.fuelTaxPaid.toFixed(2).padEnd(7)} | $${j.taxDue.toFixed(2).padEnd(6)} | $${j.refundDue.toFixed(2)}`
).join('\n')}

SUMMARY:
===============================================
Total Gross Tax: $${totals.totalGrossTax.toFixed(2)}
Total Tax Paid: $${totals.totalFuelTaxPaid.toFixed(2)}
Total Tax Due: $${totals.totalTaxDue.toFixed(2)}
Total Refund Due: $${totals.totalRefundDue.toFixed(2)}
Net Balance: $${totals.netBalance.toFixed(2)} ${totals.netBalance >= 0 ? '(DUE)' : '(REFUND)'}

Generated on: ${new Date().toLocaleDateString()}
    `;

    return report.trim();
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
                <h1 className="text-3xl font-bold text-white tracking-tight">IFTA Form Generator</h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{
                  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(129, 140, 248, 0.2) 100%)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  color: '#22d3ee',
                  letterSpacing: '0.15em'
                }}>
                  ATONDA
                </span>
              </div>
              <p className="text-sm" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>Generate detailed quarterly fuel tax returns</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                style={{
                  background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                  boxShadow: '0 4px 15px rgba(34, 211, 238, 0.4)'
                }}
                className="px-6 py-3 rounded-xl text-white font-semibold hover:scale-105 transition-transform"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              <button
                onClick={() => {
                  const report = generateReport();
                  navigator.clipboard.writeText(report).then(() => {
                    alert('IFTA report copied to clipboard!');
                  }).catch(() => {
                    alert('Report generated:\n\n' + report);
                  });
                }}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                }}
                className="px-6 py-3 rounded-xl text-white font-semibold hover:scale-105 transition-transform"
              >
                📄 Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        {/* Form Tabs - Holographic */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(34, 211, 238, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }} className="rounded-2xl mb-8">
          <div style={{ borderBottom: '1px solid rgba(34, 211, 238, 0.2)' }}>
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'company', label: 'Company Info' },
                { id: 'fleet', label: 'Fleet Summary' },
                { id: 'jurisdictions', label: 'State Details' },
                { id: 'summary', label: 'Tax Summary' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Company Information Tab */}
            {activeTab === 'company' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Licensee Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={formData.licenseeInfo.name}
                      onChange={(e) => updateCompanyInfo('name', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFTA Account Number</label>
                    <input
                      type="text"
                      value={formData.licenseeInfo.account}
                      onChange={(e) => updateCompanyInfo('account', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={formData.licenseeInfo.address}
                      onChange={(e) => updateCompanyInfo('address', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.licenseeInfo.city}
                      onChange={(e) => updateCompanyInfo('city', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <select
                      value={formData.licenseeInfo.state}
                      onChange={(e) => updateCompanyInfo('state', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.keys(stateTaxRates).map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={formData.licenseeInfo.zip}
                      onChange={(e) => updateCompanyInfo('zip', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.licenseeInfo.phone}
                      onChange={(e) => updateCompanyInfo('phone', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quarter</label>
                    <select
                      value={formData.quarter}
                      onChange={(e) => setFormData(prev => ({ ...prev, quarter: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Q1">Q1 (Jan-Mar)</option>
                      <option value="Q2">Q2 (Apr-Jun)</option>
                      <option value="Q3">Q3 (Jul-Sep)</option>
                      <option value="Q4">Q4 (Oct-Dec)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Fleet Summary Tab */}
            {activeTab === 'fleet' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Fleet Summary</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Vehicles</label>
                    <input
                      type="number"
                      value={formData.fleetInfo.totalVehicles}
                      onChange={(e) => updateFleetInfo('totalVehicles', Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualified Vehicles</label>
                    <input
                      type="number"
                      value={formData.fleetInfo.qualifiedVehicles}
                      onChange={(e) => updateFleetInfo('qualifiedVehicles', Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Miles</label>
                    <input
                      type="number"
                      value={formData.fleetInfo.totalMiles}
                      onChange={(e) => updateFleetInfo('totalMiles', Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Fuel (gallons)</label>
                    <input
                      type="number"
                      value={formData.fleetInfo.totalFuel}
                      onChange={(e) => updateFleetInfo('totalFuel', Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Fleet Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">Average MPG:</span>
                      <span className="ml-2 font-semibold">
                        {formData.fleetInfo.totalFuel > 0 ? (formData.fleetInfo.totalMiles / formData.fleetInfo.totalFuel).toFixed(1) : '0'}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-600">Miles per Vehicle:</span>
                      <span className="ml-2 font-semibold">
                        {formData.fleetInfo.qualifiedVehicles > 0 ? Math.round(formData.fleetInfo.totalMiles / formData.fleetInfo.qualifiedVehicles).toLocaleString() : '0'}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-600">Fuel per Vehicle:</span>
                      <span className="ml-2 font-semibold">
                        {formData.fleetInfo.qualifiedVehicles > 0 ? Math.round(formData.fleetInfo.totalFuel / formData.fleetInfo.qualifiedVehicles).toLocaleString() : '0'}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-600">Utilization:</span>
                      <span className="ml-2 font-semibold">
                        {formData.fleetInfo.totalVehicles > 0 ? Math.round((formData.fleetInfo.qualifiedVehicles / formData.fleetInfo.totalVehicles) * 100) : '0'}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Jurisdictions Tab */}
            {activeTab === 'jurisdictions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">State-by-State Details</h2>
                  <button
                    onClick={addJurisdiction}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                  >
                    ➕ Add State
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Miles</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fuel (gal)</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">MPG</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tax Rate</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gross Tax</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tax Paid</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due/Refund</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {formData.jurisdictionData.map((jurisdiction, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <select
                              value={jurisdiction.state}
                              onChange={(e) => updateJurisdiction(index, 'state', e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              {Object.keys(stateTaxRates).map(state => (
                                <option key={state} value={state}>{state}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={jurisdiction.miles}
                              onChange={(e) => updateJurisdiction(index, 'miles', Number(e.target.value))}
                              className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <span className="text-sm text-gray-900">{jurisdiction.computedFuel.toFixed(0)}</span>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.1"
                              value={jurisdiction.averageMPG}
                              onChange={(e) => updateJurisdiction(index, 'averageMPG', Number(e.target.value))}
                              className="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <span className="text-sm text-gray-900">${jurisdiction.taxRate.toFixed(3)}</span>
                          </td>
                          <td className="px-3 py-2">
                            <span className="text-sm font-medium text-gray-900">${jurisdiction.grossTax.toFixed(2)}</span>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={jurisdiction.fuelTaxPaid}
                              onChange={(e) => updateJurisdiction(index, 'fuelTaxPaid', Number(e.target.value))}
                              className="w-24 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-sm">
                              {jurisdiction.taxDue > 0 ? (
                                <span className="text-red-600 font-medium">Due: ${jurisdiction.taxDue.toFixed(2)}</span>
                              ) : jurisdiction.refundDue > 0 ? (
                                <span className="text-green-600 font-medium">Refund: ${jurisdiction.refundDue.toFixed(2)}</span>
                              ) : (
                                <span className="text-gray-500">$0.00</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => removeJurisdiction(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Tax Summary</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Gross Tax</h3>
                    <p className="text-3xl font-bold text-blue-600">${totals.totalGrossTax.toFixed(2)}</p>
                    <p className="text-sm text-blue-700 mt-1">All jurisdictions</p>
                  </div>
                  
                  <div className="bg-red-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Tax Due</h3>
                    <p className="text-3xl font-bold text-red-600">${totals.totalTaxDue.toFixed(2)}</p>
                    <p className="text-sm text-red-700 mt-1">Amount owed</p>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">Refund Due</h3>
                    <p className="text-3xl font-bold text-green-600">${totals.totalRefundDue.toFixed(2)}</p>
                    <p className="text-sm text-green-700 mt-1">Amount refundable</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">Net Balance</h3>
                  <p className="text-4xl font-bold mb-2 ${totals.netBalance >= 0 ? 'text-red-600' : 'text-green-600'}">
                    ${Math.abs(totals.netBalance).toFixed(2)}
                  </p>
                  <p className="text-sm text-yellow-800">
                    {totals.netBalance >= 0 ? '💰 Amount Due - Payment Required' : '💚 Refund Due - Credit Expected'}
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Filing Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Reporting Period:</span>
                      <span className="ml-2">{formData.quarter} {formData.year}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Due Date:</span>
                      <span className="ml-2">
                        {formData.quarter === 'Q1' ? 'April 30' : 
                         formData.quarter === 'Q2' ? 'July 31' : 
                         formData.quarter === 'Q3' ? 'October 31' : 'January 31'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Jurisdictions:</span>
                      <span className="ml-2">{formData.jurisdictionData.length} states</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className="ml-2 text-yellow-600 font-medium">Ready for Filing</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">IFTA Form Preview</h2>
            <pre className="bg-gray-50 p-6 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap">
              {generateReport()}
            </pre>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => {
              const report = generateReport();
              const blob = new Blob([report], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `IFTA_${formData.quarter}_${formData.year}_${formData.licenseeInfo.account}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            📥 Download Report
          </button>
          
          <button
            onClick={() => {
              const report = generateReport();
              navigator.clipboard.writeText(report).then(() => {
                alert('IFTA report copied to clipboard!');
              });
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
          >
            📋 Copy to Clipboard
          </button>
          
          <button
            onClick={() => {
              alert(`Form validation complete!\n\nTotal States: ${formData.jurisdictionData.length}\nTotal Miles: ${formData.fleetInfo.totalMiles.toLocaleString()}\nNet Balance: $${Math.abs(totals.netBalance).toFixed(2)} ${totals.netBalance >= 0 ? '(DUE)' : '(REFUND)'}`);
            }}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700"
          >
            ✅ Validate Form
          </button>
        </div>
      </div>
    </div>
  );
}