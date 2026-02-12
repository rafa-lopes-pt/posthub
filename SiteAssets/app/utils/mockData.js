// Mock data for development (from CSV files)

export const MOCK_PACKAGES = [
  // John Smith's sent packages
  {
    Title: 'Important Documents',
    TrackingNumber: 'COLOMBO-20260201-00001',
    Sender: 'john.smith@company.com',
    Recipient: 'sarah.johnson@company.com',
    Priority: 'Urgent',
    Status: 'In Transit',
    CurrentLocation: 'Mailroom A',
    DestinationLocation: 'Room 102',
    PackageDetails: 'Large envelope - 9x12 inches',
    Date: '02/01/2026'
  },
  {
    Title: 'Office Supplies',
    TrackingNumber: 'EXEO-20260201-00012',
    Sender: 'john.smith@company.com',
    Recipient: 'michael.chen@company.com',
    Priority: 'Standard',
    Status: 'Delivered',
    CurrentLocation: 'Room 201',
    DestinationLocation: 'Room 201',
    PackageDetails: 'Box - Pens and notebooks',
    Date: '02/01/2026'
  },
  {
    Title: 'Project Files',
    TrackingNumber: 'COLOMBO-20260202-00023',
    Sender: 'john.smith@company.com',
    Recipient: 'lisa.anderson@company.com',
    Priority: 'Urgent',
    Status: 'In Transit',
    CurrentLocation: 'Mailroom A',
    DestinationLocation: 'Room 103',
    PackageDetails: 'Large envelope - Project documentation',
    Date: '02/02/2026'
  },
  {
    Title: 'Team Gifts',
    TrackingNumber: 'EXEO-20260203-00034',
    Sender: 'john.smith@company.com',
    Recipient: 'emily.davis@company.com',
    Priority: 'Standard',
    Status: 'In Transit',
    CurrentLocation: 'Storage Room',
    DestinationLocation: 'Room 202',
    PackageDetails: 'Box - Coffee mugs',
    Date: '02/03/2026'
  },
  {
    Title: 'Marketing Brochures',
    TrackingNumber: 'COLOMBO-20260204-00045',
    Sender: 'john.smith@company.com',
    Recipient: 'robert.martinez@company.com',
    Priority: 'Low',
    Status: 'Delivered',
    CurrentLocation: 'North Office 100',
    DestinationLocation: 'North Office 100',
    PackageDetails: 'Large box - Promotional materials',
    Date: '02/04/2026'
  },

  // Packages sent TO John Smith (incoming)
  {
    Title: 'Hardware Equipment',
    TrackingNumber: 'EXEO-20260131-00056',
    Sender: 'sarah.johnson@company.com',
    Recipient: 'john.smith@company.com',
    Priority: 'Standard',
    Status: 'In Transit',
    CurrentLocation: 'Mailroom B',
    DestinationLocation: 'Room 101',
    PackageDetails: 'Box - Monitor and accessories',
    Date: '01/31/2026'
  },
  {
    Title: 'IT Supplies',
    TrackingNumber: 'COLOMBO-20260201-00067',
    Sender: 'james.brown@company.com',
    Recipient: 'john.smith@company.com',
    Priority: 'Urgent',
    Status: 'In Transit',
    CurrentLocation: 'Mailroom A',
    DestinationLocation: 'Room 101',
    PackageDetails: 'Box - Keyboards and mice',
    Date: '02/01/2026'
  },
  {
    Title: 'Budget Report',
    TrackingNumber: 'EXEO-20260202-00078',
    Sender: 'michael.chen@company.com',
    Recipient: 'john.smith@company.com',
    Priority: 'Standard',
    Status: 'Delivered',
    CurrentLocation: 'Room 101',
    DestinationLocation: 'Room 101',
    PackageDetails: 'Envelope - Financial documents',
    Date: '02/02/2026'
  },
  {
    Title: 'Engineering Specs',
    TrackingNumber: 'COLOMBO-20260203-00089',
    Sender: 'lisa.anderson@company.com',
    Recipient: 'john.smith@company.com',
    Priority: 'Urgent',
    Status: 'In Transit',
    CurrentLocation: 'Storage Room',
    DestinationLocation: 'Room 101',
    PackageDetails: 'Large envelope - Technical drawings',
    Date: '02/03/2026'
  },

  // Other packages (not John Smith)
  {
    Title: 'New Laptop',
    TrackingNumber: 'EXEO-20260130-00090',
    Sender: 'emily.davis@company.com',
    Recipient: 'michael.chen@company.com',
    Priority: 'Standard',
    Status: 'In Transit',
    CurrentLocation: 'Mailroom B',
    DestinationLocation: 'Room 201',
    PackageDetails: 'Box - 18x12x8 inches - Dell Laptop',
    Date: '01/30/2026'
  },
  {
    Title: 'Marketing Materials',
    TrackingNumber: 'COLOMBO-20260131-00101',
    Sender: 'robert.martinez@company.com',
    Recipient: 'jennifer.taylor@company.com',
    Priority: 'Standard',
    Status: 'Delivered',
    CurrentLocation: 'Room 201',
    DestinationLocation: 'Room 201',
    PackageDetails: 'Large box - Brochures and flyers',
    Date: '01/31/2026'
  },
  {
    Title: 'Contract Papers',
    TrackingNumber: 'EXEO-20260201-00112',
    Sender: 'james.brown@company.com',
    Recipient: 'maria.garcia@company.com',
    Priority: 'Urgent',
    Status: 'Delivered',
    CurrentLocation: 'Mailroom A',
    DestinationLocation: 'Mailroom A',
    PackageDetails: 'Envelope - Legal documents',
    Date: '02/01/2026'
  },
  {
    Title: 'Office Furniture',
    TrackingNumber: 'COLOMBO-20260202-00123',
    Sender: 'david.wilson@company.com',
    Recipient: 'sarah.johnson@company.com',
    Priority: 'Low',
    Status: 'In Transit',
    CurrentLocation: 'Mailroom A',
    DestinationLocation: 'Room 102',
    PackageDetails: 'Large box - Desk organizers',
    Date: '02/02/2026'
  }
]

export const MOCK_EMPLOYEES = [
  { Name: 'John Smith', Email: 'john.smith@company.com', Department: 'Engineering', BadgeID: 'BADGE001' },
  { Name: 'Sarah Johnson', Email: 'sarah.johnson@company.com', Department: 'Marketing', BadgeID: 'BADGE002' },
  { Name: 'Michael Chen', Email: 'michael.chen@company.com', Department: 'Finance', BadgeID: 'BADGE003' },
  { Name: 'Emily Davis', Email: 'emily.davis@company.com', Department: 'Human Resources', BadgeID: 'BADGE004' },
  { Name: 'Robert Martinez', Email: 'robert.martinez@company.com', Department: 'Operations', BadgeID: 'BADGE005' },
  { Name: 'Lisa Anderson', Email: 'lisa.anderson@company.com', Department: 'Engineering', BadgeID: 'BADGE006' },
  { Name: 'David Wilson', Email: 'david.wilson@company.com', Department: 'Sales', BadgeID: 'BADGE007' },
  { Name: 'Jennifer Taylor', Email: 'jennifer.taylor@company.com', Department: 'Customer Service', BadgeID: 'BADGE008' },
  { Name: 'James Brown', Email: 'james.brown@company.com', Department: 'IT Support', BadgeID: 'BADGE009' },
  { Name: 'Maria Garcia', Email: 'maria.garcia@company.com', Department: 'Facilities', BadgeID: 'BADGE010' }
]

// Helper to get employee name from email
export function getEmployeeName(email) {
  const employee = MOCK_EMPLOYEES.find(e => e.Email === email)
  return employee ? employee.Name : email
}
