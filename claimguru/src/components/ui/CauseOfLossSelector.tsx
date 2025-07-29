import React, { useState } from 'react'
import { Input } from './Input'
import { ChevronDown, Search } from 'lucide-react'

interface CauseOfLossSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  required?: boolean
}

export function CauseOfLossSelector({ value, onChange, className = '', required = false }: CauseOfLossSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Comprehensive cause of loss options for both residential and commercial
  const causeOfLossOptions = {
    'Property Losses - Residential': [
      'Fire',
      'Lightning',
      'Wind',
      'Hail',
      'Water Damage - Sudden and Accidental',
      'Water Damage - Gradual Seepage',
      'Burst Pipe',
      'Appliance Leak',
      'Roof Leak',
      'Foundation Leak',
      'Sewer Backup',
      'Flood',
      'Hurricane',
      'Tornado',
      'Earthquake',
      'Theft',
      'Burglary',
      'Vandalism',
      'Malicious Mischief',
      'Vehicle Impact',
      'Aircraft Impact',
      'Falling Objects',
      'Weight of Ice/Snow/Sleet',
      'Smoke Damage',
      'Explosion',
      'Riot or Civil Commotion',
      'Volcanic Eruption',
      'Freezing',
      'Power Surge',
      'Mold',
      'Other Weather-Related',
      'Other'
    ],
    'Property Losses - Commercial': [
      'Fire',
      'Lightning',
      'Wind',
      'Hail',
      'Water Damage',
      'Equipment Breakdown',
      'Business Interruption',
      'Extra Expense',
      'Loss of Income',
      'Data Loss',
      'Cyber Attack',
      'Power Outage',
      'Theft of Money/Securities',
      'Employee Dishonesty',
      'Vandalism',
      'Explosion',
      'Boiler/Machinery Breakdown',
      'Spoilage',
      'Building Collapse',
      'Other Commercial'
    ]
  }

  const allOptions = Object.entries(causeOfLossOptions).flatMap(([category, options]) => 
    options.map(option => ({ category, option }))
  )

  const filteredOptions = searchTerm
    ? allOptions.filter(({ option }) => 
        option.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allOptions

  const handleSelect = (option: string) => {
    onChange(option)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between"
        >
          <span className={value ? 'text-gray-900' : 'text-gray-500'}>
            {value || 'Select cause of loss'}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-hidden">
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search causes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {Object.entries(causeOfLossOptions).map(([category, options]) => {
                const categoryOptions = options.filter(option => 
                  !searchTerm || option.toLowerCase().includes(searchTerm.toLowerCase())
                )

                if (categoryOptions.length === 0) return null

                return (
                  <div key={category}>
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-200">
                      {category}
                    </div>
                    {categoryOptions.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelect(option)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )
              })}

              {filteredOptions.length === 0 && (
                <div className="px-3 py-4 text-center text-gray-500 text-sm">
                  No matching causes found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CauseOfLossSelector