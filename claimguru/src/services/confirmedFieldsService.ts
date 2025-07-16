/**
 * Service to track and manage confirmed fields throughout the wizard
 * Provides a centralized system for field confirmation status, sources, and protection
 */

export type FieldSource = 'pdf_extracted' | 'user_entered' | 'ai_suggested' | 'auto_populated';
export type FieldConfirmationStatus = 'confirmed' | 'pending' | 'rejected' | 'modified';

export interface ConfirmedField {
  value: any;
  source: FieldSource;
  status: FieldConfirmationStatus;
  confidence: 'high' | 'medium' | 'low';
  confirmedAt?: string;
  confirmedBy?: string; // user ID or system
  originalValue?: any; // for tracking changes
  validationPassed?: boolean;
  metadata?: {
    extractionMethod?: string;
    aiModel?: string;
    userNote?: string;
    rawSource?: string;
  };
}

export interface ConfirmedFieldsState {
  fields: Record<string, ConfirmedField>;
  lastUpdated: string;
  version: number;
  totals: {
    confirmed: number;
    pending: number;
    rejected: number;
    modified: number;
  };
}

export class ConfirmedFieldsService {
  private static state: ConfirmedFieldsState = {
    fields: {},
    lastUpdated: new Date().toISOString(),
    version: 1,
    totals: { confirmed: 0, pending: 0, rejected: 0, modified: 0 }
  };

  /**
   * Initialize the service with extracted PDF data
   */
  static initializeWithPDFData(extractedData: any, validationMetadata?: any): void {
    console.log('🔐 Initializing confirmed fields with PDF data:', extractedData);
    
    Object.entries(extractedData).forEach(([fieldPath, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        this.setField(fieldPath, {
          value,
          source: 'pdf_extracted',
          status: 'pending', // Start as pending until user confirms
          confidence: this.determineConfidence(fieldPath, value, validationMetadata),
          metadata: {
            extractionMethod: validationMetadata?.processingMethod || 'hybrid',
            rawSource: 'PDF Policy Document'
          }
        });
      }
    });

    this.updateTotals();
    console.log('✅ Confirmed fields initialized:', this.state.totals);
  }

  /**
   * Set a field with confirmation details
   */
  static setField(fieldPath: string, fieldData: Partial<ConfirmedField>): void {
    const existingField = this.state.fields[fieldPath];
    
    this.state.fields[fieldPath] = {
      value: fieldData.value,
      source: fieldData.source || 'user_entered',
      status: fieldData.status || 'pending',
      confidence: fieldData.confidence || 'medium',
      confirmedAt: fieldData.status === 'confirmed' ? new Date().toISOString() : existingField?.confirmedAt,
      confirmedBy: fieldData.status === 'confirmed' ? 'user' : existingField?.confirmedBy,
      originalValue: existingField?.value || fieldData.value,
      validationPassed: fieldData.validationPassed !== undefined ? fieldData.validationPassed : true,
      metadata: { ...existingField?.metadata, ...fieldData.metadata }
    };

    this.state.lastUpdated = new Date().toISOString();
    this.state.version++;
    this.updateTotals();
  }

  /**
   * Confirm a field (user approved)
   */
  static confirmField(fieldPath: string, finalValue?: any): void {
    const field = this.state.fields[fieldPath];
    if (!field) {
      console.warn(`Field ${fieldPath} not found for confirmation`);
      return;
    }

    this.setField(fieldPath, {
      ...field,
      value: finalValue !== undefined ? finalValue : field.value,
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
      confirmedBy: 'user'
    });

    console.log(`✅ Field confirmed: ${fieldPath} = ${finalValue || field.value}`);
  }

  /**
   * Reject a field (user disagreed with extraction)
   */
  static rejectField(fieldPath: string, reason?: string): void {
    const field = this.state.fields[fieldPath];
    if (!field) return;

    this.setField(fieldPath, {
      ...field,
      status: 'rejected',
      validationPassed: false,
      metadata: {
        ...field.metadata,
        userNote: reason
      }
    });

    console.log(`❌ Field rejected: ${fieldPath}, reason: ${reason}`);
  }

  /**
   * Modify a field (user changed the value)
   */
  static modifyField(fieldPath: string, newValue: any, source: FieldSource = 'user_entered'): void {
    const existingField = this.state.fields[fieldPath];
    
    this.setField(fieldPath, {
      value: newValue,
      source,
      status: 'modified',
      confidence: source === 'user_entered' ? 'high' : 'medium',
      originalValue: existingField?.originalValue || existingField?.value,
      validationPassed: true
    });

    console.log(`✏️ Field modified: ${fieldPath} = ${newValue}`);
  }

  /**
   * Get field information
   */
  static getField(fieldPath: string): ConfirmedField | undefined {
    return this.state.fields[fieldPath];
  }

  /**
   * Check if a field is confirmed
   */
  static isFieldConfirmed(fieldPath: string): boolean {
    const field = this.state.fields[fieldPath];
    return field?.status === 'confirmed';
  }

  /**
   * Check if a field should be protected from overwriting
   */
  static isFieldProtected(fieldPath: string): boolean {
    const field = this.state.fields[fieldPath];
    return field?.status === 'confirmed' || field?.status === 'modified';
  }

  /**
   * Get all fields by status
   */
  static getFieldsByStatus(status: FieldConfirmationStatus): Record<string, ConfirmedField> {
    return Object.fromEntries(
      Object.entries(this.state.fields).filter(([_, field]) => field.status === status)
    );
  }

  /**
   * Get all confirmed field values for wizard population
   */
  static getConfirmedValues(): Record<string, any> {
    const confirmedFields = this.getFieldsByStatus('confirmed');
    const modifiedFields = this.getFieldsByStatus('modified');
    
    return {
      ...Object.fromEntries(
        Object.entries(confirmedFields).map(([path, field]) => [path, field.value])
      ),
      ...Object.fromEntries(
        Object.entries(modifiedFields).map(([path, field]) => [path, field.value])
      )
    };
  }

  /**
   * Get fields that need user attention
   */
  static getFieldsNeedingAttention(): Record<string, ConfirmedField> {
    return Object.fromEntries(
      Object.entries(this.state.fields).filter(([_, field]) => 
        field.status === 'pending' && field.confidence === 'low'
      )
    );
  }

  /**
   * Generate field display properties for UI components
   */
  static getFieldDisplayProps(fieldPath: string): {
    hasConfirmedValue: boolean;
    isProtected: boolean;
    source: FieldSource;
    status: FieldConfirmationStatus;
    confidence: 'high' | 'medium' | 'low';
    className: string;
    badge?: {
      text: string;
      className: string;
    };
  } {
    const field = this.state.fields[fieldPath];
    
    if (!field) {
      return {
        hasConfirmedValue: false,
        isProtected: false,
        source: 'user_entered',
        status: 'pending',
        confidence: 'medium',
        className: 'border-gray-300'
      };
    }

    let className = 'border-gray-300';
    let badge;

    switch (field.status) {
      case 'confirmed':
        className = 'border-green-500 bg-green-50';
        badge = { text: 'Confirmed', className: 'bg-green-100 text-green-800' };
        break;
      case 'modified':
        className = 'border-blue-500 bg-blue-50';
        badge = { text: 'Modified', className: 'bg-blue-100 text-blue-800' };
        break;
      case 'pending':
        className = field.confidence === 'low' ? 'border-yellow-500 bg-yellow-50' : 'border-purple-300 bg-purple-50';
        badge = { text: 'AI Extracted', className: 'bg-purple-100 text-purple-800' };
        break;
      case 'rejected':
        className = 'border-red-500 bg-red-50';
        badge = { text: 'Rejected', className: 'bg-red-100 text-red-800' };
        break;
    }

    return {
      hasConfirmedValue: !!field.value,
      isProtected: this.isFieldProtected(fieldPath),
      source: field.source,
      status: field.status,
      confidence: field.confidence,
      className,
      badge
    };
  }

  /**
   * Bulk confirm multiple fields
   */
  static bulkConfirmFields(fieldPaths: string[]): void {
    fieldPaths.forEach(path => {
      if (this.state.fields[path]) {
        this.confirmField(path);
      }
    });
    console.log(`✅ Bulk confirmed ${fieldPaths.length} fields`);
  }

  /**
   * Export confirmed fields data
   */
  static exportState(): ConfirmedFieldsState {
    return { ...this.state };
  }

  /**
   * Import confirmed fields data (for restore/sync)
   */
  static importState(importedState: ConfirmedFieldsState): void {
    this.state = { ...importedState };
    console.log('📥 Confirmed fields state imported');
  }

  /**
   * Reset all fields (start over)
   */
  static reset(): void {
    this.state = {
      fields: {},
      lastUpdated: new Date().toISOString(),
      version: 1,
      totals: { confirmed: 0, pending: 0, rejected: 0, modified: 0 }
    };
    console.log('🔄 Confirmed fields state reset');
  }

  /**
   * Get summary statistics
   */
  static getSummary(): {
    totalFields: number;
    completionRate: number;
    confirmedFields: number;
    pendingFields: number;
    highConfidenceFields: number;
    needsAttention: number;
  } {
    const totalFields = Object.keys(this.state.fields).length;
    const confirmedFields = this.state.totals.confirmed + this.state.totals.modified;
    const pendingFields = this.state.totals.pending;
    const highConfidenceFields = Object.values(this.state.fields).filter(f => f.confidence === 'high').length;
    const needsAttention = Object.values(this.state.fields).filter(f => 
      f.status === 'pending' && f.confidence === 'low'
    ).length;

    return {
      totalFields,
      completionRate: totalFields > 0 ? (confirmedFields / totalFields) * 100 : 0,
      confirmedFields,
      pendingFields,
      highConfidenceFields,
      needsAttention
    };
  }

  /**
   * Private helper methods
   */
  private static determineConfidence(fieldPath: string, value: any, metadata?: any): 'high' | 'medium' | 'low' {
    if (metadata?.confidence) return metadata.confidence;
    
    // Simple heuristics for confidence
    if (typeof value === 'string' && value.length > 20) return 'high';
    if (fieldPath.includes('policyNumber') && /^[A-Z0-9-]{6,}$/.test(value)) return 'high';
    if (fieldPath.includes('Date') && /^\d{4}-\d{2}-\d{2}$/.test(value)) return 'high';
    
    return 'medium';
  }

  private static updateTotals(): void {
    this.state.totals = {
      confirmed: 0,
      pending: 0,
      rejected: 0,
      modified: 0
    };

    Object.values(this.state.fields).forEach(field => {
      this.state.totals[field.status]++;
    });
  }
}