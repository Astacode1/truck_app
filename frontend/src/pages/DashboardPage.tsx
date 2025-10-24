import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import GroupIcon from '@mui/icons-material/Group'
import PlaceIcon from '@mui/icons-material/Place'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import WarningIcon from '@mui/icons-material/Warning'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import BarChartIcon from '@mui/icons-material/BarChart'
import EventIcon from '@mui/icons-material/Event'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import TimelineIcon from '@mui/icons-material/Timeline'
import FlashOnIcon from '@mui/icons-material/FlashOn'
import InventoryIcon from '@mui/icons-material/Inventory'
import SettingsIcon from '@mui/icons-material/Settings'
import NotificationsIcon from '@mui/icons-material/Notifications'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import BuildIcon from '@mui/icons-material/Build'

function DashboardPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}>
      {/* Professional Header */}
      <div style={{ 
        background: 'rgba(15, 23, 42, 0.8)', 
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(34, 211, 238, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <div className="mx-auto max-w-7xl px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Fleet Dashboard
                </h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{
                  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(129, 140, 248, 0.2) 100%)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  color: '#22d3ee',
                  letterSpacing: '0.15em'
                }}>
                  ATONDA
                </span>
              </div>
              <p className="text-sm flex items-center gap-2" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>
                <TimelineIcon sx={{ fontSize: 16 }} className="text-primary" />
                Real-time fleet monitoring and analytics
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <div style={{
                background: 'rgba(34, 211, 238, 0.1)',
                border: '1px solid rgba(34, 211, 238, 0.3)',
                backdropFilter: 'blur(10px)'
              }} className="px-4 py-2 rounded-lg flex items-center gap-2">
                <EventIcon sx={{ fontSize: 16 }} className="text-primary" />
                <span className="text-sm font-medium text-white">Aug 2025 - Sep 2025</span>
              </div>
              <button style={{
                background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                boxShadow: '0 4px 15px rgba(34, 211, 238, 0.4)'
              }} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white hover:shadow-xl transition-all">
                <NotificationsIcon sx={{ fontSize: 16 }} className="inline mr-2" />
                Notifications
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-8 space-y-6">
        
        {/* Top Stats Cards - 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1 - Active Trips */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(34, 211, 238, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }} className="rounded-2xl p-6 hover:scale-105 transition-transform duration-300 cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div style={{
                background: 'rgba(34, 211, 238, 0.2)',
                boxShadow: '0 4px 15px rgba(34, 211, 238, 0.3)'
              }} className="w-12 h-12 rounded-xl flex items-center justify-center">
                <LocalShippingIcon sx={{ fontSize: 24 }} className="text-primary" />
              </div>
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }} className="px-3 py-1 rounded-full flex items-center gap-1">
                <TrendingUpIcon sx={{ fontSize: 12 }} className="text-success" />
                <span className="text-xs font-bold text-success">+12.5%</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>
                Active Trips
              </p>
              <p className="text-4xl font-bold text-white mb-1">247</p>
              <p className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
                <TimelineIcon sx={{ fontSize: 12 }} className="inline mr-1" />
                18 completed today
              </p>
            </div>
          </div>

          {/* Card 2 - Active Trucks */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }} className="rounded-2xl p-6 hover:scale-105 transition-transform duration-300 cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
              }} className="w-12 h-12 rounded-xl flex items-center justify-center">
                <PlaceIcon sx={{ fontSize: 24 }} className="text-success" />
              </div>
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }} className="px-3 py-1 rounded-full">
                <span className="text-xs font-bold text-success">Active</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>
                Active Trucks
              </p>
              <p className="text-4xl font-bold text-white mb-1">45</p>
              <p className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
                <BuildIcon sx={{ fontSize: 12 }} className="inline mr-1" />
                7 in maintenance
              </p>
            </div>
          </div>

          {/* Card 3 - Revenue */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(251, 146, 60, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }} className="rounded-2xl p-6 hover:scale-105 transition-transform duration-300 cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div style={{
                background: 'rgba(251, 146, 60, 0.2)',
                boxShadow: '0 4px 15px rgba(251, 146, 60, 0.3)'
              }} className="w-12 h-12 rounded-xl flex items-center justify-center">
                <AttachMoneyIcon sx={{ fontSize: 24, color: '#fb923c' }} />
              </div>
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }} className="px-3 py-1 rounded-full flex items-center gap-1">
                <TrendingUpIcon sx={{ fontSize: 12 }} className="text-success" />
                <span className="text-xs font-bold text-success">+8.3%</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>
                Monthly Revenue
              </p>
              <p className="text-4xl font-bold text-white mb-1">$87.2K</p>
              <p className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
                <BarChartIcon sx={{ fontSize: 12 }} className="inline mr-1" />
                Target: $95K
              </p>
            </div>
          </div>

          {/* Card 4 - Fuel Efficiency */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(129, 140, 248, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }} className="rounded-2xl p-6 hover:scale-105 transition-transform duration-300 cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div style={{
                background: 'rgba(129, 140, 248, 0.2)',
                boxShadow: '0 4px 15px rgba(129, 140, 248, 0.3)'
              }} className="w-12 h-12 rounded-xl flex items-center justify-center">
                <FlashOnIcon sx={{ fontSize: 24, color: '#818cf8' }} />
              </div>
              <div style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }} className="px-3 py-1 rounded-full flex items-center gap-1">
                <TrendingDownIcon sx={{ fontSize: 12 }} className="text-error" />
                <span className="text-xs font-bold text-error">-3.2%</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>
                Fuel Efficiency
              </p>
              <p className="text-4xl font-bold text-white mb-1">6.8 MPG</p>
              <p className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
                <WarningIcon sx={{ fontSize: 12 }} className="inline mr-1" />
                Target: 7.2 MPG
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Takes 2 spaces */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fleet Activity Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }} className="rounded-2xl p-6 hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Recent Activity</h3>
                  <p className="text-sm" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
                    Live fleet updates and notifications
                  </p>
                </div>
                <button className="text-sm font-medium text-primary hover:text-primary-light flex items-center gap-1 transition-colors">
                  View All
                  <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </button>
              </div>
              <div className="space-y-4">
                {/* Activity Item 1 */}
                <div style={{
                  background: 'rgba(34, 211, 238, 0.05)',
                  border: '1px solid rgba(34, 211, 238, 0.1)',
                  backdropFilter: 'blur(10px)'
                }} className="p-4 rounded-xl hover:bg-opacity-80 transition-all cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)'
                    }} className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon sx={{ fontSize: 24 }} className="text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white mb-1">Delivery Completed</p>
                      <p className="text-sm" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
                        Truck #TRK-2847 completed route to Chicago warehouse
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs px-2 py-1 rounded" style={{ 
                          background: 'rgba(16, 185, 129, 0.2)', 
                          color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}>
                          Completed
                        </span>
                        <span className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
                          <AccessTimeIcon sx={{ fontSize: 12 }} className="inline mr-1" />
                          2 min ago
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Item 2 */}
                <div style={{
                  background: 'rgba(34, 211, 238, 0.05)',
                  border: '1px solid rgba(34, 211, 238, 0.1)',
                  backdropFilter: 'blur(10px)'
                }} className="p-4 rounded-xl hover:bg-opacity-80 transition-all cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div style={{
                      background: 'rgba(34, 211, 238, 0.2)',
                      boxShadow: '0 4px 15px rgba(34, 211, 238, 0.2)'
                    }} className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                      <LocalShippingIcon sx={{ fontSize: 24 }} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white mb-1">New Route Assigned</p>
                      <p className="text-sm" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
                        Driver John Martinez started trip to Dallas
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs px-2 py-1 rounded" style={{ 
                          background: 'rgba(34, 211, 238, 0.2)', 
                          color: '#22d3ee',
                          border: '1px solid rgba(34, 211, 238, 0.3)'
                        }}>
                          In Progress
                        </span>
                        <span className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
                          <AccessTimeIcon sx={{ fontSize: 12 }} className="inline mr-1" />
                          15 min ago
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Item 3 */}
                <div style={{
                  background: 'rgba(34, 211, 238, 0.05)',
                  border: '1px solid rgba(34, 211, 238, 0.1)',
                  backdropFilter: 'blur(10px)'
                }} className="p-4 rounded-xl hover:bg-opacity-80 transition-all cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div style={{
                      background: 'rgba(251, 146, 60, 0.2)',
                      boxShadow: '0 4px 15px rgba(251, 146, 60, 0.2)'
                    }} className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                      <WarningIcon sx={{ fontSize: 24, color: '#fb923c' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white mb-1">Maintenance Alert</p>
                      <p className="text-sm" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
                        Truck #TRK-1523 scheduled for oil change
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs px-2 py-1 rounded" style={{ 
                          background: 'rgba(251, 146, 60, 0.2)', 
                          color: '#fb923c',
                          border: '1px solid rgba(251, 146, 60, 0.3)'
                        }}>
                          Attention
                        </span>
                        <span className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
                          <AccessTimeIcon sx={{ fontSize: 12 }} className="inline mr-1" />
                          1 hour ago
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Item 4 */}
                <div style={{
                  background: 'rgba(34, 211, 238, 0.05)',
                  border: '1px solid rgba(34, 211, 238, 0.1)',
                  backdropFilter: 'blur(10px)'
                }} className="p-4 rounded-xl hover:bg-opacity-80 transition-all cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)'
                    }} className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CancelIcon sx={{ fontSize: 24 }} className="text-error" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white mb-1">Delay Reported</p>
                      <p className="text-sm" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
                        Route delayed due to traffic conditions
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs px-2 py-1 rounded" style={{ 
                          background: 'rgba(239, 68, 68, 0.2)', 
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}>
                          Delayed
                        </span>
                        <span className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
                          <AccessTimeIcon sx={{ fontSize: 12 }} className="inline mr-1" />
                          2 hours ago
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Performance */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }} className="rounded-2xl p-6 hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Driver Performance</h3>
                  <p className="text-sm" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
                    Top performing drivers
                  </p>
                </div>
                <ArrowForwardIcon sx={{ fontSize: 20 }} className="text-primary" />
              </div>
              <div className="space-y-4">
                {/* Driver 1 - Holographic */}
                <div style={{
                  background: 'rgba(34, 211, 238, 0.05)',
                  border: '1px solid rgba(34, 211, 238, 0.1)',
                  backdropFilter: 'blur(10px)'
                }} className="p-4 rounded-xl hover:scale-102 transition-transform">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Holographic Avatar */}
                      <div className="relative">
                        {/* Glow Effect */}
                        <div className="absolute inset-0 rounded-full animate-pulse" style={{
                          background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.4) 0%, rgba(129, 140, 248, 0.4) 100%)',
                          filter: 'blur(12px)',
                          transform: 'scale(1.3)'
                        }}></div>
                        
                        {/* Avatar with Holographic Ring */}
                        <div style={{
                          background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                          boxShadow: '0 0 20px rgba(34, 211, 238, 0.6), 0 4px 15px rgba(34, 211, 238, 0.3)',
                          border: '2px solid rgba(34, 211, 238, 0.5)',
                          animation: 'pulse 2s ease-in-out infinite'
                        }} className="relative w-12 h-12 rounded-full flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full" style={{
                            background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                            animation: 'spin 3s linear infinite'
                          }}></div>
                          <GroupIcon sx={{ fontSize: 24, filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))' }} className="text-white relative z-10" />
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold text-white">John Martinez</p>
                        <p className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
                          ID: DRV-2847
                        </p>
                      </div>
                    </div>
                    <span className="text-xl font-bold" style={{
                      background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 0 20px rgba(34, 211, 238, 0.5)'
                    }}>98%</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: 'rgba(148, 163, 184, 0.2)' }}>
                    <div className="h-full rounded-full" style={{ 
                      width: '98%', 
                      background: 'linear-gradient(to right, #22d3ee, #06b6d4)',
                      boxShadow: '0 0 10px rgba(34, 211, 238, 0.5)'
                    }}></div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
                      247 trips completed
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ 
                      background: 'rgba(16, 185, 129, 0.2)', 
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}>
                      Excellent
                    </span>
                  </div>
                </div>

                {/* Driver 2 - Holographic */}
                <div style={{
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.1)',
                  backdropFilter: 'blur(10px)'
                }} className="p-4 rounded-xl hover:scale-102 transition-transform">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Holographic Avatar */}
                      <div className="relative">
                        {/* Glow Effect */}
                        <div className="absolute inset-0 rounded-full animate-pulse" style={{
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.4) 0%, rgba(5, 150, 105, 0.4) 100%)',
                          filter: 'blur(12px)',
                          transform: 'scale(1.3)'
                        }}></div>
                        
                        {/* Avatar with Holographic Ring */}
                        <div style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          boxShadow: '0 0 20px rgba(16, 185, 129, 0.6), 0 4px 15px rgba(16, 185, 129, 0.3)',
                          border: '2px solid rgba(16, 185, 129, 0.5)',
                          animation: 'pulse 2s ease-in-out infinite'
                        }} className="relative w-12 h-12 rounded-full flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full" style={{
                            background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                            animation: 'spin 3s linear infinite'
                          }}></div>
                          <GroupIcon sx={{ fontSize: 24, filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))' }} className="text-white relative z-10" />
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold text-white">Sarah Chen</p>
                        <p className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
                          ID: DRV-1523
                        </p>
                      </div>
                    </div>
                    <span className="text-xl font-bold" style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
                    }}>95%</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: 'rgba(148, 163, 184, 0.2)' }}>
                    <div className="h-full rounded-full" style={{ 
                      width: '95%', 
                      background: 'linear-gradient(to right, #10b981, #059669)',
                      boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                    }}></div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
                      198 trips completed
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ 
                      background: 'rgba(16, 185, 129, 0.2)', 
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}>
                      Excellent
                    </span>
                  </div>
                </div>

                {/* Driver 3 - Holographic */}
                <div style={{
                  background: 'rgba(251, 146, 60, 0.05)',
                  border: '1px solid rgba(251, 146, 60, 0.1)',
                  backdropFilter: 'blur(10px)'
                }} className="p-4 rounded-xl hover:scale-102 transition-transform">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Holographic Avatar */}
                      <div className="relative">
                        {/* Glow Effect */}
                        <div className="absolute inset-0 rounded-full animate-pulse" style={{
                          background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.4) 0%, rgba(249, 115, 22, 0.4) 100%)',
                          filter: 'blur(12px)',
                          transform: 'scale(1.3)'
                        }}></div>
                        
                        {/* Avatar with Holographic Ring */}
                        <div style={{
                          background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                          boxShadow: '0 0 20px rgba(251, 146, 60, 0.6), 0 4px 15px rgba(251, 146, 60, 0.3)',
                          border: '2px solid rgba(251, 146, 60, 0.5)',
                          animation: 'pulse 2s ease-in-out infinite'
                        }} className="relative w-12 h-12 rounded-full flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full" style={{
                            background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                            animation: 'spin 3s linear infinite'
                          }}></div>
                          <GroupIcon sx={{ fontSize: 24, filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))' }} className="text-white relative z-10" />
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold text-white">Mike Johnson</p>
                        <p className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
                          ID: DRV-3891
                        </p>
                      </div>
                    </div>
                    <span className="text-xl font-bold" style={{
                      background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 0 20px rgba(251, 146, 60, 0.5)'
                    }}>87%</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: 'rgba(148, 163, 184, 0.2)' }}>
                    <div className="h-full rounded-full" style={{ 
                      width: '87%', 
                      background: 'linear-gradient(to right, #fb923c, #f97316)',
                      boxShadow: '0 0 10px rgba(251, 146, 60, 0.5)'
                    }}></div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
                      145 trips completed
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ 
                      background: 'rgba(251, 146, 60, 0.2)', 
                      color: '#fb923c',
                      border: '1px solid rgba(251, 146, 60, 0.3)'
                    }}>
                      Good
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Sidebar - Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Quick Actions Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }} className="rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <button style={{
                  background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                  boxShadow: '0 4px 15px rgba(34, 211, 238, 0.4)'
                }} className="w-full p-4 rounded-xl text-left hover:scale-105 transition-transform">
                  <div className="flex items-center gap-3">
                    <LocalShippingIcon sx={{ fontSize: 24 }} className="text-white" />
                    <div>
                      <p className="text-sm font-semibold text-white">New Trip</p>
                      <p className="text-xs text-white text-opacity-80">Create route</p>
                    </div>
                    <ChevronRightIcon sx={{ fontSize: 20 }} className="text-white ml-auto" />
                  </div>
                </button>

                <button style={{
                  background: 'rgba(34, 211, 238, 0.1)',
                  border: '1px solid rgba(34, 211, 238, 0.2)',
                  backdropFilter: 'blur(10px)'
                }} className="w-full p-4 rounded-xl text-left hover:bg-opacity-80 transition-all">
                  <div className="flex items-center gap-3">
                    <GroupIcon sx={{ fontSize: 24 }} className="text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-white">Manage Drivers</p>
                      <p className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>45 active</p>
                    </div>
                    <ChevronRightIcon sx={{ fontSize: 20, color: 'rgba(148, 163, 184, 0.4)' }} className="ml-auto" />
                  </div>
                </button>

                <button style={{
                  background: 'rgba(34, 211, 238, 0.1)',
                  border: '1px solid rgba(34, 211, 238, 0.2)',
                  backdropFilter: 'blur(10px)'
                }} className="w-full p-4 rounded-xl text-left hover:bg-opacity-80 transition-all">
                  <div className="flex items-center gap-3">
                    <BarChartIcon sx={{ fontSize: 24 }} className="text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-white">View Reports</p>
                      <p className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>Analytics</p>
                    </div>
                    <ChevronRightIcon sx={{ fontSize: 20, color: 'rgba(148, 163, 184, 0.4)' }} className="ml-auto" />
                  </div>
                </button>

                <button style={{
                  background: 'rgba(34, 211, 238, 0.1)',
                  border: '1px solid rgba(34, 211, 238, 0.2)',
                  backdropFilter: 'blur(10px)'
                }} className="w-full p-4 rounded-xl text-left hover:bg-opacity-80 transition-all">
                  <div className="flex items-center gap-3">
                    <SettingsIcon sx={{ fontSize: 24 }} className="text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-white">Settings</p>
                      <p className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>Configure</p>
                    </div>
                    <ChevronRightIcon sx={{ fontSize: 20, color: 'rgba(148, 163, 184, 0.4)' }} className="ml-auto" />
                  </div>
                </button>
              </div>
            </div>

            {/* Fleet Status Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }} className="rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Fleet Status</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>Active</span>
                    <span className="text-sm font-bold text-primary">45 trucks</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: 'rgba(148, 163, 184, 0.2)' }}>
                    <div className="h-full rounded-full" style={{ 
                      width: '86%', 
                      background: 'linear-gradient(to right, #22d3ee, #06b6d4)',
                      boxShadow: '0 0 10px rgba(34, 211, 238, 0.5)'
                    }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>Maintenance</span>
                    <span className="text-sm font-bold" style={{ color: '#fb923c' }}>7 trucks</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: 'rgba(148, 163, 184, 0.2)' }}>
                    <div className="h-full rounded-full" style={{ 
                      width: '14%', 
                      background: 'linear-gradient(to right, #fb923c, #f97316)',
                      boxShadow: '0 0 10px rgba(251, 146, 60, 0.5)'
                    }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>Total Fleet</span>
                    <span className="text-sm font-bold text-white">52 trucks</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: 'rgba(148, 163, 184, 0.2)' }}>
                    <div className="h-full rounded-full" style={{ 
                      width: '100%', 
                      background: 'linear-gradient(to right, #10b981, #059669)',
                      boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                    }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Old sections placeholder */}
        <div style={{ display: 'none' }}>
          {/* Revenue Card */}
          

          {/* Efficiency Card */}
          <div className="stat-card stat-card-error group">
            <div className="stat-card-header">
              <div className="stat-icon-wrapper bg-warning-100 text-warning-700">
                <WarningIcon sx={{ fontSize: 24 }} />
              </div>
              <div className="stat-badge stat-badge-warning">
                <TrendingDownIcon sx={{ fontSize: 12 }} />
                -3.2%
              </div>
            </div>
            <div className="stat-card-content">
              <h3 className="stat-label">Fuel Efficiency</h3>
              <div className="flex items-baseline gap-2">
                <p className="stat-value text-warning-700">6.8</p>
                <span className="stat-subvalue">MPG avg</span>
              </div>
              <div className="stat-progress-bar">
                <div className="stat-progress-fill bg-warning-600" style={{ width: '68%' }}></div>
              </div>
            </div>
            <div className="stat-card-footer">
              <span className="stat-footer-text">
                <TimelineIcon sx={{ fontSize: 12 }} />
                Below target (7.2 MPG)
              </span>
              <ChevronRightIcon sx={{ fontSize: 16 }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

        </div>

        {/* Bottom Stats Row - 3 Glassy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }} className="rounded-xl p-6 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold text-white">29,960</div>
              <span className="text-xs px-2 py-1 rounded flex items-center gap-1" style={{ 
                background: 'rgba(34, 211, 238, 0.1)', 
                color: '#22d3ee' 
              }}>
                <TrendingUpIcon sx={{ fontSize: 12 }} />
                17%
              </span>
            </div>
            <p className="text-sm" style={{ color: 'rgba(226, 232, 240, 0.6)' }}>Product in inventory</p>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }} className="rounded-xl p-6 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold text-white">18,960</div>
              <span className="text-xs px-2 py-1 rounded flex items-center gap-1" style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                color: '#ef4444' 
              }}>
                <TrendingDownIcon sx={{ fontSize: 12 }} />
                0.6%
              </span>
            </div>
            <p className="text-sm" style={{ color: 'rgba(226, 232, 240, 0.6)' }}>Product has been sold</p>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }} className="rounded-xl p-6 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold text-white">960</div>
              <span className="text-xs px-2 py-1 rounded flex items-center gap-1" style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                color: '#ef4444' 
              }}>
                <TrendingDownIcon sx={{ fontSize: 12 }} />
                0.2%
              </span>
            </div>
            <p className="text-sm" style={{ color: 'rgba(226, 232, 240, 0.6)' }}>Product has been returned</p>
          </div>
        </div>

        {/* Product Running Out - Bottom Card */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }} className="rounded-xl p-6 hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Product running out of stock</h3>
            <ArrowForwardIcon sx={{ fontSize: 20, color: 'rgba(148, 163, 184, 0.6)' }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <InventoryIcon sx={{ fontSize: 48, padding: '8px' }} className="rounded-lg" style={{ 
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444'
              }} />
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-1">Fanta Strawberry</p>
                <p className="text-xs mb-2" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>250ml</p>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-2xl font-bold text-white">1200</p>
                    <p className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>sold</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">120</p>
                    <p className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>in stock</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded flex items-center gap-1" style={{ 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    color: '#ef4444' 
                  }}>
                    <TrendingDownIcon sx={{ fontSize: 12 }} />
                    0.4%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <InventoryIcon sx={{ fontSize: 48, padding: '8px' }} className="rounded-lg" style={{ 
                background: 'rgba(34, 211, 238, 0.1)',
                color: '#22d3ee'
              }} />
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-1">Royco Ayam</p>
                <p className="text-xs mb-2" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>150ml</p>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-2xl font-bold text-white">2200</p>
                    <p className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>sold</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">90</p>
                    <p className="text-xs" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>in stock</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded flex items-center gap-1" style={{ 
                    background: 'rgba(34, 211, 238, 0.1)', 
                    color: '#22d3ee' 
                  }}>
                    <TrendingUpIcon sx={{ fontSize: 12 }} />
                    0.7%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder for removed sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" style={{ display: 'none' }}>
          <div className="lg:col-span-2">
            
            <div className="p-6">
              <div className="space-y-4">
                {/* Activity Item 1 */}
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon sx={{ fontSize: 20 }} className="text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Delivery Completed</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Truck #TRK-2847 completed route to Chicago warehouse</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">2 min ago</p>
                    <span className="inline-block mt-1 text-xs font-medium text-success px-2 py-0.5 bg-success/10 rounded">Completed</span>
                  </div>
                </div>

                {/* Activity Item 2 */}
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <LocalShippingIcon sx={{ fontSize: 20 }} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">New Route Assigned</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Driver John Martinez started trip to Dallas</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">15 min ago</p>
                    <span className="inline-block mt-1 text-xs font-medium text-primary px-2 py-0.5 bg-primary/10 rounded">In Progress</span>
                  </div>
                </div>

                {/* Activity Item 3 */}
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                    <WarningIcon sx={{ fontSize: 20 }} className="text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Maintenance Alert</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Truck #TRK-1523 scheduled for oil change</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">1 hour ago</p>
                    <span className="inline-block mt-1 text-xs font-medium text-warning px-2 py-0.5 bg-warning/10 rounded">Attention</span>
                  </div>
                </div>

                {/* Activity Item 4 */}
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center flex-shrink-0">
                    <CancelIcon sx={{ fontSize: 20 }} className="text-error" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Delay Reported</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Route delayed due to traffic conditions</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">2 hours ago</p>
                    <span className="inline-block mt-1 text-xs font-medium text-error px-2 py-0.5 bg-error/10 rounded">Delayed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions - Takes 1 column */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Quick Actions</h2>
            </div>
            
            <div className="p-6 space-y-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors text-left">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <LocalShippingIcon sx={{ fontSize: 20 }} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">New Trip</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Create route</p>
                </div>
                <ChevronRightIcon sx={{ fontSize: 20 }} className="text-neutral-400" />
              </button>

              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors text-left">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <GroupIcon sx={{ fontSize: 20 }} className="text-success" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Manage Drivers</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">45 active</p>
                </div>
                <ChevronRightIcon sx={{ fontSize: 20 }} className="text-neutral-400" />
              </button>

              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors text-left">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BarChartIcon sx={{ fontSize: 20 }} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">View Reports</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Analytics</p>
                </div>
                <ChevronRightIcon sx={{ fontSize: 20 }} className="text-neutral-400" />
              </button>

              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors text-left">
                <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center flex-shrink-0">
                  <SettingsIcon sx={{ fontSize: 20 }} className="text-coral" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Settings</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Configure</p>
                </div>
                <ChevronRightIcon sx={{ fontSize: 20 }} className="text-neutral-400" />
              </button>
            </div>
          </div>

        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-5 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <GroupIcon sx={{ fontSize: 20 }} className="text-primary" />
              </div>
              <span className="text-xs font-medium text-success px-2 py-1 bg-success/10 rounded">+5 this week</span>
            </div>
            <p className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100 mb-1">127</p>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Active Drivers</p>
            <div className="mt-3 flex items-center gap-1.5 text-sm text-success">
              <TrendingUpIcon sx={{ fontSize: 16 }} />
              <span>8% increase</span>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-5 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <InventoryIcon sx={{ fontSize: 20 }} className="text-success" />
              </div>
              <span className="text-xs font-medium text-neutral-500 px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded">342 today</span>
            </div>
            <p className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100 mb-1">12,847</p>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Deliveries This Month</p>
            <div className="mt-3 flex items-center gap-1.5 text-sm text-success">
              <TrendingUpIcon sx={{ fontSize: 16 }} />
              <span>12% increase</span>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-5 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center">
                <AccessTimeIcon sx={{ fontSize: 20 }} className="text-coral" />
              </div>
              <span className="text-xs font-medium text-neutral-500 px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded">96.5%</span>
            </div>
            <p className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100 mb-1">4.2h</p>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Avg Delivery Time</p>
            <div className="mt-3 flex items-center gap-1.5 text-sm text-success">
              <TrendingUpIcon sx={{ fontSize: 16 }} />
              <span>2% faster</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;