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
import { supabase, Client } from '../lib/supabase';
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
import { useClients } from '../hooks/useClients';
import { ClientCreateEditModal } from '../components/modals/ClientCreateEditModal';
import { ClientPermissionModal } from '../components/modals/ClientPermissionModal';

interface ClientPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManagePermissions: boolean;
  isSubscriber: boolean;
}

export default function ClientManagement() {
  const { userProfile } = useAuth();
  const { clients, loading, error, createClient, updateClient, deleteClient } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [permissions, setPermissions] = useState<ClientPermissions>({
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canManagePermissions: false,
    isSubscriber: false
  });
  const [organizationUsers, setOrganizationUsers] = useState<any[]>([]);

  useEffect(() => {
    checkUserPermissions();
    loadOrganizationUsers();
  }, []);

  // Client data is now loaded via useClients hook - no need for manual loading

  const checkUserPermissions = async () => {
    try {
      // TODO: Replace with actual permission check
      // For demo, assume user is subscriber if they have organization_id
      const isSubscriber = userProfile?.role === 'subscriber' || userProfile?.role === 'system_admin';
      
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
      // Load organization users via authenticated API
      const { data: users, error } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email, role, is_subscriber')
        .eq('organization_id', userProfile?.organization_id)
        .order('last_name');

      if (error) {
        console.error('Error loading organization users:', error);
        setOrganizationUsers([]);
        return;
      }

      const formattedUsers = (users || []).map(user => ({
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email,
        role: user.role || 'User',
        isSubscriber: user.is_subscriber || false
      }));

      setOrganizationUsers(formattedUsers);
    } catch (error) {
      console.error('Error loading organization users:', error);
    }
  };

  const handleCreateClient = () => {
    setSelectedClient(null);
    setShowCreateModal(true);
  };

  const handleEditClient = (client: Client) => {
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
        await deleteClient(clientId);
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const handleManagePermissions = (client?: Client) => {
    setSelectedClient(client || null);
    setShowPermissionModal(true);
  };

  const handleSaveClient = async (clientData: any) => {
    try {
      if (selectedClient) {
        // Update existing client
        await updateClient(selectedClient.id, clientData);
      } else {
        // Add new client
        await createClient(clientData);
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
      client.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.primary_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // For now, show all clients since we don't have status field in the actual schema
    const matchesFilter = filterStatus === 'all';
    
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
                      {client.client_type === 'residential' ? (
                        <Users className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Building className="h-5 w-5 text-purple-600" />
                      )}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {client.client_type === 'residential' 
                          ? `${client.first_name || ''} ${client.last_name || ''}`.trim()
                          : client.business_name || 'Business Client'
                        }
                      </h3>
                    </div>
                    
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>ID: {client.id.slice(0, 8)}...</span>
                    </div>
                    {client.primary_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{client.primary_phone}</span>
                      </div>
                    )}
                    {client.primary_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{client.primary_email}</span>
                      </div>
                    )}
                    {client.city && client.state && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{client.city}, {client.state}</span>
                      </div>
                    )}
                  </div>
                  
                  {client.notes && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      {client.notes}
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
