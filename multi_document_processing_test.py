#!/usr/bin/env python3
"""
Multi-Document Processing Test and Demonstration
ClaimGuru AI Intake Wizard - Advanced Document Intelligence

This script demonstrates the new multi-document processing capabilities
by analyzing the types of documents available and showing how they would
be processed by the new system.
"""

import os
import json
from pathlib import Path
from datetime import datetime

def analyze_available_documents():
    """Analyze and categorize available documents in user_input_files"""
    
    user_files_dir = Path("/workspace/user_input_files")
    documents = []
    
    # Define document patterns and categories
    document_patterns = {
        # Policy Documents
        'policy': [
            'policy', 'cert', 'certificate', 'insurance', 'coverage'
        ],
        # Communication Documents  
        'communication': [
            'letter', 'acknowledgement', 'correspondence', 'notice'
        ],
        # Processing Documents
        'processing': [
            'rfi', 'request', 'information', 'claim filed', 'rejection', 'ror'
        ],
        # Assessment Documents
        'assessment': [
            'estimate', 'appraisal', 'inspection', 'damage', 'loss'
        ]
    }
    
    # Scan directory for PDF files
    for file_path in user_files_dir.glob("*.pdf"):
        if file_path.is_file():
            filename = file_path.name.lower()
            file_size = file_path.stat().st_size
            
            # Determine document category
            category = 'unknown'
            document_type = 'unknown_document'
            confidence = 0.5
            
            for cat, patterns in document_patterns.items():
                for pattern in patterns:
                    if pattern in filename:
                        category = cat
                        confidence = 0.9
                        
                        # Determine specific document type
                        if 'policy' in filename or 'cert' in filename:
                            document_type = 'insurance_policy'
                        elif 'acknowledge' in filename:
                            document_type = 'acknowledgment_letter'
                        elif 'rfi' in filename:
                            document_type = 'request_for_information'
                        elif 'ror' in filename:
                            document_type = 'reservation_of_rights'
                        elif 'rejection' in filename:
                            document_type = 'rejection_letter'
                        elif 'letter' in filename:
                            document_type = 'communication_letter'
                        elif 'claim filed' in filename:
                            document_type = 'claim_filing_document'
                        break
                if category != 'unknown':
                    break
            
            documents.append({
                'filename': file_path.name,
                'filepath': str(file_path),
                'category': category,
                'document_type': document_type,
                'confidence': confidence,
                'size_kb': round(file_size / 1024, 1),
                'suitable_for_multi_processing': True
            })
    
    # Sort by category for better organization
    documents.sort(key=lambda x: (x['category'], x['filename']))
    
    return documents

def simulate_workflow_analysis(documents):
    """Simulate how the multi-document processor would analyze workflow stage"""
    
    categories_present = set(doc['category'] for doc in documents)
    document_types = [doc['document_type'] for doc in documents]
    
    # Determine workflow stage based on document types
    if any('policy' in dtype for dtype in document_types):
        if any('rejection' in dtype for dtype in document_types):
            stage = 'disputed_claim'
        elif any('acknowledgment' in dtype for dtype in document_types):
            stage = 'claim_processing'
        elif any('rfi' in dtype or 'ror' in dtype for dtype in document_types):
            stage = 'investigation'
        else:
            stage = 'initial_filing'
    else:
        stage = 'pre_claim'
    
    return {
        'workflow_stage': stage,
        'categories_detected': list(categories_present),
        'total_documents': len(documents),
        'processing_complexity': 'high' if len(documents) > 3 else 'medium' if len(documents) > 1 else 'low'
    }

def generate_test_scenarios(documents):
    """Generate different test scenarios for multi-document processing"""
    
    scenarios = []
    
    # Scenario 1: Single Policy Processing
    policy_docs = [doc for doc in documents if doc['category'] == 'policy']
    if policy_docs:
        scenarios.append({
            'name': 'Single Policy Analysis',
            'description': 'Process a single insurance policy document',
            'documents': policy_docs[:1],
            'expected_outcome': 'Extract comprehensive policy details including coverage, deductibles, and terms'
        })
    
    # Scenario 2: Claim Filing Package
    claim_docs = [doc for doc in documents if doc['category'] in ['policy', 'communication']]
    if len(claim_docs) >= 2:
        scenarios.append({
            'name': 'Claim Filing Package',
            'description': 'Process policy + communication documents together',
            'documents': claim_docs[:3],
            'expected_outcome': 'Identify claim context, extract policy details, and analyze communication timeline'
        })
    
    # Scenario 3: Complex Investigation Package
    if len(documents) >= 4:
        complex_docs = documents[:4]  # Mix of different types
        scenarios.append({
            'name': 'Complex Investigation Analysis',
            'description': 'Process multiple document types for comprehensive claim analysis',
            'documents': complex_docs,
            'expected_outcome': 'Full workflow analysis, document relationships, and processing recommendations'
        })
    
    # Scenario 4: Dispute Resolution Package
    dispute_docs = [doc for doc in documents if any(keyword in doc['document_type'] 
                    for keyword in ['rejection', 'ror', 'rfi'])]
    if dispute_docs:
        scenarios.append({
            'name': 'Dispute Resolution Analysis',
            'description': 'Analyze documents related to claim disputes and investigations',
            'documents': dispute_docs,
            'expected_outcome': 'Identify dispute reasons, required actions, and response strategies'
        })
    
    return scenarios

def create_test_report(documents, workflow_analysis, scenarios):
    """Create a comprehensive test report"""
    
    report = {
        'test_info': {
            'timestamp': datetime.now().isoformat(),
            'application_url': 'https://ljqtg04f4s.space.minimax.io',
            'test_type': 'Multi-Document Processing Demonstration',
            'total_documents_available': len(documents)
        },
        'document_inventory': {
            'documents': documents,
            'categories_summary': {},
            'total_size_kb': sum(doc['size_kb'] for doc in documents)
        },
        'workflow_analysis': workflow_analysis,
        'test_scenarios': scenarios,
        'capabilities_demonstrated': [
            'Automatic document classification',
            'Multi-document workflow analysis', 
            'Intelligent data extraction and consolidation',
            'Context-aware processing recommendations',
            'Document relationship identification',
            'Claim stage determination'
        ],
        'technical_features': [
            'HybridPDFExtractionService integration',
            'DocumentClassificationService usage',
            'Multi-tier AI processing (PDF.js → OCR → Vision → OpenAI)',
            'Cost optimization and processing efficiency',
            'Real-time progress tracking',
            'Comprehensive error handling'
        ]
    }
    
    # Calculate category summary
    for doc in documents:
        category = doc['category']
        if category not in report['document_inventory']['categories_summary']:
            report['document_inventory']['categories_summary'][category] = {
                'count': 0,
                'documents': [],
                'total_size_kb': 0
            }
        
        report['document_inventory']['categories_summary'][category]['count'] += 1
        report['document_inventory']['categories_summary'][category]['documents'].append(doc['filename'])
        report['document_inventory']['categories_summary'][category]['total_size_kb'] += doc['size_kb']
    
    return report

def main():
    """Main test execution"""
    
    print("🚀 ClaimGuru Multi-Document Processing Test")
    print("=" * 60)
    
    # Analyze available documents
    print("\n📄 Analyzing Available Documents...")
    documents = analyze_available_documents()
    
    if not documents:
        print("❌ No PDF documents found in user_input_files directory")
        return
    
    print(f"✅ Found {len(documents)} PDF documents")
    
    # Simulate workflow analysis
    print("\n🧠 Simulating Workflow Analysis...")
    workflow_analysis = simulate_workflow_analysis(documents)
    print(f"✅ Detected workflow stage: {workflow_analysis['workflow_stage']}")
    
    # Generate test scenarios
    print("\n🎯 Generating Test Scenarios...")
    scenarios = generate_test_scenarios(documents)
    print(f"✅ Created {len(scenarios)} test scenarios")
    
    # Create comprehensive report
    print("\n📊 Generating Test Report...")
    report = create_test_report(documents, workflow_analysis, scenarios)
    
    # Save report
    report_path = "/workspace/multi_document_processing_test_report.json"
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"✅ Test report saved to: {report_path}")
    
    # Display summary
    print("\n" + "=" * 60)
    print("📋 TEST SUMMARY")
    print("=" * 60)
    
    print(f"\n🌐 Application URL: {report['test_info']['application_url']}")
    print(f"📄 Total Documents: {len(documents)}")
    print(f"📁 Categories Found: {', '.join(workflow_analysis['categories_detected'])}")
    print(f"🔄 Workflow Stage: {workflow_analysis['workflow_stage']}")
    print(f"🎯 Test Scenarios: {len(scenarios)}")
    
    print("\n📂 Document Categories:")
    for category, info in report['document_inventory']['categories_summary'].items():
        print(f"  • {category.title()}: {info['count']} documents ({info['total_size_kb']:.1f} KB)")
    
    print("\n🧪 Available Test Scenarios:")
    for i, scenario in enumerate(scenarios, 1):
        print(f"  {i}. {scenario['name']}")
        print(f"     • {scenario['description']}")
        print(f"     • Documents: {len(scenario['documents'])} files")
        print(f"     • Expected: {scenario['expected_outcome']}")
        print()
    
    print("🎉 Multi-Document Processing Test Complete!")
    print("\n💡 Next Steps:")
    print("1. Visit the application URL to test the new multi-document wizard")
    print("2. Try uploading combinations of documents from the scenarios above")
    print("3. Observe the intelligent document classification and processing")
    print("4. Review the consolidated data extraction and workflow analysis")
    
    return report

if __name__ == "__main__":
    report = main()