/**
 * Recommendation Service
 * Provides AI-powered recommendations using OpenAI via Supabase Edge Function
 */

import { configService } from '../configService';
import { supabase } from '../../lib/supabase';

export interface RecommendationRequest {
  claimType?: string;
  damageDescription?: string;
  propertyType?: string;
  claimAmount?: number;
  insuredName?: string;
  policyDetails?: Record<string, any>;
  context?: 'tasks' | 'vendors' | 'documentation' | 'settlement';
}

export interface TaskRecommendation {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string; // ISO date string
  category: string;
  assigneeRole?: string;
}

export interface VendorRecommendation {
  vendorType: string;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  specialization?: string;
  timing: 'immediate' | 'within_week' | 'schedule_ahead';
}

export interface DocumentationRecommendation {
  documentType: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  deadline?: string; // ISO date string
  tips?: string[];
}

export interface RecommendationResult {
  success: boolean;
  tasks?: TaskRecommendation[];
  vendors?: VendorRecommendation[];
  documentation?: DocumentationRecommendation[];
  settlementAdvice?: string;
  error?: {
    code: string;
    message: string;
  };
}

class RecommendationService {
  private static instance: RecommendationService;

  private constructor() {}

  public static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  /**
   * Get AI-powered recommendations for claim handling
   */
  public async getRecommendations(request: RecommendationRequest): Promise<RecommendationResult> {
    try {
      if (!configService.isOpenAIEnabled()) {
        console.warn('OpenAI integration is not enabled. Using mock response.');
        return this.getMockRecommendations(request);
      }

      // In a real implementation, we'd have a dedicated edge function for recommendations
      // For now, we'll repurpose the existing OpenAI edge function with a custom prompt
      const context = request.context || 'tasks';
      const customPrompt = `You are an expert insurance claim consultant. Based on this information, provide professional recommendations for ${context}:
      
      Claim Type: ${request.claimType || 'Not specified'}
      Damage Description: ${request.damageDescription || 'Not specified'}
      Property Type: ${request.propertyType || 'Not specified'}
      Claim Amount: ${request.claimAmount || 'Not specified'}
      Insured Name: ${request.insuredName || 'Not specified'}
      
      Policy Details: ${JSON.stringify(request.policyDetails || {})}
      
      Respond with JSON containing recommendations for ${context}.
      `;

      // Call the OpenAI edge function through Supabase
      const { data, error } = await supabase.functions.invoke('openai-extract-fields', {
        body: { text: customPrompt, mode: 'recommendations', context: context }
      });

      if (error) {
        console.error('OpenAI recommendations error:', error);
        throw new Error(`Failed to get recommendations: ${error.message}`);
      }

      // Process the OpenAI response
      return {
        success: true,
        ...(data || this.getDefaultRecommendations(request))
      };
    } catch (error: any) {
      console.error('Recommendations failed:', error);
      
      // If OpenAI fails, fall back to mock responses
      return {
        success: false,
        error: {
          code: 'RECOMMENDATIONS_FAILED',
          message: error.message || 'Failed to generate recommendations'
        }
      };
    }
  }

  /**
   * Get task recommendations specifically
   */
  public async getTaskRecommendations(request: RecommendationRequest): Promise<TaskRecommendation[]> {
    try {
      const result = await this.getRecommendations({ ...request, context: 'tasks' });
      
      if (result.success && result.tasks && result.tasks.length > 0) {
        return result.tasks;
      }
      
      return this.getDefaultTaskRecommendations(request);
    } catch (error) {
      console.error('Task recommendations failed:', error);
      return this.getDefaultTaskRecommendations(request);
    }
  }

  /**
   * Get vendor recommendations specifically
   */
  public async getVendorRecommendations(request: RecommendationRequest): Promise<VendorRecommendation[]> {
    try {
      const result = await this.getRecommendations({ ...request, context: 'vendors' });
      
      if (result.success && result.vendors && result.vendors.length > 0) {
        return result.vendors;
      }
      
      return this.getDefaultVendorRecommendations(request);
    } catch (error) {
      console.error('Vendor recommendations failed:', error);
      return this.getDefaultVendorRecommendations(request);
    }
  }

  /**
   * Get documentation recommendations specifically
   */
  public async getDocumentationRecommendations(request: RecommendationRequest): Promise<DocumentationRecommendation[]> {
    try {
      const result = await this.getRecommendations({ ...request, context: 'documentation' });
      
      if (result.success && result.documentation && result.documentation.length > 0) {
        return result.documentation;
      }
      
      return this.getDefaultDocumentationRecommendations(request);
    } catch (error) {
      console.error('Documentation recommendations failed:', error);
      return this.getDefaultDocumentationRecommendations(request);
    }
  }

  /**
   * Get settlement advice specifically
   */
  public async getSettlementAdvice(request: RecommendationRequest): Promise<string> {
    try {
      const result = await this.getRecommendations({ ...request, context: 'settlement' });
      
      if (result.success && result.settlementAdvice) {
        return result.settlementAdvice;
      }
      
      return this.getDefaultSettlementAdvice(request);
    } catch (error) {
      console.error('Settlement advice failed:', error);
      return this.getDefaultSettlementAdvice(request);
    }
  }

  /**
   * Fallback mock recommendations for when OpenAI is not available
   */
  private getMockRecommendations(request: RecommendationRequest): RecommendationResult {
    console.log('Using mock recommendations result');
    
    const context = request.context || 'tasks';
    const result: RecommendationResult = { success: true };
    
    if (context === 'tasks' || !context) {
      result.tasks = this.getDefaultTaskRecommendations(request);
    }
    
    if (context === 'vendors') {
      result.vendors = this.getDefaultVendorRecommendations(request);
    }
    
    if (context === 'documentation') {
      result.documentation = this.getDefaultDocumentationRecommendations(request);
    }
    
    if (context === 'settlement') {
      result.settlementAdvice = this.getDefaultSettlementAdvice(request);
    }
    
    return result;
  }

  /**
   * Default recommendations structure
   */
  private getDefaultRecommendations(request: RecommendationRequest): Record<string, any> {
    return {
      tasks: this.getDefaultTaskRecommendations(request),
      vendors: this.getDefaultVendorRecommendations(request),
      documentation: this.getDefaultDocumentationRecommendations(request),
      settlementAdvice: this.getDefaultSettlementAdvice(request)
    };
  }

  /**
   * Default task recommendations
   */
  private getDefaultTaskRecommendations(request: RecommendationRequest): TaskRecommendation[] {
    const tasks: TaskRecommendation[] = [
      {
        title: 'Document Damage with Photos',
        description: 'Take comprehensive photos of all damaged areas and items',
        priority: 'urgent',
        category: 'Documentation',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
      },
      {
        title: 'Create Inventory of Damaged Items',
        description: 'List all damaged personal property with estimates of value',
        priority: 'high',
        category: 'Documentation',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days
      },
      {
        title: 'Obtain Repair Estimates',
        description: 'Get estimates from licensed contractors for all repairs',
        priority: 'high',
        category: 'Estimation',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week
      },
      {
        title: 'Review Policy Coverage',
        description: 'Analyze policy to understand coverage limits and exclusions',
        priority: 'medium',
        category: 'Analysis',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days
      }
    ];
    
    // Add damage-specific tasks
    if (request.claimType) {
      const claimType = request.claimType.toLowerCase();
      
      if (claimType.includes('water')) {
        tasks.push({
          title: 'Arrange Water Mitigation',
          description: 'Schedule professional water extraction and drying',
          priority: 'urgent',
          category: 'Mitigation',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day
        });
      }
      
      if (claimType.includes('fire')) {
        tasks.push({
          title: 'Schedule Structural Inspection',
          description: 'Arrange for structural engineer to assess damage',
          priority: 'urgent',
          category: 'Safety',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days
        });
      }
      
      if (claimType.includes('roof') || claimType.includes('wind')) {
        tasks.push({
          title: 'Install Temporary Roof Protection',
          description: 'Cover damaged areas with tarps to prevent further damage',
          priority: 'urgent',
          category: 'Mitigation',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day
        });
      }
    }
    
    return tasks;
  }

  /**
   * Default vendor recommendations
   */
  private getDefaultVendorRecommendations(request: RecommendationRequest): VendorRecommendation[] {
    const vendors: VendorRecommendation[] = [
      {
        vendorType: 'General Contractor',
        reason: 'Needed for overall project management and coordination',
        priority: 'high',
        timing: 'within_week'
      },
      {
        vendorType: 'Insurance Adjuster',
        reason: 'Professional representation during claim process',
        priority: 'high',
        timing: 'immediate'
      }
    ];
    
    // Add damage-specific vendor recommendations
    if (request.claimType) {
      const claimType = request.claimType.toLowerCase();
      
      if (claimType.includes('water')) {
        vendors.push({
          vendorType: 'Water Mitigation Company',
          reason: 'Immediate water extraction and drying to prevent mold',
          priority: 'urgent',
          specialization: 'IICRC Certified',
          timing: 'immediate'
        });
      }
      
      if (claimType.includes('fire')) {
        vendors.push({
          vendorType: 'Fire Restoration Specialist',
          reason: 'Specialized cleanup of smoke and soot damage',
          priority: 'high',
          timing: 'immediate'
        });
      }
      
      if (claimType.includes('roof') || claimType.includes('wind')) {
        vendors.push({
          vendorType: 'Roofing Contractor',
          reason: 'Assessment and repair of roof damage',
          priority: 'high',
          timing: 'within_week'
        });
      }
    }
    
    return vendors;
  }

  /**
   * Default documentation recommendations
   */
  private getDefaultDocumentationRecommendations(request: RecommendationRequest): DocumentationRecommendation[] {
    const docs: DocumentationRecommendation[] = [
      {
        documentType: 'Damage Photos',
        importance: 'critical',
        reason: 'Visual evidence of all damage before repairs',
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
        tips: [
          'Take photos from multiple angles',
          'Include close-ups and wide shots',
          'Use good lighting'
        ]
      },
      {
        documentType: 'Contractor Estimates',
        importance: 'high',
        reason: 'Professional assessment of repair costs',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
        tips: [
          'Get at least 2-3 estimates',
          'Ensure estimates are itemized',
          'Verify contractor licensing'
        ]
      },
      {
        documentType: 'Personal Property Inventory',
        importance: 'high',
        reason: 'Detailed list of all damaged personal items',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
        tips: [
          'Include purchase date when known',
          'Estimate replacement cost',
          'Group items by room or category'
        ]
      }
    ];
    
    // Add claim-specific documentation
    if (request.claimType) {
      const claimType = request.claimType.toLowerCase();
      
      if (claimType.includes('water')) {
        docs.push({
          documentType: 'Moisture Readings',
          importance: 'high',
          reason: 'Scientific measurement of water damage extent',
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
          tips: [
            'Request from water mitigation company',
            'Ensure readings from multiple affected areas',
            'Compare to industry standards'
          ]
        });
      }
      
      if (claimType.includes('fire')) {
        docs.push({
          documentType: 'Fire Department Report',
          importance: 'critical',
          reason: 'Official documentation of the incident',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
          tips: [
            'Contact local fire department for copy',
            'May require formal request',
            'Check for cause determination'
          ]
        });
      }
    }
    
    return docs;
  }

  /**
   * Default settlement advice
   */
  private getDefaultSettlementAdvice(request: RecommendationRequest): string {
    let advice = 'Based on the information provided, we recommend thorough documentation of all damages and obtaining multiple repair estimates. ';
    
    if (request.claimAmount) {
      if (request.claimAmount > 50000) {
        advice += 'Due to the significant claim amount, consider engaging a professional public adjuster to maximize your settlement. ';
      } else {
        advice += 'While the claim amount is moderate, ensure all damages are properly documented and valuated. ';
      }
    } else {
      advice += 'Without a claim amount estimate, focus on comprehensive documentation and professional damage assessment. ';
    }
    
    if (request.claimType) {
      const claimType = request.claimType.toLowerCase();
      
      if (claimType.includes('water')) {
        advice += 'For water damage claims, document the source of water and all affected areas. Ensure proper drying to prevent mold. ';
      }
      
      if (claimType.includes('fire')) {
        advice += 'For fire damage claims, document all smoke, soot, and water damage from firefighting efforts. Consider specialized fire restoration services. ';
      }
      
      if (claimType.includes('wind') || claimType.includes('storm')) {
        advice += 'For wind/storm damage, document the pattern of damage and weather conditions at the time of loss. ';
      }
    }
    
    advice += 'Review your policy carefully for exclusions, special limits, and deductibles that may affect your settlement.';
    
    return advice;
  }
}

export const recommendationService = RecommendationService.getInstance();
export default recommendationService;
