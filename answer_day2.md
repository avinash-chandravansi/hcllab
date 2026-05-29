# Day 2 Curriculum: Cloud Security Operations & Engineering Presentation Activity Answers

This document contains the correct answers, configuration states, and technical explanations for all activities in the Day 2 Cloud Security Simulator.

---

## Module 1: Threat Detection & Incident Response

### Game 1: Incident Response Lifecycle (Chronological Sorting Format)

Arrange the 5 key phases of the incident response lifecycle in chronological order (top to bottom):

1. **Identification: Detect and qualify security events using logging analytics and threat intelligence.**
   * *Why:* Incident response begins by identifying anomalies and validating them as actual security incidents.
2. **Containment: Limit the scope and impact of the active breach by isolating affected resources.**
   * *Why:* Containment must occur immediately upon validation to restrict lateral movement and data leakage.
3. **Eradication: Remove the threat vector, patch the entry hole, and clean all infected nodes.**
   * *Why:* Eradication removes the root cause of the incident before restoring operations.
4. **Recovery: Restore systems from clean backups and return services to normal production states.**
   * *Why:* Recovery brings systems back online after verifying that the threat has been completely removed.
5. **Lessons Learned: Document the response efficiency and update detection signatures to prevent recurrence.**
   * *Why:* The final phase reviews the incident response lifecycle and feeds telemetry back into preparation controls.

---

### Game 2: Threat Detection Engines (Drag & Drop Format)

Classify the security activities into their respective detection engine category:

| SIEM & XDR Engines<br>*(Sentinel / Defender XDR)* | Cloud-Native Detection<br>*(GuardDuty / Security Hub)* |
| :--- | :--- |
| **Correlating multi-vendor firewall logs using query language to analyze security trends**<br>*Why:* SIEM engines ingest heterogeneous log sources from diverse vendors to run multi-source correlations. | **Detecting API calls originating from known malicious exit nodes**<br>*Why:* Cloud-native services like GuardDuty inspect control plane logs directly for threat patterns. |
| **Detecting malicious process injection on virtual machine operating systems**<br>*Why:* XDR endpoint sensors inspect memory and processes on virtual machine operating systems directly. | **Aggregating security framework compliance scores and resource posture checks**<br>*Why:* Cloud Security Posture Management (CSPM) maps native resource states to security frameworks. |
| **Analyzing and blocking suspicious links inside inbound communication streams**<br>*Why:* XDR platforms protect user workloads (email, identities, files) before they interact with server assets. | **Analyzing network connection traces to locate unauthorized outbound data transmissions**<br>*Why:* Native threat detection engines audit cloud network logs to highlight communication anomalies. |

---

### Game 3: Incident Containment (Scenario Format)

#### 1. An active virtual machine is detected communicating with a known command-and-control server, exfiltrating data volumes via outbound TCP. What is the most secure immediate containment step?
* **Correct Answer:** Modify the VM's Network Security Group (NSG) to block all outbound traffic except local monitoring routes.
* **Technical Explanation:** Restricting network boundaries at the host plane (NSG) halts active exfiltration instantly, independent of VM OS response time.

#### 2. A developer's AWS access key was committed to a public GitHub repository. CloudTrail logs indicate the key is currently creating unauthorized ec2 instances. How do we contain this active identity compromise?
* **Correct Answer:** Deactivate and delete the exposed Access Key in the IAM console immediately.
* **Technical Explanation:** Deactivating the key cuts off credentials instantly, preventing further unauthorized API requests globally.

#### 3. An internet-facing web server is subjected to a brute-force SSH attack, filling OS syslog records with login failures. Which control dynamically contains this attack?
* **Correct Answer:** Configure a network rule to block the attacking IP or route the server behind a Bastion/IAP.
* **Technical Explanation:** Restricting network access or routing behind an Identity-Aware Proxy isolates the exposure and blocks brute-force probes.

#### 4. Cloud storage access logs reveal that a database backup file was read by an unauthorized public IP address. What step halts further exposure of the storage assets?
* **Correct Answer:** Revoke public read grants on the storage bucket and rotate the vault KMS encryption keys.
* **Technical Explanation:** Revoking public access closes the gateway immediately, and rotating KMS keys renders downloaded keys obsolete if rotation is enforced.

#### 5. A user identity is suspected of lateral movement, logging into multiple storage servers within seconds from different geolocations. Which identity control contains this session compromise?
* **Correct Answer:** Revoke active session tokens in Entra ID / IAM and enforce an MFA re-challenge.
* **Technical Explanation:** Revoking active session tokens terminates current authorization immediately, forcing a re-authentication and MFA check.

---
---

## Module 2: Vulnerability & Patch Management

### Game 1: CVSS v3 Severity Scoring (Drag & Drop Format)

Classify the CVSS v3 descriptors:

| Base Metrics (Static)<br>*(Constant across environments/time)* | Temporal & Env Metrics<br>*(Change over time or by environment)* |
| :--- | :--- |
| **Requirement for remote network vs local physical access to execute the exploit (Attack Vector)**<br>*Why:* Base metrics capture characteristics that are constant over time and user environments. | **Public availability of proof-of-concept scripts or active malware in the wild (Exploit Code Maturity)**<br>*Why:* Temporal metrics shift over time as exploit codes transition from proof-of-concept to functional malware. |
| **The level of administrative authority or user credentials needed to run the exploit (Privileges Required)**<br>*Why:* The level of privilege required is an intrinsic characteristics of the vulnerability. | **Status of a fix, such as an official vendor patch or temporary configuration workaround (Remediation Level)**<br>*Why:* As patches are released, the remediation level changes, lowering the temporal score. |
| **Whether a target victim must perform an action (e.g. clicking a link) to initiate the attack (User Interaction)**<br>*Why:* Whether user interaction is required is a constant characteristic of the vulnerability. | **Critical value mapping of the targeted asset based on data secrecy needs (Confidentiality Requirement)**<br>*Why:* Environmental metrics customize the score based on the critical value of the asset in your network. |

---

### Game 2: Patching Priorities (Scenario Format)

#### 1. A critical SQLi vulnerability (CVSS 9.8) is found on the primary public-facing client billing portal. Cyber threat intelligence indicates active exploitation in the wild. When should this vulnerability be patched?
* **Correct Answer:** Patch immediately (Emergency Hotfix window within 24-48 hours).
* **Technical Explanation:** Vulnerabilities on public-facing critical data paths with active exploits require emergency hotfix procedures.

#### 2. A local privilege escalation bug (CVSS 7.2) is detected on a virtual machine located in an isolated testing environment with no outbound internet access. What is the appropriate patching timeline?
* **Correct Answer:** Resolve during the next scheduled maintenance or patching window.
* **Technical Explanation:** Isolated internal assets present a lower exploit likelihood, allowing for scheduled patching rather than emergency disruption.

#### 3. A vulnerability scanner reports a denial-of-service vulnerability (CVSS 5.3) on an internal messaging server. A vendor patch is unavailable, but a configuration change mitigates the issue. What is the best immediate response?
* **Correct Answer:** Apply the recommended configuration mitigation and schedule the patch once released.
* **Technical Explanation:** Configuration workarounds mitigate risks immediately when official vendor patches are unavailable.

#### 4. An outdated Java library is flagged inside a legacy repository that has been decommissioned and is not active in production pipelines. How do we resolve this threat?
* **Correct Answer:** Deprecate and archive/delete the legacy repository to remove the exposure vector.
* **Technical Explanation:** Archiving or deleting decommissioned repositories removes attack surface exposure safely.

#### 5. A newly discovered Remote Code Execution (RCE) bug is announced for a web server framework used on all production servers. No exploit exists yet, but public interest is high. How should the operations team respond?
* **Correct Answer:** Prepare the patch deployment package and roll out to test environments within 72 hours.
* **Technical Explanation:** RCE threats require proactive testing and deployment preparation before exploits are weaponized.

---

### Game 3: Vulnerability Scanning Console (Toggle Format)

Configure the scanning console settings as follows:

* **Agentless Disk Scanning:** **ON (True)**
  * *Why:* Snapshots VM volumes and scans blocks offline, avoiding server overhead and agent maintenance.
* **External Port Penetration Test:** **ON (True)**
  * *Why:* Launches unauthenticated scans on external-facing endpoints to audit public perimeter visibility.
* **Credentialed OS Audit:** **ON (True)**
  * *Why:* Supplies read-only credentials to let the scanner log in and check host patch registers for accurate inventory.
* **Auto-Patch Production Databases:** **OFF (False)**
  * *Why:* Instantly deploying critical OS patches to live databases without pre-production testing risks severe business outages and database corruption.
* **Threat Intelligence Correlation:** **ON (True)**
  * *Why:* Links scanning results with global feeds to flag issues that have active public exploits.

---
---

## Module 3: Compliance & Governance

### Game 1: Compliance Frameworks (Drag & Drop Format)

Classify compliance activities:

| ISO 27001 & NIST CSF<br>*(Structured Standards & Frameworks)* | SOC 2 Type II Audits<br>*(Operational Evidence Controls)* |
| :--- | :--- |
| **Structuring the organization's overall information security policies and guidelines**<br>*Why:* ISO 27001 compliance centers on establishing and auditing an organizational ISMS. | **Verifying that security checks worked continuously during a half-year operational period**<br>*Why:* SOC 2 Type II reports evaluate control design and operational effectiveness over a specified testing window (typically 6-12 months). |
| **Grouping security practices under functional areas (Protect, Detect, Respond, etc.)**<br>*Why:* NIST CSF structures its controls around these functional pillars. | **Evaluating security, confidentiality, and availability principles defined by the AICPA**<br>*Why:* SOC 2 audits map controls directly to the AICPA Trust Services Criteria (TSC) pillars. |
| **Creating a formal registry of identified hazards and approved mitigation plans**<br>*Why:* ISO 27001 requires a formal Risk Treatment Plan mapping identified threats to risk tolerance. | **Providing approved pull-requests and configuration change approvals to external auditors**<br>*Why:* SOC 2 auditors verify evidence showing that configuration changes went through formal approval cycles. |

---

### Game 2: Cloud Governance Policy (Toggle Format)

Configure the Cloud Policy Guardrail rules:

* **Block Public Bucket Access:** **ON (True)**
  * *Why:* Restricts all cloud storage buckets from ever enabling public URL reads at the root account level, preventing accidental data leakage.
* **Enforce Cost-Center Tags:** **ON (True)**
  * *Why:* Denies resource creation APIs if a resource does not include verified cost-center metadata tags, ensuring accountability and cost tracking.
* **Enforce Triple-Region Sync:** **OFF (False)**
  * *Why:* Blocking database deployment unless it is replicated to at least 3 global regions is overly restrictive, unnecessarily inflates cloud costs, and disrupts standard dev pipelines.
* **Disable Direct Root Logins:** **ON (True)**
  * *Why:* Blocks administrative root API logins, requiring IAM users to elevate via roles. This is a primary best practice.
* **Enforce US-Only Data Residency:** **ON (True)**
  * *Why:* Blocks database and storage bucket creation in European or Asian cloud datacenters to comply with US regulatory data localization mandates.

---

### Game 3: Compliance Audits (Scenario Format)

#### 1. An external auditor requests the latest SOC 2 Type II report for our cloud provider to verify that the provider's physical datacenters are secure. How should we retrieve and share this audit report?
* **Correct Answer:** Use the cloud provider's console (e.g. AWS Artifact) to sign the NDA and download the official auditor report.
* **Technical Explanation:* AWS Artifact and Azure Compliance portals offer direct, self-service downloads of provider compliance reports under NDA.

#### 2. We need to prove to auditors that our cloud databases are continuously evaluated for configuration compliance against the CIS Benchmarks. Which cloud service automates this evidence collection?
* **Correct Answer:** Deploy Cloud Configuration Rules (e.g., AWS Config or Azure Policy) to continuously record and audit resource settings.
* **Technical Explanation:* AWS Config and Azure Policy keep audit histories of configuration changes, providing continuous evidence for compliance frameworks.

#### 3. The compliance framework requires us to show clear boundaries for data access, detailing which company roles can query personal customer records. What is the best way to present this to auditors?
* **Correct Answer:** Produce a Role-Based Access Control (RBAC) matrix and show IAM policy bindings mapping roles to database objects.
* **Technical Explanation:* An RBAC mapping matrix tied to actual cloud IAM policy implementations validates active security boundaries to auditors.

#### 4. A SaaS vendor we use for processing client e-mails states they are compliant, but we must verify their security status for our SOC 2 audit. What evidence must be requested from the SaaS vendor?
* **Correct Answer:** Request their current SOC 2 Type II report and review their user entities controls.
* **Technical Explanation:* Reviewing a vendor's SOC 2 report ensures their internal security controls align with our compliance standards.

#### 5. The database configuration was changed during a high-priority incident, violating the compliance baseline. The incident has passed, but the audit is tomorrow. What is the correct audit response?
* **Correct Answer:** Document the change ticket, detail the security justification for the bypass, and restore the baseline configuration immediately.
* **Technical Explanation:* Audit integrity requires documenting emergency exceptions with tickets and restoring security baselines promptly.

---
---

## Module 4: Cloud Security Operations

### Game 1: SOC Command Console (Toggle Format)

Configure the SOC variables:

* **Auto-Escalate Critical Threats:** **ON (True)**
  * *Why:* Forwards verified malware alerts directly to senior Tier-3 responders, skipping the queue to reduce containment time.
* **Correlate Repeated Alarms:** **ON (True)**
  * *Why:* Combines 50 identical alerts from the same host into a single security incident to prevent alert fatigue.
* **Route Raw Syslog to Chat:** **OFF (False)**
  * *Why:* Forwards all raw firewall logs to primary response chat channels creates massive noise and makes the channel unusable for coordination.
* **Hourly KQL Threat Hunting:** **ON (True)**
  * *Why:* Triggers automated log queries to scan database and user logins for suspicious patterns proactively.
* **Manual Triage of Low Alerts:** **OFF (False)**
  * *Why:* Requiring human analysts to manually inspect every low-severity log notification wastes time. Low alerts should be automated or aggregated.

---

### Game 2: SOAR Automated Playbook (Chronological Sorting Format)

Arrange the steps of a SOAR automated playbook for a compromised user account in chronological order (top to bottom):

1. **The SIEM system registers alert telemetry for rapid login failures followed by successful access.**
   * *Why:* The automated playbook begins when the SIEM engine triggers an alert rule for suspicious login patterns.
2. **The automated firewall service receives an API call to block the suspicious external IP.**
   * *Why:* The playbook quickly blocks the attacking IP to stop active automated brute-force attempts.
3. **The identity engine disables the user account and invalidates active session tokens.**
   * *Why:* Disabling the user account prevents the attacker from utilizing hijacked credentials or session cookies.
4. **The ticketing system logs a new incident and alerts the SOC analysts via Slack channels.**
   * *Why:* The system logs the ticket and alerts analysts for verification and documentation.
5. **The directory system forces a password rotation and locks the account until manager approval.**
   * *Why:* The final step ensures the user identity is verified and reset before administrative restoration.

---

### Game 3: Incident Response Priorities (Scenario Format)

#### 1. An automated SOAR playbook is configured to instantly terminate and isolate any virtual machine displaying suspicious outgoing SSH scanning traffic. What is the operational risk if this rule triggers on a critical production billing server during high-load processing?
* **Correct Answer:** It may cause a major business outage and transaction failures (false positive impact).
* **Technical Explanation:** Hard-containment automation without human triage on critical business paths risks severe operational disruption.

#### 2. A virtual machine in the production VPC is flagged by GuardDuty for potential cryptojacking activity (mining cryptocurrency). What is the best balance of response to minimize downtime while containing the threat?
* **Correct Answer:** Isolate the VM using a security group, snapshot the disk for analysis, and inspect CPU logs without destroying the container.
* **Technical Explanation:** Isolating and snapshotting VM volumes preserves evidence and blocks threat activity without causing permanent data loss.

#### 3. A senior executive's login credentials are leaked, and an active login is recorded from a residential IP address in a country where the company does not operate. What is the best immediate response?
* **Correct Answer:** Revoke all active session tokens immediately and trigger a mandatory MFA challenge.
* **Technical Explanation:** High-value credential compromise requires immediate session revocation and MFA verification to prevent lateral entry.

#### 4. A brute force attack is directed at the public web application login page, causing high database load and slowing down the site for customers. Which control mitigates this issue without blocking real customers?
* **Correct Answer:** Configure the WAF to block repeated requests from single IPs or enforce a CAPTCHA gate on the login route.
* **Technical Explanation:** WAF rate-limiting and CAPTCHA challenges block automated bots while allowing human clients access.

#### 5. Suspicious database modifications are detected originating from an internal network administrator's personal laptop IP address. How do we handle this internal threat context?
* **Correct Answer:** Temporarily revoke the admin's API keys, isolate their network segment, and contact them to verify the actions.
* **Technical Explanation:** Isolating access and segments allows for investigation of potential insider threats or credential theft without alerting attackers.

---
---

## Module 5: Logging & Visibility

### Game 1: Logging Tiers (Drag & Drop Format)

Classify the logging activities based on cost and access latency:

| Hot Analytics Tier<br>*(High performance / Ingesting active query)* | Cold Archive Tier<br>*(Low cost / Long-term retention)* |
| :--- | :--- |
| **Storing the last 30 days of events for real-time security correlations**<br>*Why:* Hot tiers keep logs indexed and queryable for immediate alert matching. | **Storing regulatory audit trails in immutable storage for long-term compliance**<br>*Why:* Regulatory compliance mandates long-term archiving of records, which can be stored in cheap, cold storage. |
| **Streaming active connection logs to detect live intrusion attempts**<br>*Why:* Intrusion detection requires live streaming of network connections. | **Saving database history packages for occasional post-incident forensics**<br>*Why:* Forensic archives are rarely read and should be stored in high-latency cold tiers. |
| **Ingesting active API request logs for immediate rate limit audits**<br>*Why:* Active security enforcement needs immediate access to telemetry logs to detect rate violations. | **Archiving account access logs to meet long-term industry standards requirements**<br>*Why:* Access logs must be kept for PCI-DSS compliance, but do not need hot indexing for daily queries. |

---

### Game 2: Cloud Auditing Coverage (Toggle Format)

Configure the auditing coverage variables as follows:

* **Global Trail Logging:** **ON (True)**
  * *Why:* Enables CloudTrail to log write activity globally across all regions, capturing unauthorized global deployments.
* **VPC Flow Logs:** **ON (True)**
  * *Why:* Captures IP traffic details flowing in and out of network interfaces in the production VPC.
* **Verbose Debug Logs:** **OFF (False)**
  * *Why:* Verbose debugging dumps raw payload structures and database tokens to logs. This dramatically inflates log storage costs and risks logging sensitive data in plaintext.
* **Key Vault Encrypted Logs:** **ON (True)**
  * *Why:* Encrypts the log storage bucket using Customer Managed Keys (CMK) and restricts access via policy.
* **Auto-Purge Logs After 14 Days:** **OFF (False)**
  * *Why:* Automatically deleting all security event logs after two weeks violates compliance standards and ruins incident forensic capabilities.

---

### Game 3: Log Tamper Prevention (Scenario Format)

#### 1. An administrative user account is compromised. The attacker attempts to delete the primary cloud audit trail log files (S3/Blob) to cover their tracks. What control prevents the deletion of audit logs?
* **Correct Answer:** Enable S3 Object Lock / WORM storage in Compliance Mode on the log destination bucket.
* **Technical Explanation:** Object Lock in compliance mode enforces WORM (Write Once, Read Many) rules, preventing file deletion even by the root account for a set retention window.

#### 2. An attacker gains root access on a virtual machine and modifies local syslog files to remove records of their SSH login session. How do we preserve the integrity of host OS logs?
* **Correct Answer:** Configure real-time log forwarding to write log events immediately to an external, write-only central repository.
* **Technical Explanation:** Forwarding logs to a central server in real-time ensures that records are preserved off-system before an attacker can modify them locally.

#### 3. We need to verify that our log archive files have not been modified or corrupted by administrators between the time they were written and the audit date. Which cryptographic control validates log file integrity?
* **Correct Answer:** Enable Log File Validation (cryptographic digest hashing) on the cloud trail settings.
* **Technical Explanation:** Log File Validation creates cryptographic hashes and signatures for log packages, allowing automatic verification of log authenticity.

#### 4. An auditor notes that our security log storage bucket has no network restriction, allowing anyone with the storage credentials to read audit records over the internet. What is the best way to secure this storage access?
* **Correct Answer:** Enforce storage bucket policies restricting access to designated VPC endpoints and KMS key owners.
* **Technical Explanation:** Restricting bucket policies to private network endpoints limits exposure to authorized internal services.

#### 5. Log storage costs are scaling fast because application servers are logging all database operations in plaintext. How should we adjust log collection boundaries?
* **Correct Answer:** Implement a lifecycle policy to compress and transition logs to cold storage tiers, and filter out low-value debugging lines.
* **Technical Explanation:** Log lifecycle policies and targeted log level filtering optimize costs while preserving security audit paths.

---
---

## Module 6: Application & API Security

### Game 1: OWASP Top 10 Protections (Card Swiper Format)

Classify the application design choices:

* **Scenario 1 (SQL Injection Concatenation):** **Vulnerable**
  * *Exploit:* String concatenation of raw input directly into SQL commands enables SQL Injection, allowing bypass of authentication checks. Use parameterized queries.
* **Scenario 2 (API Gateway Schema Checking):** **Secure**
  * *Defense:* Input sanitization and schema checking prevent malicious payloads from reaching application logic.
* **Scenario 3 (Database credentials in config.json):** **Vulnerable**
  * *Exploit:* Hardcoding secrets in source files exposes credentials to public scanning bots, compromising the database boundary. Use secrets managers.
* **Scenario 4 (Rate Limiting Authentication):** **Secure**
  * *Defense:* Rate-limiting login endpoints blocks brute-force automation attacks while protecting user identities.
* **Scenario 5 (Unsalted MD5 Password Hash):** **Vulnerable**
  * *Exploit:* MD5 has been cryptographically broken for years. Passwords must be hashed using strong, salted algorithms (e.g. bcrypt or Argon2).

---

### Game 2: API Gateway Defenses (Toggle Format)

Configure the API Gateway defenses:

* **Restrict CORS Origin:** **ON (True)**
  * *Why:* Restricts CORS to specific trusted domain origins, blocking wildcard access (*) and preventing cross-origin data leakage.
* **Client Rate-Limiting:** **ON (True)**
  * *Why:* Limits API queries from single client IPs to a maximum of 200 requests per minute to prevent resource starvation.
* **Enforce JWT Verification:** **ON (True)**
  * *Why:* Verifies signature and claims of incoming OAuth bearer tokens before forwarding calls to microservices.
* **JSON Schema Validation:** **ON (True)**
  * *Why:* Audits API payloads against strict format rules, rejecting queries with unmapped parameter fields.
* **Allow Direct Microservice IPs:** **OFF (False)**
  * *Why:* Allowing client applications to bypass the gateway and query microservice server IPs directly bypasses all gateway security, logs, and rate-limiting controls.

---

### Game 3: WAF Rules Configuration (Scenario Format)

#### 1. An HTTP request directed at a search API contains the parameter `?query=<script>document.cookie=...</script>`, attempting to steal session cookies. Which WAF rule blocks this vulnerability?
* **Correct Answer:** Enable OWASP Core Rule Set (CRS) script and Cross-Site Scripting (XSS) filters.
* **Technical Explanation:** XSS filters scan incoming payloads for HTML tags and script elements, blocking script execution.

#### 2. An automated botnet is launching a slow HTTP header attack (Slowloris), keeping connections open and exhausting web server memory pools. What WAF or gateway control mitigates this attack?
* **Correct Answer:** Configure connection timeout limits and request rate-limiting metrics.
* **Technical Explanation:** Slowloris exploits are mitigated by setting low connection timeout boundaries and limiting TCP connection counts per source IP.

#### 3. Attackers are trying to query administrative URLs like `/admin/config.php` and `/manager/html` on the public web application. How do we restrict access to these paths in the WAF?
* **Correct Answer:** Configure a path-matching URI rule that blocks public access to admin routes, allowing only local IP ranges.
* **Technical Explanation:** URI path-matching filters block public traffic directed at sensitive subfolders before it reaches web root directories.

#### 4. Incoming logs reveal that competitive bots are scraping pricing databases by systematically querying every product ID thousands of times. Which WAF rule mitigates database scraping?
* **Correct Answer:** Enable WAF Bot Control with challenge challenges (CAPTCHA / JavaScript validation).
* **Technical Explanation:** Bot control models identify scrapers based on query patterns and user-agent details, challenging bots while allowing real customers access.

#### 5. A high-priority vulnerability is announced for a web framework we use. A patch is not yet deployed, but attackers are actively scanning for the exploit payload. What is the best immediate virtual patching method?
* **Correct Answer:** Write a custom WAF signature targeting the unique exploit payload pattern to block requests.
* **Technical Explanation:** Virtual patching via WAF blocks specific exploit signatures, protecting systems before official software patches are applied.

---
---

## Module 7: Secure DevOps

### Game 1: CI/CD Pipeline Scanning Gates (Chronological Sorting Format)

Arrange the stages of a secure DevSecOps software delivery pipeline in chronological order (top to bottom):

1. **Developer pushes new code changes, initiating the automated pipeline execution.**
   * *Why:* The DevSecOps pipeline begins when code is committed and pushed to the repository.
2. **The scanner inspects the raw source files for security weaknesses and hardcoded patterns (SAST).**
   * *Why:* Static Application Security Testing (SAST) audits source code files before building binaries.
3. **The composition analyzer audits third-party library dependencies for known vulnerabilities (SCA).**
   * *Why:* Software Composition Analysis (SCA) checks package libraries against database records of known exploits.
4. **The configuration linter checks infrastructure templates for security settings before deployment (IaC Linting).**
   * *Why:* Scanning Infrastructure-as-Code files verifies that configuration settings meet baseline guidelines before resources are provisioned.
5. **The automated testing tool executes dynamic web security scans on the running interface (DAST).**
   * *Why:* Dynamic Application Security Testing (DAST) tests the active web interface in a staging environment to identify runtime flaws.

---

### Game 2: IaC Configuration Audits (Card Swiper Format)

Classify the Infrastructure as Code (IaC) configuration settings:

* **IaC Scenario 1 (Terraform SSH ingress open 0.0.0.0/0):** **Vulnerable**
  * *Exploit:* Opening port 22 (SSH) to the entire internet allows brute-force attacks and scans to reach the host boundary. Restrict to specific admin IPs.
* **IaC Scenario 2 (S3 Bucket Private ACL):** **Secure**
  * *Defense:* Setting access controls to private blocks public reads, preserving data boundary limits.
* **IaC Scenario 3 (Terraform hardcoded variable password):** **Vulnerable**
  * *Exploit:* Hardcoding passwords in variable files exposes credentials to anyone who has access to the codebase. Use Vault references.
* **IaC Scenario 4 (Load balancer port 80 to 443 redirect):** **Secure**
  * *Defense:* Enforcing HTTPS redirection ensures that connection streams are encrypted, protecting credentials and data in flight.
* **IaC Scenario 5 (CloudTrail multi-region trail disabled):** **Vulnerable**
  * *Exploit:* Single-region trails fail to log write actions in unmonitored regions, allowing attackers to spin up resources unnoticed.

---

### Game 3: Secret Leakage Remediation (Scenario Format)

#### 1. An AWS access key key string is committed to a public GitHub repository. Security teams identify the leak within minutes of push. What is the first remediation step?
* **Correct Answer:** Deactivate the leaked key immediately in the AWS identity portal.
* **Technical Explanation:** Leaked credentials must be revoked immediately in the cloud system. Deleting the file on GitHub does not prevent historical commits from being scanned.

#### 2. An API password was committed to a repository's git history 6 months ago. The file has been updated, but the credential is still visible in git logs. How do we remove the credential from repository history?
* **Correct Answer:** Use tools like `git-filter-repo` to completely scrub the credential from all branches and commit records.
* **Technical Explanation:** Git history tools like `git-filter-repo` rewrite commit chains to completely remove secret patterns from the repository data.

#### 3. A developer needs to reference a database password inside an automated deployment container in the pipeline. What is the secure way to supply the credential without exposing it in the pipeline definition files?
* **Correct Answer:** Retrieve the password dynamically during pipeline execution from a Key Vault or KMS using environment variables.
* **Technical Explanation:** Secrets vaults resolve credential exposure by fetching secret strings dynamically during runtime and injecting them as environment variables.

#### 4. We need to ensure that developers cannot commit code containing raw secret patterns or access key strings to company repositories. What control prevents secret pushes proactively?
* **Correct Answer:** Install pre-commit hooks (like Git Secrets or Gitleaks) to scan files locally before commits are allowed.
* **Technical Explanation:** Pre-commit scanning hooks audit files locally, stopping the commit process if secret patterns are detected.

#### 5. A third-party library we use in our pipeline is found to contain a high-severity backdoor. The pipeline is currently deploying code to production. How do we handle the pipeline gate response?
* **Correct Answer:** Fail the pipeline scan gate immediately, block the release, and fall back to the last secure release container.
* **Technical Explanation:** Pipeline gates block compromised container updates, and reverting to the last secure release maintains stability.
