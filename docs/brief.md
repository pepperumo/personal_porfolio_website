# Project Brief: PeppeGPT

## What We're Building

A simple AI chatbot for my portfolio website that can answer questions about my CV and experience. Recruiters can ask questions instead of browsing through all the sections.

## The Problem

Recruiters spend limited time reviewing portfolios. They might miss important information or skip candidates because they can't quickly find what they're looking for.

## The Solution

**PeppeGPT** - A chat widget on my portfolio that:

- Answers questions about my skills, experience, and projects
- Uses Hugging Face models (free)
- Automatically updates when I change my portfolio content
- Works on GitHub Pages hosting

## Who Will Use It

**Primary Users:** Technical recruiters looking for data science/AI candidates

**What they want to know:**
- Specific technical skills
- Project details and experience
- Relevant qualifications quickly

## What We'll Build (MVP)

**Must Have:**
- Chat widget on portfolio website
- Can answer questions about CV content
- Updates automatically when portfolio changes
- Free to run (Hugging Face free tier)

**Not in MVP:**
- Conversation memory
- Advanced analytics
- Voice chat

## Technical Approach

- **Frontend:** React widget integrated into existing portfolio
- **Backend:** Hugging Face Spaces for AI processing
- **Search:** Embedding-based semantic search
- **Hosting:** GitHub Pages + Hugging Face Spaces
- **Cost:** Free (using HF free tier)

## Success Criteria

The MVP works when:
1. Chat widget appears on portfolio
2. Can answer 80% of basic questions about my experience
3. Updates within 24 hours when I change portfolio
4. Costs $0 to run

## Next Steps

1. Choose specific Hugging Face models
2. Set up HF Spaces project
3. Build basic chat widget
4. Connect to portfolio content
5. Test with sample recruiter questions
