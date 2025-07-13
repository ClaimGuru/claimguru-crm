/**
 * Custom Field Manager - Temporarily Disabled for Build Fix
 */

import React from 'react';

interface CustomFieldManagerProps {
  organizationId: string;
}

export default function CustomFieldManager({ organizationId }: CustomFieldManagerProps) {
  return (
    <div className="p-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          Custom Field Manager - Temporarily Disabled
        </h3>
        <p className="text-yellow-700">
          This component is temporarily disabled while we fix the PDF processing functionality.
          It will be restored in the next update.
        </p>
      </div>
    </div>
  );
}
