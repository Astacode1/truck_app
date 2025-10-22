import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../contexts/TranslationContext';
import { 
  User, 
  Shield, 
  Bell, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Key, 
  Mail, 
  Phone, 
  Building, 
  MapPin,
  Sun,
  Moon,
  Monitor,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Edit,
  Check,
  X,
  Settings as SettingsIcon,
  Palette,
  Globe,
  Clock,
  Calculator,
  FileText,
  Truck
} from 'lucide-react';

interface UserCredentials {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  role: string;
  joinDate: string;
  lastLogin: string;
}

interface AppSettings {
  autoSave: boolean;
  notifications: boolean;
  emailNotifications: boolean;
  dataRetention: number;
  defaultCurrency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  language: string;
  autoBackup: boolean;
  companyLogo: string;
}

export default function Settings() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [userCredentials, setUserCredentials] = useState<UserCredentials>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@atonda.com',
    phone: '+1 (555) 123-4567',
    company: 'ATONDA Logistics',
    address: '123 Logistics Ave, Transport City, TC 12345',
    role: 'Fleet Manager',
    joinDate: '2024-01-15',
    lastLogin: new Date().toLocaleString()
  });

  const [appSettings, setAppSettings] = useState<AppSettings>({
    autoSave: true,
    notifications: true,
    emailNotifications: false,
    dataRetention: 365,
    defaultCurrency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    language: 'French',
    autoBackup: true,
    companyLogo: 'ATONDA'
  });

  const [tempCredentials, setTempCredentials] = useState(userCredentials);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveCredentials = () => {
    setUserCredentials(tempCredentials);
    setIsEditing(false);
    showNotification('Profile updated successfully!');
    // Save to localStorage
    localStorage.setItem('atonda_user_credentials', JSON.stringify(tempCredentials));
  };

  const handleCancelEdit = () => {
    setTempCredentials(userCredentials);
    setIsEditing(false);
  };

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    const newSettings = { ...appSettings, [key]: value };
    setAppSettings(newSettings);
    localStorage.setItem('atonda_app_settings', JSON.stringify(newSettings));
    
    // Update translation language if language setting changed
    if (key === 'language') {
      setLanguage(value);
    }
    
    showNotification(t('msg.settings_updated'));
  };

  const exportData = () => {
    // Get data from localStorage
    const driversData = JSON.parse(localStorage.getItem('truckManagement_drivers') || '[]');
    const trucksData = JSON.parse(localStorage.getItem('truckManagement_trucks') || '[]');
    const tripsData = JSON.parse(localStorage.getItem('truckManagement_trips') || '[]');
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    const printWindow = window.open('', '_blank');
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ATONDA Data Export Report</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              padding: 40px;
              background: #ffffff;
              color: #333;
              line-height: 1.6;
            }
            
            .report-container {
              max-width: 1000px;
              margin: 0 auto;
            }
            
            .header {
              text-align: center;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 30px;
              margin-bottom: 40px;
            }
            
            .logo {
              font-size: 48px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
              letter-spacing: 2px;
            }
            
            .report-title {
              font-size: 28px;
              color: #1f2937;
              margin-bottom: 10px;
            }
            
            .report-subtitle {
              font-size: 16px;
              color: #6b7280;
              margin-bottom: 20px;
            }
            
            .report-info {
              background: #f3f4f6;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }
            
            .info-item {
              display: flex;
              justify-content: space-between;
            }
            
            .info-label {
              font-weight: 600;
              color: #374151;
            }
            
            .info-value {
              color: #1f2937;
            }
            
            .section {
              margin-bottom: 40px;
              page-break-inside: avoid;
            }
            
            .section-header {
              font-size: 22px;
              font-weight: 700;
              color: #1f2937;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            
            .section-icon {
              width: 24px;
              height: 24px;
              background: #2563eb;
              border-radius: 50%;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
            }
            
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .data-table th {
              background: #f9fafb;
              padding: 12px;
              text-align: left;
              font-weight: 600;
              color: #374151;
              border-bottom: 2px solid #e5e7eb;
              font-size: 14px;
            }
            
            .data-table td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 14px;
              color: #4b5563;
            }
            
            .data-table tr:nth-child(even) {
              background: #f9fafb;
            }
            
            .data-table tr:hover {
              background: #f3f4f6;
            }
            
            .summary-card {
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: white;
              padding: 20px;
              border-radius: 12px;
              text-align: center;
              margin: 20px 0;
            }
            
            .summary-number {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .summary-label {
              font-size: 14px;
              opacity: 0.9;
            }
            
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin: 30px 0;
            }
            
            .no-data {
              text-align: center;
              color: #6b7280;
              font-style: italic;
              padding: 40px;
              background: #f9fafb;
              border-radius: 8px;
            }
            
            .footer {
              margin-top: 50px;
              padding-top: 30px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
            
            .company-info {
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              border-left: 4px solid #2563eb;
              padding: 20px;
              margin: 20px 0;
              border-radius: 0 8px 8px 0;
            }
            
            @media print {
              body {
                padding: 20px;
              }
              
              .no-print {
                display: none !important;
              }
              
              .section {
                page-break-inside: avoid;
              }
            }
            
            @page {
              size: letter;
              margin: 0.5in;
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <!-- Header -->
            <div class="header">
              <div class="logo">ATONDA</div>
              <h1 class="report-title">Data Export Report</h1>
              <p class="report-subtitle">Comprehensive Fleet Management Data Summary</p>
            </div>

            <!-- Report Information -->
            <div class="report-info">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Generated Date:</span>
                  <span class="info-value">${currentDate}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Generated Time:</span>
                  <span class="info-value">${currentTime}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Report Type:</span>
                  <span class="info-value">Complete Data Export</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Company:</span>
                  <span class="info-value">${userCredentials.company}</span>
                </div>
              </div>
            </div>

            <!-- Summary Cards -->
            <div class="summary-grid">
              <div class="summary-card">
                <div class="summary-number">${driversData.length}</div>
                <div class="summary-label">Total Drivers</div>
              </div>
              <div class="summary-card">
                <div class="summary-number">${trucksData.length}</div>
                <div class="summary-label">Total Trucks</div>
              </div>
              <div class="summary-card">
                <div class="summary-number">${tripsData.length}</div>
                <div class="summary-label">Total Trips</div>
              </div>
            </div>

            <!-- Drivers Section -->
            <div class="section">
              <h2 class="section-header">
                <span class="section-icon">👨‍💼</span>
                Drivers Data
              </h2>
              ${driversData.length > 0 ? `
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>License</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Hire Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${driversData.map(driver => `
                      <tr>
                        <td>${driver.name || 'N/A'}</td>
                        <td>${driver.license || 'N/A'}</td>
                        <td>${driver.phone || 'N/A'}</td>
                        <td>${driver.status || 'N/A'}</td>
                        <td>${driver.hireDate || 'N/A'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : '<div class="no-data">No driver data available</div>'}
            </div>

            <!-- Trucks Section -->
            <div class="section">
              <h2 class="section-header">
                <span class="section-icon">🚛</span>
                Trucks Data
              </h2>
              ${trucksData.length > 0 ? `
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Truck Number</th>
                      <th>Make/Model</th>
                      <th>Year</th>
                      <th>Status</th>
                      <th>Mileage</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${trucksData.map(truck => `
                      <tr>
                        <td>${truck.truckNumber || 'N/A'}</td>
                        <td>${truck.make || 'N/A'} ${truck.model || ''}</td>
                        <td>${truck.year || 'N/A'}</td>
                        <td>${truck.status || 'N/A'}</td>
                        <td>${truck.mileage ? truck.mileage.toLocaleString() : 'N/A'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : '<div class="no-data">No truck data available</div>'}
            </div>

            <!-- Trips Section -->
            <div class="section">
              <h2 class="section-header">
                <span class="section-icon">🛣️</span>
                Trips Data
              </h2>
              ${tripsData.length > 0 ? `
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Load Number</th>
                      <th>Customer</th>
                      <th>Origin</th>
                      <th>Destination</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tripsData.map(trip => `
                      <tr>
                        <td>${trip.loadNumber || 'N/A'}</td>
                        <td>${trip.customer || 'N/A'}</td>
                        <td>${trip.origin || 'N/A'}</td>
                        <td>${trip.destination || 'N/A'}</td>
                        <td>${trip.status || 'N/A'}</td>
                        <td>$${trip.amount ? trip.amount.toLocaleString() : '0'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : '<div class="no-data">No trip data available</div>'}
            </div>

            <!-- Company Information -->
            <div class="company-info">
              <h3 style="margin-bottom: 15px; color: #1f2937;">Company Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Company:</span>
                  <span class="info-value">${userCredentials.company}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Contact:</span>
                  <span class="info-value">${userCredentials.firstName} ${userCredentials.lastName}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${userCredentials.email}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Phone:</span>
                  <span class="info-value">${userCredentials.phone}</span>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p><strong>ATONDA Truck Management System</strong></p>
              <p>This report contains confidential business information</p>
              <p>Generated on ${currentDate} at ${currentTime}</p>
            </div>
          </div>

          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="background: #2563eb; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; margin-right: 10px;">
              🖨️ Print / Save as PDF
            </button>
            <button onclick="window.close()" style="background: #6b7280; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 16px; cursor: pointer;">
              ✕ Close
            </button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    showNotification('Data export report generated successfully!');
  };

  const clearAllData = () => {
    if (confirm(t('dataManagement.clearConfirm'))) {
      localStorage.removeItem('truckManagement_drivers');
      localStorage.removeItem('truckManagement_trucks');
      localStorage.removeItem('truckManagement_trips');
      showNotification(t('dataManagement.clearSuccess'), 'success');
    }
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('atonda_user_credentials');
    const savedSettings = localStorage.getItem('atonda_app_settings');
    
    if (savedCredentials) {
      const parsed = JSON.parse(savedCredentials);
      setUserCredentials(parsed);
      setTempCredentials(parsed);
    }
    
    if (savedSettings) {
      setAppSettings(JSON.parse(savedSettings));
    }
  }, []);

  const tabs = [
    { id: 'profile', label: t('settings.profile'), icon: User },
    { id: 'appearance', label: t('settings.appearance'), icon: Palette },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
    { id: 'data', label: t('settings.data_management'), icon: Database },
    { id: 'system', label: t('settings.system'), icon: SettingsIcon }
  ];

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-blue-600" />
          {t('settings.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className={`w-64 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-sm p-4`}>
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-slate-700'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">{t('profile.title')}</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                    {t('profile.edit')}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveCredentials}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" />
                      {t('profile.save')}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      <X className="w-4 h-4" />
                      {t('profile.cancel')}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('profile.firstName')}</label>
                    <input
                      type="text"
                      value={tempCredentials.firstName}
                      onChange={(e) => setTempCredentials({ ...tempCredentials, firstName: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600' 
                          : 'bg-gray-50 border-gray-300'
                      } ${!isEditing ? 'cursor-not-allowed opacity-60' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('profile.lastName')}</label>
                    <input
                      type="text"
                      value={tempCredentials.lastName}
                      onChange={(e) => setTempCredentials({ ...tempCredentials, lastName: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600' 
                          : 'bg-gray-50 border-gray-300'
                      } ${!isEditing ? 'cursor-not-allowed opacity-60' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('profile.email')}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={tempCredentials.email}
                        onChange={(e) => setTempCredentials({ ...tempCredentials, email: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-slate-700 border-slate-600' 
                            : 'bg-gray-50 border-gray-300'
                        } ${!isEditing ? 'cursor-not-allowed opacity-60' : ''}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('profile.phone')}</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={tempCredentials.phone}
                        onChange={(e) => setTempCredentials({ ...tempCredentials, phone: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-slate-700 border-slate-600' 
                            : 'bg-gray-50 border-gray-300'
                        } ${!isEditing ? 'cursor-not-allowed opacity-60' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('profile.company')}</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={tempCredentials.company}
                        onChange={(e) => setTempCredentials({ ...tempCredentials, company: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-slate-700 border-slate-600' 
                            : 'bg-gray-50 border-gray-300'
                        } ${!isEditing ? 'cursor-not-allowed opacity-60' : ''}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('profile.address')}</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <textarea
                        value={tempCredentials.address}
                        onChange={(e) => setTempCredentials({ ...tempCredentials, address: e.target.value })}
                        disabled={!isEditing}
                        rows={3}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-slate-700 border-slate-600' 
                            : 'bg-gray-50 border-gray-300'
                        } ${!isEditing ? 'cursor-not-allowed opacity-60' : ''}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('profile.role')}</label>
                    <input
                      type="text"
                      value={tempCredentials.role}
                      disabled
                      className={`w-full px-4 py-2 rounded-lg border cursor-not-allowed opacity-60 ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600' 
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('profile.joinDate')}</label>
                      <input
                        type="text"
                        value={new Date(tempCredentials.joinDate).toLocaleDateString()}
                        disabled
                        className={`w-full px-4 py-2 rounded-lg border cursor-not-allowed opacity-60 ${
                          isDarkMode 
                            ? 'bg-slate-700 border-slate-600' 
                            : 'bg-gray-50 border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Login</label>
                      <input
                        type="text"
                        value={new Date(tempCredentials.lastLogin).toLocaleDateString()}
                        disabled
                        className={`w-full px-4 py-2 rounded-lg border cursor-not-allowed opacity-60 ${
                          isDarkMode 
                            ? 'bg-slate-700 border-slate-600' 
                            : 'bg-gray-50 border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h2 className="text-2xl font-semibold mb-6">{t('appearance.title')}</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-medium mb-4">{t('appearance.theme')}</label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => isDarkMode && toggleTheme()}
                      className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                        !isDarkMode 
                          ? 'border-blue-600 bg-blue-50 text-blue-600' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Sun className="w-8 h-8" />
                      <span>{t('appearance.lightMode')}</span>
                    </button>
                    
                    <button
                      onClick={() => !isDarkMode && toggleTheme()}
                      className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                        isDarkMode 
                          ? 'border-blue-600 bg-blue-50 text-blue-600' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Moon className="w-8 h-8" />
                      <span>{t('appearance.darkMode')}</span>
                    </button>
                    
                    <button
                      className="p-4 rounded-lg border-2 border-gray-300 hover:border-gray-400 flex flex-col items-center gap-2 opacity-50 cursor-not-allowed"
                      disabled
                    >
                      <Monitor className="w-8 h-8" />
                      <span>{t('appearance.autoMode')}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('appearance.companyLogo')}</label>
                  <input
                    type="text"
                    value={appSettings.companyLogo}
                    onChange={(e) => handleSettingChange('companyLogo', e.target.value)}
                    className={`w-full max-w-md px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-700 border-slate-600' 
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  />
                  <p className="text-sm text-gray-500 mt-1">This will update the logo text in the sidebar</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h2 className="text-2xl font-semibold mb-6">{t('notifications.title')}</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{t('notifications.push')}</h3>
                    <p className="text-sm text-gray-500">{t('notifications.pushDescription')}</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('notifications', !appSettings.notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      appSettings.notifications ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        appSettings.notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{t('notifications.email')}</h3>
                    <p className="text-sm text-gray-500">{t('notifications.emailDescription')}</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('emailNotifications', !appSettings.emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      appSettings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        appSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h2 className="text-2xl font-semibold mb-6">{t('dataManagement.title')}</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{t('dataManagement.autoSave')}</h3>
                    <p className="text-sm text-gray-500">{t('dataManagement.autoSaveDescription')}</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('autoSave', !appSettings.autoSave)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      appSettings.autoSave ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        appSettings.autoSave ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{t('dataManagement.autoBackup')}</h3>
                    <p className="text-sm text-gray-500">{t('dataManagement.autoBackupDescription')}</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('autoBackup', !appSettings.autoBackup)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      appSettings.autoBackup ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        appSettings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('dataManagement.dataRetention')}</label>
                  <select
                    value={appSettings.dataRetention}
                    onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
                    className={`w-full max-w-md px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-700 border-slate-600' 
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                    <option value={180}>180 days</option>
                    <option value={365}>1 year</option>
                    <option value={-1}>Forever</option>
                  </select>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">{t('dataManagement.exportImport')}</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={exportData}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      {t('dataManagement.exportData')}
                    </button>
                    
                    <button
                      onClick={() => alert(t('dataManagement.importComingSoon'))}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Upload className="w-4 h-4" />
                      {t('dataManagement.importData')}
                    </button>
                    
                    <button
                      onClick={clearAllData}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('dataManagement.clearAllData')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h2 className="text-2xl font-semibold mb-6">{t('system.title')}</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('system.defaultCurrency')}</label>
                    <select
                      value={appSettings.defaultCurrency}
                      onChange={(e) => handleSettingChange('defaultCurrency', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600' 
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD (C$)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('system.dateFormat')}</label>
                    <select
                      value={appSettings.dateFormat}
                      onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600' 
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('system.timeFormat')}</label>
                    <select
                      value={appSettings.timeFormat}
                      onChange={(e) => handleSettingChange('timeFormat', e.target.value as '12h' | '24h')}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600' 
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <option value="12h">{t('system.12Hour')}</option>
                      <option value="24h">{t('system.24Hour')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('system.language')}</label>
                    <select
                      value={appSettings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600' 
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <option value="English">{t('system.english')}</option>
                      <option value="Spanish">{t('system.spanish')}</option>
                      <option value="French">{t('system.french')}</option>
                      <option value="German">{t('system.german')}</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">{t('system.systemInfo')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>Application Version:</span>
                      <span className="font-medium">1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span className="font-medium">October 13, 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Storage:</span>
                      <span className="font-medium">localStorage</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Theme:</span>
                      <span className="font-medium">{isDarkMode ? 'Dark' : 'Light'}</span>
                    </div>
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