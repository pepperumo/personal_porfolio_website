#!/usr/bin/env python3
"""
CV Content Validation Script

This script validates that the structured CV content is ready for vectorization
and AI knowledge base integration.
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Any


def validate_cv_content() -> bool:
    """
    Validate CV content for vectorization readiness.
    
    Returns:
        bool: True if content is valid, False otherwise
    """
    validation_passed = True
    
    # Check AI content file
    ai_content_path = Path(__file__).parent / "data" / "cv_ai_content.json"
    structured_content_path = Path(__file__).parent / "data" / "cv_structured.json"
    
    print("🔍 VALIDATING CV CONTENT FOR VECTORIZATION")
    print("=" * 50)
    
    # Validate AI content
    if not ai_content_path.exists():
        print("❌ AI content file missing")
        validation_passed = False
    else:
        try:
            with open(ai_content_path, 'r', encoding='utf-8') as f:
                ai_content = json.load(f)
            
            print("✅ AI content file loaded successfully")
            
            # Required sections for AI
            required_sections = [
                'personal_info', 'profile_summary', 'professional_experience',
                'projects', 'education', 'skills', 'languages', 'certificates'
            ]
            
            missing_sections = []
            for section in required_sections:
                if section not in ai_content:
                    missing_sections.append(section)
                elif not str(ai_content[section]).strip():
                    print(f"⚠️  Section '{section}' is empty")
                    validation_passed = False
                else:
                    char_count = len(str(ai_content[section]))
                    print(f"✅ {section}: {char_count} characters")
            
            if missing_sections:
                print(f"❌ Missing required sections: {missing_sections}")
                validation_passed = False
            
            total_chars = sum(len(str(v)) for v in ai_content.values())
            print(f"\n📊 Total content: {total_chars} characters")
            
            if total_chars < 5000:
                print("⚠️  Content seems short for comprehensive AI knowledge base")
            
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON in AI content file: {e}")
            validation_passed = False
    
    # Validate structured content
    if not structured_content_path.exists():
        print("❌ Structured content file missing")
        validation_passed = False
    else:
        try:
            with open(structured_content_path, 'r', encoding='utf-8') as f:
                structured_content = json.load(f)
            
            print("✅ Structured content file loaded successfully")
            
            # Check contact info
            contact_info = structured_content.get('contact_info', {})
            if not contact_info.get('name'):
                print("⚠️  Contact name not extracted properly")
            else:
                print(f"✅ Contact name: {contact_info['name']}")
            
            # Check key sections
            sections_count = {
                'professional_experience': len(structured_content.get('professional_experience', [])),
                'projects': len(structured_content.get('projects', [])),
                'education': len(structured_content.get('education', [])),
                'languages': len(structured_content.get('languages', [])),
                'certificates': len(structured_content.get('certificates', []))
            }
            
            for section, count in sections_count.items():
                print(f"✅ {section}: {count} items")
                
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON in structured content file: {e}")
            validation_passed = False
    
    print("\n" + "=" * 50)
    
    if validation_passed:
        print("🎯 VALIDATION PASSED")
        print("✅ CV content is ready for vectorization!")
        print("✅ Ready for Story 2.1: Semantic Search implementation")
        print("\nNext steps:")
        print("1. Install sentence-transformers: pip install sentence-transformers")
        print("2. Implement vectorization service")
        print("3. Create vector embeddings for semantic search")
        print("4. Integrate with chat widget")
    else:
        print("❌ VALIDATION FAILED")
        print("Please fix the issues above before proceeding to vectorization.")
    
    return validation_passed


if __name__ == "__main__":
    success = validate_cv_content()
    sys.exit(0 if success else 1)