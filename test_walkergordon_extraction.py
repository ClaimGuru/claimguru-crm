#!/usr/bin/env python3
"""
Test the WalkerGordon PDF extraction using our deployed OpenAI edge function
"""
import json
import requests

def test_openai_extraction():
    # Read the extracted text
    with open('/workspace/walkergordon_raw_content.txt', 'r') as f:
        content = json.load(f)
    
    extracted_text = content['text_in_pdf']
    
    print("🔍 Testing OpenAI Field Extraction on WalkerGordon Policy")
    print("=" * 60)
    print(f"📄 Raw text length: {len(extracted_text)} characters")
    print("=" * 60)
    
    # Call our deployed OpenAI extraction function
    supabase_url = "https://ttnjqxemkbugwsofacxs.supabase.co"
    supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bmpxeGVta2J1Z3dzb2ZhY3hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODY1ODksImV4cCI6MjA2NzY2MjU4OX0.T4ZQBC1gF0rUtzrNqbf90k0dD8B1vD_JUBiEUbbAfuo"
    
    response = requests.post(
        f"{supabase_url}/functions/v1/openai-extract-fields",
        headers={
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json',
        },
        json={'text': extracted_text}
    )
    
    if response.status_code == 200:
        result = response.json()
        print("✅ OpenAI Field Extraction SUCCESSFUL!")
        print("=" * 60)
        
        if 'policyData' in result:
            policy_data = result['policyData']
            
            print("📋 EXTRACTED POLICY FIELDS:")
            print("=" * 40)
            for field, value in policy_data.items():
                if value and value != "null":
                    print(f"• {field}: {value}")
                else:
                    print(f"• {field}: [NOT FOUND]")
            
            print("\n" + "=" * 60)
            print("🎯 POLICY NUMBER DETECTION TEST:")
            
            policy_number = policy_data.get('policyNumber')
            if policy_number and policy_number != "null":
                print(f"✅ SUCCESS: Policy Number = {policy_number}")
                
                # Verify against raw text
                if policy_number in extracted_text:
                    print(f"✅ VERIFIED: Policy number found in original text")
                else:
                    print(f"⚠️  WARNING: Policy number not found in original text")
            else:
                print("❌ FAILED: Policy number not detected")
                
                # Manual extraction as fallback
                print("\n🔍 MANUAL PATTERN SEARCH:")
                import re
                
                # Try different policy number patterns
                patterns = [
                    r'(\d{2}-\d{6}-\d{2})',  # XX-XXXXXX-XX format
                    r'(\d{8,15})',           # Numeric sequences
                    r'([A-Z0-9\-]{8,20})',   # Alphanumeric with dashes
                ]
                
                for i, pattern in enumerate(patterns, 1):
                    matches = re.findall(pattern, extracted_text)
                    if matches:
                        print(f"  Pattern {i}: {matches}")
            
            print("\n" + "=" * 60)
            print("📊 EXTRACTION SUMMARY:")
            extracted_fields = [k for k, v in policy_data.items() if v and v != "null"]
            print(f"• Total fields extracted: {len(extracted_fields)}/{len(policy_data)}")
            print(f"• Extraction rate: {len(extracted_fields)/len(policy_data)*100:.1f}%")
            print(f"• Processing method: {result.get('processingMethod', 'openai-gpt-3.5')}")
            
        else:
            print("❌ No policy data in response")
            
    else:
        print(f"❌ OpenAI extraction failed: {response.status_code}")
        print(f"Response: {response.text}")
        
        # Fallback to manual regex extraction
        print("\n🔧 FALLBACK: Manual Regex Extraction")
        print("=" * 40)
        
        import re
        
        # Policy number patterns
        policy_patterns = [
            (r'(\d{2}-\d{6}-\d{2})', 'Standard format (XX-XXXXXX-XX)'),
            (r'Policy\s*(?:Number|#|No)?\s*[:.]?\s*([A-Z0-9\-]{5,25})', 'After "Policy" keyword'),
            (r'([A-Z0-9]{2,4}\d{6,15})', 'Alphanumeric starting'),
        ]
        
        for pattern, description in policy_patterns:
            matches = re.findall(pattern, extracted_text, re.IGNORECASE)
            if matches:
                print(f"✅ {description}: {matches[0]}")
                break
        else:
            print("❌ No policy number patterns found")

if __name__ == "__main__":
    test_openai_extraction()
