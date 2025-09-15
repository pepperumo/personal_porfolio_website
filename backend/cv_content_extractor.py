"""
CV Content Extractor for AI Knowledge Base
Structures Giuseppe Rumore's CV content into organized categories for vectorization and AI chat.
"""

import json
import re
from typing import Dict, List, Any
from pathlib import Path


class CVContentExtractor:
    """Extracts and structures CV content from text file for AI knowledge base."""
    
    def __init__(self, cv_file_path: str):
        self.cv_file_path = Path(cv_file_path)
        self.raw_content = ""
        self.structured_content = {}
        
    def load_cv_content(self) -> str:
        """Load CV content from text file."""
        try:
            with open(self.cv_file_path, 'r', encoding='utf-8') as file:
                self.raw_content = file.read()
            return self.raw_content
        except FileNotFoundError:
            raise FileNotFoundError(f"CV file not found at: {self.cv_file_path}")
        except Exception as e:
            raise Exception(f"Error reading CV file: {str(e)}")
    
    def extract_contact_info(self) -> Dict[str, str]:
        """Extract contact information and links."""
        lines = self.raw_content.split('\n')
        
        # Find Giuseppe Rumore line
        name = ""
        title = ""
        links = ""
        details = ""
        
        for line in lines:
            line = line.strip()
            if "Giuseppe Rumore" in line:
                name = line
            elif line.startswith("Data Scientist"):
                title = line
            elif line.startswith("Links:"):
                links = line.replace("Links: ", "").strip()
            elif line.startswith("Details:"):
                details = line.replace("Details: ", "").strip()
        
        # Parse contact details from details line
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', details)
        email = email_match.group(0) if email_match else ""
        
        # Parse phone
        phone_match = re.search(r'\+\d+\s+\d+', details)
        phone = phone_match.group(0) if phone_match else ""
        
        # Parse location (everything before Tel:)
        location_match = re.search(r'^([^,]+,[^,]+,[^,]+,[^,]+)', details)
        location = location_match.group(1) if location_match else ""
        
        return {
            "name": name,
            "title": title,
            "email": email,
            "phone": phone,
            "location": location,
            "links": links
        }
    
    def extract_profile(self) -> str:
        """Extract profile/summary section."""
        lines = self.raw_content.split('\n')
        profile_start = None
        profile_end = None
        
        for i, line in enumerate(lines):
            if line.strip() == "Profile":
                profile_start = i + 1
            elif profile_start and line.strip() == "Professional Experience":
                profile_end = i
                break
        
        if profile_start and profile_end:
            profile_lines = lines[profile_start:profile_end]
            return ' '.join(line.strip() for line in profile_lines if line.strip())
        
        return ""
    
    def extract_professional_experience(self) -> List[Dict[str, Any]]:
        """Extract professional experience with companies, dates, and responsibilities."""
        experiences = []
        lines = self.raw_content.split('\n')
        
        exp_start = None
        for i, line in enumerate(lines):
            if line.strip() == "Professional Experience":
                exp_start = i + 1
                break
        
        if not exp_start:
            return experiences
        
        current_job = {}
        current_responsibilities = []
        
        for i in range(exp_start, len(lines)):
            line = lines[i].strip()
            
            if not line:
                continue
                
            # Check if we hit the next section
            if line in ["Data Science and Machine Learning Projects", "Education"]:
                # Save current job if exists
                if current_job:
                    current_job['responsibilities'] = current_responsibilities
                    experiences.append(current_job)
                break
            
            # Check for job title and company (format: "Title, Company, Location")
            if re.match(r'^[A-Z][^,]+,\s*[A-Z][^,]+,\s*[A-Z]', line):
                # Save previous job if exists
                if current_job:
                    current_job['responsibilities'] = current_responsibilities
                    experiences.append(current_job)
                
                # Parse new job
                parts = line.split(', ')
                current_job = {
                    'title': parts[0].strip() if len(parts) > 0 else "",
                    'company': parts[1].strip() if len(parts) > 1 else "",
                    'location': parts[2].strip() if len(parts) > 2 else ""
                }
                current_responsibilities = []
            
            # Check for date range (format: "MONTH YEAR — MONTH YEAR")
            elif re.match(r'^[A-Z]+ \d{4} — [A-Z]+ \d{4}$', line):
                if current_job:
                    current_job['period'] = line
            
            # Responsibility lines (start with description followed by colon)
            elif ':' in line and not line.startswith('Tel:'):
                current_responsibilities.append(line)
        
        # Don't forget the last job
        if current_job:
            current_job['responsibilities'] = current_responsibilities
            experiences.append(current_job)
        
        return experiences
    
    def extract_projects(self) -> List[Dict[str, Any]]:
        """Extract data science and machine learning projects."""
        projects = []
        lines = self.raw_content.split('\n')
        
        proj_start = None
        for i, line in enumerate(lines):
            if line.strip() == "Data Science and Machine Learning Projects":
                proj_start = i + 1
                break
        
        if not proj_start:
            return projects
        
        current_project = {}
        
        for i in range(proj_start, len(lines)):
            line = lines[i].strip()
            
            if not line:
                continue
                
            # Check if we hit the next section
            if line == "Education":
                # Save current project if exists
                if current_project:
                    projects.append(current_project)
                break
            
            # Check for year (format: "YYYY")
            if re.match(r'^\d{4}$', line):
                # Save previous project if exists
                if current_project:
                    projects.append(current_project)
                
                current_project = {'year': line, 'description': ''}
            
            # Project title (after year, before description)
            elif current_project and 'title' not in current_project and not re.match(r'^\d{4}$', line):
                current_project['title'] = line
            
            # Project description (everything else)
            elif current_project and 'title' in current_project:
                if current_project['description']:
                    current_project['description'] += ' ' + line
                else:
                    current_project['description'] = line
        
        # Don't forget the last project
        if current_project:
            projects.append(current_project)
        
        return projects
    
    def extract_education(self) -> List[Dict[str, Any]]:
        """Extract education information."""
        education = []
        lines = self.raw_content.split('\n')
        
        edu_start = None
        for i, line in enumerate(lines):
            if line.strip() == "Education":
                edu_start = i + 1
                break
        
        if not edu_start:
            return education
        
        current_education = {}
        current_details = []
        
        for i in range(edu_start, len(lines)):
            line = lines[i].strip()
            
            if not line:
                continue
                
            # Check if we hit the next section
            if line == "Languages":
                # Save current education if exists
                if current_education:
                    current_education['details'] = current_details
                    education.append(current_education)
                break
            
            # Check for degree and institution (contains comma)
            if ', ' in line and ('Master' in line or 'Data Science' in line):
                # Save previous education if exists
                if current_education:
                    current_education['details'] = current_details
                    education.append(current_education)
                
                # Parse new education
                parts = line.split(', ', 1)
                current_education = {
                    'degree': parts[0].strip(),
                    'institution': parts[1].strip() if len(parts) > 1 else ""
                }
                current_details = []
            
            # Check for date range
            elif re.match(r'^[A-Z]+ \d{4} — [A-Z]+ \d{4}$', line):
                if current_education:
                    current_education['period'] = line
            
            # Everything else is details
            else:
                current_details.append(line)
        
        # Don't forget the last education
        if current_education:
            current_education['details'] = current_details
            education.append(current_education)
        
        return education
    
    def extract_skills(self) -> Dict[str, List[str]]:
        """Extract skills from the Skills section."""
        lines = self.raw_content.split('\n')
        
        skills_start = None
        for i, line in enumerate(lines):
            if line.strip() == "Skills":
                skills_start = i + 1
                break
        
        if not skills_start:
            return {}
        
        skills = {
            'programming': [],
            'technical': [],
            'tools': [],
            'frameworks': []
        }
        
        for i in range(skills_start, len(lines)):
            line = lines[i].strip()
            
            if not line:
                continue
                
            # Check if we hit the next section or end
            if line == "Extra-curricular activities" or i >= len(lines) - 1:
                break
            
            # Categorize skills based on content
            if any(lang in line.lower() for lang in ['python', 'sql', 'git']):
                skills['programming'].append(line)
            elif any(tech in line.lower() for tech in ['computer vision', 'mlops', 'linux', 'docker']):
                skills['technical'].append(line)
            elif any(tool in line.lower() for tool in ['pytorch', 'tensorflow', 'ansys', 'catia', 'solidworks']):
                skills['tools'].append(line)
            else:
                skills['frameworks'].append(line)
        
        return skills
    
    def extract_languages(self) -> List[Dict[str, str]]:
        """Extract language proficiency information."""
        languages = []
        lines = self.raw_content.split('\n')
        
        lang_start = None
        for i, line in enumerate(lines):
            if line.strip() == "Languages":
                lang_start = i + 1
                break
        
        if not lang_start:
            return languages
        
        for i in range(lang_start, len(lines)):
            line = lines[i].strip()
            
            if not line:
                continue
                
            # Check if we hit the next section
            if line == "Certificates":
                break
            
            # Parse language and proficiency
            if ':' in line:
                parts = line.split(':', 1)
                lang_names = parts[0].strip()
                proficiency = parts[1].strip()
                
                # Handle multiple languages with same proficiency
                for lang in lang_names.split(', '):
                    languages.append({
                        'language': lang.strip(),
                        'proficiency': proficiency
                    })
        
        return languages
    
    def extract_certificates(self) -> List[str]:
        """Extract certificates and certifications."""
        certificates = []
        lines = self.raw_content.split('\n')
        
        cert_start = None
        for i, line in enumerate(lines):
            if line.strip() == "Certificates":
                cert_start = i + 1
                break
        
        if not cert_start:
            return certificates
        
        for i in range(cert_start, len(lines)):
            line = lines[i].strip()
            
            if not line:
                continue
                
            # Check if we hit the next section
            if line == "Skills":
                break
            
            certificates.append(line)
        
        return certificates
    
    def structure_content(self) -> Dict[str, Any]:
        """Structure all CV content into organized categories."""
        if not self.raw_content:
            self.load_cv_content()
        
        self.structured_content = {
            "contact": self.extract_contact_info(),
            "profile": self.extract_profile(),
            "experience": self.extract_professional_experience(),
            "projects": self.extract_projects(),
            "education": self.extract_education(),
            "skills": self.extract_skills(),
            "languages": self.extract_languages(),
            "certificates": self.extract_certificates(),
            "metadata": {
                "extraction_date": "2025-09-13",
                "source": "Giuseppe_Rumore_CV.txt",
                "version": "1.0"
            }
        }
        
        return self.structured_content
    
    def save_structured_content(self, output_path: str) -> str:
        """Save structured content to JSON file."""
        if not self.structured_content:
            self.structure_content()
        
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as file:
            json.dump(self.structured_content, file, indent=2, ensure_ascii=False)
        
        return str(output_file)
    
    def get_content_for_ai(self) -> Dict[str, str]:
        """Get content formatted for AI knowledge base and vectorization."""
        if not self.structured_content:
            self.structure_content()
        
        # Create AI-friendly text chunks for each major section
        ai_content = {}
        
        # Contact and basic info
        contact = self.structured_content['contact']
        ai_content['personal_info'] = f"""
        Name: {contact['name']}
        Title: {contact['title']}
        Location: {contact['location']}
        Contact: {contact['email']}, {contact['phone']}
        Links: {contact['links']}
        """
        
        # Profile summary
        ai_content['profile_summary'] = self.structured_content['profile']
        
        # Professional experience
        exp_text = []
        for exp in self.structured_content['experience']:
            exp_section = f"""
            {exp['title']} at {exp['company']}, {exp['location']} ({exp.get('period', '')})
            Responsibilities:
            """
            for resp in exp.get('responsibilities', []):
                exp_section += f"• {resp}\n"
            exp_text.append(exp_section)
        ai_content['professional_experience'] = '\n'.join(exp_text)
        
        # Projects
        proj_text = []
        for proj in self.structured_content['projects']:
            proj_section = f"""
            {proj['title']} ({proj['year']})
            {proj['description']}
            """
            proj_text.append(proj_section)
        ai_content['projects'] = '\n'.join(proj_text)
        
        # Education
        edu_text = []
        for edu in self.structured_content['education']:
            edu_section = f"""
            {edu['degree']} - {edu['institution']} ({edu.get('period', '')})
            Details: {' '.join(edu.get('details', []))}
            """
            edu_text.append(edu_section)
        ai_content['education'] = '\n'.join(edu_text)
        
        # Skills
        skills = self.structured_content['skills']
        skills_text = f"""
        Programming: {', '.join(skills.get('programming', []))}
        Technical: {', '.join(skills.get('technical', []))}
        Tools: {', '.join(skills.get('tools', []))}
        Frameworks: {', '.join(skills.get('frameworks', []))}
        """
        ai_content['skills'] = skills_text
        
        # Languages
        lang_list = [f"{lang['language']}: {lang['proficiency']}" 
                    for lang in self.structured_content['languages']]
        ai_content['languages'] = '\n'.join(lang_list)
        
        # Certificates
        ai_content['certificates'] = '\n'.join(self.structured_content['certificates'])
        
        return ai_content


def main():
    """Main function to extract and structure CV content."""
    try:
        # Initialize extractor
        cv_path = "../public/cv/Giuseppe_Rumore_CV.txt"
        extractor = CVContentExtractor(cv_path)
        
        # Extract and structure content
        print("Loading CV content...")
        extractor.load_cv_content()
        
        print("Structuring content...")
        structured = extractor.structure_content()
        
        # Save structured content
        output_path = "data/cv_structured.json"
        saved_path = extractor.save_structured_content(output_path)
        print(f"Structured content saved to: {saved_path}")
        
        # Get AI-ready content
        ai_content = extractor.get_content_for_ai()
        ai_output_path = "data/cv_ai_content.json"
        
        with open(ai_output_path, 'w', encoding='utf-8') as file:
            json.dump(ai_content, file, indent=2, ensure_ascii=False)
        print(f"AI-ready content saved to: {ai_output_path}")
        
        # Print summary
        print("\n=== CV Content Extraction Summary ===")
        print(f"Contact: {structured['contact']['name']}")
        print(f"Experience entries: {len(structured['experience'])}")
        print(f"Projects: {len(structured['projects'])}")
        print(f"Education entries: {len(structured['education'])}")
        print(f"Languages: {len(structured['languages'])}")
        print(f"Certificates: {len(structured['certificates'])}")
        
        return structured, ai_content
        
    except Exception as e:
        print(f"Error extracting CV content: {str(e)}")
        return None, None


if __name__ == "__main__":
    main()