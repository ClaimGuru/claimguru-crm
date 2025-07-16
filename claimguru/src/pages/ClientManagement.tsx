/**
 * CLIENT MANAGEMENT SYSTEM
 * 
 * Features:
 * - Comprehensive client data fields
 * - Subscriber permission management (only subscribers can delete, but can grant create permissions)
 * - Advanced search and filtering
 * - Client creation, editing, and viewing
 * - Permission-based UI rendering
 * 
 * Permission Structure:
 * - Subscriber: Full access (create, edit, delete, manage permissions)
 * - Granted Users: Can create and edit clients (no delete)
 * - Regular Users: Read-only access unless granted specific permissions
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  Users, 
  UserPlus, 
  Shield, 
  Settings,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  UserCheck,
  Lock,
  Unlock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ClientCreateEditModal } from '../components/modals/ClientCreateEditModal';
import { ClientPermissionModal } from '../components/modals/ClientPermissionModal';

interface ClientRecord {
  id: string;
  clientNumber: string;
  
  // Basic Information
  clientType: 'individual' | 'business' | 'organization';
  firstName?: string;
  lastName?: string;
  middleName?: string;
  businessName?: string;
  organizationName?: string;
  preferredName?: string;
  title?: string;
  suffix?: string;
  
  // Contact Information
  primaryPhone: string;
  secondaryPhone?: string;
  mobilePhone?: string;
  workPhone?: string;
  faxNumber?: string;
  primaryEmail: string;
  secondaryEmail?: string;
  workEmail?: string;
  preferredContactMethod: 'phone' | 'email' | 'text' | 'mail';
  bestTimeToContact?: string;
  
  // Address Information
  mailingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    county?: string;
    country: string;
  };
  physicalAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    county?: string;
    country: string;
    sameAsMailingAddress: boolean;
  };
  
  // Personal Information
  dateOfBirth?: string;
  socialSecurityNumber?: string; // Encrypted
  driversLicenseNumber?: string;
  driversLicenseState?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'separated';
  occupation?: string;
  employer?: string;
  
  // Business Information (if applicable)
  businessType?: string;
  taxId?: string; // EIN for businesses
  businessLicense?: string;
  businessLicenseState?: string;
  dbaName?: string; // Doing Business As
  businessWebsite?: string;
  numberOfEmployees?: number;
  annualRevenue?: number;
  
  // Emergency Contact
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  
  // Legal Information
  powerOfAttorney?: {
    name: string;
    phone: string;
    email?: string;
    address: string;
  };
  guardian?: {
    name: string;
    phone: string;
    email?: string;
    relationship: string;
  };
  
  // Communication Preferences
  languagePreference: string;
  communicationRestrictions?: string;
  specialInstructions?: string;
  accessibilityNeeds?: string;
  
  // Insurance Information
  insuranceCarriers: {
    name: string;
    policyNumber?: string;
    agentName?: string;
    agentPhone?: string;
    agentEmail?: string;
    coverageTypes: string[];
  }[];
  
  // Financial Information
  bankingInformation?: {
    bankName: string;
    accountType: 'checking' | 'savings';
    routingNumber: string;
    accountNumber: string; // Encrypted
    accountHolderName: string;
  };
  
  // Referral Information
  referralSource?: {
    type: 'client' | 'professional' | 'advertisement' | 'website' | 'other';
    source: string;
    referrerName?: string;
    referrerContact?: string;
    referralDate?: string;
    referralNotes?: string;
  };
  
  // Legal History
  priorClaims: {
    claimNumber: string;
    claimType: string;
    dateOfLoss: string;
    status: string;
    settlement?: number;
  }[];
  litigation?: {
    caseNumber: string;
    courtName: string;
    caseType: string;
    status: string;
    attorney?: string;
  }[];
  
  // Internal Information
  clientStatus: 'active' | 'inactive' | 'suspended' | 'closed';
  riskLevel: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  internalNotes?: string;
  conflictCheck: boolean;
  conflictCheckDate?: string;
  conflictCheckBy?: string;
  
  // System Information
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  organizationId: string;
  
  // Permissions
  permissions: {
    canEdit: string[]; // User IDs who can edit
    canView: string[]; // User IDs who can view
  };
}

interface ClientPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManagePermissions: boolean;
  isSubscriber: boolean;
}

export default function ClientManagement() {
  const { userProfile } = useAuth();
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [permissions, setPermissions] = useState<ClientPermissions>({
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canManagePermissions: false,
    isSubscriber: false
  });
  const [organizationUsers, setOrganizationUsers] = useState<any[]>([]);

  useEffect(() => {
    loadClients();
    checkUserPermissions();
    loadOrganizationUsers();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // For now, using mock data to demonstrate the comprehensive client structure
      const mockClients: ClientRecord[] = [
        {
          id: 'client-001',
          clientNumber: 'CL-2025-001',
          clientType: 'individual',
          firstName: 'John',
          lastName: 'Smith',
          primaryPhone: '(555) 123-4567',
          primaryEmail: 'john.smith@email.com',
          preferredContactMethod: 'email',
          mailingAddress: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'TX',
            zipCode: '12345',
            country: 'USA'
          },
          languagePreference: 'English',
          insuranceCarriers: [],
          priorClaims: [],
          clientStatus: 'active',
          riskLevel: 'low',
          priority: 'medium',
          conflictCheck: true,
          createdAt: new Date().toISOString(),
          createdBy: 'user-001',
          updatedAt: new Date().toISOString(),
          updatedBy: 'user-001',
          organizationId: userProfile?.organization_id || 'demo-org',
          permissions: {
            canEdit: [],
            canView: []
          }
        }
      ];
      
      setClients(mockClients);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserPermissions = async () => {
    try {
      // TODO: Replace with actual permission check
      // For demo, assume user is subscriber if they have organization_id
      const isSubscriber = userProfile?.subscription_status === 'active' || userProfile?.role === 'admin';
      
      setPermissions({
        canCreate: true, // Can be granted by subscriber
        canEdit: true,   // Can be granted by subscriber
        canDelete: isSubscriber, // Only subscribers can delete
        canManagePermissions: isSubscriber, // Only subscribers can manage permissions
        isSubscriber: isSubscriber
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const loadOrganizationUsers = async () => {
    try {
      // TODO: Replace with actual API call
      const mockUsers = [
        {
          id: 'user-001',
          name: 'Sarah Johnson',
          email: 'sarah@company.com',
          role: 'Associate',
          isSubscriber: false
        },
        {
          id: 'user-002',
          name: 'Mike Davis',
          email: 'mike@company.com',
          role: 'Senior Associate',
          isSubscriber: false
        },
        {
          id: 'subscriber-001',
          name: 'Admin User',
          email: 'admin@company.com',
          role: 'Administrator',
          isSubscriber: true
        }
      ];
      
      setOrganizationUsers(mockUsers);
    } catch (error) {
      console.error('Error loading organization users:', error);
    }
  };

  const handleCreateClient = () => {
    setSelectedClient(null);
    setShowCreateModal(true);
  };

  const handleEditClient = (client: ClientRecord) => {
    setSelectedClient(client);
    setShowCreateModal(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!permissions.canDelete) {
      alert('Only subscribers can delete clients');
      return;
    }
    
    if (confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        // TODO: Implement actual delete
        setClients(clients.filter(c => c.id !== clientId));
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const handleManagePermissions = (client?: ClientRecord) => {
    setSelectedClient(client || null);
    setShowPermissionModal(true);
  };

  const handleSaveClient = async (clientData: any) => {
    try {
      if (selectedClient) {
        // Update existing client
        setClients(prev => prev.map(client => 
          client.id === selectedClient.id ? clientData : client
        ));
      } else {
        // Add new client
        setClients(prev => [...prev, clientData]);
      }
      setShowCreateModal(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleSavePermissions = async (permissionData: any) => {
    try {
      // TODO: Implement actual permission saving
      console.log('Saving permissions:', permissionData);
      setShowPermissionModal(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error saving permissions:', error);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.primaryEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.clientNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || client.clientStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600">Comprehensive client records and relationship management</p>
        </div>
        
        <div className="flex gap-3">
          {permissions.isSubscriber && (
            <Button
              onClick={() => setShowPermissionModal(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Manage Permissions
            </Button>
          )}
          
          {permissions.canCreate && (
            <Button
              onClick={handleCreateClient}
              variant="primary"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Client
            </Button>
          )}
        </div>
      </div>

      {/* Permissions Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <Shield className="h-4 w-4" />
            <span className="font-medium">Your Permissions:</span>
          </div>
          <div className="text-sm text-blue-700 mt-1 flex items-center gap-4">
            <span className={permissions.canCreate ? 'text-green-700' : 'text-red-700'}>
              {permissions.canCreate ? '✓' : '✗'} Create Clients
            </span>
            <span className={permissions.canEdit ? 'text-green-700' : 'text-red-700'}>
              {permissions.canEdit ? '✓' : '✗'} Edit Clients
            </span>
            <span className={permissions.canDelete ? 'text-green-700' : 'text-red-700'}>
              {permissions.canDelete ? '✓' : '✗'} Delete Clients
            </span>
            {permissions.isSubscriber && (
              <span className="text-green-700">🔑 Subscriber (Full Access)</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search clients by name, email, or client number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Client List */}
      <div className="grid gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {client.clientType === 'individual' ? (
                        <Users className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Building className="h-5 w-5 text-purple-600" />
                      )}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {client.clientType === 'individual' 
                          ? `${client.firstName} ${client.lastName}`
                          : client.businessName || client.organizationName
                        }
                      </h3>
                    </div>
                    
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      client.clientStatus === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : client.clientStatus === 'inactive'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {client.clientStatus}
                    </span>
                    
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      client.priority === 'urgent'
                        ? 'bg-red-100 text-red-800'
                        : client.priority === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : client.priority === 'medium'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {client.priority} priority
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{client.clientNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{client.primaryPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{client.primaryEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{client.mailingAddress.city}, {client.mailingAddress.state}</span>
                    </div>
                  </div>
                  
                  {client.specialInstructions && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      {client.specialInstructions}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEditClient(client)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    disabled={!permissions.canEdit}
                  >
                    <Eye className="h-3 w-3" />
                    View
                  </Button>
                  
                  {permissions.canEdit && (
                    <Button
                      onClick={() => handleEditClient(client)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Edit3 className="h-3 w-3" />
                      Edit
                    </Button>
                  )}
                  
                  {permissions.isSubscriber && (
                    <Button
                      onClick={() => handleManagePermissions(client)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <UserCheck className="h-3 w-3" />
                      Permissions
                    </Button>
                  )}
                  
                  {permissions.canDelete && (
                    <Button
                      onClick={() => handleDeleteClient(client.id)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'No clients match your search criteria'
                : 'Get started by creating your first client record'
              }
            </p>
            {permissions.canCreate && !searchTerm && filterStatus === 'all' && (
              <Button
                onClick={handleCreateClient}
                variant="primary"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create First Client
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Client Create/Edit Modal */}
      <ClientCreateEditModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedClient(null);
        }}
        onSave={handleSaveClient}
        clientData={selectedClient}
        isEditing={!!selectedClient}
      />

      {/* Permission Management Modal */}
      <ClientPermissionModal
        isOpen={showPermissionModal}
        onClose={() => {
          setShowPermissionModal(false);
          setSelectedClient(null);
        }}
        onSave={handleSavePermissions}
        clientData={selectedClient}
        organizationUsers={organizationUsers}
      />
    </div>
  );
}
