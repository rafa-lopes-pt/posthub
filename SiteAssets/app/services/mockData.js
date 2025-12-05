/**
 * Mock Data Service
 * Provides demo data for package tracking
 */

// Sample employees
export const EMPLOYEES = [
  { Id: 1, Name: 'John Smith', Email: 'john.smith@company.com', Department: 'Engineering', BadgeID: 'BADGE001', OfficeLocation: 'Room 101' },
  { Id: 2, Name: 'Sarah Johnson', Email: 'sarah.johnson@company.com', Department: 'Marketing', BadgeID: 'BADGE002', OfficeLocation: 'Room 102' },
  { Id: 3, Name: 'Michael Chen', Email: 'michael.chen@company.com', Department: 'Finance', BadgeID: 'BADGE003', OfficeLocation: 'Room 201' },
  { Id: 4, Name: 'Emily Davis', Email: 'emily.davis@company.com', Department: 'Human Resources', BadgeID: 'BADGE004', OfficeLocation: 'Room 202' },
  { Id: 5, Name: 'Robert Martinez', Email: 'robert.martinez@company.com', Department: 'Operations', BadgeID: 'BADGE005', OfficeLocation: 'North Office 100' },
  { Id: 6, Name: 'Lisa Anderson', Email: 'lisa.anderson@company.com', Department: 'Engineering', BadgeID: 'BADGE006', OfficeLocation: 'Room 103' },
  { Id: 7, Name: 'David Wilson', Email: 'david.wilson@company.com', Department: 'Sales', BadgeID: 'BADGE007', OfficeLocation: 'Conference Room A' },
  { Id: 8, Name: 'Jennifer Taylor', Email: 'jennifer.taylor@company.com', Department: 'Customer Service', BadgeID: 'BADGE008', OfficeLocation: 'Room 201' },
  { Id: 9, Name: 'James Brown', Email: 'james.brown@company.com', Department: 'IT Support', BadgeID: 'BADGE009', OfficeLocation: 'Room 102' },
  { Id: 10, Name: 'Maria Garcia', Email: 'maria.garcia@company.com', Department: 'Facilities', BadgeID: 'BADGE010', OfficeLocation: 'Mailroom A' }
];

// Sample packages
export const PACKAGES = [
  {
    Id: 1,
    Title: 'Important Documents',
    TrackingNumber: 'PGN-20251203-00001',
    Sender: 'john.smith@company.com',
    Recipient: 'sarah.johnson@company.com',
    Priority: 'Urgent',
    Status: 'In Transit',
    CurrentLocation: 'Mailroom A',
    DestinationLocation: 'Room 102',
    PackageDetails: 'Large envelope - 9x12 inches',
    Notes: 'Please deliver by end of day',
    Created: '2024-12-03T09:15:00Z',
    Modified: '2024-12-03T10:30:00Z'
  },
  {
    Id: 2,
    Title: 'New Laptop',
    TrackingNumber: 'PGN-20251203-00002',
    Sender: 'emily.davis@company.com',
    Recipient: 'michael.chen@company.com',
    Priority: 'Standard',
    Status: 'Arrived',
    CurrentLocation: 'Room 201',
    DestinationLocation: 'Room 201',
    PackageDetails: 'Box - 18x12x8 inches - Dell Laptop',
    Notes: 'Fragile - Handle with care',
    Created: '2024-12-03T08:00:00Z',
    Modified: '2024-12-03T14:00:00Z'
  },
  {
    Id: 3,
    Title: 'Office Supplies',
    TrackingNumber: 'PGN-20251203-00003',
    Sender: 'lisa.anderson@company.com',
    Recipient: 'david.wilson@company.com',
    Priority: 'Low',
    Status: 'Sent',
    CurrentLocation: 'Mailroom A',
    DestinationLocation: 'Conference Room A',
    PackageDetails: 'Medium box - Pens and notebooks',
    Notes: 'Standard office supplies',
    Created: '2024-12-03T11:00:00Z',
    Modified: '2024-12-03T11:00:00Z'
  },
  {
    Id: 4,
    Title: 'Marketing Materials',
    TrackingNumber: 'PGN-20251203-00004',
    Sender: 'sarah.johnson@company.com',
    Recipient: 'jennifer.taylor@company.com',
    Priority: 'Standard',
    Status: 'Delivered',
    CurrentLocation: 'Room 201',
    DestinationLocation: 'Room 201',
    PackageDetails: 'Large box - Brochures and flyers',
    Notes: 'Inter-campus delivery',
    Created: '2024-12-02T15:00:00Z',
    Modified: '2024-12-03T09:00:00Z'
  },
  {
    Id: 5,
    Title: 'Contract Documents',
    TrackingNumber: 'PGN-20251203-00005',
    Sender: 'michael.chen@company.com',
    Recipient: 'sarah.johnson@company.com',
    Priority: 'Urgent',
    Status: 'Stored',
    CurrentLocation: 'Mailroom B',
    DestinationLocation: 'Room 102',
    PackageDetails: 'Sealed envelope - Legal documents',
    Notes: 'Requires signature upon delivery',
    Created: '2024-12-03T07:30:00Z',
    Modified: '2024-12-03T12:00:00Z'
  },
  {
    Id: 6,
    Title: 'Equipment Return',
    TrackingNumber: 'PGN-20251203-00006',
    Sender: 'sarah.johnson@company.com',
    Recipient: 'james.brown@company.com',
    Priority: 'Standard',
    Status: 'In Transit',
    CurrentLocation: 'Building A Lobby',
    DestinationLocation: 'Room 102',
    PackageDetails: 'Box - Old monitor for recycling',
    Notes: 'IT equipment return',
    Created: '2024-12-03T10:00:00Z',
    Modified: '2024-12-03T13:00:00Z'
  },
  {
    Id: 7,
    Title: 'Birthday Gift',
    TrackingNumber: 'PGN-20251203-00007',
    Sender: 'robert.martinez@company.com',
    Recipient: 'sarah.johnson@company.com',
    Priority: 'Low',
    Status: 'Received',
    CurrentLocation: 'Room 102',
    DestinationLocation: 'Room 102',
    PackageDetails: 'Small wrapped gift box',
    Notes: 'Personal delivery',
    Created: '2024-12-01T14:00:00Z',
    Modified: '2024-12-02T10:00:00Z'
  },
  {
    Id: 8,
    Title: 'Quarterly Reports',
    TrackingNumber: 'PGN-20251203-00008',
    Sender: 'sarah.johnson@company.com',
    Recipient: 'robert.martinez@company.com',
    Priority: 'Urgent',
    Status: 'Sent',
    CurrentLocation: 'Mailroom A',
    DestinationLocation: 'North Office 100',
    PackageDetails: 'Document folder - Financial reports',
    Notes: 'Confidential - Deliver to recipient only',
    Created: '2024-12-03T16:00:00Z',
    Modified: '2024-12-03T16:00:00Z'
  }
];

/**
 * Get employee by email
 */
export function getEmployeeByEmail(email) {
  return EMPLOYEES.find(emp => emp.Email.toLowerCase() === email.toLowerCase());
}

/**
 * Get employee name by email
 */
export function getEmployeeName(email) {
  const employee = getEmployeeByEmail(email);
  return employee ? employee.Name : email;
}

/**
 * Get packages where user is the recipient (incoming packages)
 */
export function getIncomingPackages(userEmail) {
  return PACKAGES
    .filter(pkg => pkg.Recipient.toLowerCase() === userEmail.toLowerCase())
    .map(pkg => ({
      ...pkg,
      SenderName: getEmployeeName(pkg.Sender),
      RecipientName: getEmployeeName(pkg.Recipient)
    }));
}

/**
 * Get packages where user is the sender (sent packages)
 */
export function getSentPackages(userEmail) {
  return PACKAGES
    .filter(pkg => pkg.Sender.toLowerCase() === userEmail.toLowerCase())
    .map(pkg => ({
      ...pkg,
      SenderName: getEmployeeName(pkg.Sender),
      RecipientName: getEmployeeName(pkg.Recipient)
    }));
}

/**
 * Get package by ID
 */
export function getPackageById(id) {
  const pkg = PACKAGES.find(p => p.Id === id);
  if (!pkg) return null;
  return {
    ...pkg,
    SenderName: getEmployeeName(pkg.Sender),
    RecipientName: getEmployeeName(pkg.Recipient)
  };
}

/**
 * Get all packages (for admin view)
 */
export function getAllPackages() {
  return PACKAGES.map(pkg => ({
    ...pkg,
    SenderName: getEmployeeName(pkg.Sender),
    RecipientName: getEmployeeName(pkg.Recipient)
  }));
}
