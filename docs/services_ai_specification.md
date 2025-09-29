# ClaimGuru Services & AI Integration Specification

## Executive Summary

ClaimGuru implements a sophisticated, multi-tier AI-powered document processing and service architecture that combines multiple external APIs, advanced machine learning capabilities, and intelligent fallback mechanisms to provide comprehensive insurance claim processing automation. The system demonstrates enterprise-grade design patterns with robust error handling, adaptive learning, and cost optimization strategies.

## Architecture Overview

### Service Layer Structure

The ClaimGuru application uses a modular service architecture with clear separation of concerns:

1. **Frontend Services** (`src/services/`) - Client-side business logic and API coordination
2. **Backend Functions** (`supabase/functions/`) - Serverless edge functions for secure API integration
3. **AI Processing Pipeline** - Multi-tier document extraction and analysis
4. **External API Integrations** - OpenAI, Google Vision, AWS Textract, Google Places

### Design Principles

- **Hybrid Processing**: Multiple extraction methods with quality-based selection
- **Adaptive Learning**: Carrier-specific pattern recognition and improvement
- **Graceful Degradation**: Robust fallback mechanisms at every tier
- **Cost Optimization**: Smart API usage based on document characteristics
- **Security-First**: All external API keys managed through Supabase secrets

## Core Service Classes

### AI Document Processing Services

#### 1. HybridPDFExtractionService

**Purpose**: Multi-tier document extraction with optimal quality vs. cost balance

**Key Features**:
- PDF.js for fast text-based extraction (free)
- Tesseract.js OCR for comprehensive scanning (free)
- Google Vision API for high-accuracy OCR (premium)
- OpenAI enhancement for structured data extraction
- Quality-based method selection with early exit optimization

**Code Example**:
```typescript
export class HybridPDFExtractionService {
  async extractFromPDF(file: File): Promise<HybridPDFExtractionResult> {
    // Step 1: Try PDF.js (free, fast)
    const pdfJsResult = await this.extractWithPDFjs(file);
    const qualityScore = this.evaluateTextQuality(pdfJsResult.text);
    
    // Smart strategy: only use expensive methods when needed
    if (qualityScore >= 90 && pdfJsResult.text.length > 8000) {
      console.log('Excellent quality, skipping additional methods');
      return this.finalizeResult(pdfJsResult, 'pdf-js');
    }
    
    // Step 2: Try Tesseract OCR if quality is insufficient
    if (qualityScore < 75) {
      const tesseractResult = await this.extractWithTesseract(file);
      if (this.isBetterQuality(tesseractResult, pdfJsResult)) {
        bestResult = tesseractResult;
      }
    }
    
    // Step 3: Use Google Vision only for low-quality, small files
    if (qualityScore < 60 && file.size < 4 * 1024 * 1024) {
      const visionResult = await this.extractWithGoogleVision(file);
      if (this.isBetterQuality(visionResult, bestResult)) {
        bestResult = visionResult;
      }
    }
    
    return this.enhanceWithAI(bestResult);
  }
}
```

#### 2. IntelligentExtractionService

**Purpose**: Carrier-specific learning and pattern recognition

**Key Features**:
- Adaptive learning from successful extractions
- Carrier identification and specialized processing
- Pattern-based confidence boosting
- User feedback integration

**Integration Pattern**:
```typescript
export class IntelligentExtractionService {
  async extractWithIntelligence(file: File): Promise<IntelligentExtractionResult> {
    // Get base extraction
    const basicExtraction = await this.hybridExtractor.extractFromPDF(file);
    
    // Identify carrier using learned patterns
    const carrierId = await this.carrierLearning.identifyCarrier(basicExtraction.extractedText);
    
    // Apply carrier-specific enhancements
    const intelligentData = carrierId
      ? await this.carrierLearning.enhanceExtraction(carrierId, basicExtraction)
      : basicExtraction.policyData;
    
    // Learn from this extraction
    if (carrierId) {
      await this.carrierLearning.learnFromExtraction(carrierId, intelligentData);
    }
    
    return {
      extractedData: intelligentData,
      carrierIdentified: { carrierId, confidence: 0.9 },
      extractionIntelligence: {
        finalConfidence: basicExtraction.confidence + (carrierId ? 0.2 : 0)
      }
    };
  }
}
```

#### 3. MultiDocumentExtractionService

**Purpose**: Orchestrates processing of multiple documents with workflow analysis

**Key Features**:
- Parallel document processing
- Document type classification and relationship analysis
- Data consolidation across documents
- Workflow recommendations

### AI-Powered Analysis Services

#### 1. DocumentAnalysisService

**Purpose**: OpenAI-powered document analysis and field extraction

**Integration**:
- Uses Supabase edge functions for secure API access
- Structured prompting for consistent JSON responses
- Fallback to mock responses when API unavailable

#### 2. ClaimProcessingService

**Purpose**: AI-powered claim analysis and settlement estimation

**Capabilities**:
- Coverage assessment analysis
- Settlement amount prediction
- Risk factor identification
- Processing timeline estimation

#### 3. RecommendationService

**Purpose**: Contextual AI recommendations for claim handling

**Features**:
- Task recommendations with priorities and deadlines
- Vendor recommendations based on claim type
- Documentation requirements analysis
- Settlement strategy advice

## Supabase Edge Functions (Backend API Integration)

### OpenAI Integration Functions

#### 1. openai-extract-fields
**Purpose**: Basic policy data extraction
**Model**: GPT-3.5-turbo
**Cost**: ~$0.002 per request

```typescript
const prompt = `Extract these fields from insurance document:
{
  "policyNumber": "string or null",
  "insuredName": "string or null", 
  "effectiveDate": "string or null",
  ...
}`;

const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${openaiKey}` },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1
  })
});
```

#### 2. openai-extract-fields-enhanced
**Purpose**: Advanced extraction with 34+ specialized fields
**Model**: GPT-4o-mini
**Features**: Coinsured detection, hurricane deductible consolidation

#### 3. openai-service
**Purpose**: Unified OpenAI service with multiple operation modes
**Modes**: document_analysis, claim_analysis, recommendations

### Google Vision Integration

#### google-vision-extract
**Purpose**: OCR text extraction from images and PDFs
**API**: Google Cloud Vision Document Text Detection
**Cost**: ~$0.06 per page

```typescript
const payload = {
  requests: [{
    image: { content: base64ImageData },
    features: [{
      type: 'DOCUMENT_TEXT_DETECTION',
      maxResults: 1
    }]
  }]
};

const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
  method: 'POST',
  body: JSON.stringify(payload)
});
```

### AWS Textract Integration

#### textract-pdf-processor
**Purpose**: Advanced document analysis with form field extraction
**Features**: 
- Form field detection and key-value extraction
- Table extraction
- Query-based information retrieval
**Cost**: ~$0.05 per page

## Service Integration Patterns

### 1. Configuration Management

The ConfigService handles API key validation and service availability:

```typescript
class ConfigService {
  private validateGoogleMapsConfig(): boolean {
    const apiKey = this.config.googleMapsApiKey;
    return apiKey.startsWith('AIza') && apiKey.length > 20;
  }
  
  private validateOpenAIConfig(): boolean {
    // Uses Supabase URL validation since API key is in edge functions
    return !!(supabaseUrl && supabaseAnonKey);
  }
}
```

### 2. Error Handling Strategy

**Multi-Level Fallbacks**:
1. Primary API (OpenAI/Google Vision/Textract)
2. Alternative method (different OCR engine)
3. Regex-based extraction
4. Mock/demo data with user notification

**Example Implementation**:
```typescript
async extractFromDocument(file: File): Promise<ExtractionResult> {
  try {
    // Try Google Vision OCR
    return await this.callGoogleVisionExtraction(file);
  } catch (ocrError) {
    console.log('OCR failed, trying fallback text extraction');
    try {
      return await this.extractTextFromPDF(file);
    } catch (fallbackError) {
      return this.generateFallbackResponse(file);
    }
  }
}
```

### 3. Cost Optimization Strategies

**Smart API Usage**:
- Quality assessment before expensive API calls
- File size limits for premium services
- Timeout mechanisms to prevent runaway costs
- Caching of extraction results

**Quality-Based Decision Making**:
```typescript
// Only use Google Vision for low-quality, small files
if (qualityScore < 60 && file.size < 4 * 1024 * 1024) {
  const visionResult = await this.extractWithGoogleVision(file);
  cost += 0.015; // Track API costs
}
```

## Data Flow Architecture

### Document Processing Pipeline

1. **Upload** → File validation and preprocessing
2. **Classification** → Document type identification
3. **Extraction** → Multi-tier text and data extraction
4. **Enhancement** → AI-powered field extraction and validation
5. **Learning** → Pattern recognition and carrier-specific optimization
6. **Validation** → Quality scoring and confidence assessment
7. **Output** → Structured data with metadata

### API Integration Flow

```
Frontend Service → Supabase Edge Function → External API → Response Processing → Client
     ↓                    ↓                      ↓              ↓              ↓
Configuration →     Secret Management →    API Call →    Error Handling → User Feedback
```

## Advanced Features

### 1. Adaptive Learning System

**CarrierLearningService**: 
- Learns extraction patterns specific to each insurance carrier
- Stores successful field extraction patterns
- Applies carrier-specific enhancements automatically
- Tracks learning statistics and improvement metrics

### 2. Document Relationship Analysis

**MultiDocumentExtractionService**:
- Identifies relationships between uploaded documents
- Consolidates data from multiple sources
- Provides workflow analysis and next steps
- Generates comprehensive claim context

### 3. Quality Assessment Engine

**Text Quality Evaluation**:
- Content length scoring (25 points)
- Insurance keyword detection (35 points)
- Critical identifier presence (25 points)
- Structure and formatting (15 points)

### 4. Intelligent Wizard System

**EnhancedClaimWizardAI**:
- Step-by-step claim processing guidance
- Real-time validation and suggestions
- Coverage issue analysis
- Automated task generation

## Security and Privacy

### API Key Management
- All external API keys stored in Supabase secrets
- No sensitive credentials in frontend code
- Secure edge function authentication

### Data Processing
- Client-side file processing when possible
- Minimal data transmission to external services
- Comprehensive error logging without exposing sensitive data

### CORS and Security Headers
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400'
};
```

## Performance Optimization

### 1. Processing Time Optimization
- Parallel processing for multiple documents
- Early exit strategies for high-quality extractions
- Timeout mechanisms for unreliable services
- Quality-based method selection

### 2. Cost Management
- Smart API usage based on document characteristics
- Free methods prioritized when quality is sufficient
- Premium services only for complex cases
- Processing cost tracking and reporting

### 3. User Experience
- Progress indicators for long-running processes
- Graceful degradation with user notifications
- Offline capability with local processing
- Comprehensive error messages with suggestions

## Integration Examples

### Google Places Service Integration

```typescript
export class GooglePlacesService {
  async validateAddress(address: string): Promise<AddressValidation> {
    if (!configService.isGoogleMapsEnabled()) {
      return this.getMockValidation(address);
    }
    
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`);
    
    if (!response.ok) {
      throw new Error('Address validation failed');
    }
    
    const data = await response.json();
    return this.processGeocodingResult(data);
  }
}
```

### Email Automation Service

```typescript
export class EmailAutomationService {
  async sendClaimStatusUpdate(claimData: any, templateType: string): Promise<boolean> {
    // Uses Supabase edge function for secure email sending
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        templateType,
        claimData,
        recipientEmail: claimData.insuredEmail
      }
    });
    
    if (error) {
      console.error('Email sending failed:', error);
      return false;
    }
    
    return data.success;
  }
}
```

## Conclusion

ClaimGuru's services and AI integration architecture represents a sophisticated approach to insurance document processing, combining multiple AI technologies, intelligent fallback mechanisms, and adaptive learning to provide reliable, cost-effective, and user-friendly claim processing automation. The system's modular design, robust error handling, and comprehensive feature set position it as an enterprise-ready solution for insurance claim management.

The architecture successfully addresses key challenges in insurance document processing:
- **Accuracy**: Multi-tier extraction with quality assessment
- **Reliability**: Comprehensive fallback mechanisms
- **Cost-Effectiveness**: Smart API usage and optimization
- **Scalability**: Modular service design and serverless functions
- **Learning**: Adaptive improvement and carrier-specific optimization
- **User Experience**: Progressive enhancement with graceful degradation

This technical foundation enables ClaimGuru to provide sophisticated AI-powered claim processing while maintaining reliability and cost control in production environments.