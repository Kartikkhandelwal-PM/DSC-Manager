export const mockClients = [
  { id: 'own',  name: 'My Own DSCs',                       type: 'self',    pan: '—'          },
  { id: 'c1',   name: 'ABC & Associates',                   type: 'CA Firm', pan: 'AABCA1234P' },
  { id: 'c2',   name: 'XYZ Enterprises Pvt Ltd',            type: 'Company', pan: 'AABCX5678Q' },
  { id: 'c3',   name: 'Global Exports Ltd',                 type: 'Company', pan: 'AABCG9012R' },
  { id: 'c4',   name: 'Shah & Partners LLP',                type: 'LLP',     pan: 'AABCS3456S' },
  { id: 'c5',   name: 'Mehta Industries',                   type: 'Company', pan: 'AABCM7890T' },
  { id: 'c6',   name: 'Patel & Co Chartered Accountants',   type: 'CA Firm', pan: 'AABCP2345U' },
  { id: 'c7',   name: 'Sunrise Retail Pvt Ltd',             type: 'Company', pan: 'AABCS6789V' },
  { id: 'c8',   name: 'Trivedi Law Associates LLP',         type: 'LLP',     pan: 'AABCT0123W' },
  { id: 'c9',   name: 'Kapoor & Sons Trading Co',           type: 'Company', pan: 'AABCK4567X' },
  { id: 'c10',  name: 'Rajesh Gupta & Associates',          type: 'CA Firm', pan: 'AABCR8901Y' },
  { id: 'c11',  name: 'Bharat Pharma Pvt Ltd',              type: 'Company', pan: 'AABCB2345Z' },
  { id: 'c12',  name: 'Agarwal Consultancy Services',       type: 'CA Firm', pan: 'AABCA6789A' },
  { id: 'c13',  name: 'Joshi & Joshi Advocates',            type: 'LLP',     pan: 'AABCJ0123B' },
  { id: 'c14',  name: 'Lakshmi Textiles Ltd',               type: 'Company', pan: 'AABCL4567C' },
  { id: 'c15',  name: 'Sharma Constructions Pvt Ltd',       type: 'Company', pan: 'AABCS8901D' },
  { id: 'c16',  name: 'Desai & Desai Tax Consultants',      type: 'CA Firm', pan: 'AABCD2345E' },
  { id: 'c17',  name: 'Nirmala Logistics Pvt Ltd',          type: 'Company', pan: 'AABCN6789F' },
  { id: 'c18',  name: 'Verma Brothers Hardware',            type: 'Company', pan: 'AABCV0123G' },
  { id: 'c19',  name: 'Iyer & Krishnan LLP',                type: 'LLP',     pan: 'AABCI4567H' },
  { id: 'c20',  name: 'Horizon Infra Projects Ltd',         type: 'Company', pan: 'AABCH8901I' },
  { id: 'c21',  name: 'Bansal Financial Advisors',          type: 'CA Firm', pan: 'AABCB2345J' },
  { id: 'c22',  name: 'Tata Precision Components Pvt Ltd',  type: 'Company', pan: 'AABCT6789K' },
  { id: 'c23',  name: 'Malhotra & Co Auditors',             type: 'CA Firm', pan: 'AABCM0123L' },
  { id: 'c24',  name: 'Greenfields Agro Industries',        type: 'Company', pan: 'AABCG4567M' },
  { id: 'c25',  name: 'Choudhary Steel Works',              type: 'Company', pan: 'AABCC8901N' },
  { id: 'c26',  name: 'Pillai & Nair Associates LLP',       type: 'LLP',     pan: 'AABCP2345O' },
  { id: 'c27',  name: 'Dixit Jewellers Pvt Ltd',            type: 'Company', pan: 'AABCD6789P' },
  { id: 'c28',  name: 'Saxena & Saxena CAs',                type: 'CA Firm', pan: 'AABCS0123Q' },
  { id: 'c29',  name: 'Indo-Gulf Chemicals Ltd',            type: 'Company', pan: 'AABCI4567R' },
  { id: 'c30',  name: 'Reddy Agritech Pvt Ltd',             type: 'Company', pan: 'AABCR8901S' },
  { id: 'c31',  name: 'Mittal & Associates',                type: 'CA Firm', pan: 'AABCM2345T' },
  { id: 'c32',  name: 'Sunrise Power Solutions Pvt Ltd',    type: 'Company', pan: 'AABCS6789U' },
  { id: 'c33',  name: 'Pandey Brothers Traders',            type: 'Company', pan: 'AABCP0123V' },
  { id: 'c34',  name: 'Kulkarni & Gokhale LLP',             type: 'LLP',     pan: 'AABCK4567W' },
  { id: 'c35',  name: 'Zenith Auto Parts Pvt Ltd',          type: 'Company', pan: 'AABCZ8901X' },
];

// Dates relative to today so the mock data always has a realistic spread
function relDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export const mockDSCs = [
  // My own DSCs
  {
    id: '1', client_id: 'own',
    label: 'My Signing DSC',
    holder_name: 'Ramesh Kumar (CA)',
    organization: 'Ramesh Kumar & Co.',
    city: 'Ahmedabad', state: 'Gujarat', email: 'ramesh@rkca.com',
    serial_number: '3AF12C9D00B4E721',
    issued_by: 'eMudhra Consumer CA 5',
    issue_date: relDate(-1090), expiry_date: relDate(5),    // expiring in 5 days
    dsc_purpose: 'Signing', dsc_class: 'Class 3',
    token_label: 'ePass2003', token_serial: 'HW12345678',
    location: 'My Desk Drawer', assigned_to: 'Self', notes: 'Primary signing DSC',
    added_method: 'token', created_at: relDate(-1070),
  },
  {
    id: '2', client_id: 'own',
    label: 'My Encryption DSC',
    holder_name: 'Ramesh Kumar (CA)',
    organization: 'Ramesh Kumar & Co.',
    city: 'Ahmedabad', state: 'Gujarat', email: 'ramesh@rkca.com',
    serial_number: 'AA112233445566BB',
    issued_by: 'eMudhra Consumer CA 5',
    issue_date: relDate(-1280), expiry_date: relDate(-180),  // expired 180 days ago
    dsc_purpose: 'Encryption', dsc_class: 'Class 3',
    token_label: 'ePass2003', token_serial: 'HW87654321',
    location: 'My Desk Drawer', assigned_to: 'Self', notes: '',
    added_method: 'token', created_at: relDate(-1275),
  },

  // ABC & Associates
  {
    id: '3', client_id: 'c1',
    label: 'Director DSC',
    holder_name: 'Suresh Patel',
    organization: 'ABC & Associates',
    city: 'Ahmedabad', state: 'Gujarat', email: 'suresh@abcassoc.com',
    serial_number: 'B1C24E8F009A3D12',
    issued_by: 'NSDL e-Gov CA',
    issue_date: relDate(-1083), expiry_date: relDate(12),   // expiring in 12 days
    dsc_purpose: 'Signing', dsc_class: 'Class 3',
    token_label: 'WatchData', token_serial: 'WD98765432',
    location: 'Client Office', assigned_to: 'Suresh Patel', notes: 'Used for MCA filings',
    added_method: 'token', created_at: relDate(-1035),
  },
  {
    id: '4', client_id: 'c1',
    label: 'Partner DSC',
    holder_name: 'Anjali Patel',
    organization: 'ABC & Associates',
    city: 'Ahmedabad', state: 'Gujarat', email: 'anjali@abcassoc.com',
    serial_number: 'C9D34F1A00E5B823',
    issued_by: 'eMudhra Consumer CA 5',
    issue_date: relDate(-730), expiry_date: relDate(365),   // active, 1 year left
    dsc_purpose: 'Signing & Encryption', dsc_class: 'Class 3',
    token_label: 'PROXKey', token_serial: 'PK44556677',
    location: 'Client Office', assigned_to: 'Anjali Patel', notes: '',
    added_method: 'token', created_at: relDate(-725),
  },
  {
    id: '5', client_id: 'c1',
    label: 'DGFT DSC',
    holder_name: 'Suresh Patel',
    organization: 'ABC & Associates',
    city: 'Ahmedabad', state: 'Gujarat', email: 'suresh@abcassoc.com',
    serial_number: 'D7E45G2B00F6C934',
    issued_by: 'Sify Sub CA',
    issue_date: relDate(-1460), expiry_date: relDate(-365),  // expired 1 year ago
    dsc_purpose: 'Signing', dsc_class: 'DGFT',
    token_label: 'SafeNet iKey', token_serial: 'SN11223344',
    location: 'Client Safe', assigned_to: 'Suresh Patel', notes: 'For DGFT portal only',
    added_method: 'token', created_at: relDate(-1455),
  },

  // XYZ Enterprises
  {
    id: '6', client_id: 'c2',
    label: 'MD Signing DSC',
    holder_name: 'Priya Mehta',
    organization: 'XYZ Enterprises Pvt Ltd',
    city: 'Mumbai', state: 'Maharashtra', email: 'priya@xyzent.com',
    serial_number: 'E8F56H3C11G7D045',
    issued_by: 'eMudhra Consumer CA 5',
    issue_date: relDate(-800), expiry_date: relDate(295),   // active, ~10 months left
    dsc_purpose: 'Signing', dsc_class: 'Class 3',
    token_label: 'ePass2003', token_serial: 'HW11223344',
    location: 'Mumbai Office', assigned_to: 'Priya Mehta', notes: '',
    added_method: 'token', created_at: relDate(-795),
  },
  {
    id: '7', client_id: 'c2',
    label: 'CFO DSC',
    holder_name: 'Vivek Shah',
    organization: 'XYZ Enterprises Pvt Ltd',
    city: 'Mumbai', state: 'Maharashtra', email: 'vivek@xyzent.com',
    serial_number: 'F9G67I4D12H8E156',
    issued_by: 'NSDL e-Gov CA',
    issue_date: relDate(-1050), expiry_date: relDate(45),   // expiring in 45 days
    dsc_purpose: 'Signing', dsc_class: 'Class 3',
    token_label: 'WatchData', token_serial: 'WD55667788',
    location: 'Mumbai Office', assigned_to: 'Vivek Shah', notes: 'For GST filings',
    added_method: 'manual', created_at: relDate(-1020),
  },

  // Global Exports
  {
    id: '8', client_id: 'c3',
    label: 'DGFT Signing DSC',
    holder_name: 'Kiran Desai',
    organization: 'Global Exports Ltd',
    city: 'Surat', state: 'Gujarat', email: 'kiran@globalexports.com',
    serial_number: 'G0H78J5E13I9F267',
    issued_by: 'eMudhra Consumer CA 5',
    issue_date: relDate(-550), expiry_date: relDate(-100),  // expired 100 days ago
    dsc_purpose: 'Signing', dsc_class: 'DGFT',
    token_label: 'PROXKey', token_serial: 'PK99887766',
    location: 'Surat Office', assigned_to: 'Kiran Desai', notes: 'DGFT & customs filings',
    added_method: 'token', created_at: relDate(-545),
  },

  // Shah & Partners
  {
    id: '9', client_id: 'c4',
    label: 'Senior Partner DSC',
    holder_name: 'Nitin Shah',
    organization: 'Shah & Partners LLP',
    city: 'Pune', state: 'Maharashtra', email: 'nitin@shahpartners.com',
    serial_number: 'H1I89K6F14J0G378',
    issued_by: 'Sify Sub CA',
    issue_date: relDate(-1250), expiry_date: relDate(-160),  // expired 160 days ago
    dsc_purpose: 'Signing', dsc_class: 'Class 3',
    token_label: 'SafeNet iKey', token_serial: 'SN99001122',
    location: 'Pune Office', assigned_to: 'Nitin Shah', notes: '',
    added_method: 'manual', created_at: relDate(-1245),
  },
  {
    id: '10', client_id: 'c4',
    label: 'Junior Partner DSC',
    holder_name: 'Pooja Shah',
    organization: 'Shah & Partners LLP',
    city: 'Pune', state: 'Maharashtra', email: 'pooja@shahpartners.com',
    serial_number: 'I2J90L7G15K1H489',
    issued_by: 'eMudhra Consumer CA 5',
    issue_date: relDate(-560), expiry_date: relDate(530),   // active, ~18 months left
    dsc_purpose: 'Signing', dsc_class: 'Class 3',
    token_label: 'ePass2003', token_serial: 'HW33445566',
    location: 'Pune Office', assigned_to: 'Pooja Shah', notes: '',
    added_method: 'token', created_at: relDate(-555),
  },

  // Mehta Industries
  {
    id: '11', client_id: 'c5',
    label: 'Director DSC',
    holder_name: 'Rajesh Mehta',
    organization: 'Mehta Industries',
    city: 'Vadodara', state: 'Gujarat', email: 'rajesh@mehtaind.com',
    serial_number: 'J3K01M8H16L2I590',
    issued_by: 'NSDL e-Gov CA',
    issue_date: relDate(-640), expiry_date: relDate(455),   // active, ~15 months left
    dsc_purpose: 'Signing & Encryption', dsc_class: 'Class 3',
    token_label: 'WatchData', token_serial: 'WD12345678',
    location: 'Vadodara HQ', assigned_to: 'Rajesh Mehta', notes: 'Primary company DSC',
    added_method: 'token', created_at: relDate(-635),
  },
];

export const getStatus = (expiry_date, threshold = 90) => {
  const daysLeft = getDaysLeft(expiry_date);
  if (daysLeft <= 0)           return 'Expired';
  if (daysLeft <= threshold)   return 'Expiring Soon';
  return 'Active';
};

export const getDaysLeft = (expiry_date) => {
  const [y, m, d] = expiry_date.split('-').map(Number);
  const expiry = new Date(y, m - 1, d); // local midnight on expiry date
  const today  = new Date();
  today.setHours(0, 0, 0, 0);          // local midnight today
  return Math.round((expiry - today) / (1000 * 60 * 60 * 24));
};
