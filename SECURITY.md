# Security Policy

## Overview

We take the security of BestBikeFit4U seriously and appreciate responsible disclosure of security issues.

Please **do not disclose security vulnerabilities publicly** in GitHub issues, discussions, pull requests, social media, or other public channels. Report them privately using the process below.

---

## Supported versions

Security updates are provided for the following code lines and environments:

| Version / branch | Supported |
| --- | --- |
| Production (live environment) | ✅ |
| Latest main branch | ✅ |
| Older release branches | ❌ |
| Archived / deprecated branches | ❌ |

If this repository starts using formal versioned releases, this table should be updated accordingly.

---

## Reporting a vulnerability

Please report suspected vulnerabilities privately.

### Preferred reporting channel
Send an email to: **[security@bestbikefit4u.eu]**  
If you do not want to publish a security contact yet, replace this with your preferred address before committing.

### Alternative
If you use GitHub private vulnerability reporting, you can submit the report there instead.

---

## What to include in your report

To help us investigate quickly, please include:

- a clear description of the issue
- affected URL, page, component, API route, or feature
- steps to reproduce
- proof of concept, screenshots, or sample payloads if relevant
- expected impact
- any suggested remediation if you have one

Useful details include:

- browser / device / OS
- account type or permission level required
- whether authentication is needed
- whether the issue is reproducible consistently

---

## What to expect from us

We aim to handle reports promptly and professionally.

### Response targets
- **Acknowledgement:** within **3 business days**
- **Initial triage update:** within **7 business days**
- **Further status updates:** at least every **14 business days** while the issue is being worked on

### After review
Once reviewed, we will typically classify the report as one of the following:

- **Accepted** — confirmed as a security issue and queued for remediation
- **Needs more information** — more detail required to reproduce or assess
- **Informational / not applicable** — not considered a security vulnerability in this project
- **Duplicate** — already known or already reported

We may not be able to share all internal remediation details, but we will keep reporters informed of material progress.

---

## Coordinated disclosure

We ask reporters to follow coordinated disclosure practices:

- do not publicly disclose the issue until we have had a reasonable opportunity to investigate and remediate it
- do not access, modify, or exfiltrate data beyond what is necessary to demonstrate the issue
- do not attempt denial-of-service, destructive testing, or privacy-invasive testing
- do not socially engineer staff, users, or third parties

If a report is valid, we will work toward a fix and, where appropriate, coordinate on disclosure timing.

---

## Safe testing expectations

Good-faith security research is welcome. We will not pursue action against researchers who:

- act in good faith
- avoid privacy violations, service disruption, and data destruction
- report findings promptly and privately
- stop testing once sensitive exposure is confirmed
- do not exploit the issue for personal gain

This does not authorize:
- data access beyond what is necessary for proof of concept
- account takeover or persistence
- automated abuse or denial-of-service
- phishing, physical attacks, spam, or social engineering
- testing against third-party services or infrastructure not owned by this project

---

## Out of scope

The following are generally **out of scope** unless they lead to a real and demonstrable security impact:

- missing security headers without exploitability
- rate-limit observations without abuse impact
- clickjacking on pages with no sensitive actions
- CSRF on endpoints that are already protected or non-sensitive
- low-value open redirects
- best-practice suggestions without a specific vulnerability
- version/banner disclosure only
- issues in third-party dependencies without a demonstrated impact on this project
- self-XSS requiring unrealistic user action
- reports based only on scanners without validation

---

## Severity and prioritization

Reports are prioritized based on factors such as:

- impact on confidentiality, integrity, and availability
- authentication requirements
- required user interaction
- exploitability
- number of affected users
- production relevance

Examples of high-priority categories include:

- authentication bypass
- privilege escalation
- IDOR / unauthorized data access
- injection vulnerabilities
- remote code execution
- sensitive data exposure
- payment, account, or report-access vulnerabilities

---

## Rewards / bug bounty

At this time, **BestBikeFit4U does not operate a public bug bounty program**, and we cannot guarantee monetary rewards for reports.

Valid reports are still appreciated and will be handled seriously.

---

## Security updates

Where appropriate, fixes may be communicated through:

- release notes
- commit history
- changelogs
- direct coordination with the reporter

Sensitive implementation details may be withheld until remediation is complete.

---

## Contact

Security contact: **[security@bestbikefit4u.eu]**  
General support questions should go to the normal support channel, not the security channel.

---

## Maintainer note

Before publishing this file, replace placeholder contact details with the correct reporting address and confirm whether GitHub private vulnerability reporting is enabled for this repository.
