/**
 * CLIENT PERMISSION MANAGEMENT MODAL
 * 
 * Allows subscribers to:
 * - Grant create/edit permissions to specific users
 * - View current permission assignments
 * - Revoke permissions (subscribers only)
 * - Set client-specific permissions
 * 
 * Permission Rules:
 * - Only subscribers can manage permissions
 * - Subscribers can always delete clients
 * - Granted users can create and edit but not delete
 * - Client-specific permissions override general permissions
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { 
  X, 
  Save, 
  Shield, 
  UserPlus, 
  UserMinus, 
  Users, 
  Search,
  Check,
  AlertTriangle,
  Crown,
  Key,
  Lock,
  Unlock,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isSubscriber: boolean;
  avatar?: string;
}

interface PermissionGrant {
  userId: string;
  userName: string;
  userEmail: string;
  permissions: {
    canCreate: boolean;
    canEdit: boolean;
    canView: boolean;
  };
  grantedAt: string;
  grantedBy: string;
}

interface ClientPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (permissions: any) => void;
  clientData?: any; // If null, it's global permissions; if provided, it's client-specific
  organizationUsers: User[];
}

export const ClientPermissionModal: React.FC<ClientPermissionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clientData,
  organizationUsers
}) => {
  const [activeTab, setActiveTab] = useState('grants');
  const [searchTerm, setSearchTerm] = useState('');
  const [permissionGrants, setPermissionGrants] = useState<PermissionGrant[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [newPermissions, setNewPermissions] = useState({
    canCreate: false,
    canEdit: false,
    canView: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadCurrentPermissions();
    }
  }, [isOpen, clientData]);

  const loadCurrentPermissions = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call to load current permissions
      // For now, using mock data
      const mockGrants: PermissionGrant[] = [
        {
          userId: 'user-001',
          userName: 'Sarah Johnson',
          userEmail: 'sarah@company.com',
          permissions: {
            canCreate: true,
            canEdit: true,
            canView: true
          },
          grantedAt: new Date().toISOString(),
          grantedBy: 'subscriber-001'
        },
        {
          userId: 'user-002',
          userName: 'Mike Davis',
          userEmail: 'mike@company.com',
          permissions: {
            canCreate: false,
            canEdit: true,
            canView: true
          },
          grantedAt: new Date().toISOString(),
          grantedBy: 'subscriber-001'
        }
      ];
      
      setPermissionGrants(mockGrants);
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserSelection = (userId: string) => {
    const newSelectedUsers = new Set(selectedUsers);
    if (newSelectedUsers.has(userId)) {
      newSelectedUsers.delete(userId);
    } else {
      newSelectedUsers.add(userId);
    }
    setSelectedUsers(newSelectedUsers);
  };

  const handleGrantPermissions = async () => {
    if (selectedUsers.size === 0) {
      alert('Please select at least one user to grant permissions to.');
      return;
    }

    const newGrants: PermissionGrant[] = Array.from(selectedUsers).map(userId => {
      const user = organizationUsers.find(u => u.id === userId);
      return {
        userId,
        userName: user?.name || 'Unknown User',
        userEmail: user?.email || '',
        permissions: { ...newPermissions },
        grantedAt: new Date().toISOString(),
        grantedBy: 'current-user-id' // TODO: Get from auth
      };
    });

    // Add new grants to existing ones (remove duplicates)
    const updatedGrants = [...permissionGrants];
    newGrants.forEach(newGrant => {
      const existingIndex = updatedGrants.findIndex(g => g.userId === newGrant.userId);
      if (existingIndex >= 0) {
        updatedGrants[existingIndex] = newGrant; // Update existing
      } else {
        updatedGrants.push(newGrant); // Add new
      }
    });

    setPermissionGrants(updatedGrants);
    setSelectedUsers(new Set());
    setNewPermissions({ canCreate: false, canEdit: false, canView: true });
  };

  const handleRevokePermission = (userId: string) => {
    if (confirm('Are you sure you want to revoke permissions for this user?')) {
      setPermissionGrants(prev => prev.filter(grant => grant.userId !== userId));
    }
  };

  const handleUpdatePermission = (userId: string, permission: string, value: boolean) => {
    setPermissionGrants(prev => 
      prev.map(grant => 
        grant.userId === userId
          ? {
              ...grant,
              permissions: {
                ...grant.permissions,
                [permission]: value
              }
            }
          : grant
      )
    );
  };

  const handleSavePermissions = async () => {
    setIsSaving(true);
    try {
      const permissionData = {
        clientId: clientData?.id || null,
        grants: permissionGrants,
        updatedAt: new Date().toISOString(),
        updatedBy: 'current-user-id' // TODO: Get from auth
      };

      await onSave(permissionData);
      onClose();
    } catch (error) {
      console.error('Error saving permissions:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = organizationUsers.filter(user => 
    !user.isSubscriber && // Don't show subscribers in the grant list
    ((user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
     (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())) &&
    !permissionGrants.some(grant => grant.userId === user.id) // Don't show users who already have permissions
  );

  const subscriberUsers = organizationUsers.filter(user => user.isSubscriber);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              {clientData ? `Client Permissions - ${clientData.firstName} ${clientData.lastName}` : 'Global Client Permissions'}
            </h2>
            <p className="text-gray-600 text-sm">
              {clientData 
                ? 'Manage who can access and modify this specific client record'
                : 'Manage who can create, edit, and view client records in your organization'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Permission Rules Notice */}
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-start gap-3">
            <Crown className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Subscriber Permissions</h4>
              <p className="text-sm text-blue-700">
                As a subscriber, you have full access to all client records and can grant permissions to other users. 
                Only subscribers can delete clients. Granted users can create and edit based on permissions you assign.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('grants')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'grants'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Current Permissions
            </button>
            <button
              onClick={() => setActiveTab('grant')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'grant'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Grant New Permissions
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'subscribers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Subscribers
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-250px)] p-6">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {/* Current Permissions Tab */}
              {activeTab === 'grants' && (
                <div className="space-y-4">
                  {permissionGrants.length === 0 ? (
                    <div className="text-center p-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No permissions granted yet</h3>
                      <p className="text-gray-600">
                        Grant permissions to team members so they can help manage client records.
                      </p>
                    </div>
                  ) : (
                    permissionGrants.map((grant) => (
                      <Card key={grant.userId} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div>
                                  <h4 className="font-medium text-gray-900">{grant.userName}</h4>
                                  <p className="text-sm text-gray-600">{grant.userEmail}</p>
                                </div>
                              </div>
                              
                              <div className="flex gap-4 text-sm">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={grant.permissions.canView}
                                    onChange={(e) => handleUpdatePermission(grant.userId, 'canView', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <Eye className="h-3 w-3" />
                                  View
                                </label>
                                
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={grant.permissions.canEdit}
                                    onChange={(e) => handleUpdatePermission(grant.userId, 'canEdit', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <Edit3 className="h-3 w-3" />
                                  Edit
                                </label>
                                
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={grant.permissions.canCreate}
                                    onChange={(e) => handleUpdatePermission(grant.userId, 'canCreate', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <UserPlus className="h-3 w-3" />
                                  Create New Clients
                                </label>
                              </div>
                              
                              <p className="text-xs text-gray-500 mt-2">
                                Granted on {new Date(grant.grantedAt).toLocaleDateString()}
                              </p>
                            </div>
                            
                            <Button
                              onClick={() => handleRevokePermission(grant.userId)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                            >
                              <UserMinus className="h-3 w-3" />
                              Revoke
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* Grant New Permissions Tab */}
              {activeTab === 'grant' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Grant Permissions to Users</h3>
                    
                    {/* Permission Selection */}
                    <Card className="border border-blue-200 bg-blue-50 mb-6">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-blue-900 mb-3">Select Permissions to Grant</h4>
                        <div className="flex gap-6">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={newPermissions.canView}
                              onChange={(e) => setNewPermissions(prev => ({ ...prev, canView: e.target.checked }))}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <Eye className="h-4 w-4" />
                            View Clients
                          </label>
                          
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={newPermissions.canEdit}
                              onChange={(e) => setNewPermissions(prev => ({ ...prev, canEdit: e.target.checked }))}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <Edit3 className="h-4 w-4" />
                            Edit Clients
                          </label>
                          
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={newPermissions.canCreate}
                              onChange={(e) => setNewPermissions(prev => ({ ...prev, canCreate: e.target.checked }))}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <UserPlus className="h-4 w-4" />
                            Create New Clients
                          </label>
                        </div>
                        
                        {selectedUsers.size > 0 && (
                          <div className="mt-4 pt-4 border-t border-blue-200">
                            <Button
                              onClick={handleGrantPermissions}
                              variant="primary"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Key className="h-3 w-3" />
                              Grant to {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* User Selection */}
                    <div className="relative mb-4">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="space-y-2">
                      {filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          className={`border cursor-pointer transition-colors rounded-lg ${
                            selectedUsers.has(user.id) 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleToggleUserSelection(user.id)}
                        >
                        <Card className="border-none shadow-none bg-transparent">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedUsers.has(user.id)}
                                    onChange={() => handleToggleUserSelection(user.id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <div>
                                    <h4 className="font-medium text-gray-900">{user.name}</h4>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {user.role}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                        </div>
                      ))}
                      
                      {filteredUsers.length === 0 && (
                        <div className="text-center p-8">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No users available</h3>
                          <p className="text-gray-600">
                            {searchTerm ? 'No users match your search criteria' : 'All eligible users already have permissions granted'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Subscribers Tab */}
              {activeTab === 'subscribers' && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Crown className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Subscriber Information</h4>
                        <p className="text-sm text-yellow-700">
                          Subscribers have full access to all client management features including the ability to delete clients and manage permissions. 
                          Subscriber status is managed at the organization level.
                        </p>
                      </div>
                    </div>
                  </div>

                  {subscriberUsers.map((user) => (
                    <Card key={user.id} className="border border-yellow-200 bg-yellow-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Crown className="h-5 w-5 text-yellow-600" />
                            <div>
                              <h4 className="font-medium text-gray-900">{user.name}</h4>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                              Subscriber
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Check className="h-3 w-3" />
                              Full Access
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Changes will take effect immediately after saving
          </div>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePermissions}
              variant="primary"
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Permissions
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
