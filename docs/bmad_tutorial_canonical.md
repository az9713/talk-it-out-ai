# BMAD Method: Canonical Tutorial (Aligned with BMAD-METHOD)

> **Scope & Intent (Canonical Notice)**
>
> This document presents a **BMAD-canonical description** of the *Breakthrough Method for Agile AI-Driven Development* as defined by the BMAD-METHOD project.
>
> - It describes **what BMAD is**, **what it is not**, and **what it guarantees**.
> - It avoids fixed agent counts, rigid phase models, timing promises, or tooling assumptions.
> - Any pedagogical structure used below is explicitly a **teaching abstraction**, not a normative requirement of BMAD.
>
> BMAD is a **methodological framework**, not a prescriptive process, product, or tool.

---

## 1. What BMAD Is (Canonical)

**BMAD** stands for:

> **Breakthrough Method for Agile AI-Driven Development**

BMAD is a **methodology for structuring AI-assisted software development** around:

- **Role-specialized AI agents** (not a single general-purpose assistant)
- **Persistent, versioned artifacts** (PRDs, specs, architecture, stories)
- **Human-in-the-loop orchestration and approval**
- **Continuous alignment between intent and implementation**

BMAD is designed for environments where **AI systems actively participate in planning, design, implementation, and validation**, rather than being used only as ad-hoc code or text generators.

---

## 2. What BMAD Is Not

BMAD is **not**:

- A mathematical or optimization algorithm
- A fixed agile framework like Scrum, SAFe, or XP
- A single prompt or prompt template
- A guarantee of speed, page counts, or delivery timelines
- A fixed set of tools, CLIs, or repositories

BMAD intentionally avoids over-prescription so it can adapt to:

- Project scale
- Regulatory context
- Team composition (solo developer vs. team)
- Tooling evolution

---

## 3. Core BMAD Principles (Authoritative)

### 3.1 Role-Specialized Intelligence

BMAD decomposes development work into **roles**, each of which may be instantiated as an AI agent, a human, or a hybrid.

Canonical roles include (non-exhaustive):

- **Analysis / Research**
- **Product Definition (e.g., Product Management)**
- **System Design / Architecture**
- **Implementation / Development**
- **Quality & Validation**
- **Documentation & Knowledge Transfer**

> BMAD does **not** mandate a fixed number of agents or role names.

---

### 3.2 Artifact-Centered Development

BMAD treats **documents and artifacts as first-class system components**, not byproducts.

Common artifacts include:

- Project brief or problem statement
- Product Requirements Document (PRD)
- Technical specifications
- Architecture descriptions
- User stories and acceptance criteria
- Test plans and validation artifacts

These artifacts:

- Persist across sessions
- Are versioned
- Serve as **binding context** for downstream work

---

### 3.3 Continuous Alignment

BMAD emphasizes **alignment checks** throughout development:

- Implementation is validated against requirements
- Requirements are traceable to original intent
- Changes trigger re-evaluation of affected artifacts

This avoids the failure mode where AI-generated output drifts from the original problem definition.

---

## 4. PRDs in BMAD (Canonical View)

BMAD does not define a single PRD template, length, or format.

What is canonical:

- A **PRD (or equivalent requirements artifact)** defines *what is to be built*
- It is typically produced by a **product-definition role**
- It acts as a **source-of-truth artifact** for architecture, implementation, and validation

What BMAD does **not** specify:

- Page counts
- Time to generate
- Mandatory sections
- Specific prioritization frameworks

BMAD allows PRDs to scale from minimal (for small changes) to extensive (for new products or regulated systems).

---

## 5. Workflow in BMAD (Non-Prescriptive)

BMAD does **not** mandate a fixed lifecycle or phase model.

However, most BMAD implementations exhibit a **logical flow**:

1. **Problem Understanding**
2. **Requirement Definition**
3. **Solution Design**
4. **Implementation & Validation**

These activities:

- May overlap
- May be skipped if context already exists
- May be revisited iteratively

> Any diagrammatic phase model should be understood as a *conceptual aid*, not a rule.

---

## 6. Agents in BMAD (Canonical Constraints)

BMAD supports **agent specialization**, but enforces only the following constraints:

- Each agent should have a **clear role boundary**
- Each agent should consume and produce **explicit artifacts**
- Agents should not silently override upstream decisions

BMAD does **not** require:

- A fixed roster of agents
- Named agents beyond their functional role
- One-to-one mapping between roles and tools

---

## 7. Tooling and Implementations

BMAD is **tool-agnostic**.

The BMAD-METHOD repository provides:

- Reference structures
- Example workflows
- Sample agent definitions

These are **implementations of BMAD**, not the definition of BMAD itself.

Any CLI commands, scripts, or installation steps should be treated as:

> *One evolving implementation of the BMAD Method*

—not as canonical requirements.

---

## 8. Human Role in BMAD

In BMAD, the human acts as:

- **Orchestrator** of agents
- **Reviewer and approver** of artifacts
- **Final decision authority**

BMAD explicitly rejects fully autonomous development without human oversight.

---

## 9. Summary (Canonical)

BMAD is best understood as:

> A methodology for structuring AI-assisted software development around role-specialized intelligence, persistent artifacts, and continuous alignment between intent and implementation.

It is deliberately:

- Flexible
- Tool-agnostic
- Scalable

Any concrete workflow, tutorial, or tooling setup should be labeled as an **instantiation of BMAD**, not BMAD itself.

---

## 10. Canonical Source

- BMAD-METHOD Project (primary reference)

This document is intentionally conservative and normative, prioritizing **methodological correctness over pedagogy or convenience**.
