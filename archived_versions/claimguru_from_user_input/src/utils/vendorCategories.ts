export interface VendorCategory {
  id: string
  name: string
  category: 'contractor' | 'expert'
  icon: string
  claimTypes: string[]
  description: string
  typicalCost?: string
  urgency?: 'immediate' | 'urgent' | 'standard'
}

export const contractorCategories: VendorCategory[] = [
  {
    id: 'general_contractor',
    name: 'General Contractor',
    category: 'contractor',
    icon: 'Building2',
    claimTypes: ['all', 'fire', 'wind_damage', 'hail', 'water_damage', 'vandalism'],
    description: 'Full-service construction and restoration contractor',
    typicalCost: '$5,000 - $50,000+',
    urgency: 'standard'
  },
  {
    id: 'mold_remediation',
    name: 'Mold Remediation',
    category: 'contractor',
    icon: 'AlertTriangle',
    claimTypes: ['water_damage', 'flood', 'hurricane'],
    description: 'Specialized mold testing, removal, and prevention services',
    typicalCost: '$500 - $6,000',
    urgency: 'urgent'
  },
  {
    id: 'water_mitigation',
    name: 'Water Mitigation',
    category: 'contractor',
    icon: 'Droplets',
    claimTypes: ['water_damage', 'flood', 'hurricane', 'burst_pipe'],
    description: 'Emergency water extraction, drying, and damage mitigation',
    typicalCost: '$1,000 - $5,000',
    urgency: 'immediate'
  },
  {
    id: 'lead_testing',
    name: 'Lead Testing',
    category: 'contractor',
    icon: 'Shield',
    claimTypes: ['fire', 'renovation', 'older_homes'],
    description: 'Lead paint testing and abatement certification',
    typicalCost: '$300 - $800',
    urgency: 'standard'
  },
  {
    id: 'tarping_services',
    name: 'Tarping Services',
    category: 'contractor',
    icon: 'Home',
    claimTypes: ['wind_damage', 'hail', 'hurricane', 'tornado', 'storm'],
    description: 'Emergency roof and structure protection services',
    typicalCost: '$500 - $2,000',
    urgency: 'immediate'
  },
  {
    id: 'roofer',
    name: 'Roofer',
    category: 'contractor',
    icon: 'Triangle',
    claimTypes: ['wind_damage', 'hail', 'hurricane', 'fire', 'tornado'],
    description: 'Roof repair, replacement, and installation services',
    typicalCost: '$3,000 - $20,000',
    urgency: 'urgent'
  },
  {
    id: 'plumber',
    name: 'Plumber',
    category: 'contractor',
    icon: 'Wrench',
    claimTypes: ['water_damage', 'freeze', 'burst_pipe', 'flood'],
    description: 'Plumbing repair, installation, and emergency services',
    typicalCost: '$150 - $3,000',
    urgency: 'urgent'
  },
  {
    id: 'electrician',
    name: 'Electrician',
    category: 'contractor',
    icon: 'Zap',
    claimTypes: ['fire', 'lightning', 'water_damage', 'electrical'],
    description: 'Electrical system repair, installation, and safety services',
    typicalCost: '$200 - $5,000',
    urgency: 'urgent'
  },
  {
    id: 'hvac',
    name: 'HVAC Technician',
    category: 'contractor',
    icon: 'Wind',
    claimTypes: ['fire', 'water_damage', 'freeze', 'storm'],
    description: 'Heating, ventilation, and air conditioning services',
    typicalCost: '$500 - $8,000',
    urgency: 'standard'
  },
  {
    id: 'flooring',
    name: 'Flooring Specialist',
    category: 'contractor',
    icon: 'Square',
    claimTypes: ['water_damage', 'fire', 'wind_damage', 'flood'],
    description: 'Floor removal, installation, and restoration services',
    typicalCost: '$2,000 - $15,000',
    urgency: 'standard'
  },
  {
    id: 'drywall',
    name: 'Drywall Contractor',
    category: 'contractor',
    icon: 'Square',
    claimTypes: ['water_damage', 'fire', 'wind_damage', 'impact'],
    description: 'Drywall repair, replacement, and finishing services',
    typicalCost: '$800 - $4,000',
    urgency: 'standard'
  },
  {
    id: 'painting',
    name: 'Painting Contractor',
    category: 'contractor',
    icon: 'Paintbrush2',
    claimTypes: ['fire', 'water_damage', 'wind_damage', 'smoke'],
    description: 'Interior and exterior painting and finishing services',
    typicalCost: '$1,000 - $6,000',
    urgency: 'standard'
  },
  {
    id: 'windows_doors',
    name: 'Windows & Doors',
    category: 'contractor',
    icon: 'DoorOpen',
    claimTypes: ['wind_damage', 'hail', 'vandalism', 'impact'],
    description: 'Window and door repair, replacement, and installation',
    typicalCost: '$500 - $8,000',
    urgency: 'urgent'
  },
  {
    id: 'structural_repair',
    name: 'Structural Repair',
    category: 'contractor',
    icon: 'Building',
    claimTypes: ['fire', 'wind_damage', 'earthquake', 'foundation'],
    description: 'Structural damage assessment and repair services',
    typicalCost: '$5,000 - $50,000+',
    urgency: 'urgent'
  },
  {
    id: 'cleaning_services',
    name: 'Cleaning Services',
    category: 'contractor',
    icon: 'Sparkles',
    claimTypes: ['fire', 'water_damage', 'smoke', 'vandalism'],
    description: 'Professional cleaning and restoration services',
    typicalCost: '$500 - $3,000',
    urgency: 'standard'
  }
]

export const expertCategories: VendorCategory[] = [
  {
    id: 'structural_engineer',
    name: 'Structural Engineer',
    category: 'expert',
    icon: 'Building',
    claimTypes: ['fire', 'wind_damage', 'earthquake', 'foundation', 'structural'],
    description: 'Professional engineering assessment and structural analysis',
    typicalCost: '$500 - $3,000',
    urgency: 'urgent'
  },
  {
    id: 'environmental_consultant',
    name: 'Environmental Consultant',
    category: 'expert',
    icon: 'Leaf',
    claimTypes: ['water_damage', 'flood', 'fire', 'mold', 'contamination'],
    description: 'Environmental testing, assessment, and remediation planning',
    typicalCost: '$800 - $2,500',
    urgency: 'urgent'
  },
  {
    id: 'insurance_consultant',
    name: 'Insurance Consultant',
    category: 'expert',
    icon: 'Shield',
    claimTypes: ['all'],
    description: 'Insurance policy analysis and claim strategy consulting',
    typicalCost: '$150 - $500/hour',
    urgency: 'standard'
  },
  {
    id: 'legal_expert',
    name: 'Legal Expert',
    category: 'expert',
    icon: 'Scale',
    claimTypes: ['all'],
    description: 'Legal counsel for complex claims and disputes',
    typicalCost: '$300 - $800/hour',
    urgency: 'standard'
  },
  {
    id: 'forensic_accountant',
    name: 'Forensic Accountant',
    category: 'expert',
    icon: 'Calculator',
    claimTypes: ['theft', 'vandalism', 'business_interruption'],
    description: 'Financial investigation and loss quantification',
    typicalCost: '$200 - $600/hour',
    urgency: 'standard'
  },
  {
    id: 'construction_consultant',
    name: 'Construction Consultant',
    category: 'expert',
    icon: 'HardHat',
    claimTypes: ['all'],
    description: 'Construction cost analysis and project management',
    typicalCost: '$100 - $300/hour',
    urgency: 'standard'
  },
  {
    id: 'code_compliance_expert',
    name: 'Code Compliance Expert',
    category: 'expert',
    icon: 'CheckSquare',
    claimTypes: ['fire', 'wind_damage', 'renovation', 'upgrade'],
    description: 'Building code compliance and upgrade requirements',
    typicalCost: '$150 - $400/hour',
    urgency: 'standard'
  },
  {
    id: 'safety_inspector',
    name: 'Safety Inspector',
    category: 'expert',
    icon: 'AlertCircle',
    claimTypes: ['all'],
    description: 'Safety assessment and hazard identification',
    typicalCost: '$200 - $500',
    urgency: 'urgent'
  },
  {
    id: 'fire_investigator',
    name: 'Fire Investigator',
    category: 'expert',
    icon: 'Flame',
    claimTypes: ['fire', 'explosion', 'arson'],
    description: 'Fire origin and cause investigation services',
    typicalCost: '$1,000 - $5,000',
    urgency: 'urgent'
  },
  {
    id: 'water_damage_expert',
    name: 'Water Damage Expert',
    category: 'expert',
    icon: 'Droplets',
    claimTypes: ['water_damage', 'flood', 'hurricane'],
    description: 'Water damage assessment and restoration consulting',
    typicalCost: '$500 - $2,000',
    urgency: 'urgent'
  }
]

export const allVendorCategories = [...contractorCategories, ...expertCategories]

export function getVendorCategoriesForClaimType(claimType: string): VendorCategory[] {
  const normalizedClaimType = claimType.toLowerCase().replace(' ', '_')
  return allVendorCategories.filter(category => 
    category.claimTypes.includes('all') || 
    category.claimTypes.includes(normalizedClaimType)
  )
}

export function getEmergencyVendors(): VendorCategory[] {
  return allVendorCategories.filter(category => 
    category.urgency === 'immediate'
  )
}

export function getUrgentVendors(): VendorCategory[] {
  return allVendorCategories.filter(category => 
    category.urgency === 'urgent'
  )
}

export function getVendorsByCategory(categoryType: 'contractor' | 'expert'): VendorCategory[] {
  return allVendorCategories.filter(category => category.category === categoryType)
}

export const claimTypeMapping: { [key: string]: string[] } = {
  'Fire': ['fire', 'smoke', 'explosion'],
  'Water Damage': ['water_damage', 'burst_pipe', 'leak'],
  'Wind Damage': ['wind_damage', 'hurricane', 'tornado'],
  'Hail': ['hail', 'storm'],
  'Hurricane': ['hurricane', 'wind_damage', 'water_damage'],
  'Tornado': ['tornado', 'wind_damage'],
  'Theft': ['theft', 'burglary'],
  'Vandalism': ['vandalism', 'malicious_damage'],
  'Earthquake': ['earthquake', 'structural'],
  'Flood': ['flood', 'water_damage'],
  'Lightning': ['lightning', 'electrical', 'fire'],
  'Explosion': ['explosion', 'fire'],
  'Other': ['other']
}