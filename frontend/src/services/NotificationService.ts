// Notification service for managing expiry alerts
export interface NotificationData {
  id: string;
  type: 'license' | 'order' | 'inspection' | 'insurance' | 'permit' | 'maintenance';
  title: string;
  message: string;
  daysUntilExpiry: number;
  expiryDate: string;
  priority: 'high' | 'medium' | 'low';
  relatedId?: string;
}

class NotificationService {
  // Mock data representing real system data
  private static mockData = {
    drivers: [
      { id: 'driver-001', name: 'John Smith', cdlExpiry: '2025-10-15', medicalExpiry: '2025-11-20' },
      { id: 'driver-002', name: 'Sarah Johnson', cdlExpiry: '2025-12-10', medicalExpiry: '2025-10-25' },
      { id: 'driver-003', name: 'Mike Wilson', cdlExpiry: '2025-11-05', medicalExpiry: '2026-01-15' }
    ],
    trucks: [
      { id: 'truck-abc123', plate: 'ABC-123', dotInspection: '2025-10-07', registration: '2025-12-31' },
      { id: 'truck-xyz789', plate: 'XYZ-789', dotInspection: '2025-11-15', registration: '2025-10-20' },
      { id: 'truck-def456', plate: 'DEF-456', dotInspection: '2025-10-30', registration: '2026-02-28' }
    ],
    orders: [
      { id: 'order-12345', customer: 'ABC Corp', deadline: '2025-10-02', status: 'in-transit' },
      { id: 'order-12346', customer: 'XYZ Ltd', deadline: '2025-10-08', status: 'pending' },
      { id: 'order-12347', customer: 'DEF Inc', deadline: '2025-10-15', status: 'scheduled' }
    ],
    insurance: [
      { id: 'policy-001', type: 'Fleet Insurance', expiry: '2025-10-30' },
      { id: 'policy-002', type: 'Cargo Insurance', expiry: '2025-11-25' }
    ],
    permits: [
      { id: 'permit-001', type: 'IFTA Permit', truckId: 'truck-xyz789', expiry: '2025-11-14' },
      { id: 'permit-002', type: 'Oversize Permit', truckId: 'truck-abc123', expiry: '2025-10-12' }
    ],
    maintenance: [
      { id: 'maint-001', truckId: 'truck-def456', type: 'Oil Change', due: '2025-10-05' },
      { id: 'maint-002', truckId: 'truck-abc123', type: 'Brake Inspection', due: '2025-10-10' }
    ]
  };

  static calculateDaysUntilExpiry(expiryDate: string): number {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static getPriority(daysUntilExpiry: number, type: string): 'high' | 'medium' | 'low' {
    if (daysUntilExpiry <= 7) return 'high';
    if (daysUntilExpiry <= 14 && (type === 'license' || type === 'inspection' || type === 'order')) return 'high';
    if (daysUntilExpiry <= 30) return 'medium';
    return 'low';
  }

  static generateNotifications(): NotificationData[] {
    const notifications: NotificationData[] = [];
    let idCounter = 1;

    // Driver license notifications
    this.mockData.drivers.forEach(driver => {
      const cdlDays = this.calculateDaysUntilExpiry(driver.cdlExpiry);
      const medicalDays = this.calculateDaysUntilExpiry(driver.medicalExpiry);

      if (cdlDays <= 60) {
        notifications.push({
          id: `${idCounter++}`,
          type: 'license',
          title: 'CDL License Expiring',
          message: `Driver ${driver.name}'s CDL license expires in ${cdlDays} days`,
          daysUntilExpiry: cdlDays,
          expiryDate: driver.cdlExpiry,
          priority: this.getPriority(cdlDays, 'license'),
          relatedId: driver.id
        });
      }

      if (medicalDays <= 60) {
        notifications.push({
          id: `${idCounter++}`,
          type: 'license',
          title: 'Medical Certificate Expiring',
          message: `Driver ${driver.name}'s medical certificate expires in ${medicalDays} days`,
          daysUntilExpiry: medicalDays,
          expiryDate: driver.medicalExpiry,
          priority: this.getPriority(medicalDays, 'license'),
          relatedId: driver.id
        });
      }
    });

    // Truck inspection notifications
    this.mockData.trucks.forEach(truck => {
      const inspectionDays = this.calculateDaysUntilExpiry(truck.dotInspection);
      const registrationDays = this.calculateDaysUntilExpiry(truck.registration);

      if (inspectionDays <= 60) {
        notifications.push({
          id: `${idCounter++}`,
          type: 'inspection',
          title: 'DOT Inspection Due',
          message: `Truck ${truck.plate} DOT inspection due in ${inspectionDays} days`,
          daysUntilExpiry: inspectionDays,
          expiryDate: truck.dotInspection,
          priority: this.getPriority(inspectionDays, 'inspection'),
          relatedId: truck.id
        });
      }

      if (registrationDays <= 60) {
        notifications.push({
          id: `${idCounter++}`,
          type: 'permit',
          title: 'Registration Renewal',
          message: `Truck ${truck.plate} registration expires in ${registrationDays} days`,
          daysUntilExpiry: registrationDays,
          expiryDate: truck.registration,
          priority: this.getPriority(registrationDays, 'permit'),
          relatedId: truck.id
        });
      }
    });

    // Order deadline notifications
    this.mockData.orders.forEach(order => {
      const orderDays = this.calculateDaysUntilExpiry(order.deadline);

      if (orderDays <= 14) {
        notifications.push({
          id: `${idCounter++}`,
          type: 'order',
          title: 'Delivery Deadline Approaching',
          message: `Order #${order.id.split('-')[1]} for ${order.customer} due in ${orderDays} days`,
          daysUntilExpiry: orderDays,
          expiryDate: order.deadline,
          priority: this.getPriority(orderDays, 'order'),
          relatedId: order.id
        });
      }
    });

    // Insurance notifications
    this.mockData.insurance.forEach(policy => {
      const insuranceDays = this.calculateDaysUntilExpiry(policy.expiry);

      if (insuranceDays <= 60) {
        notifications.push({
          id: `${idCounter++}`,
          type: 'insurance',
          title: 'Insurance Renewal Due',
          message: `${policy.type} renewal due in ${insuranceDays} days`,
          daysUntilExpiry: insuranceDays,
          expiryDate: policy.expiry,
          priority: this.getPriority(insuranceDays, 'insurance'),
          relatedId: policy.id
        });
      }
    });

    // Permit notifications
    this.mockData.permits.forEach(permit => {
      const permitDays = this.calculateDaysUntilExpiry(permit.expiry);
      const truck = this.mockData.trucks.find(t => t.id === permit.truckId);

      if (permitDays <= 60) {
        notifications.push({
          id: `${idCounter++}`,
          type: 'permit',
          title: 'Permit Renewal Required',
          message: `${permit.type} for Truck ${truck?.plate} expires in ${permitDays} days`,
          daysUntilExpiry: permitDays,
          expiryDate: permit.expiry,
          priority: this.getPriority(permitDays, 'permit'),
          relatedId: permit.id
        });
      }
    });

    // Maintenance notifications
    this.mockData.maintenance.forEach(maint => {
      const maintDays = this.calculateDaysUntilExpiry(maint.due);
      const truck = this.mockData.trucks.find(t => t.id === maint.truckId);

      if (maintDays <= 30) {
        notifications.push({
          id: `${idCounter++}`,
          type: 'maintenance',
          title: 'Scheduled Maintenance Due',
          message: `${maint.type} for Truck ${truck?.plate} due in ${maintDays} days`,
          daysUntilExpiry: maintDays,
          expiryDate: maint.due,
          priority: this.getPriority(maintDays, 'maintenance'),
          relatedId: maint.id
        });
      }
    });

    // Sort by priority and days until expiry
    return notifications.sort((a, b) => {
      if (a.priority !== b.priority) {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.daysUntilExpiry - b.daysUntilExpiry;
    });
  }

  static getNotificationsByType(type: string): NotificationData[] {
    return this.generateNotifications().filter(n => n.type === type);
  }

  static getUrgentNotifications(): NotificationData[] {
    return this.generateNotifications().filter(n => n.daysUntilExpiry <= 7);
  }

  static getUpcomingNotifications(): NotificationData[] {
    return this.generateNotifications().filter(n => n.daysUntilExpiry > 7 && n.daysUntilExpiry <= 30);
  }
}

export default NotificationService;