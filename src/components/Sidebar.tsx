import { useState } from 'react'
import type { Country } from '../types'

interface SidebarProps {
  countries: Country[]
  selectedCountry: Country | null
  onCountrySelect: (country: Country) => void
}

export default function Sidebar({ countries, selectedCountry, onCountrySelect }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-64 bg-gray-100 border-r border-gray-300 flex flex-col h-full">
      <div className="p-4 border-b border-gray-300 bg-white">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Countries</h2>
        <input
          type="text"
          placeholder="Search countries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredCountries.map((country) => (
          <button
            key={country.id}
            onClick={() => onCountrySelect(country)}
            className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-200 transition-colors ${
              selectedCountry?.id === country.id ? 'bg-blue-100 hover:bg-blue-200' : ''
            }`}
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">{country.code}</span>
              <span className="text-sm font-medium text-gray-800">{country.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
