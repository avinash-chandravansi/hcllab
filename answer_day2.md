# Day 2 Curriculum: Cloud Security Operations & Engineering — Answer Key

All options are numbered to match what appears on screen during the activity. The correct answer is clearly marked with ✅.

---

## Module 1: Threat Detection & Incident Response

### Game 1: Incident Response Lifecycle (Chronological Sorting)

Arrange the 5 key phases in this exact order (1 = first, 5 = last):

1. **Identification** — Detect and qualify security events using logging analytics and threat intelligence.
2. **Containment** — Limit the scope and impact of the active breach by isolating affected resources.
3. **Eradication** — Remove the threat vector, patch the entry hole, and clean all infected nodes.
4. **Recovery** — Restore systems from clean backups and return services to normal production states.
5. **Lessons Learned** — Document the response efficiency and update detection signatures to prevent recurrence.

---

### Game 2: Threat Detection Engines (Drag & Drop Format)

| SIEM & XDR Engines *(Sentinel / Defender XDR)* | Cloud-Native Detection *(GuardDuty / Security Hub)* |
|---|---|
| **Correlating multi-vendor firewall logs using query language to analyze security trends** — SIEM engines ingest heterogeneous log sources from diverse vendors to run multi-source correlations. | **Detecting API calls originating from known malicious exit nodes** — Cloud-native services like GuardDuty inspect control plane logs directly for threat patterns. |
| **Detecting malicious process injection on virtual machine operating systems** — XDR endpoint sensors inspect memory and processes on virtual machine operating systems directly. | **Aggregating security framework compliance scores and resource posture checks** — CSPM maps native resource states to security frameworks. |
| **Analyzing and blocking suspicious links inside inbound communication streams** — XDR platforms protect user workloads (email, identities, files) before they interact with server assets. | **Analyzing network connection traces to locate unauthorized outbound data transmissions** — Native threat detection engines audit cloud network logs to highlight communication anomalies. |

---

### Game 3: Incident Containment (Scenario MCQ)

---

**Q1.** An active virtual machine is detected communicating with a known command-and-control server, exfiltrating data via outbound TCP. What is the most secure immediate containment step?

- **Option 1:** Modify the VM's Network Security Group (NSG) to block all outbound traffic except local monitoring routes.
- **Option 2:** Deploy a backup VM instance in a separate subnet and initiate a data sync.
- **Option 3:** Run a full anti-virus scan on the VM OS to identify and isolate the malicious binary.

> ✅ **Correct: Option 1** — Restricting network boundaries at the host plane (NSG) halts active exfiltration instantly, independent of VM OS response time.

---

**Q2.** A developer's AWS access key was committed to a public GitHub repository. CloudTrail logs indicate the key is currently creating unauthorized EC2 instances. How do we contain this?

- **Option 1:** Deactivate and delete the exposed Access Key in the IAM console immediately.
- **Option 2:** E-mail the developer to change their password and rotate the key within 24 hours.
- **Option 3:** Configure a firewall rule to block traffic originating from the unauthorized EC2 instances.

> ✅ **Correct: Option 1** — Deactivating the key cuts off credentials instantly, preventing further unauthorized API requests globally.

---

**Q3.** An internet-facing web server is subjected to a brute-force SSH attack, filling OS syslog records with login failures. Which control dynamically contains this attack?

- **Option 1:** Configure a network rule to block the attacking IP or route the server behind a Bastion/IAP.
- **Option 2:** Increase OS password complexity limits to prevent successful cracking.
- **Option 3:** Restart the virtual machine to clear the SSH connection pool.

> ✅ **Correct: Option 1** — Restricting network access or routing behind an Identity-Aware Proxy isolates the exposure and blocks brute-force probes.

---

**Q4.** Cloud storage access logs reveal that a database backup file was read by an unauthorized public IP address. What step halts further exposure?

- **Option 1:** Revoke public read grants on the storage bucket and rotate the vault KMS encryption keys.
- **Option 2:** Delete the database backup file to prevent anyone else from reading it.
- **Option 3:** Set up an automated email notification to alert administrators of subsequent reads.

> ✅ **Correct: Option 1** — Revoking public access closes the gateway immediately, and rotating KMS keys renders downloaded keys obsolete if rotation is enforced.

---

**Q5.** A user identity is suspected of lateral movement, logging into multiple storage servers within seconds from different geolocations. Which identity control contains this session compromise?

- **Option 1:** Revoke active session tokens in Entra ID / IAM and enforce an MFA re-challenge.
- **Option 2:** Disable the user's primary password to prevent next week's logins.
- **Option 3:** Send an alert to the user's team lead to confirm their current location.

> ✅ **Correct: Option 1** — Revoking active session tokens terminates current authorization immediately, forcing a re-authentication and MFA check.

---
---

## Module 2: Vulnerability & Patch Management

### Game 1: CVSS v3 Severity Scoring (Drag & Drop Format)

| Base Metrics (Static) — *Constant over time* | Temporal & Env Metrics — *Change over time or by environment* |
|---|---|
| **Requirement for remote network vs local physical access to execute the exploit (Attack Vector)** — Base metrics capture characteristics constant over time and environments. | **Public availability of proof-of-concept scripts or active malware in the wild (Exploit Code Maturity)** — Temporal metrics shift over time as exploit codes transition from proof-of-concept to functional malware. |
| **The level of administrative authority or credentials needed to run the exploit (Privileges Required)** — The level of privilege required is an intrinsic Base metric. | **Status of a fix, such as an official vendor patch or temporary configuration workaround (Remediation Level)** — As patches are released, the remediation level changes, lowering the temporal score. |
| **Whether a target victim must perform an action to initiate the attack (User Interaction)** — Whether user interaction is required is a constant characteristic of the vulnerability. | **Critical value mapping of the targeted asset based on data secrecy needs (Confidentiality Requirement)** — Environmental metrics customize the score based on the critical value of the asset in your network. |

---

### Game 2: Patching Priorities (Scenario MCQ)

---

**Q1.** A critical SQL Injection vulnerability (CVSS 9.8) is found on the primary public-facing client billing portal. Cyber threat intelligence indicates active exploitation in the wild. When should this be patched?

- **Option 1:** Patch immediately (Emergency Hotfix window within 24-48 hours).
- **Option 2:** Defer patching to the next standard monthly maintenance cycle.
- **Option 3:** Ignore, as network-level firewalls will block database queries.

> ✅ **Correct: Option 1** — Vulnerabilities on public-facing critical data paths with active exploits require emergency hotfix procedures.

---

**Q2.** A local privilege escalation bug (CVSS 7.2) is detected on a virtual machine in an isolated testing environment with no outbound internet access. What is the appropriate patching timeline?

- **Option 1:** Resolve during the next scheduled maintenance or patching window.
- **Option 2:** Trigger an emergency pipeline shutdown and patch immediately.
- **Option 3:** Exclude the system from scanning to clear the audit log.

> ✅ **Correct: Option 1** — Isolated internal assets present a lower exploit likelihood, allowing for scheduled patching rather than emergency disruption.

---

**Q3.** A vulnerability scanner reports a denial-of-service vulnerability (CVSS 5.3) on an internal messaging server. A vendor patch is unavailable, but a configuration change mitigates the issue. What is the best immediate response?

- **Option 1:** Apply the recommended configuration mitigation and schedule the patch once released.
- **Option 2:** Leave the server unpatched and turn off monitoring to avoid alarms.
- **Option 3:** Rebuild the messaging server using a different Operating System.

> ✅ **Correct: Option 1** — Configuration workarounds mitigate risks immediately when official vendor patches are unavailable.

---

**Q4.** An outdated Java library is flagged inside a legacy repository that has been decommissioned and is not active in production pipelines. How do we resolve this threat?

- **Option 1:** Deprecate and archive/delete the legacy repository to remove the exposure vector.
- **Option 2:** Re-deploy the repository to production to test if the library still works.
- **Option 3:** Re-write the entire repository using Python to bypass the scan.

> ✅ **Correct: Option 1** — Archiving or deleting decommissioned repositories removes attack surface exposure safely.

---

**Q5.** A newly discovered Remote Code Execution (RCE) bug is announced for a web server framework used on all production servers. No exploit exists yet, but public interest is high. How should the operations team respond?

- **Option 1:** Prepare the patch deployment package and roll out to test environments within 72 hours.
- **Option 2:** Wait until active exploitation is confirmed in the wild before patching.
- **Option 3:** Uninstall the web server software to guarantee safety.

> ✅ **Correct: Option 1** — RCE threats require proactive testing and deployment preparation before exploits are weaponized.

---

### Game 3: Vulnerability Scanning Console (Toggle Format)

| Toggle | Correct State | Why |
|---|---|---|
| Agentless Disk Scanning | **ON** | Snapshots VM volumes and scans blocks offline, avoiding server overhead and agent maintenance. |
| External Port Penetration Test | **ON** | Launches unauthenticated scans on external-facing endpoints to audit public perimeter visibility. |
| Credentialed OS Audit | **ON** | Supplies read-only credentials to let the scanner log in and check host patch registers. |
| Auto-Patch Production Databases | **OFF** | Instantly deploying patches to live databases without pre-production testing risks severe business outages. |
| Threat Intelligence Correlation | **ON** | Links scanning results with global feeds to flag issues that have active public exploits. |

---
---

## Module 3: Compliance & Governance

### Game 1: Compliance Frameworks (Drag & Drop Format)

| ISO 27001 & NIST CSF | SOC 2 Type II Audits |
|---|---|
| **Structuring the organization's overall information security policies and guidelines** — ISO 27001 compliance centers on establishing and auditing an organizational ISMS. | **Verifying that security checks worked continuously during a half-year operational period** — SOC 2 Type II evaluates control design and operational effectiveness over a testing window (typically 6-12 months). |
| **Grouping security practices under functional areas (Protect, Detect, Respond, etc.)** — NIST CSF structures its controls around these 5 functional pillars. | **Evaluating security, confidentiality, and availability principles defined by the AICPA** — SOC 2 audits map controls to the AICPA Trust Services Criteria (TSC) pillars. |
| **Creating a formal registry of identified hazards and approved mitigation plans** — ISO 27001 requires a formal Risk Treatment Plan mapping identified threats to risk tolerance. | **Providing approved pull-requests and configuration change approvals to external auditors** — SOC 2 auditors verify evidence showing that configuration changes went through formal approval cycles. |

---

### Game 2: Cloud Governance Policy (Toggle Format)

| Toggle | Correct State | Why |
|---|---|---|
| Block Public Bucket Access | **ON** | Restricts all cloud storage buckets from ever enabling public URL reads at the root account level. |
| Enforce Cost-Center Tags | **ON** | Denies resource creation APIs if a resource does not include verified cost-center metadata tags. |
| Enforce Triple-Region Sync | **OFF** | Requiring 3-region replication for all databases is overly restrictive and unnecessarily inflates cloud costs. |
| Disable Direct Root Logins | **ON** | Blocks administrative root API logins, requiring IAM users to elevate via roles. This is a primary best practice. |
| Enforce US-Only Data Residency | **ON** | Blocks database and storage bucket creation in European or Asian cloud datacenters to comply with data localization mandates. |

---

### Game 3: Compliance Audits (Scenario MCQ)

---

**Q1.** An external auditor requests the latest SOC 2 Type II report for our cloud provider to verify that the provider's physical datacenters are secure. How should we retrieve and share this?

- **Option 1:** Use the cloud provider's console (e.g. AWS Artifact) to sign the NDA and download the official auditor report.
- **Option 2:** E-mail the cloud provider support desk asking for a text summary of their physical security controls.
- **Option 3:** Write a custom statement claiming that the cloud provider guarantees safety under the Shared Responsibility Model.

> ✅ **Correct: Option 1** — AWS Artifact and Azure Compliance portals offer direct, self-service downloads of provider compliance reports under NDA.

---

**Q2.** We need to prove to auditors that our cloud databases are continuously evaluated for configuration compliance against the CIS Benchmarks. Which cloud service automates this evidence collection?

- **Option 1:** Deploy Cloud Configuration Rules (e.g., AWS Config or Azure Policy) to continuously record and audit resource settings.
- **Option 2:** Ask developers to take weekly screenshots of the database configuration screens.
- **Option 3:** Configure hourly database backups to prove configuration retention.

> ✅ **Correct: Option 1** — AWS Config and Azure Policy keep audit histories of configuration changes, providing continuous evidence for compliance frameworks.

---

**Q3.** The compliance framework requires us to show clear boundaries for data access, detailing which company roles can query personal customer records. What is the best way to present this to auditors?

- **Option 1:** Produce a Role-Based Access Control (RBAC) matrix and show IAM policy bindings mapping roles to database objects.
- **Option 2:** Provide the employee handbook stating that customer privacy is highly valued.
- **Option 3:** Export a list of all database table structures with no user mapping data.

> ✅ **Correct: Option 1** — An RBAC mapping matrix tied to actual cloud IAM policy implementations validates active security boundaries to auditors.

---

**Q4.** A SaaS vendor we use for processing client e-mails states they are compliant, but we must verify their security status for our SOC 2 audit. What evidence must be requested?

- **Option 1:** Request their current SOC 2 Type II report and review their user entities controls.
- **Option 2:** Request their business registration certificate and tax documents.
- **Option 3:** Accept their website landing page marketing claims of secure architectures.

> ✅ **Correct: Option 1** — Reviewing a vendor's SOC 2 report ensures their internal security controls align with our compliance standards.

---

**Q5.** The database configuration was changed during a high-priority incident, violating the compliance baseline. The incident has passed, but the audit is tomorrow. What is the correct audit response?

- **Option 1:** Document the change ticket, detail the security justification for the bypass, and restore the baseline configuration immediately.
- **Option 2:** Manually modify the compliance logs to show that no baseline violation occurred.
- **Option 3:** Pretend the server does not exist and exclude it from the audit scope.

> ✅ **Correct: Option 1** — Audit integrity requires documenting emergency exceptions with tickets and restoring security baselines promptly.

---
---

## Module 4: Cloud Security Operations

### Game 1: SOC Command Console (Toggle Format)

| Toggle | Correct State | Why |
|---|---|---|
| Auto-Escalate Critical Threats | **ON** | Forwards verified malware alerts directly to senior Tier-3 responders, skipping the queue. |
| Correlate Repeated Alarms | **ON** | Combines 50 identical alerts from the same host into a single security incident to prevent alert fatigue. |
| Route Raw Syslog to Chat | **OFF** | Forwarding all firewall logs to primary response chat channels creates massive noise and makes coordination impossible. |
| Hourly KQL Threat Hunting | **ON** | Triggers automated log queries to scan database and user logins for suspicious patterns proactively. |
| Manual Triage of Low Alerts | **OFF** | Requiring human analysts to manually inspect every low-severity notification wastes time and increases alert fatigue. |

---

### Game 2: SOAR Automated Playbook (Chronological Sorting)

Arrange the steps in this exact order (1 = first, 5 = last):

1. The SIEM system registers alert telemetry for rapid login failures followed by successful access.
2. The automated firewall service receives an API call to block the suspicious external IP.
3. The identity engine disables the user account and invalidates active session tokens.
4. The ticketing system logs a new incident and alerts the SOC analysts via Slack channels.
5. The directory system forces a password rotation and locks the account until manager approval.

---

### Game 3: Incident Response Priorities (Scenario MCQ)

---

**Q1.** An automated SOAR playbook is configured to instantly terminate any VM displaying suspicious outgoing SSH scanning traffic. What is the operational risk if this triggers on a critical production billing server during high-load processing?

- **Option 1:** It may cause a major business outage and transaction failures (false positive impact).
- **Option 2:** It will increase cloud billing costs by spinning up duplicate servers.
- **Option 3:** It will corrupt the hypervisor hosting the billing database.

> ✅ **Correct: Option 1** — Hard-containment automation without human triage on critical business paths risks severe operational disruption.

---

**Q2.** A virtual machine in the production VPC is flagged by GuardDuty for potential cryptojacking activity. What is the best balance of response to minimize downtime while containing the threat?

- **Option 1:** Isolate the VM using a security group, snapshot the disk for analysis, and inspect CPU logs without destroying the container.
- **Option 2:** Delete the VM immediately, along with all associated database storage volumes.
- **Option 3:** Ignore the alert, as cryptojacking does not access customer records.

> ✅ **Correct: Option 1** — Isolating and snapshotting VM volumes preserves evidence and blocks threat activity without causing permanent data loss.

---

**Q3.** A senior executive's login credentials are leaked, and an active login is recorded from a residential IP address in a country where the company does not operate. What is the best immediate response?

- **Option 1:** Revoke all active session tokens immediately and trigger a mandatory MFA challenge.
- **Option 2:** Send an e-mail to the executive asking if they are currently traveling.
- **Option 3:** Monitor the session for 48 hours to collect intelligence on what files they access.

> ✅ **Correct: Option 1** — High-value credential compromise requires immediate session revocation and MFA verification to prevent lateral entry.

---

**Q4.** A brute force attack is directed at the public web application login page, causing high database load and slowing the site for customers. Which control mitigates this issue without blocking real customers?

- **Option 1:** Configure the WAF to block repeated requests from single IPs or enforce a CAPTCHA gate on the login route.
- **Option 2:** Take the entire web application offline to stop the database load.
- **Option 3:** Disable user logins temporarily for all users across the company.

> ✅ **Correct: Option 1** — WAF rate-limiting and CAPTCHA challenges block automated bots while allowing human clients access.

---

**Q5.** Suspicious database modifications are detected originating from an internal network administrator's personal laptop IP address. How do we handle this internal threat context?

- **Option 1:** Temporarily revoke the admin's API keys, isolate their network segment, and contact them to verify the actions.
- **Option 2:** Publicly announce that the administrator's account is compromised in company channels.
- **Option 3:** Reset all cloud user passwords across the entire company.

> ✅ **Correct: Option 1** — Isolating access and segments allows for investigation of potential insider threats or credential theft without alerting attackers.

---
---

## Module 5: Logging & Visibility

### Game 1: Logging Tiers (Drag & Drop Format)

| Hot Analytics Tier — *High performance / Active querying* | Cold Archive Tier — *Low cost / Long-term retention* |
|---|---|
| **Storing the last 30 days of events for real-time security correlations** — Hot tiers keep logs indexed and queryable for immediate alert matching and active analyst searches. | **Storing regulatory audit trails in immutable storage for long-term compliance** — Regulatory compliance mandates long-term archiving, which can be stored in cheap, cold storage. |
| **Streaming active connection logs to detect live intrusion attempts** — Intrusion detection requires live streaming of network connections to identify threats instantly. | **Saving database history packages for occasional post-incident forensics** — Forensic archives are rarely read and should be stored in high-latency cold tiers. |
| **Ingesting active API request logs for immediate rate limit audits** — Active security enforcement needs access to telemetry logs to detect rate-limit violations instantly. | **Archiving account access logs to meet long-term industry standards requirements** — Access logs must be kept for PCI-DSS compliance but do not need hot indexing for daily queries. |

---

### Game 2: Cloud Auditing Coverage (Toggle Format)

| Toggle | Correct State | Why |
|---|---|---|
| Global Trail Logging | **ON** | Enables CloudTrail to log write activity globally across all regions, capturing unauthorized global deployments. |
| VPC Flow Logs | **ON** | Captures IP traffic details flowing in and out of network interfaces in the production VPC. |
| Verbose Debug Logs | **OFF** | Verbose debugging dumps raw payload structures and database tokens to logs — inflates storage costs and risks logging sensitive data. |
| Key Vault Encrypted Logs | **ON** | Encrypts the log storage bucket using Customer Managed Keys (CMK) and restricts access via policy. |
| Auto-Purge Logs After 14 Days | **OFF** | Automatically deleting all security event logs after two weeks violates compliance standards and ruins incident forensic capabilities. |

---

### Game 3: Log Tamper Prevention (Scenario MCQ)

---

**Q1.** An administrative user account is compromised. The attacker attempts to delete the primary cloud audit trail log files (S3/Blob) to cover their tracks. What control prevents this?

- **Option 1:** Enable S3 Object Lock / WORM storage in Compliance Mode on the log destination bucket.
- **Option 2:** Configure a daily cron job to copy log files to another folder in the same bucket.
- **Option 3:** E-mail administrators when a file is deleted from the storage account.

> ✅ **Correct: Option 1** — Object Lock in compliance mode enforces WORM (Write Once, Read Many) rules, preventing file deletion even by the root account for a set retention window.

---

**Q2.** An attacker gains root access on a virtual machine and modifies local syslog files to remove records of their SSH login session. How do we preserve the integrity of host OS logs?

- **Option 1:** Configure real-time log forwarding to write log events immediately to an external, write-only central repository.
- **Option 2:** Set local log files to read-only using guest OS permissions.
- **Option 3:** Run a host script to encrypt local syslog files using a key stored on the server.

> ✅ **Correct: Option 1** — Forwarding logs to a central server in real-time ensures that records are preserved off-system before an attacker can modify them locally.

---

**Q3.** We need to verify that our log archive files have not been modified or corrupted by administrators between the time they were written and the audit date. Which cryptographic control validates log file integrity?

- **Option 1:** Enable Log File Validation (cryptographic digest hashing) on the cloud trail settings.
- **Option 2:** Manually check the file modification times on the storage dashboard.
- **Option 3:** Enforce a policy requiring two administrators to view the log folders.

> ✅ **Correct: Option 1** — Log File Validation creates cryptographic hashes and signatures for log packages, allowing automatic verification of log authenticity.

---

**Q4.** An auditor notes that our security log storage bucket has no network restriction, allowing anyone with the storage credentials to read audit records over the internet. What is the best way to secure this?

- **Option 1:** Enforce storage bucket policies restricting access to designated VPC endpoints and KMS key owners.
- **Option 2:** Change the names of the log folders to randomized characters.
- **Option 3:** Zip the log files and password-protect the archive files using a shared password.

> ✅ **Correct: Option 1** — Restricting bucket policies to private network endpoints limits exposure to authorized internal services.

---

**Q5.** Log storage costs are scaling fast because application servers are logging all database operations in plaintext. How should we adjust log collection boundaries?

- **Option 1:** Implement a lifecycle policy to compress and transition logs to cold storage tiers, and filter out low-value debugging lines.
- **Option 2:** Disable all application logs and rely only on network flow logs.
- **Option 3:** Delete old log files manually once the storage bucket hits 10 Terabytes.

> ✅ **Correct: Option 1** — Log lifecycle policies and targeted log level filtering optimize costs while preserving security audit paths.

---
---

## Module 6: Application & API Security

### Game 1: OWASP Top 10 Protections (Card Swiper)

Classify each application design choice as **Secure** or **Vulnerable**:

| Scenario | Classification | Explanation |
|---|---|---|
| Login backend uses string concatenation to build SQL queries from raw user input | **Vulnerable** | String concatenation of raw input into SQL enables SQL Injection, allowing bypass of authentication. Use parameterized queries. |
| API gateway endpoint validates incoming customer IDs using strict integer regex matching | **Secure** | Input sanitization and schema checking prevent malicious payloads from reaching application logic. |
| Database connection string declared in `config.json` in a public GitHub repository | **Vulnerable** | Hardcoding secrets in source files exposes credentials to public scanning bots. Use secrets managers. |
| Authentication endpoint restricts clients to a maximum of 5 login attempts per username every 15 minutes | **Secure** | Rate-limiting login endpoints blocks brute-force automation attacks while protecting user identities. |
| User passwords are hashed using MD5 with no salt, stored in a flat file on the application server | **Vulnerable** | MD5 has been cryptographically broken. Passwords must be hashed using strong, salted algorithms (e.g. bcrypt or Argon2). |

---

### Game 2: API Gateway Defenses (Toggle Format)

| Toggle | Correct State | Why |
|---|---|---|
| Restrict CORS Origin | **ON** | Restricts CORS to specific trusted domain origins, blocking wildcard access (*) and preventing cross-origin data leakage. |
| Client Rate-Limiting | **ON** | Limits API queries from single client IPs to a maximum of 200 requests per minute to prevent resource starvation. |
| Enforce JWT Verification | **ON** | Verifies signature and claims of incoming OAuth bearer tokens before forwarding calls to microservices. |
| JSON Schema Validation | **ON** | Audits API payloads against strict format rules, rejecting queries with unmapped parameter fields. |
| Allow Direct Microservice IPs | **OFF** | Allowing clients to bypass the gateway and query microservice IPs directly bypasses all security, logging, and rate-limiting controls. |

---

### Game 3: WAF Rules Configuration (Scenario MCQ)

---

**Q1.** An HTTP request directed at a search API contains the parameter `?query=<script>document.cookie=...</script>`, attempting to steal session cookies. Which WAF rule blocks this vulnerability?

- **Option 1:** Enable OWASP Core Rule Set (CRS) script and Cross-Site Scripting (XSS) filters.
- **Option 2:** Apply a rate-limiting rule to limit request volume to 100 per minute.
- **Option 3:** Enable geographic IP blocklists for non-local traffic origins.

> ✅ **Correct: Option 1** — XSS filters scan incoming payloads for HTML tags and script elements, blocking script execution.

---

**Q2.** An automated botnet is launching a slow HTTP header attack (Slowloris), keeping connections open and exhausting web server memory pools. What WAF or gateway control mitigates this attack?

- **Option 1:** Configure connection timeout limits and request rate-limiting metrics.
- **Option 2:** Add a SQL Injection block rule targeting incoming form fields.
- **Option 3:** Enforce multi-factor authentication for all incoming HTTP connection paths.

> ✅ **Correct: Option 1** — Slowloris exploits are mitigated by setting low connection timeout boundaries and limiting TCP connection counts per source IP.

---

**Q3.** Attackers are trying to query administrative URLs like `/admin/config.php` and `/manager/html` on the public web application. How do we restrict access to these paths in the WAF?

- **Option 1:** Configure a path-matching URI rule that blocks public access to admin routes, allowing only local IP ranges.
- **Option 2:** Run a script to rename the administrative directories on the host OS every hour.
- **Option 3:** Apply SSL certificates to encrypt traffic directed at administrative paths.

> ✅ **Correct: Option 1** — URI path-matching filters block public traffic directed at sensitive subfolders before it reaches web root directories.

---

**Q4.** Incoming logs reveal that competitive bots are scraping pricing databases by systematically querying every product ID thousands of times. Which WAF rule mitigates database scraping?

- **Option 1:** Enable WAF Bot Control with challenge challenges (CAPTCHA / JavaScript validation).
- **Option 2:** Encrypt all product ID strings using AES-256 keys.
- **Option 3:** Rotate the SSL certificates on the load balancer.

> ✅ **Correct: Option 1** — Bot control models identify scrapers based on query patterns and user-agent details, challenging bots while allowing real customers access.

---

**Q5.** A high-priority vulnerability is announced for a web framework we use. A patch is not yet deployed, but attackers are actively scanning for the exploit payload. What is the best immediate virtual patching method?

- **Option 1:** Write a custom WAF signature targeting the unique exploit payload pattern to block requests.
- **Option 2:** Shut down the web servers until security teams can deploy the patch manually.
- **Option 3:** Set the web application database to read-only state.

> ✅ **Correct: Option 1** — Virtual patching via WAF blocks specific exploit signatures, protecting systems before official software patches are applied.

---
---

## Module 7: Secure DevOps

### Game 1: CI/CD Pipeline Scanning Gates (Chronological Sorting)

Arrange the stages in this exact order (1 = first, 5 = last):

1. Developer pushes new code changes, initiating the automated pipeline execution.
2. The scanner inspects the raw source files for security weaknesses and hardcoded patterns **(SAST — Static Application Security Testing)**.
3. The composition analyzer audits third-party library dependencies for known vulnerabilities **(SCA — Software Composition Analysis)**.
4. The configuration linter checks infrastructure templates for security settings before deployment **(IaC Scanning)**.
5. The automated testing tool executes dynamic web security scans on the running interface **(DAST — Dynamic Application Security Testing)**.

---

### Game 2: IaC Configuration Audits (Card Swiper)

Classify each Infrastructure as Code (IaC) configuration as **Secure** or **Vulnerable**:

| IaC Scenario | Classification | Explanation |
|---|---|---|
| Terraform security group: SSH port 22 open to `0.0.0.0/0` (entire internet) | **Vulnerable** | Opening port 22 to the internet allows brute-force attacks and scans to reach the host boundary. Restrict to specific admin IPs. |
| AWS S3 resource declared with `acl = 'private'` | **Secure** | Setting access controls to private blocks public reads, preserving data boundary limits. |
| Terraform variables file defines master database password: `default = 'Admin123!'` | **Vulnerable** | Hardcoding passwords in variable files exposes credentials to anyone with access to the codebase. Use Vault references. |
| Load balancer listener configured to redirect all port 80 (HTTP) traffic to port 443 (HTTPS) | **Secure** | Enforcing HTTPS redirection ensures that connection streams are encrypted, protecting credentials and data in flight. |
| CloudTrail provisioned with `is_multi_region_trail = false` | **Vulnerable** | Single-region trails fail to log write actions in unmonitored regions, allowing attackers to spin up resources unnoticed. |

---

### Game 3: Secret Leakage Remediation (Scenario MCQ)

---

**Q1.** An AWS access key string is committed to a public GitHub repository. Security teams identify the leak within minutes of push. What is the first remediation step?

- **Option 1:** Deactivate the leaked key immediately in the AWS identity portal.
- **Option 2:** E-mail the developer to change their password and delete the key from their local laptop.
- **Option 3:** Delete the file from GitHub using the web browser editor.

> ✅ **Correct: Option 1** — Leaked credentials must be revoked immediately in the cloud system. Deleting the file on GitHub does not prevent historical commits from being scanned.

---

**Q2.** An API password was committed to a repository's git history 6 months ago. The file has been updated, but the credential is still visible in git logs. How do we remove the credential from repository history?

- **Option 1:** Use tools like `git-filter-repo` to completely scrub the credential from all branches and commit records.
- **Option 2:** Create a new file in the repository claiming that the password is now obsolete.
- **Option 3:** Delete the repository and start writing the application code from scratch.

> ✅ **Correct: Option 1** — Git history tools like `git-filter-repo` rewrite commit chains to completely remove secret patterns from the repository data.

---

**Q3.** A developer needs to reference a database password inside an automated deployment container in the pipeline. What is the secure way to supply the credential without exposing it in the pipeline definition files?

- **Option 1:** Retrieve the password dynamically during pipeline execution from a Key Vault or KMS using environment variables.
- **Option 2:** Write the database password in a text file and save it in the build directory.
- **Option 3:** Encode the password string in base64 and declare it as a plain variable inside the build script.

> ✅ **Correct: Option 1** — Secrets vaults resolve credential exposure by fetching secret strings dynamically during runtime and injecting them as environment variables.

---

**Q4.** We need to ensure that developers cannot commit code containing raw secret patterns or access key strings to company repositories. What control prevents secret pushes proactively?

- **Option 1:** Install pre-commit hooks (like Git Secrets or Gitleaks) to scan files locally before commits are allowed.
- **Option 2:** Instruct team leads to manually review all lines of code changes before every commit.
- **Option 3:** Block developers from committing code during off-hours.

> ✅ **Correct: Option 1** — Pre-commit scanning hooks audit files locally, stopping the commit process if secret patterns are detected.

---

**Q5.** A third-party library we use in our pipeline is found to contain a high-severity backdoor. The pipeline is currently deploying code to production. How do we handle the pipeline gate response?

- **Option 1:** Fail the pipeline scan gate immediately, block the release, and fall back to the last secure release container.
- **Option 2:** Let the pipeline complete the deployment and schedule an investigation for next month.
- **Option 3:** Exempt the library from scanning checks to let the build finish.

> ✅ **Correct: Option 1** — Pipeline gates block compromised container updates, and reverting to the last secure release maintains stability.
