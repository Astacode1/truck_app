import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
// Material UI Icons - Premium Modern Design
import DashboardIcon from '@mui/icons-material/Dashboard'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import MapIcon from '@mui/icons-material/Map'
import GroupIcon from '@mui/icons-material/Group'
import BuildIcon from '@mui/icons-material/Build'
import NotificationsIcon from '@mui/icons-material/Notifications'
import SettingsIcon from '@mui/icons-material/Settings'
import BarChartIcon from '@mui/icons-material/BarChart'
import DescriptionIcon from '@mui/icons-material/Description'
import SecurityIcon from '@mui/icons-material/Security'
import ReceiptIcon from '@mui/icons-material/Receipt'
import CalculateIcon from '@mui/icons-material/Calculate'
import ChatIcon from '@mui/icons-material/Chat'
import { SvgIconProps } from '@mui/material/SvgIcon'
import NotificationBar from './NotificationBar'
import ProfileManager from './ProfileManager'
import { useTheme } from '../contexts/ThemeContext'
import { useTranslation } from '../contexts/TranslationContext'
import '../styles/sidebar.css'

interface LayoutProps {
  children: ReactNode
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<SvgIconProps>
  badge?: number
  section: string
}

interface NavigationItem {
  name: string
  translationKey: string
  href: string
  icon: React.ComponentType<SvgIconProps>
  badge?: number
  section: string
}

const navigationItems: Omit<NavigationItem, 'name'>[] = [
  { translationKey: 'nav.dashboard', href: '/', icon: DashboardIcon, section: 'overview' },
  { translationKey: 'nav.analytics', href: '/analytics', icon: BarChartIcon, section: 'overview' },
  
  { translationKey: 'nav.trucks', href: '/trucks', icon: LocalShippingIcon, section: 'fleet' },
  { translationKey: 'nav.trips', href: '/trips', icon: MapIcon, badge: 3, section: 'fleet' },
  { translationKey: 'nav.drivers', href: '/drivers', icon: GroupIcon, section: 'fleet' },
  
  { translationKey: 'nav.invoices', href: '/invoices', icon: ReceiptIcon, badge: 2, section: 'financial' },
  { translationKey: 'nav.ifta_calculator', href: '/ifta', icon: CalculateIcon, section: 'financial' },
  { translationKey: 'nav.ifta_form', href: '/ifta-form', icon: DescriptionIcon, section: 'financial' },
  { translationKey: 'nav.maintenance', href: '/maintenance', icon: BuildIcon, badge: 2, section: 'operations' },
  { translationKey: 'nav.reports', href: '/reports', icon: DescriptionIcon, section: 'operations' },
  { translationKey: 'nav.safety', href: '/safety', icon: SecurityIcon, section: 'operations' },
  { translationKey: 'nav.communications', href: '/communications', icon: ChatIcon, badge: 5, section: 'system' },
  { translationKey: 'nav.settings', href: '/settings', icon: SettingsIcon, section: 'system' },
]

const sectionKeys = {
  overview: 'Overview',
  fleet: 'Fleet Management', 
  financial: 'Financial',
  operations: 'Operations',
  system: 'System'
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()

  // Create navigation with translated names
  const navigation: NavigationItem[] = navigationItems.map(item => ({
    ...item,
    name: t(item.translationKey)
  }))

  const getSectionItems = (sectionKey: string) => 
    navigation.filter(item => item.section === sectionKey)

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)' }}>
      {/* Glassy Sidebar - Fixed Layout */}
      <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* PROFILE MANAGER - INTERACTIVE WITH IMAGE UPLOAD */}
        <ProfileManager />

        {/* Navigation - SCROLLABLE */}
        <nav className="flex-1 overflow-y-auto px-3 py-6" style={{ 
          flexGrow: 1,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          {/* Render each section */}
          {Object.entries(sectionKeys).map(([key, label]) => (
            <div key={key} className="nav-section">
              <div className="nav-section-title">
                {label}
              </div>
              <ul className="space-y-1">
                {getSectionItems(key).map((item) => {
                  const isActive = location.pathname === item.href
                  const IconComponent = item.icon
                  
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                      >
                        <IconComponent style={{ fontSize: '20px', minWidth: '20px' }} />
                        <span className="nav-text">{item.name}</span>
                        {item.badge && (
                          <span className="nav-badge">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}

          {/* Settings section at the bottom with professional styling */}
          <div className="nav-section mt-8 pt-4 border-t border-white border-opacity-20">
            <ul className="space-y-1">
              <li>
                <Link
                  to="/notifications"
                  className={`nav-item ${location.pathname === '/notifications' ? 'active' : ''}`}
                >
                  <NotificationsIcon style={{ fontSize: '20px' }} />
                  <span className="nav-text">Notifications</span>
                  <span className="nav-badge">5</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/settings"
                  className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
                >
                  <SettingsIcon style={{ fontSize: '20px' }} />
                  <span className="nav-text">Settings</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        
        {/* ATONDA Footer Branding - FIXED */}
        <div className="p-6" style={{
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, transparent 100%)',
          backdropFilter: 'blur(10px)',
          flexShrink: 0
        }}>
          <div className="text-center">
            <div className="mb-2">
              <span className="text-2xl font-black tracking-widest" style={{
                background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 50%, #fb923c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 20px rgba(34, 211, 238, 0.3)'
              }}>ATONDA</span>
            </div>
            <p className="text-xs font-medium" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
              © 2025 Fleet Management System
            </p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{
                background: '#10b981',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)'
              }}></div>
              <span className="text-xs font-semibold" style={{ color: '#10b981' }}>
                System Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Notification Bar - FIXED STATIC HEADER */}
        <div style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 40,
          flexShrink: 0
        }}>
          <NotificationBar />
        </div>
        
        {/* Scrollable Content Area */}
        <main style={{ 
          flexGrow: 1, 
          overflowY: 'auto',
          minHeight: 0
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}
