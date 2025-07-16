import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Button } from './Button';
import { 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  FileText, 
  Brain,
  Wand2,
  Target,
  TrendingUp,
  Clock,
  Shield,
  Info
} from 'lucide-react';
import { ConfirmedFieldsService } from '../../services/confirmedFieldsService';

interface ConfirmedFieldsSummaryProps {
  onBulkConfirm?: () => void;
  onViewDetails?: () => void;
  showActions?: boolean;
  className?: string;
}

export const ConfirmedFieldsSummary: React.FC<ConfirmedFieldsSummaryProps> = ({
  onBulkConfirm,
  onViewDetails,
  showActions = true,
  className
}) => {
  const [summary, setSummary] = useState(ConfirmedFieldsService.getSummary());
  const [showDetails, setShowDetails] = useState(false);
  
  // Update summary periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSummary(ConfirmedFieldsService.getSummary());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const pendingFields = ConfirmedFieldsService.getFieldsByStatus('pending');
  const confirmedFields = ConfirmedFieldsService.getFieldsByStatus('confirmed');
  const modifiedFields = ConfirmedFieldsService.getFieldsByStatus('modified');
  const rejectedFields = ConfirmedFieldsService.getFieldsByStatus('rejected');
  const needsAttention = ConfirmedFieldsService.getFieldsNeedingAttention();

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBgColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-100 border-green-200';
    if (rate >= 50) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  const handleBulkConfirmPending = () => {
    const pendingPaths = Object.keys(pendingFields).filter(path => {
      const field = pendingFields[path];
      return field.confidence === 'high' || field.confidence === 'medium';
    });
    
    ConfirmedFieldsService.bulkConfirmFields(pendingPaths);
    setSummary(ConfirmedFieldsService.getSummary());
    onBulkConfirm?.();
  };

  if (summary.totalFields === 0) {
    return (
      <Card className={`border-blue-200 bg-blue-50 ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-blue-700">
            <Info className="h-5 w-5" />
            <span className="text-sm">No extracted fields to confirm yet. Upload a policy document to get started.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-purple-200 bg-purple-50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <span>Field Confirmation Status</span>
          </div>
          <div className={`text-sm px-2 py-1 rounded ${getProgressBgColor(summary.completionRate)}`}>
            <span className={getProgressColor(summary.completionRate)}>
              {Math.round(summary.completionRate)}% Complete
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-xs text-gray-600">Confirmed</span>
            </div>
            <div className="text-lg font-semibold text-green-600">
              {summary.confirmedFields}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-xs text-gray-600">Pending</span>
            </div>
            <div className="text-lg font-semibold text-yellow-600">
              {summary.pendingFields}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-gray-600">High Confidence</span>
            </div>
            <div className="text-lg font-semibold text-blue-600">
              {summary.highConfidenceFields}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-xs text-gray-600">Needs Attention</span>
            </div>
            <div className="text-lg font-semibold text-red-600">
              {summary.needsAttention}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span className={getProgressColor(summary.completionRate)}>
              {summary.confirmedFields} of {summary.totalFields} fields confirmed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                summary.completionRate >= 80 ? 'bg-green-500' :
                summary.completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${summary.completionRate}%` }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        {showActions && (
          <div className="flex flex-wrap gap-2">
            {Object.keys(pendingFields).length > 0 && (
              <Button
                onClick={handleBulkConfirmPending}
                variant="primary"
                size="sm"
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
              >
                <Wand2 className="h-3 w-3" />
                Confirm High Confidence ({Object.keys(pendingFields).filter(path => 
                  pendingFields[path].confidence !== 'low'
                ).length})
              </Button>
            )}
            
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Eye className="h-3 w-3" />
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
            
            {onViewDetails && (
              <Button
                onClick={onViewDetails}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <FileText className="h-3 w-3" />
                View All Fields
              </Button>
            )}
          </div>
        )}

        {/* Detailed Breakdown */}
        {showDetails && (
          <div className="space-y-3 mt-4 pt-4 border-t border-purple-200">
            <h4 className="font-medium text-purple-900">Field Details</h4>
            
            {/* Confirmed Fields */}
            {Object.keys(confirmedFields).length > 0 && (
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <h5 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Confirmed Fields ({Object.keys(confirmedFields).length})
                </h5>
                <div className="text-xs text-green-700 space-y-1">
                  {Object.entries(confirmedFields).slice(0, 5).map(([path, field]) => (
                    <div key={path} className="flex justify-between">
                      <span className="capitalize">{path.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-mono">{String(field.value).substring(0, 20)}{String(field.value).length > 20 ? '...' : ''}</span>
                    </div>
                  ))}
                  {Object.keys(confirmedFields).length > 5 && (
                    <div className="text-green-600">+ {Object.keys(confirmedFields).length - 5} more</div>
                  )}
                </div>
              </div>
            )}

            {/* Pending Fields */}
            {Object.keys(pendingFields).length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <h5 className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending Review ({Object.keys(pendingFields).length})
                </h5>
                <div className="text-xs text-yellow-700 space-y-1">
                  {Object.entries(pendingFields).slice(0, 5).map(([path, field]) => (
                    <div key={path} className="flex justify-between items-center">
                      <span className="capitalize">{path.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-1 py-0.5 rounded text-xs ${
                          field.confidence === 'high' ? 'bg-green-100 text-green-700' :
                          field.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {field.confidence}
                        </span>
                        <span className="font-mono">{String(field.value).substring(0, 15)}{String(field.value).length > 15 ? '...' : ''}</span>
                      </div>
                    </div>
                  ))}
                  {Object.keys(pendingFields).length > 5 && (
                    <div className="text-yellow-600">+ {Object.keys(pendingFields).length - 5} more</div>
                  )}
                </div>
              </div>
            )}

            {/* Needs Attention */}
            {Object.keys(needsAttention).length > 0 && (
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <h5 className="text-sm font-medium text-red-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Needs Attention ({Object.keys(needsAttention).length})
                </h5>
                <div className="text-xs text-red-700 space-y-1">
                  {Object.entries(needsAttention).slice(0, 3).map(([path, field]) => (
                    <div key={path} className="flex justify-between">
                      <span className="capitalize">{path.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-mono">{String(field.value).substring(0, 15)}{String(field.value).length > 15 ? '...' : ''}</span>
                    </div>
                  ))}
                  {Object.keys(needsAttention).length > 3 && (
                    <div className="text-red-600">+ {Object.keys(needsAttention).length - 3} more</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
