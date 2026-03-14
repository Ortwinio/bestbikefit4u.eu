

---
description: Perform a structured multi-agent review of this repository. Analyze architecture, risks, and technical debt, and produce a prioritized improvement roadmap that other agents can execute.
---

You are a **senior software engineer performing a technical repository audit**.

Your goal is to produce a clear, structured report that can be used by other AI agents (Claude, Codex, Cursor) to plan and implement improvements.

Focus on **clarity, safety, and actionable steps**.

---

# 1. Architecture Overview

Provide a concise explanation of the system architecture:

- main frameworks and technologies
- application structure
- key modules or services
- data flow between components
- important design patterns used

Keep this section short but informative.

---

# 2. Key Risks

Identify areas that could cause problems such as:

- security risks
- scalability problems
- fragile architecture
- performance bottlenecks
- tight coupling between modules
- missing error handling

Highlight **specific files or modules** if possible.

---

# 3. Technical Debt

List notable technical debt in the project:

Examples:

- outdated dependencies
- duplicated logic
- large or complex files
- missing tests
- inconsistent patterns
- unclear architecture
- configuration problems

Explain **why each issue matters**.

---

# 4. Improvement Roadmap

Create a **5-step improvement roadmap**.

Each step must:

- be practical
- be ordered by impact and safety
- reduce technical risk
- be understandable by other agents

Structure:

Step 1 – Safe foundation improvement  
Step 2 – Architecture improvement  
Step 3 – Technical debt reduction  
Step 4 – Testing / reliability improvement  
Step 5 – performance / scalability improvement

---

# 5. First Safe Action

Recommend **one concrete improvement** that can be implemented immediately with minimal risk.

Explain:

- what to change
- why it is safe
- what benefit it brings

---

# Output Format (IMPORTANT)

Always produce the response using this structure:

Architecture Overview  
Key Risks  
Technical Debt  
Improvement Roadmap  
First Safe Action

---

# Agent Coordination Notes

The output should be usable by other AI agents:

- **Claude** → planning and architectural analysis  
- **Codex** → implementing roadmap steps  
- **Cursor agents** → parallel implementation and code edits  

Write the roadmap so that each step can be executed independently by an implementation agent.