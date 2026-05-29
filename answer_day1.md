# Day 1 Curriculum: Cloud Security & Identity Presentation Activity Answers

This document contains the correct answers, configuration states, and technical explanations for all activities in the Day 1 Cloud Security and Identity simulation.

---

## Module 1: Cloud Computing & Shared Responsibility

### Game 1: IaaS Infrastructure Security (Scenario Format)

#### 1. Who is responsible for patching the Guest Operating System in an Infrastructure as a Service (IaaS) model?
* **Correct Answer:** Customer IT Security Team - We deploy and manage the virtual machines, so Guest OS configuration, maintenance, and patching are our duty.
* **Technical Explanation:** Under IaaS, the cloud provider secures the physical infrastructure, hypervisor, and hardware virtualization layer. The customer is completely responsible for the Guest OS, applications installed on it, and network firewall rules inside the VM.

#### 2. Who is responsible for configuring firewall security groups and access ports in IaaS?
* **Correct Answer:** Customer IT Security Team - Configuring inbound/outbound firewall rules (security groups) is a customer responsibility.
* **Technical Explanation:** Firewall rules, network access lists, and virtual network security groups are customer-configured items in IaaS. The provider grants the tools, but the customer must define the access constraints.

#### 3. Who is responsible for enabling encryption and managing key rotations for raw cloud storage volumes?
* **Correct Answer:** Customer IT Security Team - Data security and encryption settings for customer files are owned by us.
* **Technical Explanation:** In IaaS, the customer owns their data. While the provider offers encryption mechanisms (like KMS APIs), enabling encryption at rest, managing key rotation schedules, and defining access policies are customer duties.

#### 4. Who is responsible for mitigating physical network infrastructure attacks and hardware outages?
* **Correct Answer:** Cloud Provider - They own and manage the physical routers, switches, and internet gateways.
* **Technical Explanation:** Physical security, cooling, power, and physical network lines (routing, switching, and fiber infrastructure) are the sole responsibility of the cloud provider.

#### 5. Who is responsible for tenant isolation and hypervisor security in cloud computing?
* **Correct Answer:** Cloud Provider - They must guarantee isolation between different customers sharing the same physical hardware.
* **Technical Explanation:** Tenant isolation and securing the virtualization layer (hypervisor) is the core security commitment of a public cloud provider. A breakout represents a failure in the provider's infrastructure security boundary.

---

### Game 2: PaaS Configuration Dashboard (Toggle Format)

To pass the audit, configure the controls as follows:

* **Enforce HTTPS Redirection:** **ON (True)**
  * *Technical Explanation:* HTTPS redirection guarantees that all traffic is encrypted in transit. Disabling it leaves session cookies vulnerable to intercept.
* **Restrict CORS to Trusted Domains:** **ON (True)**
  * *Technical Explanation:* Wildcard CORS headers (*) allow any external site to read app responses. Restricting CORS prevents Cross-Origin data leakage and enforces cross-origin boundaries.
* **Enable Secrets Vault Bindings:** **ON (True)**
  * *Technical Explanation:* Storing secrets in configuration files risks exposure in source control. Vault references secure the database keys and support rotation.
* **Disable Basic Authentication Protocols:** **ON (True)**
  * *Technical Explanation:* Basic Authentication protocols do not support interactive MFA challenges and are easily targeted in credential stuffing attacks. Enforce modern OAuth2 token validation.
* **Enable API Rate Limiting:** **ON (True)**
  * *Technical Explanation:* Without rate limiting, public API endpoints can be flooded with requests, exhausting server resources and causing downtime. Enforce request limits per client IP (e.g., 100/minute).

---

### Game 3: SaaS Access Governance (Scenario Format)

#### 1. Who is responsible for identity lifecycle management (onboarding, offboarding, and auditing access) in a SaaS model?
* **Correct Answer:** Customer IT Security Team - We own access governance, user account management, and offboarding workflows.
* **Technical Explanation:** In Software as a Service (SaaS), you do not manage infrastructure or application code, but you ALWAYS own access management: user accounts, group memberships, and role assignments are the customer's duty.

#### 2. Who is responsible for configuring data sharing options and information security policies within a SaaS application?
* **Correct Answer:** Customer IT Security Team - We are responsible for setting sharing restrictions, file classifications, and DLP policies.
* **Technical Explanation:** Even in SaaS, the provider only hosts the data and configuration panels. The customer is responsible for defining who can access what, enabling data loss prevention (DLP), and setting document classification rules.

#### 3. Who is responsible for fixing software vulnerabilities and database isolation bugs in a SaaS application?
* **Correct Answer:** SaaS Vendor - They own, update, patch, and secure the software code, infrastructure, and databases.
* **Technical Explanation:** In SaaS, the vendor provides the software as a complete service. The customer has no access to the application source code or backend databases. Therefore, security patching, bug fixing, and backend configurations belong entirely to the SaaS vendor.

#### 4. Who is responsible for enabling and enforcing MFA policies for users of a SaaS platform?
* **Correct Answer:** Customer IT Security Team - The vendor provides the MFA settings, but the customer must enable and enforce them.
* **Technical Explanation:** While the SaaS vendor must build secure authentication features (like MFA, SAML SSO integration, and IP gating), it is the customer's responsibility to configure, enable, and enforce these security features for their users.

#### 5. Who is responsible for physical security (guards, CCTV, locks, cages) of the SaaS servers?
* **Correct Answer:** SaaS Vendor / Cloud Host - They are responsible for the physical security of their data center facilities.
* **Technical Explanation:** Physical security of the server facility, backup storage units, cooling pipelines, and power supplies is always the responsibility of the cloud provider/vendor hosting the software infrastructure.

---

### Game 4: Shared Responsibility Matrix (Drag & Drop Format)

Organize the security duties into the correct column:

| Customer Responsibility | Provider Responsibility |
| :--- | :--- |
| **Patching Guest Operating System (in IaaS VMs)**<br>*Why:* The customer deploys the VM OS, and is fully responsible for patching and configuring it. | **Physical Datacenter Security (Guards, Cages, CCTV)**<br>*Why:* The cloud host secures the physical infrastructure, facility access, cooling, and power lines. |
| **Data Classification & Content Compliance**<br>*Why:* Regardless of the cloud model (IaaS, PaaS, SaaS), the customer always owns their own data and compliance. | **Safe Destruction of Decommissioned Hard Drives**<br>*Why:* Physical media lifecycle management and shredding is handled by the cloud provider's operations team. |
| **Configuring Network Security Groups & Port Rules**<br>*Why:* Setting rules to block or allow access (e.g. closing SSH/RDP ports) is managed by customer administrators. | **Securing the Hypervisor & Server Virtualization Layer**<br>*Why:* The provider is responsible for ensuring secure tenant isolation at the hypervisor level. |

---

### Game 5: Hybrid Cloud Connectivity (Scenario Format)

#### 1. Who is responsible for configuration and maintenance of local on-premises network appliances in a hybrid cloud?
* **Correct Answer:** Customer IT Security Team - Managing, patching, and configuring on-premises hardware is our responsibility.
* **Technical Explanation:** In a hybrid cloud model, the customer is fully responsible for all on-premises hardware, local routing, VPN client setups, and configurations of local boundary firewalls.

#### 2. Who is responsible for configuring and monitoring hybrid directory synchronization tools?
* **Correct Answer:** Customer IT Security Team - Synchronizing local user databases and managing active sync agents is the customer's responsibility.
* **Technical Explanation:** Directory sync tools (like Azure AD Connect or Okta Directory Sync agents) are deployed and managed by the customer. Ensuring correct routing, credential synchronization, and synchronization agent updates is your duty.

#### 3. Who coordinates the physical repair and restoration of dedicated high-speed cloud trunk lines?
* **Correct Answer:** Cloud Provider / Telecommunication Carrier - The provider manages network trunks and physical links up to the edge of their facility.
* **Technical Explanation:** Physical trunk line connections, carrier agreements, and provider-side edge routers are managed by the cloud host or their authorized network carrier. The customer's responsibility stops at their own endpoint router.

#### 4. Who is responsible for setting API rate limiting and traffic management rules on a hybrid API gateway?
* **Correct Answer:** Customer IT Security Team - We must configure security profiles, rate ceilings, and request filters.
* **Technical Explanation:** Gateway security, rate limits, CORS configurations, and authorization headers are application-security attributes configured and managed by the customer.

#### 5. Who is responsible for server hardware maintenance and parts replacement for local hybrid nodes?
* **Correct Answer:** Customer IT Security Team - We own the local physical infrastructure, so hardware repairs and data center cooling are our responsibility.
* **Technical Explanation:** In hybrid setups, the public cloud provider's SLA only covers cloud resources. On-premises server rooms, hardware procurement, disk swaps, cooling, and electrical grounding are entirely managed by the customer.

---
---

## Module 2: Identity Security & Zero Trust

### Game 1: Authentication vs Authorization (Drag & Drop Format)

Classify the security actions into their correct identity boundary:

| Authentication (AuthN)<br>*(Verifying WHO you are)* | Authorization (AuthZ)<br>*(Verifying WHAT you can do)* |
| :--- | :--- |
| **Validating a user's password and login ID**<br>*Why:* Checking login credentials verifies the identity of the user. | **Checking if a user belongs to the 'Global Admins' group**<br>*Why:* Group memberships determine what operations a user has permissions to run. |
| **Verifying an offline TOTP code from an authenticator app**<br>*Why:* MFA is an extra verification check of the user's identity. | **Restricting API access using OAuth scopes like 'read:billing'**<br>*Why:* OAuth scopes define access limits to resources. |
| **Scanning a user's fingerprint on a biometric reader**<br>*Why:* Biometrics check physical identity attributes to verify who the user is. | **Limiting server write access to on-duty hours (ABAC context)**<br>*Why:* Enforcing environmental access parameters controls what actions are authorized in real-time. |

---

### Game 2: Multi-Factor Authentication Checkpoint (Card Swiper Format)

Classify each event card:

* **Scenario Card 1 (SMS Support OTP):** **Vulnerable**
  * *Exploit:* Phished SMS OTP attack. SMS codes are not phishing-resistant and should never be shared with anyone.
* **Scenario Card 2 (FIDO2 WebAuthn Key):** **Secure**
  * *Defense:* FIDO2 security keys use public-key origin-bound cryptography, making them immune to standard credential phishing and SIM-swapping.
* **Scenario Card 3 (Push Notification Fatigue):** **Vulnerable**
  * *Exploit:* MFA Push Fatigue exploit. Without settings like 'Number Matching', administrators can be easily tricked into approving rogue logins.
* **Scenario Card 4 (Offline TOTP Generator):** **Secure**
  * *Defense:* TOTP codes are generated locally and require no internet/network connectivity to function, eliminating cellular interception risks.
* **Scenario Card 5 (Legacy SMTP Basic Auth):** **Vulnerable**
  * *Exploit:* Legacy basic authentication protocols do not support interactive MFA challenges, making them major targets for automated credential stuffing.

---

### Game 3: PAM Just-In-Time Elevation (Chronological Sorting Format)

Arrange the steps of a Just-In-Time (JIT) privileged access elevation workflow in chronological order (top to bottom):

1. **User requests temporary administrative access in the PAM portal, stating a clear business justification.**
   * *Why:* The JIT workflow begins when a user submits an elevation request stating a valid business justification.
2. **A security manager or designated data owner reviews the request and grants approval for a specific time window.**
   * *Why:* Following submission, the request must be approved by an authorized manager or automated compliance gateway.
3. **The PAM system issues a temporary security token and injects the credentials directly into the target session.**
   * *Why:* Upon approval, the system provisions access. Secrets are injected directly, preventing the user from seeing cleartext passwords.
4. **User performs maintenance actions while the PAM gateway records all commands and keystrokes for audits.**
   * *Why:* During the elevated session, the PAM system monitors and logs terminal commands for accountability.
5. **The time lease expires, the token is revoked, and administrative privileges are automatically stripped.**
   * *Why:* Once the time limit ends, privileges are automatically terminated, ensuring zero standing administrative access.

---

### Game 4: Zero Trust Architecture (Scenario Format)

#### 1. If we secured our corporate network perimeter with firewalls, why do we need to encrypt and authenticate network traffic between servers in our internal data center?
* **Correct Answer:** Assume Breach - Treat the internal network as hostile and encrypt/verify all traffic.
* **Technical Explanation:** Zero Trust rejects the old model of 'trusted internal networks' (castle-and-moat). By assuming breach, you treat all networks as untrusted, requiring all communications to be encrypted, authenticated, and authorized.

#### 2. What network security technique restricts lateral traffic by segmenting workloads into small, isolated security zones?
* **Correct Answer:** Microsegmentation - Using granular security policies to isolate workloads from one another.
* **Technical Explanation:** Microsegmentation divides networks into distinct security zones down to individual workload levels. This prevents attackers from moving laterally (sideways) within the network if they compromise a single node.

#### 3. Which Zero Trust evaluation signal is most likely causing the access denial despite valid credentials and MFA?
* **Correct Answer:** Explicit Verification of device state, compliance, location, and risk context.
* **Technical Explanation:** Zero Trust mandates that all access requests are explicitly verified against multiple real-time context metrics, including device health, location, network security posture, and data classification, rather than just credentials.

#### 4. What technology evaluates the health and compliance of an endpoint device prior to granting access?
* **Correct Answer:** Device Health Attestation / Endpoint Compliance Policy.
* **Technical Explanation:** Endpoint compliance systems inspect the requesting device's security configuration (antivirus active, patches current, disk encrypted) to verify the device meets security standards before authorizing connections.

#### 5. Which Zero Trust concept is illustrated by this automatic session termination?
* **Correct Answer:** Continuous Risk Assessment and Session Authorization.
* **Technical Explanation:** Zero Trust is not a one-time check at login. Access must be continuously authorized and monitored. If user risk scores spike or anomalous behavior is detected, the security engine dynamically revokes session access.

---

### Game 5: Identity Governance & Compliance (Scenario Format)

#### 1. What identity governance process requires managers to regularly review and justify employee access rights?
* **Correct Answer:** Attestation / Access Certification Reviews - Regular audits where managers must justify and re-approve user access.
* **Technical Explanation:** Access certification reviews force managers or data owners to audit active user rights periodically. Access that is no longer required is revoked, preventing permissions accumulation and orphaned accounts.

#### 2. Which stage of Identity Lifecycle Management failed in this transition?
* **Correct Answer:** Access Mutation / Role Lifecycle Transition.
* **Technical Explanation:** The 'Joiner-Mover-Leaver' (JML) framework governs user lifecycle states. When a mover changes roles, old permissions must be stripped ('Mover access remediation') to align with their new least privilege profile.

#### 3. What core internal control principle prevents users from executing conflicting sensitive actions?
* **Correct Answer:** Segregation of Duties (SoD) - Splitting key roles so no single identity can perform fraud unchecked.
* **Technical Explanation:** Segregation of Duties (SoD) prevents fraud by dividing critical tasks between multiple users. A single user must not have enough privileges to initiate, authorize, and complete a financial transaction alone.

#### 4. What is the best way to prevent orphan accounts in cloud identity systems?
* **Correct Answer:** HR-Driven Provisioning - Automating account lifecycle triggers (creation, suspension) directly from HR database events.
* **Technical Explanation:** HR-driven provisioning coordinates active directory states directly with HR records. When HR changes an employee status to 'terminated', the synchronization system automatically disables all associated identity accounts.

#### 5. How should security logs be archived to ensure their integrity and compliance with audits?
* **Correct Answer:** Shipping logs immediately to a centralized, immutable storage repository (Write-Once-Read-Many / WORM) separated from database administration rights.
* **Technical Explanation:** Security logs must be centralized, isolated, and immutable. Shipping logs to WORM storage ensures they cannot be altered or deleted, even if an attacker gains local root access to the database server.

---
---

## Module 3: Network Security: Secure Network Design

### Game 1: VPC & VNet Segmentations (Scenario Format)

#### 1. What network segmentation strategy should be applied to isolate the database tier from direct external access?
* **Correct Answer:** Public-Private Subnet Split - Deploy databases in a private subnet with no public route, using virtual network boundary rules to restrict ingress to the web tier.
* **Technical Explanation:** Private subnets do not associate with internet gateways. By separating web and database tiers into public and private subnets, you enforce physical routing boundaries.

#### 2. What is the best cloud network topology to connect these VPCs while retaining central control?
* **Correct Answer:** Transit Gateway (TGW) Hub - Deploy a centralized cloud router to coordinate routing tables and transit traffic between spoke networks securely.
* **Technical Explanation:** A Transit Gateway acts as a cloud router, simplifying network architecture from peer-to-peer links to a clean hub-and-spoke model.

#### 3. What is the secure alternative to granting temporary remote administration access to private subnets?
* **Correct Answer:** Bastion Host / Identity-Aware Proxy (IAP) - Route admin traffic through a hardened tunnel gateway that enforces strict identity-based access control.
* **Technical Explanation:** Bastion hosts or Identity-Aware Proxies provide a single, audited checkpoint, avoiding direct public exposure of private assets.

#### 4. Which technology establishes a private connection between your virtual network and provider services?
* **Correct Answer:** Private Service Endpoint / Private Link - Inject a private network interface into the VPC to route service traffic entirely inside the cloud network.
* **Technical Explanation:** Endpoints route traffic over the provider's internal fabric, avoiding public DNS/internet routing entirely.

#### 5. What native cloud network auditing feature captures IP traffic logs going to and from network interfaces?
* **Correct Answer:** VPC Flow Logs - Capture and analyze metadata records of network sessions at network interfaces.
* **Technical Explanation:** VPC Flow logs capture packet headers at the infrastructure level (NIC), ensuring logs cannot be tampered with by guest OS users.

---

### Game 2: NSG vs WAF Rules Mapping (Drag & Drop Format)

Classify the firewall functions into Network Security Groups (Layers 3/4) vs Web Application Firewalls (Layer 7):

| Network Security Group (NSG/SG)<br>*(Layer 3/4 Filtering)* | Web Application Firewall (WAF)<br>*(Layer 7 Inspecting)* |
| :--- | :--- |
| **Blocking inbound traffic from a specific malicious IP range (e.g. 198.51.100.0/24)**<br>*Why:* IP address blocking operates at the packet header layer (Layer 3). | **Blocking SQL Injection (SQLi) attacks inside HTTP POST parameters**<br>*Why:* SQLi checks require decoding and inspecting application-layer HTTP body payloads (Layer 7). |
| **Filtering traffic on TCP Port 22 (SSH) and Port 3389 (RDP)**<br>*Why:* Port-level restrictions drop traffic at Layer 4 before reaching application hosts. | **Inspecting HTTP headers for Cross-Site Scripting (XSS) script injections**<br>*Why:* XSS prevention audits HTTP request headers and URL strings for malicious JavaScript. |
| **Applying stateless port-level access rules at the virtual subnet layer**<br>*Why:* Subnet access lists evaluate Layer 3/4 headers statelessly (standard ACLs). | **Applying geographic IP rate limiting (Geo-blocking) to HTTP/HTTPS requests**<br>*Why:* Geo-blocking and rate limiting on web requests inspect Layer 7 HTTP request headers. |

---

### Game 3: WAF Rules Configuration (Toggle Format)

Configure the WAF variables as follows:

* **SQL Injection Protection Rules:** **ON (True)**
  * *Technical Explanation:* SQLi rules inspect inputs for drop, union, or select commands, neutralizing database hijacking threats.
* **Cross-Site Scripting (XSS) Rules:** **ON (True)**
  * *Technical Explanation:* XSS rules prevent malicious scripts from being injected into the web application and executed on users' browsers.
* **OWASP Core Rule Set (CRS):** **ON (True)**
  * *Technical Explanation:* The OWASP Core Rule Set shields applications against broad threat classes like session hijacking and protocol anomalies.
* **Geographic IP Restrictions:** **OFF (False)**
  * *Technical Explanation:* Geo-blocking should NOT be enabled here — your SaaS product serves global customers. Enabling it would block legitimate users from valid regions. Only apply geo-blocking when your service has known regional restrictions.
* **Enforce Bot Control Limits:** **ON (True)**
  * *Technical Explanation:* Bot control mitigates credential-stuffing and scraping attempts, protecting server compute limits from overload.

---

### Game 4: DDoS Mitigation & Edge Defenses (Scenario Format)

#### 1. What layer of security handles physical volumetric DDoS mitigation?
* **Correct Answer:** Cloud Infrastructure Shield - Deploying automated scrubbing centers at cloud network boundaries to absorb multi-gigabit traffic.
* **Technical Explanation:** Volumetric DDoS attacks must be mitigated at the cloud provider's ingress scrubbing centers before they reach virtual subnets.

#### 2. Which technology mitigates HTTP Application-layer (Layer 7) DDoS attacks?
* **Correct Answer:** WAF Rate Limiting / CDN Ingress - Enforcing request limits per client IP at the Edge Content Delivery Network (CDN).
* **Technical Explanation:** Layer 7 DDoS attacks are mitigated by rate limiting HTTP headers at edge caching nodes (CDNs) before they overload origin servers.

#### 3. What is the network design best practice to protect cloud origins from direct IP attacks?
* **Correct Answer:** IP Obfuscation / CDN Origin Shield - Route all public traffic through Content Delivery networks and restrict origin firewalls to accept only CDN IPs.
* **Technical Explanation:** Restricting origin security groups to CDN-only IP ranges prevents attackers from bypassing edge controls and attacking origin servers directly.

#### 4. What TCP/IP mechanism should be active to mitigate SYN flood attacks at the network layer?
* **Correct Answer:** SYN Cookies / Provider SYN proxying - Handshaking connection requests at the cloud edge before forwarding verified TCP connections to origin.
* **Technical Explanation:** SYN proxying validates connection integrity before initiating server-side handshakes, preventing connection table exhaustion.

#### 5. What is the best cost mitigation strategy during sustained DDoS attacks?
* **Correct Answer:** DDoS Cost Protection / SLA Reimbursement - Enroll in cloud DDoS protection plans that credit back auto-scaling costs caused by verified attacks.
* **Technical Explanation:** Cloud providers offering advanced DDoS protection guarantee cost billing protection, shielding enterprises from scaling cost surges.

---
---

## Module 4: Data Security: Protection & Encryption

### Game 1: At Rest vs In Transit Encryption (Drag & Drop Format)

Classify the cryptographic controls:

| Encryption At Rest<br>*(Securing stored data)* | Encryption In Transit<br>*(Securing active traffic)* |
| :--- | :--- |
| **Enabling BitLocker or Cloud Managed Volume Encryption on VM disks**<br>*Why:* Disk volume encryption secures stored bits on physical hardware blocks. | **Enforcing TLS 1.3 cryptographic tunnels for HTTP connections**<br>*Why:* TLS 1.3 encrypts active network connections in flight. |
| **Encrypting Cloud Storage buckets using KMS-managed root keys**<br>*Why:* Object storage bucket policies encrypt files when saved, ensuring protection at rest. | **Securing site-to-site VPN tunnels using IPsec network protocols**<br>*Why:* IPsec tunnels encrypt packet payloads while crossing public router boundaries. |
| **Transparent Data Encryption (TDE) configured on SQL Database servers**<br>*Why:* TDE encrypts database pages, backup files, and transaction logs when written to disk. | **Encrypting API payloads via HTTPS using SSL certificates**<br>*Why:* HTTPS encrypts API payloads between clients and API gateways. |

---

### Game 2: In-Use & Confidential Computing (Scenario Format)

#### 1. What technology isolates data in RAM during processing to prevent administrative snooping?
* **Correct Answer:** Confidential Computing / Secure Enclaves - Hardware-based memory encryption that isolates virtual workloads from hypervisors and host root administrators.
* **Technical Explanation:** Confidential computing encrypts RAM at the hardware level, protecting data in use even from privileged host OS administrators.

#### 2. What emerging cryptographic technique permits processing of encrypted ciphertexts without ever decrypting them?
* **Correct Answer:** Homomorphic Encryption - Perform mathematical operations directly on encrypted data, yielding an encrypted result that only the customer can decrypt.
* **Technical Explanation:** Homomorphic encryption allows analytical models to compute values on encrypted inputs, ensuring zero plaintext exposure in cloud RAM.

#### 3. What process validates the integrity of a secure enclave workload prior to sending sensitive data?
* **Correct Answer:** Attestation / Cryptographic Verification - The hardware enclave generates a signed token verifying its configuration and authenticity.
* **Technical Explanation:** Remote attestation uses public-key cryptography to prove that an enclave is genuine, untampered, and running on compliant hardware.

#### 4. What CPU-level hardware-isolated container isolates keys during memory execution?
* **Correct Answer:** Hardware Security Enclave (e.g. Intel SGX / AMD SEV) - Dedicated processor compartments that shield critical code blocks from external inspection.
* **Technical Explanation:** Secure enclaves isolate memory pages at the hardware level, blocking access from host operating systems, hypervisors, and local root accounts.

#### 5. What hardware feature mitigates physical bus probing and memory interception attacks on RAM chips?
* **Correct Answer:** Hardware Memory Encryption (TME/MKTME) - Real-time cryptographic encryption of data moving between the CPU and external RAM DIMMs.
* **Technical Explanation:** Total Memory Encryption (TME) encrypts RAM contents using key material generated inside the CPU, rendering bus probes useless.

---

### Game 3: KMS Key Rotation Workflow (Chronological Sorting Format)

Arrange the steps of a Key Management Service (KMS) manual key rotation in chronological order (top to bottom):

1. **Create a new Key Version (cryptographic material) inside the Key Vault / KMS portal.**
   * *Why:* The rotation begins by generating fresh key material inside the HSM cluster.
2. **Update the KMS Key Alias to reference the new key version for all new encryption requests.**
   * *Why:* Updating the alias redirects all subsequent encryption calls to the new key without breaking application configuration references.
3. **Encrypt all newly created database records using the updated active key reference.**
   * *Why:* New application write operations utilize the newly referenced version transparently.
4. **Retain the old key version in active read-only state to decrypt legacy database records.**
   * *Why:* Legacy keys must be preserved to decrypt historical rows that have not yet been rewritten.
5. **Deprecate and archive the legacy key version once all old records have been re-encrypted.**
   * *Why:* Once background jobs re-encrypt all historical data, the legacy key material can be safely archived.

---

### Game 4: Key Vault & HSM Strategies (Scenario Format)

#### 1. Which key management strategy should be implemented to maintain complete ownership over our database encryption keys, including the ability to instantly revoke cloud database access without provider consent?
* **Correct Answer:** Customer Managed Keys (CMK) / Bring Your Own Key (BYOK) - The customer generates and controls the root key, granting storage access via KMS IAM policies.
* **Technical Explanation:** CMKs put key governance in the customer's control. Disabling the CMK instantly cuts off the database from the decrypted storage without provider intervention.

#### 2. What design pattern resolves database row-level encryption latency?
* **Correct Answer:** Envelope Encryption - Request a master key from KMS, generate local Data Encryption Keys (DEKs) to encrypt data locally, and store the encrypted DEK alongside the data.
* **Technical Explanation:** Envelope encryption uses local DEKs for fast data operations, utilizing the KMS API only for decrypting/encrypting the local DEK.

#### 3. What technology hosts keys under FIPS 140-2 Level 3 hardware security guarantees?
* **Correct Answer:** Hardware Security Modules (HSMs) - Hardened physical appliances that process cryptographic operations within tamper-resistant boundaries.
* **Technical Explanation:** Dedicated Cloud HSM instances ensure that cryptographic operations occur inside hardware boundaries, preventing keys from ever appearing in CPU registers outside the HSM.

#### 4. What security control limits network entry pathways directly at the Key Vault resource level?
* **Correct Answer:** Key Vault Firewall & Service Endpoints - Enforce network routing rules at the vault layer to drop all traffic originating outside approved subnets.
* **Technical Explanation:** Resource firewalls drop connection requests at the networking layer, preventing external hosts from even attempting credential verification.

#### 5. Which Key Vault feature prevents immediate key deletion by administrators?
* **Correct Answer:** Soft-Delete & Purge Protection - Retain deleted vaults in a recoverable state for a retention window, prohibiting immediate purge even by administrators.
* **Technical Explanation:** Purge protection ensures that deleted keys are held in a secure cloud quarantine for a recovery window, safeguarding against malicious or accidental deletions.

---
---

## Module 5: Threat Awareness: Cloud Threat Landscape

### Game 1: Misconfiguration Audit Dashboard (Toggle Format)

Configure the dashboard variables as follows:

* **Enforce Block Public Storage Access:** **ON (True)**
  * *Technical Explanation:* Blocking public storage ingress secures internal reports from automated directory enumeration bots.
* **Restrict Admin SSH/RDP Ports:** **ON (True)**
  * *Technical Explanation:* Closing public SSH/RDP access limits management access to corporate VPN gateways, blocking brute force sweeps.
* **Disable Default Root Credentials:** **ON (True)**
  * *Technical Explanation:* Standard default passwords are compiled in attacker scripts and tested immediately upon discovery.
* **Activate Infrastructure Audit Logging:** **ON (True)**
  * *Technical Explanation:* Comprehensive auditing is essential to detect unauthorized configuration drift and construct incident timelines.
* **Revoke Inactive Access Keys:** **ON (True)**
  * *Technical Explanation:* Leaked or orphaned API credentials represent a massive attack surface. Enforcing expiry limits reduces exposure windows.

---

### Game 2: Credential Attack Mitigations (Card Swiper Format)

Classify each identity event scenario:

* **Credential Scenario 1 (Hardcoded credentials in GitHub):** **Vulnerable**
  * *Exploit:* Hardcoded API keys committed to public repos are instantly scraped by automated threat crawlers and leveraged for compute hijacking.
* **Credential Scenario 2 (Dynamic credentials via IMDSv2):** **Secure**
  * *Defense:* IMDSv2 leverages token-based request handshakes, which neutralizes simple SSRF attacks seeking to extract instance roles.
* **Credential Scenario 3 (Password on sticky note):** **Vulnerable**
  * *Exploit:* Physical security is the foundational layer of authentication. Exposed passwords permit rapid, unauthorized lateral access by internal actors.
* **Credential Scenario 4 (Temporary IAM Roles):** **Secure**
  * *Defense:* IAM Roles eliminate static keys entirely. Generating short-lived credentials limits the damage window if a key is intercepted.
* **Credential Scenario 5 (Never expiring API keys):** **Vulnerable**
  * *Exploit:* Non-expiring administrative API keys are highly dangerous. If leaked, they grant permanent, unchecked access until manually deleted.

---

### Game 3: Cloud Incident Response Pipeline (Chronological Sorting Format)

Arrange the steps of a cloud security incident response workflow in chronological order (top to bottom):

1. **Detect anomaly: Cloud security monitoring detects administrative actions originating from a known malicious IP.**
   * *Why:* The IR lifecycle starts by identifying alert anomalies via network logging or threat analysis systems.
2. **Contain scope: Instantly revoke the compromised credentials and quarantine the affected virtual machines.**
   * *Why:* Containment must occur immediately upon detection to restrict lateral movement and stop active data leakage.
3. **Investigate logs: Parse cloud audit trails (CloudTrail) to identify all resources modified by the compromised account.**
   * *Why:* After containment, analysts audit logs to identify the extent of configuration mutations and asset access.
4. **Remediate gap: Close open access firewall paths, rotate all administrative secrets, and verify configuration state.**
   * *Why:* Remediation addresses the root vulnerability, locking the entryway before services are brought back online.
5. **Post-incident audit: Review response telemetry, update detection signatures, and adjust compliance policies.**
   * *Why:* The final step reviews operational response efficiency, feeding lessons back to optimize detection controls.

---

### Game 4: Cloud Threat Scenarios (Scenario Format)

#### 1. Which security control prevents SSRF metadata credential extraction?
* **Correct Answer:** IMDSv2 / Session Tokens - Requiring HTTP PUT requests with session headers to retrieve metadata, blocking simple SSRF GET calls.
* **Technical Explanation:** IMDSv2 enforces session validation using local headers, which prevents attackers from retrieving credentials via simple SSRF URL queries.

#### 2. What threat vector is illustrated by a hijacked DNS CNAME record pointing to a decommissioned web application?
* **Correct Answer:** DNS Subdomain Takeover - Attackers register the target resource name referenced in a hanging DNS record, taking control of the subdomain.
* **Technical Explanation:** Hanging CNAME records pointing to decommissioned resources can be registered by third parties, letting them serve malicious sites under your domain.

#### 3. What threat class describes unauthorized resource consumption for mining?
* **Correct Answer:** Cryptojacking - Compromising system compute resources (like containers or VMs) to mine digital currency.
* **Technical Explanation:** Cryptojacking exploits compromised virtual machine or container compute capacities. It is detected by CPU spikes, anomalous container images, and egress connections to mining pools.

#### 4. What design strategy guarantees backup resilience against ransomware encryption?
* **Correct Answer:** Immutable Backups / WORM Storage - Deploying write-once-read-many backup profiles that cannot be modified or deleted for a set retention duration.
* **Technical Explanation:** Immutable backups use write-once-read-many locks. Even if administrative credentials are stolen, the cloud host blocks backup deletion or editing during the lock window.

#### 5. What network auditing metric helps verify data exfiltration events?
* **Correct Answer:** Egress Data Volume / NAT Gateway Telemetry - Audit network egress bandwidth logs to identify sudden data transfer peaks.
* **Technical Explanation:** Data exfiltration triggers an abnormal volume of outbound (egress) network traffic. Auditing billing, NAT transfer logs, or firewall egress metrics confirms exfiltration volumes.
