# Truck Tracking & Expense Management System - Design Specification

## 1. Page Inventory

### Admin Pages

| Page | URL | Purpose | Key Features |
|------|-----|---------|--------------|
| **Admin Dashboard** | `/admin/dashboard` | Overview of fleet operations, KPIs, and alerts | Fleet metrics, active trips, maintenance alerts, financial summary |
| **Fleet Management** | `/admin/fleet` | Manage trucks, assignments, and status | Truck listing, driver assignments, maintenance scheduling |
| **Driver Management** | `/admin/drivers` | Manage driver profiles, licenses, and performance | Driver profiles, license tracking, performance metrics |
| **Trip Management** | `/admin/trips` | Monitor all trips, routes, and completion status | Trip overview, route tracking, completion rates |
| **Expense Management** | `/admin/expenses` | Review and approve expenses, receipts, and reimbursements | Expense approval workflow, receipt verification, reimbursement processing |
| **Invoicing** | `/admin/invoicing` | Generate and manage client invoices | Invoice creation, billing cycles, payment tracking |
| **Reports & Analytics** | `/admin/reports` | Financial reports, performance analytics, compliance | Custom reports, data exports, compliance documentation |
| **User Management** | `/admin/users` | Manage system users and permissions | User roles, permissions, access control |
| **Settings** | `/admin/settings` | System configuration and preferences | Company settings, notification preferences, integrations |

### Driver Pages

| Page | URL | Purpose | Key Features |
|------|-----|---------|--------------|
| **Driver Dashboard** | `/driver/dashboard` | Personal overview of trips, earnings, and notifications | Trip summary, earnings tracker, alerts |
| **Active Trip** | `/driver/trip/active` | Real-time trip management and tracking | GPS tracking, trip progress, milestone updates |
| **Trip History** | `/driver/trips` | View completed and upcoming trips | Trip list, details, documentation |
| **Expense Submission** | `/driver/expenses` | Submit receipts and expense claims | Receipt upload, expense categorization, submission workflow |
| **Vehicle Inspection** | `/driver/inspection` | Pre-trip and post-trip vehicle checks | Inspection checklists, photo uploads, issue reporting |
| **Earnings** | `/driver/earnings` | View payment history and pending earnings | Payment statements, tax documents, earning summaries |
| **Profile** | `/driver/profile` | Manage personal information and preferences | Contact info, license details, notification settings |

## 2. Low-Fi Wireframe Descriptions

### Admin Dashboard (`/admin/dashboard`)

**Layout**: 4-column grid with header navigation
- **Header Panel**: Company logo, user menu, notifications (bell icon with count)
- **KPI Cards Row**: 4 cards showing total trucks, active trips, pending expenses, monthly revenue
- **Fleet Status Panel** (left): Live truck status map with color-coded markers
- **Recent Activities Panel** (center): Timeline of recent trips, expenses, alerts
- **Financial Summary Panel** (right): Revenue charts, expense breakdown, profit margins
- **Quick Actions Panel** (bottom): Buttons for "New Trip", "Approve Expenses", "Generate Report"

### Driver Dashboard (`/driver/dashboard`)

**Layout**: Single column mobile-first with key widgets
- **Header Panel**: Driver name, profile photo, current status indicator
- **Current Trip Card**: Active trip details, progress bar, ETA, route map thumbnail
- **Today's Summary**: Trips completed, miles driven, estimated earnings
- **Quick Actions**: "Start Trip", "Submit Expense", "Vehicle Check"
- **Notifications Panel**: Messages from dispatch, expense approvals, upcoming maintenance
- **Recent Trips**: Last 5 trips with basic details and status

### Fleet Management (`/admin/fleet`)

**Layout**: Data table with filters and action panels
- **Filter Bar**: Search, status filters, assignment filters, sort options
- **Data Table**: Truck ID, make/model, driver assignment, status, last maintenance, actions
- **Side Panel** (triggered): Detailed truck info, maintenance history, assignment history
- **Bulk Actions Bar**: Multi-select operations, export options
- **Add Truck Button**: Floating action button for new truck registration

### Expense Management (`/admin/expenses`)

**Layout**: Split view with list and detail panels
- **Filter Sidebar**: Date range, driver filter, category filter, status filter
- **Expense List**: Thumbnail, description, amount, driver, date, status, priority
- **Detail Panel**: Full receipt image, expense details, approval workflow buttons
- **Batch Processing**: Select multiple expenses, bulk approve/reject options

### Trip Management (`/admin/trips`)

**Layout**: Map view with trip overlay and control panel
- **Map Container**: Full-width map showing active routes and truck positions
- **Trip Control Panel** (overlay): Trip filters, status legend, refresh controls
- **Trip List Sidebar**: Scrollable list of trips with summary cards
- **Trip Detail Modal**: Route details, driver info, cargo info, timeline

### Expense Submission (`/driver/expenses`)

**Layout**: Form-based with receipt upload and categorization
- **Upload Area**: Drag-drop receipt image upload with camera option
- **Expense Form**: Amount, category dropdown, description, date picker
- **Receipt Preview**: Thumbnail with crop/rotate options
- **Auto-categorization**: AI suggestions based on receipt content
- **Submission Queue**: List of pending submissions with edit/delete options

## 3. Component Inventory

### Layout Components
- **`AppShell`**: Main application wrapper with navigation and content areas
- **`AdminSidebar`**: Left navigation for admin pages with collapsible sections
- **`DriverBottomNav`**: Mobile bottom navigation for driver app
- **`PageHeader`**: Consistent page headers with breadcrumbs and actions
- **`ContentGrid`**: Responsive grid layout for dashboard widgets

### Data Display Components
- **`DataTable`**: Sortable, filterable table with pagination and row actions
- **`KPICard`**: Metric display card with trend indicators and color coding
- **`TripCard`**: Compact trip information display with status indicators
- **`ExpenseCard`**: Receipt thumbnail with expense details and status
- **`StatusBadge`**: Color-coded status indicators for various entities
- **`ProgressBar`**: Linear progress indicator for trips and tasks
- **`MapComponent`**: Interactive map with markers and route overlays

### Form Components
- **`FormInput`**: Styled text input with validation states
- **`FormSelect`**: Dropdown select with search and multi-select options
- **`DatePicker`**: Calendar date selection with range options
- **`FileUpload`**: Receipt and document upload with preview
- **`FormWizard`**: Multi-step form navigation for complex workflows
- **`SearchBar`**: Global and contextual search with autocomplete

### Action Components
- **`Button`**: Primary, secondary, and tertiary button variants
- **`ActionMenu`**: Dropdown menu for row-level actions
- **`FloatingActionButton`**: Mobile-friendly primary action button
- **`BulkActions`**: Multi-select action bar for batch operations
- **`ApprovalButtons`**: Approve/reject workflow controls

### Feedback Components
- **`Toast`**: Success, error, and info notifications
- **`Modal`**: Overlay dialogs for confirmations and detailed views
- **`LoadingSpinner`**: Loading states for async operations
- **`EmptyState`**: Illustrations and messaging for empty data sets
- **`ErrorBoundary`**: Error handling and retry mechanisms

### Chart Components
- **`LineChart`**: Revenue trends and performance metrics
- **`PieChart`**: Expense category breakdowns
- **`BarChart`**: Comparative data visualization
- **`MetricDashboard`**: Combined chart widgets for analytics

## 4. Design System Specifications

### Color Palette

```json
{
  "primary": {
    "50": "#eff6ff",
    "100": "#dbeafe", 
    "200": "#bfdbfe",
    "300": "#93c5fd",
    "400": "#60a5fa",
    "500": "#3b82f6",
    "600": "#2563eb",
    "700": "#1d4ed8",
    "800": "#1e40af",
    "900": "#1e3a8a"
  },
  "secondary": {
    "50": "#f8fafc",
    "100": "#f1f5f9",
    "200": "#e2e8f0",
    "300": "#cbd5e1",
    "400": "#94a3b8",
    "500": "#64748b",
    "600": "#475569",
    "700": "#334155",
    "800": "#1e293b",
    "900": "#0f172a"
  },
  "success": {
    "50": "#f0fdf4",
    "500": "#22c55e",
    "600": "#16a34a",
    "700": "#15803d"
  },
  "warning": {
    "50": "#fffbeb",
    "500": "#f59e0b",
    "600": "#d97706",
    "700": "#b45309"
  },
  "error": {
    "50": "#fef2f2",
    "500": "#ef4444",
    "600": "#dc2626",
    "700": "#b91c1c"
  },
  "neutral": {
    "50": "#fafafa",
    "100": "#f5f5f5",
    "200": "#e5e5e5",
    "300": "#d4d4d4",
    "400": "#a3a3a3",
    "500": "#737373",
    "600": "#525252",
    "700": "#404040",
    "800": "#262626",
    "900": "#171717"
  }
}
```

### Typography Scale

```json
{
  "fontFamily": {
    "sans": ["Inter", "system-ui", "sans-serif"],
    "mono": ["Fira Code", "monospace"]
  },
  "fontSize": {
    "xs": ["0.75rem", { "lineHeight": "1rem" }],
    "sm": ["0.875rem", { "lineHeight": "1.25rem" }],
    "base": ["1rem", { "lineHeight": "1.5rem" }],
    "lg": ["1.125rem", { "lineHeight": "1.75rem" }],
    "xl": ["1.25rem", { "lineHeight": "1.75rem" }],
    "2xl": ["1.5rem", { "lineHeight": "2rem" }],
    "3xl": ["1.875rem", { "lineHeight": "2.25rem" }],
    "4xl": ["2.25rem", { "lineHeight": "2.5rem" }]
  },
  "fontWeight": {
    "normal": "400",
    "medium": "500",
    "semibold": "600",
    "bold": "700"
  }
}
```

### Spacing System

```json
{
  "spacing": {
    "0": "0px",
    "1": "0.25rem",
    "2": "0.5rem", 
    "3": "0.75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "8": "2rem",
    "10": "2.5rem",
    "12": "3rem",
    "16": "4rem",
    "20": "5rem",
    "24": "6rem"
  },
  "borderRadius": {
    "none": "0",
    "sm": "0.125rem",
    "default": "0.25rem",
    "md": "0.375rem",
    "lg": "0.5rem",
    "xl": "0.75rem",
    "2xl": "1rem",
    "full": "9999px"
  }
}
```

### Component Specifications

#### Button Component
```json
{
  "Button": {
    "variants": {
      "primary": {
        "backgroundColor": "primary.600",
        "color": "white",
        "hover": { "backgroundColor": "primary.700" },
        "padding": "spacing.3 spacing.6",
        "borderRadius": "borderRadius.md",
        "fontSize": "fontSize.sm",
        "fontWeight": "fontWeight.medium"
      },
      "secondary": {
        "backgroundColor": "neutral.100",
        "color": "neutral.700", 
        "hover": { "backgroundColor": "neutral.200" },
        "padding": "spacing.3 spacing.6",
        "borderRadius": "borderRadius.md"
      }
    },
    "sizes": {
      "sm": { "padding": "spacing.2 spacing.4", "fontSize": "fontSize.xs" },
      "md": { "padding": "spacing.3 spacing.6", "fontSize": "fontSize.sm" },
      "lg": { "padding": "spacing.4 spacing.8", "fontSize": "fontSize.base" }
    }
  }
}
```

#### Card Component
```json
{
  "Card": {
    "base": {
      "backgroundColor": "white",
      "borderRadius": "borderRadius.lg",
      "boxShadow": "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      "border": "1px solid neutral.200",
      "padding": "spacing.6"
    },
    "variants": {
      "elevated": {
        "boxShadow": "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      },
      "bordered": {
        "border": "2px solid primary.200"
      }
    }
  }
}
```

#### DataTable Component
```json
{
  "DataTable": {
    "container": {
      "backgroundColor": "white",
      "borderRadius": "borderRadius.lg",
      "overflow": "hidden",
      "border": "1px solid neutral.200"
    },
    "header": {
      "backgroundColor": "neutral.50",
      "padding": "spacing.4",
      "fontSize": "fontSize.sm",
      "fontWeight": "fontWeight.medium",
      "color": "neutral.600"
    },
    "row": {
      "padding": "spacing.4",
      "borderBottom": "1px solid neutral.100",
      "hover": { "backgroundColor": "neutral.50" }
    },
    "cell": {
      "fontSize": "fontSize.sm",
      "color": "neutral.900"
    }
  }
}
```

### Layout Grid System

```json
{
  "grid": {
    "columns": 12,
    "gutters": {
      "xs": "spacing.4",
      "sm": "spacing.6", 
      "md": "spacing.8",
      "lg": "spacing.10"
    },
    "breakpoints": {
      "sm": "640px",
      "md": "768px", 
      "lg": "1024px",
      "xl": "1280px",
      "2xl": "1536px"
    },
    "container": {
      "maxWidth": {
        "sm": "640px",
        "md": "768px",
        "lg": "1024px", 
        "xl": "1280px",
        "2xl": "1536px"
      },
      "padding": {
        "sm": "spacing.4",
        "lg": "spacing.8"
      }
    }
  }
}
```

### Animation & Transitions

```json
{
  "animations": {
    "duration": {
      "fast": "150ms",
      "normal": "300ms", 
      "slow": "500ms"
    },
    "easing": {
      "ease": "cubic-bezier(0.4, 0, 0.2, 1)",
      "easeIn": "cubic-bezier(0.4, 0, 1, 1)",
      "easeOut": "cubic-bezier(0, 0, 0.2, 1)"
    },
    "common": {
      "fadeIn": "opacity 300ms ease",
      "slideUp": "transform 300ms ease",
      "scaleIn": "transform 150ms ease"
    }
  }
}
```

## JSON Export

```json
{
  "designSystem": {
    "name": "Truck Tracking & Expense Management",
    "version": "1.0.0",
    "pages": {
      "admin": [
        {
          "name": "Admin Dashboard",
          "url": "/admin/dashboard", 
          "components": ["KPICard", "MapComponent", "DataTable", "LineChart"]
        },
        {
          "name": "Fleet Management",
          "url": "/admin/fleet",
          "components": ["DataTable", "FilterSidebar", "Modal", "BulkActions"]
        },
        {
          "name": "Expense Management", 
          "url": "/admin/expenses",
          "components": ["ExpenseCard", "FileUpload", "ApprovalButtons", "FilterSidebar"]
        }
      ],
      "driver": [
        {
          "name": "Driver Dashboard",
          "url": "/driver/dashboard",
          "components": ["TripCard", "KPICard", "ProgressBar", "StatusBadge"]
        },
        {
          "name": "Expense Submission",
          "url": "/driver/expenses", 
          "components": ["FileUpload", "FormInput", "FormSelect", "Button"]
        }
      ]
    },
    "components": {
      "layout": ["AppShell", "AdminSidebar", "DriverBottomNav", "PageHeader"],
      "dataDisplay": ["DataTable", "KPICard", "TripCard", "ExpenseCard", "MapComponent"],
      "forms": ["FormInput", "FormSelect", "DatePicker", "FileUpload"],
      "feedback": ["Toast", "Modal", "LoadingSpinner", "EmptyState"]
    },
    "colors": "...", // (Full color palette as defined above)
    "typography": "...", // (Full typography as defined above)  
    "spacing": "..." // (Full spacing as defined above)
  }
}
```

This comprehensive design specification provides a complete foundation for building the Truck Tracking & Expense Management System with consistent design patterns, reusable components, and clear user experience flows for both admin and driver interfaces.
