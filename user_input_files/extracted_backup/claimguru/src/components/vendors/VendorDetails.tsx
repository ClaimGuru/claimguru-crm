import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  Building, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Globe,
  Star,
  Calendar,
  DollarSign,
  FileText,
  Tag,
  Edit,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import type { Vendor } from '../../lib/supabase'

interface VendorDetailsProps {
  vendor: Vendor
  onEdit: () => void
}

export function VendorDetails({ vendor, onEdit }: VendorDetailsProps) {
  const formatPhone = (phone: string) => {
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`
    }
    return phone
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'busy': return 'bg-yellow-100 text-yellow-800'
      case 'unavailable': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-900">{vendor.company_name}</h2>
            {vendor.is_preferred && (
              <Star className="h-6 w-6 text-yellow-400 fill-current" />
            )}
          </div>
          <p className="text-lg text-gray-600 mt-1">{vendor.category}</p>
          
          <div className="flex items-center space-x-4 mt-3">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              getStatusColor(vendor.status || 'inactive')
            }`}>
              {vendor.status?.charAt(0).toUpperCase() + vendor.status?.slice(1)}
            </span>
            
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              getAvailabilityColor(vendor.availability || 'unavailable')
            }`}>
              {vendor.availability?.charAt(0).toUpperCase() + vendor.availability?.slice(1)}
            </span>
            
            {vendor.rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{vendor.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
        
        <Button onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Vendor
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-gray-400" />
              <div>
                <p className="font-medium">{vendor.contact_name}</p>
                {vendor.title && <p className="text-sm text-gray-600">{vendor.title}</p>}
              </div>
            </div>
            
            {vendor.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-gray-600">{formatPhone(vendor.phone)}</p>
                </div>
              </div>
            )}
            
            {vendor.mobile && (
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">Mobile</p>
                  <p className="text-sm text-gray-600">{formatPhone(vendor.mobile)}</p>
                </div>
              </div>
            )}
            
            {vendor.email && (
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href={`mailto:${vendor.email}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                    {vendor.email}
                  </a>
                </div>
              </div>
            )}
            
            {vendor.website && (
              <div className="flex items-center space-x-3">
                <Globe className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">Website</p>
                  <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-800">
                    {vendor.website}
                  </a>
                </div>
              </div>
            )}
            
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700">Preferred Contact Method</p>
              <p className="text-sm text-gray-600 capitalize">
                {vendor.preferred_contact_method || 'Email'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Address</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vendor.street_address || vendor.city || vendor.state ? (
              <div className="space-y-2">
                {vendor.street_address && (
                  <p className="text-gray-900">{vendor.street_address}</p>
                )}
                <p className="text-gray-900">
                  {[vendor.city, vendor.state, vendor.zip_code].filter(Boolean).join(', ')}
                </p>
                {vendor.country && vendor.country !== 'United States' && (
                  <p className="text-gray-600">{vendor.country}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">No address information available</p>
            )}
          </CardContent>
        </Card>

        {/* Specialties */}
        {vendor.specialties && vendor.specialties.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="h-5 w-5" />
                <span>Specialties</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {vendor.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rates & Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Rates & Payment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {vendor.hourly_rate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Hourly Rate:</span>
                <span className="font-medium">${vendor.hourly_rate.toFixed(2)}/hour</span>
              </div>
            )}
            
            {vendor.fixed_rate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Fixed Rate:</span>
                <span className="font-medium">${vendor.fixed_rate.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Terms:</span>
              <span className="font-medium">{vendor.payment_terms || 30} days</span>
            </div>
            
            {vendor.tax_id && (
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-600">Tax ID:</span>
                <span className="font-medium">{vendor.tax_id}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Credentials & Licensing</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {vendor.license_number && (
              <div className="flex justify-between">
                <span className="text-gray-600">License Number:</span>
                <span className="font-medium">{vendor.license_number}</span>
              </div>
            )}
            
            {vendor.license_expiry && (
              <div className="flex justify-between">
                <span className="text-gray-600">License Expiry:</span>
                <span className="font-medium">
                  {new Date(vendor.license_expiry).toLocaleDateString()}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-gray-600">Insurance Certificate:</span>
              <div className="flex items-center space-x-2">
                {vendor.insurance_certificate ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <span className={`font-medium ${
                  vendor.insurance_certificate ? 'text-green-600' : 'text-red-600'
                }`}>
                  {vendor.insurance_certificate ? 'On File' : 'Missing'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {vendor.notes && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Notes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{vendor.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}