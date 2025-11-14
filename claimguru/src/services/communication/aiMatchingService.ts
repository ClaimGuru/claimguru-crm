/**
 * AI Matching Service
 * Uses Google Gemini AI to intelligently match communications to claims
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as Sentry from '@sentry/react';
import { supabase } from '../../lib/supabase';
import type { AIMatchResult, Communication, SentimentType } from './types';
import type { Claim } from '../../lib/supabase';

// Initialize Gemini AI
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export class AIMatchingService {
  private model = genAI?.getGenerativeModel({ model: 'gemini-1.5-flash' });

  /**
   * Match a communication to an existing claim using AI
   */
  async matchCommunicationToClaim(
    communication: Communication,
    organizationId: string
  ): Promise<AIMatchResult> {
    if (!this.model) {
      console.warn('Gemini AI not configured');
      return this.createManualReviewResult('AI not configured');
    }

    try {
      // Get content to analyze
      const content = this.extractContent(communication);

      // Get all claims for this organization
      const claims = await this.getOrganizationClaims(organizationId);

      if (claims.length === 0) {
        return this.createManualReviewResult('No claims found');
      }

      // Use AI to extract identifiers and analyze content
      const analysisPrompt = this.buildAnalysisPrompt(content, communication);
      const analysisResult = await this.model.generateContent(analysisPrompt);
      const analysis = analysisResult.response.text();

      // Parse AI response
      const extractedData = this.parseAIAnalysis(analysis);

      // Match against claims
      const matchResult = this.findBestMatch(extractedData, claims);

      // Analyze sentiment
      const sentiment = this.detectSentiment(content);

      // Generate summary
      const summary = await this.generateSummary(content);

      return {
        matched: matchResult.confidence >= 70,
        claimId: matchResult.claimId,
        confidence: matchResult.confidence,
        extractedData,
        sentiment,
        summary,
        requiresManualReview: matchResult.confidence < 85,
      };
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'ai-matching', operation: 'match-communication' },
        extra: { communicationId: communication.id },
      });
      console.error('Error matching communication:', error);
      return this.createManualReviewResult('AI matching error');
    }
  }

  /**
   * Extract relevant content from communication
   */
  private extractContent(communication: Communication): string {
    let content = '';

    if (communication.type === 'email') {
      content = `Subject: ${communication.subject || ''}\n\nBody: ${communication.body || ''}`;
    } else if (communication.type === 'sms') {
      content = communication.message_content || '';
    } else if (communication.type === 'call') {
      // For calls, we'd use transcription if available
      content = communication.body || communication.metadata?.notes || 'Voice call';
    }

    // Add contact information
    if (communication.from_email) {
      content = `From: ${communication.from_email}\n\n${content}`;
    } else if (communication.from_number) {
      content = `From: ${communication.from_number}\n\n${content}`;
    }

    return content;
  }

  /**
   * Build AI prompt for analysis
   */
  private buildAnalysisPrompt(content: string, communication: Communication): string {
    return `
Analyze the following communication and extract relevant claim-related information:

Communication Type: ${communication.type}
Content:
${content}

Please extract and identify the following in JSON format:
{
  "claimNumber": "extracted claim number if found",
  "policyNumber": "extracted policy number if found",
  "claimantName": "extracted claimant name if found",
  "carrierName": "insurance carrier name if found",
  "phoneNumber": "phone number mentioned if found",
  "email": "email address mentioned if found",
  "dateOfLoss": "date of loss if mentioned",
  "keywords": ["list", "of", "relevant", "keywords"],
  "urgencyLevel": "low | medium | high | critical"
}

Be precise and only extract information explicitly mentioned. Return valid JSON only.
`;
  }

  /**
   * Parse AI analysis response
   */
  private parseAIAnalysis(analysis: string): Record<string, any> {
    try {
      // Extract JSON from markdown code blocks if present
      let jsonText = analysis;
      const jsonMatch = analysis.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      return JSON.parse(jsonText);
    } catch (error) {
      console.warn('Failed to parse AI analysis:', error);
      return {};
    }
  }

  /**
   * Find best matching claim
   */
  private findBestMatch(
    extractedData: Record<string, any>,
    claims: Claim[]
  ): { claimId?: string; confidence: number } {
    let bestMatch: { claimId?: string; confidence: number } = { confidence: 0 };

    for (const claim of claims) {
      let confidence = 0;

      // Match on claim number (highest weight)
      if (extractedData.claimNumber) {
        if (
          claim.file_number?.toLowerCase() === extractedData.claimNumber.toLowerCase() ||
          claim.claim_number?.toLowerCase() === extractedData.claimNumber.toLowerCase() ||
          claim.carrier_claim_number?.toLowerCase() === extractedData.claimNumber.toLowerCase()
        ) {
          confidence += 50;
        }
      }

      // Match on policy number (high weight)
      if (extractedData.policyNumber && claim.policy_number) {
        if (claim.policy_number.toLowerCase().includes(extractedData.policyNumber.toLowerCase())) {
          confidence += 30;
        }
      }

      // Match on phone number (medium weight)
      if (extractedData.phoneNumber) {
        const phoneMatch = this.matchPhoneNumber(extractedData.phoneNumber, claim);
        if (phoneMatch) {
          confidence += 20;
        }
      }

      // Match on email (medium weight)
      if (extractedData.email) {
        const emailMatch = this.matchEmail(extractedData.email, claim);
        if (emailMatch) {
          confidence += 20;
        }
      }

      // Match on claimant name (low weight due to variations)
      if (extractedData.claimantName && claim.client_id) {
        // We'd need to fetch client data to compare names
        // For now, add a small confidence boost
        confidence += 10;
      }

      // Update best match
      if (confidence > bestMatch.confidence) {
        bestMatch = { claimId: claim.id, confidence };
      }
    }

    return bestMatch;
  }

  /**
   * Match phone number against claim
   */
  private matchPhoneNumber(phone: string, claim: Claim): boolean {
    // Normalize phone number
    const normalized = phone.replace(/\D/g, '');

    // We'd need to fetch client data to compare phone numbers
    // This is a simplified version
    return false; // Placeholder
  }

  /**
   * Match email against claim
   */
  private matchEmail(email: string, claim: Claim): boolean {
    // We'd need to fetch client data to compare emails
    // This is a simplified version
    return false; // Placeholder
  }

  /**
   * Detect sentiment from content
   */
  private detectSentiment(content: string): SentimentType {
    const lowerContent = content.toLowerCase();

    // Urgent keywords
    const urgentKeywords = [
      'urgent',
      'emergency',
      'asap',
      'immediately',
      'critical',
      'help',
      'problem',
      'issue',
    ];
    if (urgentKeywords.some((keyword) => lowerContent.includes(keyword))) {
      return 'urgent';
    }

    // Negative keywords
    const negativeKeywords = [
      'angry',
      'frustrated',
      'disappointed',
      'unhappy',
      'complaint',
      'unacceptable',
    ];
    if (negativeKeywords.some((keyword) => lowerContent.includes(keyword))) {
      return 'negative';
    }

    // Positive keywords
    const positiveKeywords = [
      'thank',
      'appreciate',
      'great',
      'excellent',
      'satisfied',
      'happy',
    ];
    if (positiveKeywords.some((keyword) => lowerContent.includes(keyword))) {
      return 'positive';
    }

    return 'neutral';
  }

  /**
   * Generate AI summary of communication
   */
  private async generateSummary(content: string): Promise<string> {
    if (!this.model) {
      return 'AI summarization not available';
    }

    try {
      const prompt = `Summarize the following communication in 1-2 sentences:\n\n${content}`;
      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Error generating summary:', error);
      return 'Unable to generate summary';
    }
  }

  /**
   * Get all claims for organization
   */
  private async getOrganizationClaims(organizationId: string): Promise<Claim[]> {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(100); // Limit to recent claims for performance

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching claims:', error);
      return [];
    }
  }

  /**
   * Create a manual review result
   */
  private createManualReviewResult(reason: string): AIMatchResult {
    return {
      matched: false,
      confidence: 0,
      extractedData: { reason },
      sentiment: 'neutral',
      summary: 'Requires manual review',
      requiresManualReview: true,
    };
  }

  /**
   * Suggest new claim creation from communication
   */
  async suggestNewClaim(
    communication: Communication
  ): Promise<{ suggested: boolean; data: Record<string, any> }> {
    if (!this.model) {
      return { suggested: false, data: {} };
    }

    try {
      const content = this.extractContent(communication);

      const prompt = `
Analyze this communication and determine if it appears to be a NEW claim report (not related to an existing claim):

${content}

Respond in JSON format:
{
  "isNewClaim": true/false,
  "confidence": 0-100,
  "suggestedData": {
    "claimantName": "if mentioned",
    "dateOfLoss": "if mentioned",
    "lossDescription": "brief description",
    "propertyAddress": "if mentioned",
    "phoneNumber": "if mentioned",
    "email": "if mentioned"
  }
}
`;

      const result = await this.model.generateContent(prompt);
      const analysis = this.parseAIAnalysis(result.response.text());

      return {
        suggested: analysis.isNewClaim && analysis.confidence > 70,
        data: analysis.suggestedData || {},
      };
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'ai-matching', operation: 'suggest-new-claim' },
      });
      console.error('Error suggesting new claim:', error);
      return { suggested: false, data: {} };
    }
  }
}

// Export singleton instance
export const aiMatchingService = new AIMatchingService();
