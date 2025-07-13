export interface ExcelRow {
  [key: string]: any
}

export function parseCSV(csvText: string): ExcelRow[] {
  const lines = csvText.split('\n').filter(line => line.trim())
  if (lines.length === 0) return []
  
  const headers = lines[0].split(',').map(header => header.replace(/"/g, '').trim())
  const rows: ExcelRow[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.replace(/"/g, '').trim())
    const row: ExcelRow = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    if (Object.values(row).some(value => value)) { // Only include non-empty rows
      rows.push(row)
    }
  }
  
  return rows
}

export function generateCSV(data: ExcelRow[], headers: string[]): string {
  const csvHeaders = headers.map(header => `"${header}"`).join(',')
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header] || ''
      // Handle arrays and objects
      const stringValue = Array.isArray(value) ? value.join('; ') : 
                         typeof value === 'object' ? JSON.stringify(value) : 
                         String(value)
      return `"${stringValue.replace(/"/g, '""')}"`
    }).join(',')
  )
  
  return [csvHeaders, ...csvRows].join('\n')
}

export function downloadCSV(data: ExcelRow[], filename: string, headers: string[]) {
  const csvContent = generateCSV(data, headers)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  window.URL.revokeObjectURL(url)
}

export function downloadJSON(data: any[], filename: string) {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  window.URL.revokeObjectURL(url)
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string)
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    reader.onerror = () => reject(new Error('Error reading file'))
    reader.readAsText(file)
  })
}

// Insurer-specific utility functions
export const insurerCSVHeaders = [
  'Name',
  'License Number', 
  'Contact Phone',
  'Contact Email',
  'Website',
  'Street Address',
  'City',
  'State',
  'ZIP Code',
  'Country',
  'Claims Email',
  'Claims Phone', 
  'Claims Portal',
  'Claims Procedure',
  'Coverage Types',
  'Preferred Communication',
  'Status',
  'Notes'
]

export function insurerToCSVRow(insurer: any): ExcelRow {
  return {
    'Name': insurer.name || '',
    'License Number': insurer.license_number || '',
    'Contact Phone': insurer.contact_phone || '',
    'Contact Email': insurer.contact_email || '',
    'Website': insurer.website || '',
    'Street Address': insurer.address?.street || '',
    'City': insurer.address?.city || '',
    'State': insurer.address?.state || '',
    'ZIP Code': insurer.address?.zip || '',
    'Country': insurer.address?.country || 'US',
    'Claims Email': insurer.claims_reporting?.email || '',
    'Claims Phone': insurer.claims_reporting?.phone || '',
    'Claims Portal': insurer.claims_reporting?.online_portal || '',
    'Claims Procedure': insurer.claims_reporting?.procedure || '',
    'Coverage Types': (insurer.coverage_types || []).join('; '),
    'Preferred Communication': insurer.preferred_communication || 'email',
    'Status': insurer.is_active ? 'Active' : 'Inactive',
    'Notes': insurer.notes || ''
  }
}

export function csvRowToInsurer(row: ExcelRow): any {
  return {
    name: row['Name'] || '',
    license_number: row['License Number'] || '',
    contact_phone: row['Contact Phone'] || '',
    contact_email: row['Contact Email'] || '',
    website: row['Website'] || '',
    address: {
      street: row['Street Address'] || '',
      city: row['City'] || '',
      state: row['State'] || '',
      zip: row['ZIP Code'] || '',
      country: row['Country'] || 'US'
    },
    claims_reporting: {
      email: row['Claims Email'] || '',
      phone: row['Claims Phone'] || '',
      online_portal: row['Claims Portal'] || '',
      procedure: row['Claims Procedure'] || ''
    },
    coverage_types: row['Coverage Types'] ? 
      row['Coverage Types'].split(';').map((type: string) => type.trim()).filter(Boolean) : 
      [],
    preferred_communication: row['Preferred Communication'] || 'email',
    is_active: row['Status'] === 'Active',
    notes: row['Notes'] || '',
    organization_id: '00000000-0000-0000-0000-000000000000'
  }
}

// Sample insurer data for template
export const sampleInsurerData: ExcelRow[] = [
  {
    'Name': 'State Farm Insurance',
    'License Number': 'SF123456',
    'Contact Phone': '(555) 123-4567',
    'Contact Email': 'contact@statefarm.com',
    'Website': 'https://statefarm.com',
    'Street Address': '1 State Farm Plaza',
    'City': 'Bloomington',
    'State': 'IL',
    'ZIP Code': '61710',
    'Country': 'US',
    'Claims Email': 'claims@statefarm.com',
    'Claims Phone': '(555) 123-CLAIM',
    'Claims Portal': 'https://claims.statefarm.com',
    'Claims Procedure': 'File claim online or call claims phone number',
    'Coverage Types': 'Homeowners; Auto; Commercial Property',
    'Preferred Communication': 'email',
    'Status': 'Active',
    'Notes': 'Large national carrier with good claim handling'
  },
  {
    'Name': 'Allstate Insurance',
    'License Number': 'AL789012',
    'Contact Phone': '(555) 987-6543',
    'Contact Email': 'info@allstate.com',
    'Website': 'https://allstate.com',
    'Street Address': '2775 Sanders Rd',
    'City': 'Northbrook',
    'State': 'IL',
    'ZIP Code': '60062',
    'Country': 'US',
    'Claims Email': 'claims@allstate.com',
    'Claims Phone': '(555) 987-CLAIM',
    'Claims Portal': 'https://claims.allstate.com',
    'Claims Procedure': 'Online claim filing preferred, phone backup available',
    'Coverage Types': 'Homeowners; Auto; Renters; Umbrella',
    'Preferred Communication': 'portal',
    'Status': 'Active',
    'Notes': 'Requires detailed documentation for large claims'
  }
]