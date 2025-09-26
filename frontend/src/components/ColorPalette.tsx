import React, { useState, useEffect } from 'react';

const ColorPalette: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`p-8 min-h-screen transition-all duration-300 ${
      isDarkMode 
        ? 'bg-neutral-900 text-neutral-100' 
        : 'bg-neutral-50 text-neutral-900'
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Header with Dark Mode Toggle */}
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold transition-colors duration-300 ${
            isDarkMode ? 'text-neutral-100' : 'text-neutral-900'
          }`}>
            🚛 Truck System Color Palette
          </h1>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg ${
              isDarkMode 
                ? 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700 border border-neutral-600' 
                : 'bg-white text-neutral-800 hover:bg-neutral-50 border border-neutral-300'
            }`}
            aria-label="Toggle dark mode"
          >
            <span className="mr-2 text-lg">
              {isDarkMode ? '☀️' : '🌙'}
            </span>
            <span className="text-sm font-medium">
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
        </div>
        
        {/* Color Swatches */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Primary Colors with Full Shade Range */}
          <div className="card">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Primary - Professional Blue</h3>
            <div className="space-y-2">
              {/* Full shade range for primary */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg mb-1 border border-neutral-200"></div>
                  <p className="text-xs text-neutral-600">100</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-300 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">300</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-500 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">500</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-700 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">700</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-900 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">900</p>
                </div>
              </div>
              {/* Gradient showcase */}
              <div className="h-16 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">Primary Gradient</span>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-800 rounded-lg mr-3 shadow-lg"></div>
                <div>
                  <p className="font-medium">Primary 800 (Main)</p>
                  <p className="text-sm text-neutral-500">#1E40AF</p>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Colors with Full Shade Range */}
          <div className="card">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Secondary - Truck Orange</h3>
            <div className="space-y-2">
              {/* Full shade range for secondary */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-secondary-100 rounded-lg mb-1 border border-neutral-200"></div>
                  <p className="text-xs text-neutral-600">100</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-secondary-300 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">300</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-secondary-500 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">500</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-secondary-700 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">700</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-secondary-900 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">900</p>
                </div>
              </div>
              {/* Gradient showcase */}
              <div className="h-16 bg-gradient-to-r from-secondary-300 via-secondary-500 to-secondary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">Secondary Gradient</span>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-secondary-600 rounded-lg mr-3 shadow-lg"></div>
                <div>
                  <p className="font-medium">Secondary 600 (Main)</p>
                  <p className="text-sm text-neutral-500">#EA580C</p>
                </div>
              </div>
            </div>
          </div>

          {/* Success Colors with Full Shade Range */}
          <div className="card">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Success - Emerald Green</h3>
            <div className="space-y-2">
              {/* Full shade range for success */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-success-100 rounded-lg mb-1 border border-neutral-200"></div>
                  <p className="text-xs text-neutral-600">100</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-success-300 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">300</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-success-500 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">500</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-success-700 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">700</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-success-900 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">900</p>
                </div>
              </div>
              {/* Gradient showcase */}
              <div className="h-16 bg-gradient-to-r from-success-400 via-success-500 to-success-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">Success Gradient</span>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-success-600 rounded-lg mr-3 shadow-lg"></div>
                <div>
                  <p className="font-medium">Success 600 (Main)</p>
                  <p className="text-sm text-neutral-500">#059669</p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Colors with Full Shade Range */}
          <div className="card">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Warning - Amber</h3>
            <div className="space-y-2">
              {/* Full shade range for warning */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-warning-100 rounded-lg mb-1 border border-neutral-200"></div>
                  <p className="text-xs text-neutral-600">100</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-warning-300 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">300</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-warning-500 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">500</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-warning-700 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">700</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-warning-900 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">900</p>
                </div>
              </div>
              {/* Gradient showcase */}
              <div className="h-16 bg-gradient-to-r from-warning-300 via-warning-500 to-warning-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">Warning Gradient</span>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-warning-500 rounded-lg mr-3 shadow-lg"></div>
                <div>
                  <p className="font-medium">Warning 500 (Main)</p>
                  <p className="text-sm text-neutral-500">#F59E0B</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Colors with Full Shade Range */}
          <div className="card">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Error - Red</h3>
            <div className="space-y-2">
              {/* Full shade range for error */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-error-100 rounded-lg mb-1 border border-neutral-200"></div>
                  <p className="text-xs text-neutral-600">100</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-error-300 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">300</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-error-500 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">500</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-error-700 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">700</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-error-900 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">900</p>
                </div>
              </div>
              {/* Gradient showcase */}
              <div className="h-16 bg-gradient-to-r from-error-400 via-error-500 to-error-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">Error Gradient</span>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-error-500 rounded-lg mr-3 shadow-lg"></div>
                <div>
                  <p className="font-medium">Error 500 (Main)</p>
                  <p className="text-sm text-neutral-500">#EF4444</p>
                </div>
              </div>
            </div>
          </div>

          {/* Neutral Colors with Full Shade Range */}
          <div className="card">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Neutral - Grays</h3>
            <div className="space-y-2">
              {/* Full shade range for neutral */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-neutral-100 rounded-lg mb-1 border border-neutral-300"></div>
                  <p className="text-xs text-neutral-600">100</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-neutral-300 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">300</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-neutral-500 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">500</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-neutral-700 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">700</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-neutral-900 rounded-lg mb-1"></div>
                  <p className="text-xs text-neutral-600">900</p>
                </div>
              </div>
              {/* Gradient showcase */}
              <div className="h-16 bg-gradient-to-r from-neutral-200 via-neutral-400 to-neutral-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">Neutral Gradient</span>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-neutral-500 rounded-lg mr-3 shadow-lg"></div>
                <div>
                  <p className="font-medium">Neutral 500 (Main)</p>
                  <p className="text-sm text-neutral-500">#64748B</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Beautiful Gradient Showcase */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">🌈 Beautiful Gradient Combinations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Professional Blue to Orange */}
            <div className="relative overflow-hidden rounded-xl h-32 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 flex items-center justify-center group hover:scale-105 transition-transform duration-300">
              <div className="text-white text-center">
                <p className="font-bold text-lg">Professional Gradient</p>
                <p className="text-sm opacity-90">Blue → Orange</p>
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </div>

            {/* Success to Primary */}
            <div className="relative overflow-hidden rounded-xl h-32 bg-gradient-to-br from-success-500 via-primary-500 to-primary-700 flex items-center justify-center group hover:scale-105 transition-transform duration-300">
              <div className="text-white text-center">
                <p className="font-bold text-lg">Success Flow</p>
                <p className="text-sm opacity-90">Green → Blue</p>
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </div>

            {/* Warning Sunset */}
            <div className="relative overflow-hidden rounded-xl h-32 bg-gradient-to-br from-warning-400 via-secondary-500 to-error-500 flex items-center justify-center group hover:scale-105 transition-transform duration-300">
              <div className="text-white text-center">
                <p className="font-bold text-lg">Sunset Gradient</p>
                <p className="text-sm opacity-90">Amber → Orange → Red</p>
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </div>

            {/* Ocean Depth */}
            <div className="relative overflow-hidden rounded-xl h-32 bg-gradient-to-br from-primary-400 via-primary-700 to-primary-900 flex items-center justify-center group hover:scale-105 transition-transform duration-300">
              <div className="text-white text-center">
                <p className="font-bold text-lg">Ocean Depth</p>
                <p className="text-sm opacity-90">Light Blue → Deep Blue</p>
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>

        {/* Button Examples */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">Button Styles</h3>
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary">Primary Button</button>
            <button className="btn-secondary">Secondary Button</button>
            <button className="btn-success">Success Button</button>
            <button className="btn-warning">Warning Button</button>
            <button className="btn-error">Error Button</button>
            <button className="btn-neutral">Neutral Button</button>
          </div>
        </div>

        {/* Interactive Color Visualization */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">✨ Interactive Color Harmonies</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Animated Color Wheel */}
            <div className="space-y-4">
              <h4 className="font-semibold text-neutral-700 mb-4">Color Wheel Harmony</h4>
              <div className="relative w-64 h-64 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-conic from-primary-500 via-secondary-500 via-success-500 via-warning-500 via-error-500 to-primary-500 animate-spin-slow shadow-2xl"></div>
                <div className="absolute inset-4 rounded-full bg-white shadow-inner flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full mx-auto mb-2 shadow-lg"></div>
                    <p className="text-sm font-medium text-neutral-700">Harmony</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Temperature Scale */}
            <div className="space-y-4">
              <h4 className="font-semibold text-neutral-700 mb-4">Temperature Scale</h4>
              <div className="space-y-3">
                <div className="relative">
                  <div className="h-8 bg-gradient-to-r from-primary-700 to-primary-300 rounded-full shadow-lg"></div>
                  <span className="absolute left-0 top-10 text-xs text-neutral-600">Cool</span>
                  <span className="absolute right-0 top-10 text-xs text-neutral-600">Warm</span>
                </div>
                <div className="relative">
                  <div className="h-8 bg-gradient-to-r from-success-700 to-success-300 rounded-full shadow-lg"></div>
                </div>
                <div className="relative">
                  <div className="h-8 bg-gradient-to-r from-warning-700 to-warning-300 rounded-full shadow-lg"></div>
                </div>
                <div className="relative">
                  <div className="h-8 bg-gradient-to-r from-secondary-700 to-secondary-300 rounded-full shadow-lg"></div>
                </div>
                <div className="relative">
                  <div className="h-8 bg-gradient-to-r from-error-700 to-error-300 rounded-full shadow-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Color Accessibility & Contrast */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">♿ Accessibility & Contrast Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* High Contrast Examples */}
            <div className="bg-primary-900 text-white p-4 rounded-lg">
              <h5 className="font-bold mb-2">AAA Rated</h5>
              <p className="text-sm opacity-90">Perfect contrast ratio for maximum accessibility</p>
            </div>

            <div className="bg-secondary-600 text-white p-4 rounded-lg">
              <h5 className="font-bold mb-2">AA Rated</h5>
              <p className="text-sm opacity-90">Good contrast for general use</p>
            </div>

            <div className="bg-success-700 text-white p-4 rounded-lg">
              <h5 className="font-bold mb-2">Success State</h5>
              <p className="text-sm opacity-90">Clear visibility for positive actions</p>
            </div>

            <div className="bg-neutral-800 text-white p-4 rounded-lg">
              <h5 className="font-bold mb-2">Neutral Text</h5>
              <p className="text-sm opacity-90">Professional readability</p>
            </div>
          </div>
        </div>

        {/* Advanced Color Applications */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">🎨 Advanced Color Applications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Glass Morphism Examples */}
            <div className="space-y-4">
              <h4 className="font-semibold text-neutral-700 mb-4">Glass Morphism Effects</h4>
              <div className="relative p-6 rounded-xl bg-gradient-to-br from-primary-400 via-secondary-400 to-success-400">
                <div className="absolute inset-2 bg-white bg-opacity-20 backdrop-blur-lg rounded-lg border border-white border-opacity-30 p-4">
                  <h5 className="text-white font-bold mb-2">Frosted Glass</h5>
                  <p className="text-white text-sm opacity-90">Beautiful translucent overlay with backdrop blur</p>
                </div>
              </div>
            </div>

            {/* Shadow & Elevation Examples */}
            <div className="space-y-4">
              <h4 className="font-semibold text-neutral-700 mb-4">Shadow & Elevation</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
                  <p className="text-sm text-neutral-600">Level 1</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <p className="text-sm text-neutral-600">Level 2</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <p className="text-sm text-neutral-600">Level 3</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-xl">
                  <p className="text-sm text-neutral-600">Level 4</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Truck Dashboard Example */}
        <div className="card">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">🚛 Example Truck Dashboard</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary-50 border-l-4 border-primary-800 p-4 rounded">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary-800 rounded-lg mr-3 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">T</span>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Active Trucks</p>
                  <p className="text-2xl font-bold text-primary-800">24</p>
                </div>
              </div>
            </div>
            
            <div className="bg-secondary-50 border-l-4 border-secondary-600 p-4 rounded">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-secondary-600 rounded-lg mr-3 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🛣</span>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Miles Today</p>
                  <p className="text-2xl font-bold text-secondary-600">1,247</p>
                </div>
              </div>
            </div>
            
            <div className="bg-success-50 border-l-4 border-success-600 p-4 rounded">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-success-600 rounded-lg mr-3 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Deliveries</p>
                  <p className="text-2xl font-bold text-success-600">18</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Badges & Pills */}
        <div className="card">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">🏷️ Status Badges & Pills</h3>
          
          {/* Truck Status Examples */}
          <div className="mb-8">
            <h4 className="text-md font-medium text-neutral-700 mb-4">Truck Status Examples</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-success-100 text-success-800 px-3 py-2 rounded-full text-sm font-medium text-center border border-success-300">
                <span className="mr-1">🚛</span> Active
              </div>
              <div className="bg-warning-100 text-warning-800 px-3 py-2 rounded-full text-sm font-medium text-center border border-warning-300">
                <span className="mr-1">⚠️</span> Maintenance
              </div>
              <div className="bg-error-100 text-error-800 px-3 py-2 rounded-full text-sm font-medium text-center border border-error-300">
                <span className="mr-1">🔴</span> Out of Service
              </div>
              <div className="bg-primary-100 text-primary-800 px-3 py-2 rounded-full text-sm font-medium text-center border border-primary-300">
                <span className="mr-1">📍</span> In Transit
              </div>
            </div>
          </div>

          {/* Load Status Examples */}
          <div className="mb-8">
            <h4 className="text-md font-medium text-neutral-700 mb-4">Load Status Examples</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-secondary-100 text-secondary-800 px-4 py-2 rounded-lg text-sm font-medium text-center border-l-4 border-secondary-600">
                📦 Loaded
              </div>
              <div className="bg-success-100 text-success-800 px-4 py-2 rounded-lg text-sm font-medium text-center border-l-4 border-success-600">
                ✅ Delivered
              </div>
              <div className="bg-neutral-100 text-neutral-800 px-4 py-2 rounded-lg text-sm font-medium text-center border-l-4 border-neutral-400">
                ⭕ Empty
              </div>
            </div>
          </div>

          {/* Priority Levels */}
          <div className="mb-8">
            <h4 className="text-md font-medium text-neutral-700 mb-4">Priority & Alert Badges</h4>
            <div className="flex flex-wrap gap-3">
              <span className="bg-error-600 text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-lg">
                🚨 URGENT
              </span>
              <span className="bg-warning-500 text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-lg">
                ⚡ HIGH
              </span>
              <span className="bg-secondary-500 text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-lg">
                📈 MEDIUM
              </span>
              <span className="bg-neutral-400 text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-lg">
                📋 NORMAL
              </span>
              <span className="bg-success-500 text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-lg">
                ✨ COMPLETE
              </span>
            </div>
          </div>

          {/* Interactive Status Pills */}
          <div>
            <h4 className="text-md font-medium text-neutral-700 mb-4">Interactive Status Pills</h4>
            <div className="flex flex-wrap gap-2">
              <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg">
                🔄 Update Status
              </button>
              <button className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg">
                📍 Track Location
              </button>
              <button className="bg-success-500 hover:bg-success-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg">
                ✅ Mark Complete
              </button>
              <button className="bg-warning-500 hover:bg-warning-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg">
                ⚠️ Report Issue
              </button>
            </div>
          </div>
        </div>

        {/* Dark Mode vs Light Mode Comparison */}
        <div className="card">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-6">🌙 Dark Mode vs Light Mode</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Light Mode Preview */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-neutral-100 px-4 py-2 border-b">
                <span className="text-sm font-medium text-neutral-600">☀️ Light Mode</span>
              </div>
              <div className="bg-white p-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-neutral-900">Truck Dashboard</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-primary-50 border border-primary-200 p-3 rounded">
                      <div className="text-primary-800 font-medium">Active Trucks</div>
                      <div className="text-2xl font-bold text-primary-700">24</div>
                    </div>
                    <div className="bg-secondary-50 border border-secondary-200 p-3 rounded">
                      <div className="text-secondary-800 font-medium">Routes</div>
                      <div className="text-2xl font-bold text-secondary-700">12</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-success-100 text-success-800 px-2 py-1 rounded text-xs">✅ On Route</span>
                    <span className="bg-warning-100 text-warning-800 px-2 py-1 rounded text-xs">⚠️ Delayed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dark Mode Preview */}
            <div className="border border-neutral-700 rounded-lg overflow-hidden bg-neutral-800">
              <div className="bg-neutral-700 px-4 py-2 border-b border-neutral-600">
                <span className="text-sm font-medium text-neutral-300">🌙 Dark Mode</span>
              </div>
              <div className="bg-neutral-800 p-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-neutral-100">Truck Dashboard</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-primary-900 border border-primary-700 p-3 rounded">
                      <div className="text-primary-200 font-medium">Active Trucks</div>
                      <div className="text-2xl font-bold text-primary-300">24</div>
                    </div>
                    <div className="bg-secondary-900 border border-secondary-700 p-3 rounded">
                      <div className="text-secondary-200 font-medium">Routes</div>
                      <div className="text-2xl font-bold text-secondary-300">12</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-success-900 text-success-200 px-2 py-1 rounded text-xs">✅ On Route</span>
                    <span className="bg-warning-900 text-warning-200 px-2 py-1 rounded text-xs">⚠️ Delayed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Dark Mode Benefits */}
          <div className="mt-8 p-4 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
            <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-3">🌟 Dark Mode Benefits</h4>
            <ul className="text-sm text-neutral-600 dark:text-neutral-300 space-y-2">
              <li>• Reduces eye strain in low-light environments</li>
              <li>• Better battery life on OLED screens</li>
              <li>• Professional appearance for night driving</li>
              <li>• Improved focus on critical information</li>
              <li>• Modern and sophisticated user experience</li>
            </ul>
          </div>
        </div>

        {/* Design Principles */}
        <div className="mt-12 card bg-primary-50 dark:bg-primary-900 border-primary-200 dark:border-primary-700">
          <h3 className="text-lg font-semibold text-primary-800 dark:text-primary-200 mb-4">🎨 Design Principles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-primary-700 dark:text-primary-300 mb-2">Primary Blue (#1E40AF)</h4>
              <ul className="text-neutral-600 dark:text-neutral-300 space-y-1">
                <li>• Professional and trustworthy</li>
                <li>• Technology-forward appearance</li>
                <li>• High contrast for accessibility</li>
                <li>• Use for main actions and navigation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-secondary-700 dark:text-secondary-300 mb-2">Secondary Orange (#EA580C)</h4>
              <ul className="text-neutral-600 dark:text-neutral-300 space-y-1">
                <li>• High visibility and attention-grabbing</li>
                <li>• Associated with trucking/transportation</li>
                <li>• Energy and action-oriented</li>
                <li>• Use for calls-to-action and highlights</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPalette;
