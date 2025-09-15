# 13. Architecture Decision Records (ADRs)

### ADR-001: Hugging Face Spaces for Backend
**Decision**: Use Hugging Face Spaces instead of traditional cloud providers
**Rationale**: Zero cost, integrated AI model hosting, simple deployment
**Consequences**: Limited to HF's infrastructure, free-tier constraints

### ADR-002: Lazy Loading for Chat Widget
**Decision**: Implement React.lazy for chat components
**Rationale**: Minimize impact on portfolio loading performance
**Consequences**: Slight delay when first opening chat, complexity in error handling

### ADR-003: Ephemeral Sessions Only
**Decision**: No conversation persistence across browser sessions
**Rationale**: Privacy compliance, reduced backend complexity, aligns with recruiter use case
**Consequences**: Users lose context on page refresh, simpler architecture

### ADR-004: Feature Flag Architecture
**Decision**: Environment variable-based feature toggling
**Rationale**: Safe rollback capability for brownfield deployment
**Consequences**: Additional configuration complexity, enables gradual rollout
