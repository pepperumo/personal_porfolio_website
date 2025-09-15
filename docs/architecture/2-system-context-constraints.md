# 2. System Context & Constraints

### Business Context
- **Primary Users**: Technical recruiters seeking candidate information
- **Success Metrics**: 80% accuracy, <5s response time, zero operational cost
- **Risk Profile**: Low-risk brownfield enhancement with rollback capabilities

### Technical Constraints
- **Cost**: Must operate entirely on free tiers (GitHub Pages + Hugging Face)
- **Performance**: <50KB bundle impact, lazy loading required
- **Compatibility**: React CRA, styled-components, existing portfolio structure
- **Security**: No PII storage, ephemeral sessions only

### Operational Constraints
- **Deployment**: Automated via GitHub Actions
- **Monitoring**: Free-tier observability solutions only
- **Maintenance**: Minimal manual intervention required
