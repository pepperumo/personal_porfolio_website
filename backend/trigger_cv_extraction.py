#!/usr/bin/env python3
"""
Trigger CV Content Extraction
Orchestrates the CV content extraction process for the AI knowledge base.
"""

import os
import sys
import json
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from cv_content_extractor import CVContentExtractor


def main():
    """Main orchestration function for CV extraction."""
    print("🚀 Starting CV Content Extraction for AI Knowledge Base")
    print("=" * 60)
    
    try:
        # Set up paths
        cv_file = backend_dir / ".." / "public" / "cv" / "Giuseppe_Rumore_CV.txt"
        data_dir = backend_dir / "data"
        
        # Ensure data directory exists
        data_dir.mkdir(exist_ok=True)
        
        # Check if CV file exists
        if not cv_file.exists():
            print(f"❌ CV file not found: {cv_file}")
            return False
        
        print(f"📄 Found CV file: {cv_file}")
        
        # Initialize extractor
        extractor = CVContentExtractor(str(cv_file))
        
        # Load and structure content
        print("📖 Loading CV content...")
        extractor.load_cv_content()
        
        print("🏗️  Structuring content for AI knowledge base...")
        structured_content = extractor.structure_content()
        
        # Save structured content
        structured_path = data_dir / "cv_structured.json"
        extractor.save_structured_content(str(structured_path))
        print(f"💾 Structured content saved: {structured_path}")
        
        # Generate AI-ready content
        print("🤖 Generating AI-optimized content chunks...")
        ai_content = extractor.get_content_for_ai()
        
        ai_content_path = data_dir / "cv_ai_content.json"
        with open(ai_content_path, 'w', encoding='utf-8') as file:
            json.dump(ai_content, file, indent=2, ensure_ascii=False)
        print(f"🧠 AI-ready content saved: {ai_content_path}")
        
        # Print extraction summary
        print("\n" + "=" * 60)
        print("📊 EXTRACTION SUMMARY")
        print("=" * 60)
        
        contact = structured_content['contact']
        print(f"👤 Name: {contact['name']}")
        print(f"💼 Title: {contact['title']}")
        print(f"📍 Location: {contact['location']}")
        print(f"📧 Email: {contact['email']}")
        
        print(f"\n📈 Content Statistics:")
        print(f"   • Professional Experience: {len(structured_content['experience'])} positions")
        print(f"   • Projects: {len(structured_content['projects'])} projects")
        print(f"   • Education: {len(structured_content['education'])} degrees")
        print(f"   • Languages: {len(structured_content['languages'])} languages")
        print(f"   • Certificates: {len(structured_content['certificates'])} certificates")
        
        # Show AI content sections
        print(f"\n🤖 AI Content Sections Generated:")
        for section, content in ai_content.items():
            content_length = len(content.strip())
            print(f"   • {section}: {content_length} characters")
        
        print("\n✅ CV Content Extraction Completed Successfully!")
        print("🎯 Ready for vectorization in Story 2.1 (Semantic Search)")
        
        # Show next steps
        print("\n" + "=" * 60)
        print("🚀 NEXT STEPS")
        print("=" * 60)
        print("1. ✅ CV content is now structured and ready")
        print("2. 🔄 Add API endpoints to serve this content")
        print("3. 🧮 Implement vectorization service (Story 2.1)")
        print("4. 🔍 Enable semantic search in chat widget")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during CV extraction: {str(e)}")
        print(f"📍 Error type: {type(e).__name__}")
        import traceback
        print(f"🔍 Traceback: {traceback.format_exc()}")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)