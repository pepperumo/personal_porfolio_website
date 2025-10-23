<!--
Sync Impact Report:
- Version: 1.0.0 → 1.1.0
- Removed principles: Performance Budget (Principle IV)
- Remaining principles renumbered: Documentation-Driven (V → IV)
- Rationale: Performance is important but not a constitutional requirement
- Templates: ✅ No template updates required
- Amendment date: 2025-10-23
-->

# Personal Portfolio Website Constitution

## Core Principles

### I. Portfolio-First Design

Every feature and enhancement MUST serve the primary goal of showcasing professional work and making it accessible to recruiters and potential collaborators. Features that do not directly contribute to portfolio value MUST be justified with clear user benefit analysis.

**Rationale**: The portfolio is a professional tool, not a technology playground. Each addition should enhance the visitor's ability to understand skills, experience, and project work. Features that add complexity without clear value dilute the portfolio's effectiveness.

### II. Zero-Cost Operations (NON-NEGOTIABLE)

All portfolio infrastructure and services MUST operate within free-tier limits of hosting and service providers. Any feature requiring paid services MUST be rejected or redesigned to use free alternatives.

**Rationale**: Portfolio sustainability depends on zero operational costs. GitHub Pages, Hugging Face Spaces free tier, and similar services provide sufficient capability for portfolio purposes. Paid services create ongoing financial burden and maintenance anxiety that distract from portfolio content updates.

### III. Brownfield Safety

All enhancements to the existing portfolio MUST be implemented with feature flags and rollback capabilities. No deployment may break existing portfolio functionality. Changes MUST be reversible without data loss.

**Rationale**: The portfolio serves as a professional calling card. Breaking the site during enhancements damages professional reputation and may cause missed opportunities. Safe integration patterns ensure the core portfolio remains functional even when experiments fail.

### IV. Documentation-Driven Development

Features MUST be specified and planned in documentation before implementation. Architecture decisions, API contracts, and integration patterns MUST be documented for future reference. Code without documentation is considered incomplete.

**Documentation Requirements**:

- Feature specifications before implementation
- Architecture decision records (ADRs) for significant choices
- API contracts and data models documented
- Deployment and rollback procedures written
- README updates for setup changes

**Rationale**: Portfolio development is often intermittent with gaps between work sessions. Documentation enables picking up work after breaks without reverse-engineering previous decisions. It also demonstrates professional development practices to potential employers.

## Development Standards

### Technology Stack Constraints

The portfolio MUST maintain consistency in its technology choices to reduce maintenance burden and ensure long-term sustainability:

**Required Technologies**:

- Frontend: React 18+ with Create React App or modern equivalent
- Styling: styled-components for component styling
- Hosting: GitHub Pages for frontend deployment
- Backend (when needed): Serverless solutions within free tiers (Hugging Face Spaces, Vercel, Netlify)
- Version Control: Git with GitHub for repository management

**Prohibited Technologies**:

- Paid hosting services
- Complex backend frameworks requiring dedicated servers
- Technologies requiring paid licenses
- Experimental frameworks without stable community support

### Testing Requirements

Features MUST include appropriate testing based on complexity and criticality:

**Testing Levels**:

- **Critical Features** (authentication, data processing, API integration): Unit + Integration + Manual validation
- **Standard Features** (UI components, interactions): Unit + Manual validation
- **Simple Features** (styling, content updates): Manual validation sufficient

**Test Coverage Expectations**:

- New React components: Basic smoke tests at minimum
- API integrations: Integration tests for contract validation
- Error handling: Test failure scenarios explicitly
- Mobile responsiveness: Manual testing on real devices

**Rationale**: Testing prevents regressions and provides confidence when making changes after long breaks between development sessions. The level of testing must match the feature's criticality without creating excessive maintenance burden.

### Security and Privacy Standards

The portfolio MUST respect user privacy and maintain security best practices:

**Security Requirements**:

- No collection of personally identifiable information (PII) without explicit user consent
- Analytics MUST be privacy-respecting (no tracking cookies, GDPR-compliant)
- API keys and secrets MUST be stored in environment variables, never committed to repository
- Third-party services MUST be vetted for privacy compliance
- HTTPS MUST be enforced for all connections

**Privacy Principles**:

- Minimal data collection (only what's necessary)
- No third-party tracking scripts
- Clear privacy policy if any data is collected
- User opt-out mechanisms where applicable

## Development Workflow

### Feature Development Process

1. **Specification Phase**: Document feature requirements, user value, technical approach
2. **Architecture Phase**: Design integration, identify risks, plan rollback strategy
3. **Implementation Phase**: Build with feature flags, maintain brownfield safety
4. **Validation Phase**: Test functionality, performance, mobile responsiveness
5. **Deployment Phase**: Deploy with monitoring, validate production behavior
6. **Documentation Phase**: Update READMEs, record decisions, close documentation loops

### Branching Strategy

- **main**: Production-ready code deployed to GitHub Pages
- **feature/***: Feature development branches
- **fix/***: Bug fix branches
- **experiment/***: Experimental work (may be discarded)

**Merge Requirements**:

- Feature branches MUST pass all tests before merging
- Performance budget MUST be validated
- Documentation MUST be updated
- Rollback procedure MUST be documented

### Deployment Safety

All deployments MUST follow safe rollout practices:

1. **Feature Flag**: New features hidden behind environment variable flags
2. **Validation**: Smoke testing in production environment
3. **Gradual Rollout**: Enable for testing before public exposure
4. **Monitoring**: Watch for errors, performance degradation
5. **Rollback Plan**: Document and test rollback procedure before deployment

## Governance

This constitution supersedes all other development practices and methodologies. While project management frameworks (such as BMAD, Agile, etc.) and knowledge management tools (such as Archon) may be used as productivity aids, they are OPTIONAL and their requirements do NOT override these core principles.

**Amendment Process**:

- Amendments require clear justification based on project experience
- Breaking changes to principles require MAJOR version increment
- New principles or expanded guidance require MINOR version increment
- Clarifications and wording improvements require PATCH version increment

**Compliance Verification**:

- All feature specifications MUST reference relevant constitutional principles
- Code reviews MUST verify compliance with performance budgets and safety requirements
- Deployment checklists MUST validate brownfield safety and rollback procedures

**Methodology Flexibility**:

- BMAD methodology is recommended but NOT required for project management
- Archon knowledge management is recommended but NOT required
- Alternative workflows and tools may be used as long as core principles are maintained
- Documentation and planning requirements (Principle IV) MUST be met regardless of methodology chosen

**Version**: 1.1.0 | **Ratified**: 2025-10-23 | **Last Amended**: 2025-10-23
