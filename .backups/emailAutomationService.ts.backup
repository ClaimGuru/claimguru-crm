/**
 * Email Automation Service
 * 
 * Handles email ingestion, classification, and automated claim number extraction
 * for ClaimGuru CRM system.
 */

export interface EmailMessage {
  id: string
  messageId: string
  threadId?: string
  subject: string
  from: {
    email: string
    name?: string
  }
  to: {
    email: string
    name?: string
  }[]
  cc?: {
    email: string
    name?: string
  }[]
  bcc?: {
    email: string
    name?: string
  }[]
  body: {
    text?: string
    html?: string
  }
  attachments?: EmailAttachment[]
  date: string
  labels?: string[]
  read: boolean
  importance?: 'high' | 'normal' | 'low'
}

export interface EmailAttachment {
  id: string
  filename: string
  mimeType: string
  size: number
  contentId?: string
  data?: string // base64 encoded
}

export interface ClassifiedEmail {
  email: EmailMessage
  classification: EmailClassification
  extractedData: EmailExtractionData
  confidence: number
  shouldProcess: boolean
  reasonForExclusion?: string
}

export interface EmailClassification {
  category: 'claim_related' | 'adjuster_communication' | 'insurer_update' | 'vendor_communication' | 'client_communication' | 'spam' | 'other'
  subcategory?: string
  priority: 'high' | 'medium' | 'low'
  isAutomated: boolean
  requiresResponse: boolean
  sentiment: 'positive' | 'neutral' | 'negative'
}

export interface EmailExtractionData {
  claimNumbers: string[]
  policyNumbers: string[]
  adjusterInfo?: {
    name: string
    company: string
    phone?: string
    email: string
  }
  dateReferences: {
    lossDate?: string
    inspectionDate?: string
    deadlineDate?: string
  }
  amounts: {
    estimate?: number
    settlement?: number
    deductible?: number
  }
  propertyAddress?: string
  urgencyKeywords: string[]
  actionItems: string[]
}

export interface EmailIntegrationConfig {
  provider: 'gmail' | 'outlook' | 'imap'
  credentials: {
    email: string
    accessToken?: string
    refreshToken?: string
    clientId?: string
    clientSecret?: string
    // For IMAP
    host?: string
    port?: number
    username?: string
    password?: string
    secure?: boolean
  }
  filters: {
    excludedDomains: string[]
    includedDomains?: string[]
    keywords: string[]
    senderWhitelist: string[]
    senderBlacklist: string[]
  }
  automation: {
    autoClassify: boolean
    autoExtract: boolean
    autoCreateTasks: boolean
    autoNotifyTeam: boolean
  }
}

class EmailAutomationService {
  private config: EmailIntegrationConfig | null = null
  private supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  private supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  constructor() {
    this.initializeService()
  }

  private async initializeService() {
    // Load configuration from Supabase
    await this.loadConfiguration()
  }

  /**
   * Load email integration configuration from Supabase
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/email_configurations?select=*`, {
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const configs = await response.json()
        if (configs.length > 0) {
          this.config = configs[0] // Use first configuration for now
        }
      }
    } catch (error) {
      console.error('Failed to load email configuration:', error)
    }
  }

  /**
   * Set up email integration configuration
   */
  public async setupEmailIntegration(config: EmailIntegrationConfig): Promise<boolean> {
    try {
      // Save configuration to Supabase
      const response = await fetch(`${this.supabaseUrl}/rest/v1/email_configurations`, {
        method: 'POST',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: config.provider,
          credentials: config.credentials,
          filters: config.filters,
          automation: config.automation,
          created_at: new Date().toISOString()
        })
      })

      if (response.ok) {
        this.config = config
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to setup email integration:', error)
      return false
    }
  }

  /**
   * Classify email content using AI
   */
  public async classifyEmail(email: EmailMessage): Promise<EmailClassification> {
    const combinedContent = `
      Subject: ${email.subject}
      From: ${email.from.email}
      Body: ${email.body.text || email.body.html || ''}
    `.toLowerCase()

    // Check for automated emails
    const isAutomated = this.detectAutomatedEmail(email)
    
    // Determine category
    const category = this.determineEmailCategory(combinedContent, email.from.email)
    
    // Assess priority
    const priority = this.assessEmailPriority(combinedContent, email.subject)
    
    // Check if response is required
    const requiresResponse = this.requiresResponse(combinedContent)
    
    // Analyze sentiment
    const sentiment = this.analyzeSentiment(combinedContent)

    return {
      category,
      priority,
      isAutomated,
      requiresResponse,
      sentiment
    }
  }

  /**
   * Extract relevant data from email content
   */
  public async extractEmailData(email: EmailMessage): Promise<EmailExtractionData> {
    const content = email.body.text || email.body.html || ''
    const subject = email.subject
    const fullContent = `${subject} ${content}`

    return {
      claimNumbers: this.extractClaimNumbers(fullContent),
      policyNumbers: this.extractPolicyNumbers(fullContent),
      adjusterInfo: this.extractAdjusterInfo(email),
      dateReferences: this.extractDateReferences(content),
      amounts: this.extractAmounts(content),
      propertyAddress: this.extractPropertyAddress(content),
      urgencyKeywords: this.extractUrgencyKeywords(content),
      actionItems: this.extractActionItems(content)
    }
  }

  /**
   * Process incoming email and store in database
   */
  public async processIncomingEmail(email: EmailMessage): Promise<ClassifiedEmail> {
    // Check if email should be excluded
    if (this.shouldExcludeEmail(email)) {
      return {
        email,
        classification: {
          category: 'other',
          priority: 'low',
          isAutomated: true,
          requiresResponse: false,
          sentiment: 'neutral'
        },
        extractedData: {
          claimNumbers: [],
          policyNumbers: [],
          dateReferences: {},
          amounts: {},
          urgencyKeywords: [],
          actionItems: []
        },
        confidence: 0,
        shouldProcess: false,
        reasonForExclusion: 'Domain excluded or spam'
      }
    }

    // Classify and extract data
    const classification = await this.classifyEmail(email)
    const extractedData = await this.extractEmailData(email)
    const confidence = this.calculateConfidence(classification, extractedData)

    const classifiedEmail: ClassifiedEmail = {
      email,
      classification,
      extractedData,
      confidence,
      shouldProcess: confidence > 0.6 && classification.category !== 'spam'
    }

    // Store in database
    await this.storeEmailLog(classifiedEmail)

    // Auto-create tasks if enabled and appropriate
    if (this.config?.automation.autoCreateTasks && classifiedEmail.shouldProcess) {
      await this.createAutomatedTasks(classifiedEmail)
    }

    return classifiedEmail
  }

  /**
   * Store email log in Supabase
   */
  private async storeEmailLog(classifiedEmail: ClassifiedEmail): Promise<void> {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/email_logs`, {
        method: 'POST',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message_id: classifiedEmail.email.messageId,
          subject: classifiedEmail.email.subject,
          from_email: classifiedEmail.email.from.email,
          from_name: classifiedEmail.email.from.name,
          to_emails: classifiedEmail.email.to.map(t => t.email),
          received_at: classifiedEmail.email.date,
          classification: classifiedEmail.classification,
          extracted_data: classifiedEmail.extractedData,
          confidence_score: classifiedEmail.confidence,
          should_process: classifiedEmail.shouldProcess,
          raw_content: classifiedEmail.email.body.text || classifiedEmail.email.body.html,
          attachments_count: classifiedEmail.email.attachments?.length || 0,
          created_at: new Date().toISOString()
        })
      })

      if (!response.ok) {
        console.error('Failed to store email log:', await response.text())
      }
    } catch (error) {
      console.error('Error storing email log:', error)
    }
  }

  /**
   * Create automated tasks based on email content
   */
  private async createAutomatedTasks(classifiedEmail: ClassifiedEmail): Promise<void> {
    const tasks = []

    // Create task for each claim number found
    classifiedEmail.extractedData.claimNumbers.forEach(claimNumber => {
      tasks.push({
        title: `Follow up on email regarding claim ${claimNumber}`,
        description: `Email from ${classifiedEmail.email.from.email}: ${classifiedEmail.email.subject}`,
        priority: classifiedEmail.classification.priority,
        claim_number: claimNumber,
        due_date: this.calculateTaskDueDate(classifiedEmail),
        task_type: 'email_followup',
        automated: true
      })
    })

    // Create task for urgent emails without claim numbers
    if (classifiedEmail.classification.priority === 'high' && classifiedEmail.extractedData.claimNumbers.length === 0) {
      tasks.push({
        title: `Urgent email requires attention`,
        description: `High priority email from ${classifiedEmail.email.from.email}: ${classifiedEmail.email.subject}`,
        priority: 'high',
        due_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        task_type: 'email_review',
        automated: true
      })
    }

    // Store tasks in database
    for (const task of tasks) {
      try {
        await fetch(`${this.supabaseUrl}/rest/v1/tasks`, {
          method: 'POST',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...task,
            created_at: new Date().toISOString()
          })
        })
      } catch (error) {
        console.error('Failed to create automated task:', error)
      }
    }
  }

  /**
   * Check if email should be excluded from processing
   */
  private shouldExcludeEmail(email: EmailMessage): boolean {
    if (!this.config) return false

    const fromDomain = email.from.email.split('@')[1]?.toLowerCase()
    
    // Check excluded domains
    if (this.config.filters.excludedDomains.some(domain => fromDomain === domain.toLowerCase())) {
      return true
    }

    // Check sender blacklist
    if (this.config.filters.senderBlacklist.some(sender => 
      email.from.email.toLowerCase().includes(sender.toLowerCase())
    )) {
      return true
    }

    // Check for spam indicators
    if (this.isSpamEmail(email)) {
      return true
    }

    return false
  }

  /**
   * Detect if email is automated
   */
  private detectAutomatedEmail(email: EmailMessage): boolean {
    const automatedIndicators = [
      'noreply', 'no-reply', 'donotreply', 'do-not-reply',
      'automated', 'auto-', 'system@', 'robot@', 'bot@'
    ]

    const fromEmail = email.from.email.toLowerCase()
    const subject = email.subject.toLowerCase()

    return automatedIndicators.some(indicator => 
      fromEmail.includes(indicator) || subject.includes(indicator)
    )
  }

  /**
   * Determine email category based on content and sender
   */
  private determineEmailCategory(content: string, fromEmail: string): EmailClassification['category'] {
    const claimKeywords = ['claim', 'loss', 'damage', 'insurance', 'adjuster', 'estimate']
    const insurerKeywords = ['carrier', 'underwriter', 'policy', 'coverage', 'premium']
    const vendorKeywords = ['contractor', 'vendor', 'supplier', 'invoice', 'estimate', 'quote']

    if (claimKeywords.some(keyword => content.includes(keyword))) {
      return 'claim_related'
    }

    if (insurerKeywords.some(keyword => content.includes(keyword))) {
      return 'insurer_update'
    }

    if (vendorKeywords.some(keyword => content.includes(keyword))) {
      return 'vendor_communication'
    }

    const domain = fromEmail.split('@')[1]?.toLowerCase()
    const insurerDomains = ['allstate.com', 'statefarm.com', 'geico.com', 'progressive.com']
    
    if (insurerDomains.some(insurerDomain => domain?.includes(insurerDomain))) {
      return 'insurer_update'
    }

    return 'other'
  }

  /**
   * Assess email priority
   */
  private assessEmailPriority(content: string, subject: string): EmailClassification['priority'] {
    const highPriorityKeywords = ['urgent', 'asap', 'immediate', 'emergency', 'critical', 'deadline']
    const mediumPriorityKeywords = ['follow up', 'reminder', 'update', 'status']

    const fullText = `${subject} ${content}`.toLowerCase()

    if (highPriorityKeywords.some(keyword => fullText.includes(keyword))) {
      return 'high'
    }

    if (mediumPriorityKeywords.some(keyword => fullText.includes(keyword))) {
      return 'medium'
    }

    return 'low'
  }

  /**
   * Check if email requires response
   */
  private requiresResponse(content: string): boolean {
    const responseKeywords = [
      'please respond', 'need response', 'please confirm', 'please reply',
      'get back to', 'let me know', 'waiting for', 'need to hear'
    ]

    return responseKeywords.some(keyword => content.includes(keyword))
  }

  /**
   * Analyze email sentiment
   */
  private analyzeSentiment(content: string): EmailClassification['sentiment'] {
    const positiveKeywords = ['thank', 'appreciate', 'excellent', 'great', 'pleased', 'satisfied']
    const negativeKeywords = ['disappointed', 'frustrated', 'upset', 'angry', 'concerned', 'worried', 'unacceptable']

    const positiveScore = positiveKeywords.filter(keyword => content.includes(keyword)).length
    const negativeScore = negativeKeywords.filter(keyword => content.includes(keyword)).length

    if (positiveScore > negativeScore) return 'positive'
    if (negativeScore > positiveScore) return 'negative'
    return 'neutral'
  }

  /**
   * Extract claim numbers from content
   */
  private extractClaimNumbers(content: string): string[] {
    const patterns = [
      /claim\s*#?\s*([A-Z0-9-]{6,20})/gi,
      /file\s*#?\s*([A-Z0-9-]{6,20})/gi,
      /\b([A-Z]{2,4}\d{6,12})\b/g,
      /\b(\d{6,12}[A-Z]{1,3})\b/g
    ]

    const claimNumbers = new Set<string>()

    patterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.replace(/claim\s*#?\s*|file\s*#?\s*/i, '').trim()
          if (cleaned.length >= 6) {
            claimNumbers.add(cleaned)
          }
        })
      }
    })

    return Array.from(claimNumbers)
  }

  /**
   * Extract policy numbers from content
   */
  private extractPolicyNumbers(content: string): string[] {
    const patterns = [
      /policy\s*#?\s*([A-Z0-9-]{6,20})/gi,
      /pol\s*#?\s*([A-Z0-9-]{6,20})/gi
    ]

    const policyNumbers = new Set<string>()

    patterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.replace(/policy\s*#?\s*|pol\s*#?\s*/i, '').trim()
          if (cleaned.length >= 6) {
            policyNumbers.add(cleaned)
          }
        })
      }
    })

    return Array.from(policyNumbers)
  }

  /**
   * Extract adjuster information
   */
  private extractAdjusterInfo(email: EmailMessage): EmailExtractionData['adjusterInfo'] {
    const signature = this.extractEmailSignature(email.body.text || email.body.html || '')
    
    if (signature) {
      const phoneMatch = signature.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
      const companyMatch = signature.match(/([A-Za-z\s&]+(?:Insurance|Adjusting|Claims|Company))/i);
      
      return {
        name: email.from.name || email.from.email.split('@')[0],
        company: companyMatch?.[1]?.trim() || email.from.email.split('@')[1],
        phone: phoneMatch?.[1],
        email: email.from.email
      }
    }

    return undefined
  }

  /**
   * Extract email signature
   */
  private extractEmailSignature(content: string): string | null {
    const signaturePatterns = [
      /--\s*\n([\s\S]*?)(?:\n\n|\n$)/,
      /best regards[\s\S]*?(?:\n\n|\n$)/i,
      /sincerely[\s\S]*?(?:\n\n|\n$)/i,
      /thanks[\s\S]*?(?:\n\n|\n$)/i
    ]

    for (const pattern of signaturePatterns) {
      const match = content.match(pattern)
      if (match) {
        return match[1] || match[0]
      }
    }

    return null
  }

  /**
   * Extract date references
   */
  private extractDateReferences(content: string): EmailExtractionData['dateReferences'] {
    const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4})/g
    const dates = content.match(datePattern) || []

    const dateReferences: EmailExtractionData['dateReferences'] = {}

    dates.forEach(date => {
      const normalizedDate = this.normalizeDate(date)
      if (normalizedDate) {
        if (content.toLowerCase().includes('loss') && content.toLowerCase().includes('date')) {
          dateReferences.lossDate = normalizedDate
        } else if (content.toLowerCase().includes('inspection')) {
          dateReferences.inspectionDate = normalizedDate
        } else if (content.toLowerCase().includes('deadline')) {
          dateReferences.deadlineDate = normalizedDate
        }
      }
    })

    return dateReferences
  }

  /**
   * Normalize date format
   */
  private normalizeDate(dateString: string): string | null {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return null
      return date.toISOString().split('T')[0]
    } catch {
      return null
    }
  }

  /**
   * Extract monetary amounts
   */
  private extractAmounts(content: string): EmailExtractionData['amounts'] {
    const amountPattern = /\$[\d,]+\.?\d*/g
    const amounts = content.match(amountPattern) || []

    const parsedAmounts = amounts.map(amount => 
      parseFloat(amount.replace(/[$,]/g, ''))
    ).filter(amount => !isNaN(amount))

    const amountData: EmailExtractionData['amounts'] = {}

    if (content.toLowerCase().includes('estimate') && parsedAmounts.length > 0) {
      amountData.estimate = Math.max(...parsedAmounts)
    }

    if (content.toLowerCase().includes('settlement') && parsedAmounts.length > 0) {
      amountData.settlement = Math.max(...parsedAmounts)
    }

    if (content.toLowerCase().includes('deductible') && parsedAmounts.length > 0) {
      amountData.deductible = Math.min(...parsedAmounts)
    }

    return amountData
  }

  /**
   * Extract property address
   */
  private extractPropertyAddress(content: string): string | undefined {
    const addressPatterns = [
      /(\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Circle|Cir|Court|Ct|Place|Pl))/gi,
      /property\s*(?:address)?:?\s*([^\n]+)/gi,
      /location:?\s*([^\n]+)/gi
    ]

    for (const pattern of addressPatterns) {
      const match = content.match(pattern)
      if (match) {
        return match[1]?.trim()
      }
    }

    return undefined
  }

  /**
   * Extract urgency keywords
   */
  private extractUrgencyKeywords(content: string): string[] {
    const urgencyKeywords = [
      'urgent', 'asap', 'immediate', 'emergency', 'critical', 
      'deadline', 'time-sensitive', 'rush', 'priority'
    ]

    return urgencyKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword)
    )
  }

  /**
   * Extract action items
   */
  private extractActionItems(content: string): string[] {
    const actionPatterns = [
      /please\s+([^.!?]+)/gi,
      /need\s+to\s+([^.!?]+)/gi,
      /must\s+([^.!?]+)/gi,
      /required\s+to\s+([^.!?]+)/gi
    ]

    const actionItems = new Set<string>()

    actionPatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) {
        matches.forEach(match => {
          actionItems.add(match.trim())
        })
      }
    })

    return Array.from(actionItems).slice(0, 5) // Limit to 5 action items
  }

  /**
   * Check if email is spam
   */
  private isSpamEmail(email: EmailMessage): boolean {
    const spamKeywords = [
      'viagra', 'lottery', 'winner', 'congratulations', 'free money',
      'click here now', 'limited time offer', 'act now'
    ]

    const subject = email.subject.toLowerCase()
    const body = (email.body.text || email.body.html || '').toLowerCase()

    return spamKeywords.some(keyword => 
      subject.includes(keyword) || body.includes(keyword)
    )
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    classification: EmailClassification, 
    extractedData: EmailExtractionData
  ): number {
    let confidence = 0.5 // Base confidence

    // Boost confidence for claim-related emails
    if (classification.category === 'claim_related') {
      confidence += 0.3
    }

    // Boost confidence if claim numbers found
    if (extractedData.claimNumbers.length > 0) {
      confidence += 0.2
    }

    // Boost confidence if policy numbers found
    if (extractedData.policyNumbers.length > 0) {
      confidence += 0.1
    }

    // Boost confidence if adjuster info found
    if (extractedData.adjusterInfo) {
      confidence += 0.1
    }

    // Reduce confidence for automated emails
    if (classification.isAutomated) {
      confidence -= 0.2
    }

    return Math.min(Math.max(confidence, 0), 1)
  }

  /**
   * Calculate task due date based on email priority
   */
  private calculateTaskDueDate(classifiedEmail: ClassifiedEmail): string {
    const now = new Date()
    let hoursToAdd = 24 // Default 24 hours

    switch (classifiedEmail.classification.priority) {
      case 'high':
        hoursToAdd = 2
        break
      case 'medium':
        hoursToAdd = 8
        break
      case 'low':
        hoursToAdd = 48
        break
    }

    return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000).toISOString()
  }

  /**
   * Get recent email logs
   */
  public async getRecentEmailLogs(limit: number = 50): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/email_logs?select=*&order=created_at.desc&limit=${limit}`,
        {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        return await response.json()
      }
      return []
    } catch (error) {
      console.error('Failed to fetch email logs:', error)
      return []
    }
  }

  /**
   * Get email analytics
   */
  public async getEmailAnalytics(days: number = 30): Promise<any> {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/email_logs?select=*&created_at=gte.${new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()}`,
        {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const logs = await response.json()
        
        return {
          totalEmails: logs.length,
          claimRelated: logs.filter((log: any) => log.classification?.category === 'claim_related').length,
          highPriority: logs.filter((log: any) => log.classification?.priority === 'high').length,
          averageConfidence: logs.reduce((sum: number, log: any) => sum + (log.confidence_score || 0), 0) / logs.length,
          tasksCreated: logs.filter((log: any) => log.should_process).length,
          claimNumbersExtracted: logs.reduce((sum: number, log: any) => 
            sum + (log.extracted_data?.claimNumbers?.length || 0), 0
          )
        }
      }
      
      return null
    } catch (error) {
      console.error('Failed to fetch email analytics:', error)
      return null
    }
  }
}

export const emailAutomationService = new EmailAutomationService()
