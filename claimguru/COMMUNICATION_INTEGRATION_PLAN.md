# Communication Integration - Execution Plan

**Project:** ClaimGuru CRM Communication System  
**Integration Partner:** Twilio  
**AI Engine:** Google Gemini  
**Timeline:** Phased Implementation  
**Budget:** ~$127/month for 100 claims

---

## Executive Summary

This plan outlines the complete implementation of a unified communication system integrating **phone**, **SMS**, and **email** capabilities with AI-powered claim matching. The system will use Twilio as the communication backbone and Google Gemini AI for intelligent routing and matching.

---

## Phase 1: Foundation & Setup ✅ (Week 1)

### 1.1 Twilio Account Setup
- [x] Create Twilio account
- [ ] Verify business details
- [ ] Configure billing
- [ ] Set up API credentials (Account SID, Auth Token)
- [ ] Provision initial phone numbers (2 dedicated numbers to start)
- [ ] Configure SendGrid email integration
- [ ] Set up Twilio Studio for call flows

### 1.2 Development Environment
- [ ] Install Twilio SDK: `@twilio/sdk`
- [ ] Add environment variables:
  ```
  TWILIO_ACCOUNT_SID=
  TWILIO_AUTH_TOKEN=
  TWILIO_PHONE_NUMBER=
  TWILIO_MESSAGING_SERVICE_SID=
  SENDGRID_API_KEY=
  SENDGRID_DOMAIN=
  ```
- [ ] Configure webhook URLs for development and production

### 1.3 Database Schema
- [ ] Create `communications` table (central communication log)
- [ ] Create `twilio_phone_numbers` table (number management)
- [ ] Create `claim_email_addresses` table (unique emails per claim)
- [ ] Create `communication_templates` table (SMS/email templates)
- [ ] Create `call_recordings` table (recording metadata)
- [ ] Add indexes for performance
- [ ] Set up Row Level Security (RLS) policies

**Deliverables:**
- Database migration SQL file
- Twilio account fully configured
- Development environment ready

---

## Phase 2: Core Communication Services (Week 2)

### 2.1 Twilio Integration Service
**File:** `src/services/communication/twilioService.ts`

**Features:**
- Phone call initiation (outbound)
- Phone call handling (inbound webhook)
- SMS sending and receiving
- Email sending via SendGrid
- Call recording management
- Auto-play consent message for recordings
- Error handling and retry logic

**Key Functions:**
```typescript
- initiateCall(to: string, from: string, claimId?: string)
- sendSMS(to: string, message: string, claimId?: string)
- sendEmail(to: string, subject: string, body: string, claimId?: string)
- handleIncomingCall(callSid: string, from: string, to: string)
- handleIncomingSMS(messageSid: string, from: string, body: string)
- handleIncomingEmail(emailData: IncomingEmail)
- getCallRecording(callSid: string)
```

### 2.2 AI-Powered Matching Service
**File:** `src/services/communication/aiMatchingService.ts`

**Features:**
- Analyze incoming communication content (Gemini AI)
- Match communication to existing claims
- Extract key information (policy numbers, names, dates)
- Sentiment analysis for priority routing
- Confidence scoring for matches
- Fallback to manual review queue

**Matching Logic:**
```typescript
- matchCommunicationToClaim(content: string, from: string, metadata: any)
- extractClaimIdentifiers(content: string)
- analyzeCommunicationIntent(content: string)
- calculateMatchConfidence(claim: Claim, extractedData: any)
- suggestNewClaimCreation(extractedData: any)
```

### 2.3 Communication Repository Service
**File:** `src/services/communication/communicationRepository.ts`

**Features:**
- CRUD operations for all communication tables
- Query communications by claim ID
- Communication search and filtering
- Pagination support
- Analytics queries

**Deliverables:**
- 3 core service files fully implemented
- Unit tests for each service
- Integration tests for Twilio webhook flows

---

## Phase 3: Webhook Endpoints (Week 3)

### 3.1 API Routes
**Directory:** `src/api/webhooks/`

**Endpoints:**
```
POST /api/webhooks/twilio/voice/incoming    - Handle incoming calls
POST /api/webhooks/twilio/voice/status      - Call status updates
POST /api/webhooks/twilio/voice/recording   - Recording ready callback
POST /api/webhooks/twilio/sms/incoming      - Handle incoming SMS
POST /api/webhooks/twilio/sms/status        - SMS delivery status
POST /api/webhooks/sendgrid/inbound         - Handle incoming emails
POST /api/webhooks/sendgrid/events          - Email event webhooks
```

### 3.2 Security
- Twilio signature validation
- SendGrid webhook authentication
- Rate limiting per endpoint
- Request logging and monitoring
- Error alerting via Sentry

### 3.3 TwiML Response Generation
**File:** `src/services/communication/twimlService.ts`

**Features:**
- Generate TwiML for call flows
- Auto-play recording consent message
- Call routing based on claim status
- Voicemail handling
- IVR menu generation

**Deliverables:**
- 7 webhook endpoints fully functional
- TwiML service for dynamic call flows
- Comprehensive security validation

---

## Phase 4: Email System - Unique Addresses Per Claim (Week 4)

### 4.1 Email Address Management
**File:** `src/services/communication/claimEmailService.ts`

**Features:**
- Generate unique email per claim: `claim-{claimId}@claimguru.app`
- Configure SendGrid inbound parse
- Handle CC chains (include all stakeholders)
- Email threading and conversation tracking
- Automatic claim email creation on claim creation

**Email Format:**
```
Primary: claim-12345@claimguru.app
CC: adjuster@claimguru.app, claimant-email@domain.com, attorney@lawfirm.com
```

### 4.2 Email Threading
- Track email threads by Message-ID and In-Reply-To headers
- Group related emails in UI
- Maintain conversation context for AI analysis

### 4.3 Email Templates
**File:** `src/services/communication/emailTemplateService.ts`

**Templates:**
- Claim status updates
- Document requests
- Appointment reminders
- Payment notifications
- Custom templates with variable substitution

**Deliverables:**
- Unique email system fully operational
- Email template engine
- CC chain management
- Email threading UI

---

## Phase 5: Outbound Communication System (Week 5)

### 5.1 Outbound Service
**File:** `src/services/communication/outboundService.ts`

**Features:**
- Schedule calls/SMS/emails
- Bulk communication campaigns
- Communication queue management
- Retry logic for failed communications
- Throttling and rate limiting
- Delivery tracking and analytics

### 5.2 Communication Logging
**Requirements:**
- Log every outbound communication
- Track delivery status
- Record response times
- Store communication metadata
- Link to claim and user records

### 5.3 Templates and Automation
- Create reusable message templates
- Variable substitution (claim data, claimant name, etc.)
- Trigger-based communications (claim status change → notify claimant)
- Integration with workflow automation service

**Deliverables:**
- Outbound service with queue system
- Comprehensive logging
- Template system
- Automation triggers

---

## Phase 6: Phone Number Management (Week 6)

### 6.1 Hybrid Phone System
**File:** `src/services/communication/phoneNumberService.ts`

**Features:**
- Manage dedicated Twilio numbers
- Configure call forwarding to existing numbers
- Number assignment by region/claim type
- Caller ID management
- Number pooling for load balancing

**Number Strategy:**
```
Dedicated Numbers:
- Main office line: (555) 100-0001
- Sales hotline: (555) 100-0002

Forwarded Numbers:
- Individual adjuster cells (forwarded through Twilio)
- Department extensions (forwarded to existing VOIP)
```

### 6.2 Call Routing
- Route based on business hours
- Route based on claim assignment
- Overflow routing (main → backup → voicemail)
- Emergency escalation routing

### 6.3 Number Analytics
- Track calls per number
- Measure response times
- Monitor number performance
- Cost tracking per number

**Deliverables:**
- Phone number management interface
- Hybrid routing system
- Number provisioning automation
- Analytics dashboard

---

## Phase 7: User Interface Components (Week 7)

### 7.1 Communication Inbox
**Component:** `src/components/communication/CommunicationInbox.tsx`

**Features:**
- Unified inbox for calls, SMS, emails
- Filter by type, status, claim
- Search communications
- Mark as read/unread
- Priority flagging
- Quick actions (reply, call back, assign to claim)

### 7.2 Claim Linking Interface
**Component:** `src/components/communication/ClaimLinkModal.tsx`

**Features:**
- AI-suggested claim matches with confidence scores
- Manual claim selection
- Create new claim from communication
- View communication details
- Bulk linking operations

### 7.3 Communication Detail View
**Component:** `src/components/communication/CommunicationDetail.tsx`

**Features:**
- Full communication content display
- Call playback for recordings
- SMS conversation threading
- Email conversation view
- Metadata display (duration, timestamp, participants)
- Action buttons (reply, forward, export, link to claim)

### 7.4 Outbound Communication UI
**Component:** `src/components/communication/OutboundCommunication.tsx`

**Features:**
- Send SMS/email from claim view
- Initiate call with click-to-dial
- Select templates
- CC management for emails
- Schedule communications
- Preview before send

### 7.5 Communication Analytics Dashboard
**Component:** `src/components/communication/CommunicationAnalytics.tsx`

**Features:**
- Total communications chart (by type)
- Response time metrics
- Claim match accuracy
- Cost tracking
- Call duration statistics
- Email open/click rates

**Deliverables:**
- 5 major UI components
- Responsive design
- Real-time updates via Supabase subscriptions
- Accessibility compliant

---

## Phase 8: Call Recording & Consent (Week 8)

### 8.1 Recording Management
**File:** `src/services/communication/recordingService.ts`

**Features:**
- Auto-record all calls (configurable)
- Play consent message at call start
- Store recordings securely (Twilio storage + optional S3)
- Transcription via AI (Gemini Audio API or AssemblyAI)
- Searchable transcripts
- Retention policy enforcement (delete after X days)

### 8.2 Consent Message
**TwiML Flow:**
```xml
<Response>
  <Say voice="alice">
    This call may be recorded for quality and training purposes.
    By staying on the line, you consent to recording.
  </Say>
  <Record
    maxLength="3600"
    transcribe="false"
    recordingStatusCallback="/api/webhooks/twilio/voice/recording"
  />
</Response>
```

### 8.3 Recording UI
**Component:** `src/components/communication/RecordingPlayer.tsx`

**Features:**
- Audio player with playback controls
- Transcript display with timestamps
- Download recording
- Share recording link
- Mark sections of interest
- Add notes/tags to recordings

**Deliverables:**
- Recording service with secure storage
- Consent message implementation
- Transcription pipeline
- Recording player UI

---

## Phase 9: Analytics & Reporting (Week 9)

### 9.1 Communication Analytics Service
**File:** `src/services/communication/communicationAnalyticsService.ts`

**Metrics:**
- Total communications (calls, SMS, emails)
- Average response time
- Communication-to-claim match rate
- Cost per communication type
- Peak communication times
- User productivity (communications handled per adjuster)

### 9.2 Reports
- Daily communication summary
- Weekly claim communication report
- Monthly cost analysis
- AI matching accuracy report
- User performance report

### 9.3 Real-Time Monitoring
- Active calls dashboard
- Pending communications queue
- Failed communication alerts
- Cost tracking alerts

**Deliverables:**
- Analytics service with 15+ metrics
- 5 standard reports
- Real-time monitoring dashboard
- Export to CSV/PDF

---

## Phase 10: Testing & Quality Assurance (Week 10)

### 10.1 Unit Tests
**Coverage Target:** 80%+

**Test Files:**
```
src/services/communication/__tests__/
├── twilioService.test.ts
├── aiMatchingService.test.ts
├── communicationRepository.test.ts
├── claimEmailService.test.ts
├── outboundService.test.ts
├── phoneNumberService.test.ts
├── recordingService.test.ts
├── communicationAnalyticsService.test.ts
└── twimlService.test.ts
```

### 10.2 Integration Tests
- End-to-end webhook flows
- AI matching accuracy tests
- Email threading tests
- Call routing tests
- Outbound queue processing tests

### 10.3 Load Testing
- Concurrent call handling
- SMS throughput
- Email processing capacity
- Database query performance
- Webhook response times

### 10.4 Security Testing
- Webhook signature validation
- SQL injection prevention
- XSS prevention in communication content
- Access control verification
- PII protection in logs

**Deliverables:**
- 100+ unit tests
- 20+ integration tests
- Load test results
- Security audit report

---

## Phase 11: Documentation (Week 11)

### 11.1 Technical Documentation
**Files:**
- `docs/COMMUNICATION_SYSTEM_ARCHITECTURE.md`
- `docs/TWILIO_SETUP_GUIDE.md`
- `docs/WEBHOOK_INTEGRATION.md`
- `docs/AI_MATCHING_ALGORITHM.md`
- `docs/COMMUNICATION_API_REFERENCE.md`

### 11.2 User Documentation
**Files:**
- `docs/USER_GUIDE_COMMUNICATION_INBOX.md`
- `docs/USER_GUIDE_OUTBOUND_COMMUNICATIONS.md`
- `docs/USER_GUIDE_CALL_RECORDINGS.md`
- `docs/USER_GUIDE_EMAIL_SYSTEM.md`

### 11.3 Admin Documentation
**Files:**
- `docs/ADMIN_GUIDE_PHONE_NUMBER_MANAGEMENT.md`
- `docs/ADMIN_GUIDE_TWILIO_CONFIGURATION.md`
- `docs/ADMIN_GUIDE_COST_MONITORING.md`

### 11.4 API Documentation
- OpenAPI/Swagger spec for all webhook endpoints
- Postman collection for testing
- Example payloads

**Deliverables:**
- 11 documentation files
- API specifications
- Video tutorials (optional)

---

## Phase 12: Deployment & Monitoring (Week 12)

### 12.1 Environment Configuration
- Production Twilio account setup
- Production phone numbers provisioning
- SendGrid production domain verification
- Environment variable configuration
- Webhook URL configuration

### 12.2 Database Migration
- Run migration in production Supabase
- Verify indexes and RLS policies
- Seed initial data (templates, phone numbers)

### 12.3 Monitoring Setup
- Sentry error tracking for communication services
- Twilio Monitor for call quality
- SendGrid analytics for email delivery
- Custom dashboards for real-time metrics
- Alert configuration for critical failures

### 12.4 Gradual Rollout
1. **Beta Phase:** Enable for 5 test users
2. **Pilot Phase:** Enable for 25 users
3. **Full Launch:** Enable for all users
4. Monitor performance and costs at each phase

### 12.5 Post-Launch Support
- Daily monitoring for first week
- Weekly performance reviews
- User feedback collection
- Bug fixes and improvements
- Cost optimization

**Deliverables:**
- Production deployment complete
- Monitoring dashboards live
- Support runbook
- Rollback plan documented

---

## Cost Breakdown (Monthly)

### Twilio Costs (100 claims/month)
| Service | Usage | Unit Cost | Monthly Cost |
|---------|-------|-----------|--------------|
| Phone Numbers (2 dedicated) | 2 numbers | $2.00/number | $4.00 |
| Incoming Calls | 200 calls @ 5 min avg | $0.0085/min | $8.50 |
| Outgoing Calls | 100 calls @ 3 min avg | $0.013/min | $3.90 |
| Call Recording | 300 calls | $0.0025/min @ 4 min avg | $3.00 |
| SMS Incoming | 500 messages | $0.0075/msg | $3.75 |
| SMS Outgoing | 800 messages | $0.0079/msg | $6.32 |
| **Twilio Total** | | | **$29.47** |

### SendGrid Costs
| Service | Usage | Unit Cost | Monthly Cost |
|---------|-------|-----------|--------------|
| Essentials Plan | 50,000 emails/month | $19.95/month | $19.95 |
| Inbound Parse | Included | $0 | $0 |
| **SendGrid Total** | | | **$19.95** |

### Infrastructure Costs
| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| Supabase Storage (recordings) | 10 GB | $0.021/GB | $0.21 |
| Additional API calls | Within free tier | $0 | $0 |
| **Infrastructure Total** | | **$0.21** |

### **Total Monthly Cost: ~$50/month**

*Note: Original estimate of $127/month was conservative. Actual costs for 100 claims are closer to $50/month.*

---

## Success Metrics

### Technical Metrics
- [ ] Webhook response time < 200ms (95th percentile)
- [ ] AI matching accuracy > 85%
- [ ] Call connection rate > 95%
- [ ] SMS delivery rate > 99%
- [ ] Email deliverability > 98%
- [ ] System uptime > 99.9%

### Business Metrics
- [ ] Average response time < 2 hours
- [ ] Communication-to-claim link rate > 90%
- [ ] User satisfaction score > 4.5/5
- [ ] Reduction in manual data entry > 70%
- [ ] Cost per claim communication < $0.50

### User Experience Metrics
- [ ] Inbox load time < 1 second
- [ ] Search results < 500ms
- [ ] One-click claim linking > 80% of the time
- [ ] Zero training required for basic features

---

## Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|------------|
| Twilio API downtime | Implement retry logic, queue system, and fallback notifications |
| AI matching accuracy issues | Manual review queue, confidence thresholds, user feedback loop |
| High webhook latency | Async processing, queue-based architecture, caching |
| Data loss in communications | Redundant logging, backup webhooks, Twilio message retention |

### Business Risks
| Risk | Mitigation |
|------|------------|
| Cost overruns | Real-time cost monitoring, alerts, usage caps |
| Compliance issues (recording consent) | Legal review, clear consent messaging, opt-out options |
| User adoption resistance | Comprehensive training, gradual rollout, support resources |
| Phone number shortage | Pre-provision pool of numbers, auto-provisioning system |

### Security Risks
| Risk | Mitigation |
|------|------------|
| Unauthorized webhook access | Signature validation, IP whitelisting, rate limiting |
| PII exposure in logs | Log sanitization, encryption at rest, access controls |
| Recording data breaches | Encrypted storage, retention policies, access audits |

---

## Timeline Summary

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Foundation & Setup | Week 1 | ⏳ Pending |
| Phase 2: Core Services | Week 2 | ⏳ Pending |
| Phase 3: Webhook Endpoints | Week 3 | ⏳ Pending |
| Phase 4: Email System | Week 4 | ⏳ Pending |
| Phase 5: Outbound System | Week 5 | ⏳ Pending |
| Phase 6: Phone Management | Week 6 | ⏳ Pending |
| Phase 7: User Interface | Week 7 | ⏳ Pending |
| Phase 8: Call Recording | Week 8 | ⏳ Pending |
| Phase 9: Analytics | Week 9 | ⏳ Pending |
| Phase 10: Testing | Week 10 | ⏳ Pending |
| Phase 11: Documentation | Week 11 | ⏳ Pending |
| Phase 12: Deployment | Week 12 | ⏳ Pending |

**Total Timeline: 12 weeks (3 months)**

---

## Next Steps - Immediate Actions

1. ✅ Create this execution plan document
2. ⏳ Install Twilio SDK dependency
3. ⏳ Create database migration SQL file
4. ⏳ Implement core Twilio service
5. ⏳ Implement AI matching service
6. ⏳ Begin webhook endpoint development

---

## Approval & Sign-Off

**Prepared by:** Droid AI Assistant  
**Date:** 2025-11-13  
**Status:** Ready for Implementation  

**Awaiting approval to proceed with implementation.**

---

*This plan represents a complete, production-ready communication system integrated with AI-powered claim matching. All features are designed to scale, secure, and optimized for user experience.*
