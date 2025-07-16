import React, { useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { 
  CheckCircle, 
  AlertCircle, 
  Edit3, 
  X, 
  Save, 
  Eye,
  Shield,
  Brain,
  User,
  Wand2
} from 'lucide-react';
import { ConfirmedFieldsService, FieldSource, FieldConfirmationStatus } from '../../services/confirmedFieldsService';

interface ConfirmedFieldWrapperProps {
  fieldPath: string;
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'tel' | 'date';
  onChange: (value: string) => void;
  onConfirm?: (value: string) => void;
  onReject?: (reason?: string) => void;
  disabled?: boolean;
  className?: string;
  showConfirmationControls?: boolean;
}

export const ConfirmedFieldWrapper: React.FC<ConfirmedFieldWrapperProps> = ({
  fieldPath,
  label,
  value,
  placeholder,
  required,
  type = 'text',
  onChange,
  onConfirm,
  onReject,
  disabled,
  className,
  showConfirmationControls = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fieldData = ConfirmedFieldsService.getField(fieldPath);
  const displayProps = ConfirmedFieldsService.getFieldDisplayProps(fieldPath);

  const handleConfirm = () => {
    const finalValue = isEditing ? editValue : value;
    ConfirmedFieldsService.confirmField(fieldPath, finalValue);
    onChange(finalValue);
    onConfirm?.(finalValue);
    setIsEditing(false);
  };

  const handleReject = () => {
    ConfirmedFieldsService.rejectField(fieldPath, rejectReason);
    onReject?.(rejectReason);
    setShowRejectModal(false);
    setRejectReason('');
  };

  const handleEdit = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  const handleSave = () => {
    ConfirmedFieldsService.modifyField(fieldPath, editValue, 'user_entered');
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const getSourceIcon = (source: FieldSource) => {
    switch (source) {
      case 'pdf_extracted': return <Brain className="h-3 w-3" />;
      case 'ai_suggested': return <Wand2 className="h-3 w-3" />;
      case 'user_entered': return <User className="h-3 w-3" />;
      case 'auto_populated': return <Shield className="h-3 w-3" />;
      default: return <User className="h-3 w-3" />;
    }
  };

  const getStatusIcon = (status: FieldConfirmationStatus) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'modified': return <Edit3 className="h-4 w-4 text-blue-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'rejected': return <X className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-2">
      {/* Label with status indicators */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {displayProps.badge && (
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${displayProps.badge.className}`}>
            {getSourceIcon(displayProps.source)}
            {displayProps.badge.text}
          </div>
        )}
      </div>

      {/* Input field */}
      <div className="relative">
        <Input
          type={type}
          value={isEditing ? editValue : value}
          onChange={(e) => {
            const newValue = e.target.value;
            if (isEditing) {
              setEditValue(newValue);
            } else {
              // Track as user modification
              ConfirmedFieldsService.modifyField(fieldPath, newValue, 'user_entered');
              onChange(newValue);
            }
          }}
          placeholder={placeholder}
          disabled={disabled || (displayProps.isProtected && !isEditing)}
          className={`${displayProps.className} ${className || ''} pr-10`}
          required={required}
        />
        
        {/* Status icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {getStatusIcon(displayProps.status)}
        </div>
      </div>

      {/* Field metadata */}
      {fieldData && (
        <div className="text-xs text-gray-500 space-y-1">
          {fieldData.confidence && (
            <div className="flex items-center gap-1">
              <span>Confidence:</span>
              <span className={`font-medium ${
                fieldData.confidence === 'high' ? 'text-green-600' :
                fieldData.confidence === 'medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {typeof fieldData.confidence === 'number' ? 
                  `${Math.round(fieldData.confidence * 100)}%` : 
                  fieldData.confidence}
              </span>
            </div>
          )}
          
          {fieldData.metadata?.extractionMethod && (
            <div>Extracted via: {fieldData.metadata.extractionMethod}</div>
          )}
          
          {fieldData.confirmedAt && (
            <div>Confirmed: {new Date(fieldData.confirmedAt).toLocaleDateString()} at {new Date(fieldData.confirmedAt).toLocaleTimeString()}</div>
          )}
        </div>
      )}

      {/* Confirmation controls */}
      {showConfirmationControls && displayProps.status === 'pending' && !isEditing && (
        <div className="flex gap-2">
          <Button
            onClick={handleConfirm}
            variant="primary"
            size="sm"
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-3 w-3" />
            Confirm
          </Button>
          
          <Button
            onClick={handleEdit}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Edit3 className="h-3 w-3" />
            Edit
          </Button>
          
          <Button
            onClick={() => setShowRejectModal(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50"
          >
            <X className="h-3 w-3" />
            Reject
          </Button>
        </div>
      )}

      {/* Edit controls */}
      {isEditing && (
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            variant="primary"
            size="sm"
            className="flex items-center gap-1"
          >
            <Save className="h-3 w-3" />
            Save
          </Button>
          
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Cancel
          </Button>
        </div>
      )}

      {/* Protected field notice */}
      {displayProps.isProtected && !isEditing && (
        <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
          <Shield className="h-3 w-3" />
          <span>This field has been confirmed and is protected from auto-changes</span>
          <Button
            onClick={handleEdit}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            <Edit3 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Field Value</h3>
            <p className="text-sm text-gray-600 mb-4">
              Why is this value incorrect? (Optional)
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Incorrect policy number, wrong date format..."
              className="w-full p-2 border rounded-md text-sm"
              rows={3}
            />
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleReject}
                variant="primary"
                className="bg-red-600 hover:bg-red-700"
              >
                Reject Field
              </Button>
              <Button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
