/**
 * Dynamic Custom Field - Temporarily Disabled for Build Fix
 */

import React from 'react';

interface DynamicCustomFieldProps {
  field: any;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export default function DynamicCustomField({ field, value, onChange, error }: DynamicCustomFieldProps) {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-yellow-700">
        Dynamic Custom Field temporarily disabled for build stability.
      </p>
    </div>
  );
}
