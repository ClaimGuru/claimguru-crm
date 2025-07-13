/**
 * Custom Fields Step - Temporarily Disabled for Build Fix
 */

import React from 'react';

interface CustomFieldsStepProps {
  data: any;
  onUpdate: (data: any) => void;
  organizationId: string;
  onComplete?: () => void;
}

export default function CustomFieldsStep({ data, onUpdate, organizationId }: CustomFieldsStepProps) {
  return (
    <div className="p-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          Custom Fields Step - Temporarily Disabled
        </h3>
        <p className="text-yellow-700">
          This step is temporarily disabled while we fix the PDF processing functionality.
        </p>
      </div>
    </div>
  );
}
