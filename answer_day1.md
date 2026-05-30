# Day 1 Curriculum: Cloud Security & Identity — Answer Key

All options are numbered to match what appears on screen during the activity. The correct answer is clearly marked with ✅.

---

## Module 1: Cloud Computing & Shared Responsibility

### Game 1: IaaS Infrastructure Security (Scenario MCQ)

---

**Q1.** Who is responsible for patching the Guest Operating System in an IaaS model?

- **Option 1:** Cloud Provider — They manage physical host hardware and hypervisors, so they automatically patch guest OS instances to maintain isolation.
- **Option 2:** Customer IT Security Team — We deploy and manage the virtual machines, so Guest OS configuration, maintenance, and patching are our duty.
- **Option 3:** Shared Responsibility Policy — The cloud provider patches security kernels automatically at the hypervisor layer, leaving customer applications unaffected.

> ✅ **Correct: Option 2** — Under IaaS, the cloud provider secures the physical infrastructure and hypervisor. The customer is completely responsible for the Guest OS, applications installed on it, and network firewall rules inside the VM.

---

**Q2.** Who is responsible for configuring firewall security groups and access ports in IaaS?

- **Option 1:** Cloud Provider Edge Gateway — Default security groups are monitored and automatically hardened at the perimeter boundary by the provider's default routing profiles.
- **Option 2:** Database Host OS Engine — The underlying database runtime daemon is responsible for rejecting non-localhost connections regardless of security group definitions.
- **Option 3:** Customer IT Security Team — Configuring inbound/outbound firewall rules (security groups) is a customer responsibility.

> ✅ **Correct: Option 3** — Firewall rules, network access lists, and virtual network security groups are customer-configured items in IaaS. The provider grants the tools, but the customer must define the access constraints.

---

**Q3.** Who is responsible for enabling encryption and managing key rotations for raw cloud storage volumes?

- **Option 1:** Customer IT Security Team — Data security and encryption settings for customer files are owned by us.
- **Option 2:** Underlying Storage Fabric — The platform's managed block storage subsystem handles envelope encryption and rotation transparently using default infrastructure keys.
- **Option 3:** Cloud Provider Security Services — The provider automatically encrypts all provisioned customer block storage by default using provider-managed root keys.

> ✅ **Correct: Option 1** — In IaaS, the customer owns their data. While the provider offers encryption mechanisms (like KMS APIs), enabling encryption at rest, managing key rotation schedules, and defining access policies are customer duties.

---

**Q4.** Who is responsible for mitigating physical network infrastructure attacks and hardware outages?

- **Option 1:** Customer Network Team — We must deploy software DDoS shields on our virtual machines to protect the provider's physical routers.
- **Option 2:** Cloud Provider — They own and manage the physical routers, switches, and internet gateways.
- **Option 3:** Shared Edge WAN Protocol — Mitigating layer-3 infrastructure attacks is coordinate-managed where customers deploy edge routing protocols to absorb transit bandwidth.

> ✅ **Correct: Option 2** — Physical security, cooling, power, and physical network lines (routing, switching, and fiber infrastructure) are the sole responsibility of the cloud provider.

---

**Q5.** Who is responsible for tenant isolation and hypervisor security in cloud computing?

- **Option 1:** Cloud Provider — They must guarantee isolation between different customers sharing the same physical hardware.
- **Option 2:** Customer DevSecOps Team — We must configure guest kernel modules and secure enclave virtualization containers to prevent inter-VM memory access.
- **Option 3:** Cooperative Isolation Model — Hardware isolation is co-managed; tenants must configure software-defined memory segmentation overlays to prevent side-channel exploits.

> ✅ **Correct: Option 1** — Tenant isolation and securing the virtualization layer (hypervisor) is the core security commitment of a public cloud provider. A breakout represents a failure in the provider's infrastructure security boundary.

---

### Game 2: PaaS Configuration Dashboard (Toggle Format)

Configure each toggle to the correct security state to pass the audit:

| Toggle | Correct State | Why |
|---|---|---|
| Enforce HTTPS Redirection | **ON** | Encrypts all traffic in transit; disabled state leaves session cookies vulnerable to intercept. |
| Restrict CORS to Trusted Domains | **ON** | Wildcard CORS (*) allows any external site to read app responses. Restricting it enforces cross-origin boundaries. |
| Enable Secrets Vault Bindings | **ON** | Hardcoded connection strings are easily leaked in source control. Vault references secure the database keys. |
| Disable Basic Authentication Protocols | **ON** | Basic Auth does not support MFA challenges and is easily targeted in credential stuffing attacks. |
| Enable API Rate Limiting | **ON** | Without rate limiting, public API endpoints can be flooded with requests, exhausting server resources. |

---

### Game 3: SaaS Access Governance (Scenario MCQ)

---

**Q1.** Who is responsible for identity lifecycle management (onboarding, offboarding, and auditing access) in a SaaS model?

- **Option 1:** SaaS Vendor — The vendor's cloud service is responsible for listening to corporate directory updates and terminating sessions automatically.
- **Option 2:** Customer IT Security Team — We own access governance, user account management, and offboarding workflows.
- **Option 3:** SaaS Identity Provider (IdP) — The cloud software vendor operates federated identity synchronizers that automatically audit and revoke active sessions based on local AD state changes.

> ✅ **Correct: Option 2** — In SaaS, you do not manage infrastructure or application code, but you ALWAYS own access management: user accounts, group memberships, and role assignments are the customer's duty.

---

**Q2.** Who is responsible for configuring data sharing options and information security policies within a SaaS application?

- **Option 1:** Customer IT Security Team — We are responsible for setting sharing restrictions, file classifications, and DLP policies.
- **Option 2:** SaaS Provider — They must block all sharing requests containing file types like spreadsheets.
- **Option 3:** SaaS Application Security Layer — The host application dynamically audits file classifications and restricts unauthorized sharing links automatically by scanning document contents.

> ✅ **Correct: Option 1** — Even in SaaS, the provider only hosts the data and configuration panels. The customer is responsible for defining who can access what, enabling DLP, and setting document classification rules.

---

**Q3.** Who is responsible for fixing software vulnerabilities and database isolation bugs in a SaaS application?

- **Option 1:** Customer IT Security Team — We must hire developers to patch the SaaS provider's codebase.
- **Option 2:** SaaS Vendor — They own, update, patch, and secure the software code, infrastructure, and databases.
- **Option 3:** Shared Vulnerability SLA — The customer must apply hotfixes and patch database integrations via custom client-side API script extensions.

> ✅ **Correct: Option 2** — In SaaS, the vendor provides the software as a complete service. The customer has no access to the application source code or backend databases. Security patching and bug fixing belong entirely to the SaaS vendor.

---

**Q4.** Who is responsible for enabling and enforcing MFA policies for users of a SaaS platform?

- **Option 1:** SaaS Vendor — They should enforce MFA on every account globally and refuse connection if a phone is missing.
- **Option 2:** Customer IT Security Team — The vendor provides the MFA settings, but the customer must enable and enforce them.
- **Option 3:** SaaS IAM Services — The vendor's identity control plane automatically enforces MFA based on global tenant risk score metrics, overriding customer group policies.

> ✅ **Correct: Option 2** — While the SaaS vendor must build secure authentication features (like MFA and SAML SSO), it is the customer's responsibility to configure, enable, and enforce these features for their users.

---

**Q5.** Who is responsible for physical security (guards, CCTV, locks, cages) of the SaaS servers?

- **Option 1:** Customer IT Security Team — We must deploy guards to secure the vendor's physical server cages.
- **Option 2:** SaaS Vendor / Cloud Host — They are responsible for the physical security of their data center facilities.
- **Option 3:** Coordinated Facility Governance — The customer audit team co-manages site entry control logs and validates security badge credentials at the vendor facility boundary.

> ✅ **Correct: Option 2** — Physical security of the server facility, backup storage units, cooling pipelines, and power supplies is always the responsibility of the cloud provider/vendor hosting the software infrastructure.

---

### Game 4: Shared Responsibility Matrix (Drag & Drop Format)

| Customer Responsibility | Provider Responsibility |
|---|---|
| **Patching Guest Operating System (in IaaS VMs)** — The customer deploys the VM OS and is fully responsible for patching and configuring it. | **Physical Datacenter Security (Guards, Cages, CCTV)** — The cloud host secures the physical infrastructure, facility access, cooling, and power lines. |
| **Data Classification & Content Compliance** — Regardless of cloud model (IaaS, PaaS, SaaS), the customer always owns their own data and compliance. | **Safe Destruction of Decommissioned Hard Drives** — Physical media lifecycle management and shredding is handled by the cloud provider's operations team. |
| **Configuring Network Security Groups & Port Rules** — Setting rules to block or allow access (e.g. closing SSH/RDP ports) is managed by customer administrators. | **Securing the Hypervisor & Server Virtualization Layer** — The provider is responsible for ensuring secure tenant isolation at the hypervisor level. |

---

### Game 5: Hybrid Cloud Connectivity (Scenario MCQ)

---

**Q1.** Who is responsible for configuration and maintenance of local on-premises network appliances in a hybrid cloud?

- **Option 1:** Cloud Provider — They must remotely log in and fix our office router configurations under default management SLAs.
- **Option 2:** Customer IT Security Team — Managing, patching, and configuring on-premises hardware is our responsibility.
- **Option 3:** Telecom Link Provider — The ISP or carrier managing the transit circuit is responsible for modifying client premises gateway tunnel configs.

> ✅ **Correct: Option 2** — In a hybrid cloud model, the customer is fully responsible for all on-premises hardware, local routing, VPN client setups, and configurations of local boundary firewalls.

---

**Q2.** Who is responsible for configuring and monitoring hybrid directory synchronization tools?

- **Option 1:** Customer IT Security Team — Synchronizing local user databases and managing active sync agents is the customer's responsibility.
- **Option 2:** Cloud Provider — They must audit our local servers and fix the synchronization software.
- **Option 3:** Identity Sync Engine API — The platform agent operates under auto-remediation policies where sync exceptions are auto-patched and resolved at the vendor's cloud console level.

> ✅ **Correct: Option 1** — Directory sync tools (like Azure AD Connect or Okta Directory Sync agents) are deployed and managed by the customer. Ensuring correct routing, credential synchronization, and sync agent updates is your duty.

---

**Q3.** Who coordinates the repair and physical restoration of dedicated high-speed cloud trunk lines?

- **Option 1:** Customer Network Team — We must dispatch fiber-splicing engineers to repair physical core trunk segments located outside the corporate facility.
- **Option 2:** Cloud Provider / Telecommunication Carrier — The provider manages network trunks and physical links up to the edge of their facility.
- **Option 3:** Local Utility Board — Physical routing cuts on public rights-of-way must be municipal-repaired without provider carrier intervention.

> ✅ **Correct: Option 2** — Physical trunk line connections, carrier agreements, and provider-side edge routers are managed by the cloud host or their authorized network carrier. The customer's responsibility stops at their own endpoint router.

---

**Q4.** Who is responsible for setting API rate limiting and traffic management rules on a hybrid API gateway?

- **Option 1:** Customer IT Security Team — We must configure security profiles, rate ceilings, and request filters.
- **Option 2:** Cloud Provider Web Layer — The cloud host automatically implements volumetric Layer 7 blocklists at the ingress hub to secure all downstream hybrid endpoints.
- **Option 3:** Target Mainframe System — The destination backend database must throttle concurrent socket calls at the kernel TCP layer to prevent overload.

> ✅ **Correct: Option 1** — Gateway security, rate limits, CORS configurations, and authorization headers are application-security attributes configured and managed by the customer.

---

**Q5.** Who is responsible for server hardware maintenance and parts replacement for local hybrid nodes?

- **Option 1:** Cloud Provider Hardware Depot — The provider must ship replacement boards and dispatch local technicians under hybrid platform lease agreements.
- **Option 2:** Customer IT Security Team — We own the local physical infrastructure, so hardware repairs and data center cooling are our responsibility.
- **Option 3:** Hardware Warranty Carrier — The cloud platform SLA covers automated physical part swap-outs and technician dispatches for customer-premises servers.

> ✅ **Correct: Option 2** — In hybrid setups, the public cloud provider's SLA only covers cloud resources. On-premises server rooms, hardware procurement, disk swaps, cooling, and electrical grounding are entirely managed by the customer.

---
---

## Module 2: Identity Security & Zero Trust

### Game 1: Authentication vs Authorization (Drag & Drop Format)

| Authentication (AuthN) — *Verifying WHO you are* | Authorization (AuthZ) — *Verifying WHAT you can do* |
|---|---|
| **Validating a user's password and login ID** — Checking login credentials verifies identity. | **Checking if a user belongs to the 'Global Admins' group** — Group memberships determine what operations a user has permissions to run. |
| **Verifying an offline TOTP code from an authenticator app** — MFA is an extra verification check of the user's identity. | **Restricting API access using OAuth scopes like 'read:billing'** — OAuth scopes define access limitations to resources. |
| **Scanning a user's fingerprint on a biometric reader** — Biometrics check physical identity attributes to verify who the user is. | **Limiting server write access to on-duty hours (ABAC context)** — Enforcing environmental access parameters controls what actions are authorized in real-time. |

---

### Game 2: Multi-Factor Authentication Checkpoint (Card Swiper)

Classify each card as **Secure** or **Vulnerable**:

| Card | Classification | Explanation |
|---|---|---|
| Card 1: Admin receives unsolicited SMS OTP, then asked to repeat it to "IT support" | **Vulnerable** | Phished SMS OTP attack. SMS codes are not phishing-resistant and should never be shared. |
| Card 2: Engineer logs in using a FIDO2 WebAuthn hardware key | **Secure** | FIDO2 uses public-key origin-bound cryptography, immune to credential phishing and SIM-swapping. |
| Card 3: Admin flooded with 30 push requests at 2:30 AM and approves one | **Vulnerable** | MFA Push Fatigue exploit. Without 'Number Matching', administrators can be tricked into approving rogue logins. |
| Card 4: Developer uses authenticator app generating TOTP codes offline | **Secure** | TOTP codes are generated locally with no internet dependency, eliminating cellular interception risks. |
| Card 5: Legacy billing tool uses SMTP Basic Authentication without MFA | **Vulnerable** | Legacy basic auth protocols do not support interactive MFA challenges — major credential stuffing targets. |

---

### Game 3: PAM Just-In-Time Elevation (Chronological Sorting)

Arrange the steps in this exact order (1 = first, 5 = last):

1. User requests temporary administrative access in the PAM portal, stating a clear business justification.
2. A security manager or designated data owner reviews the request and grants approval for a specific time window.
3. The PAM system issues a temporary security token and injects the credentials directly into the target session.
4. User performs maintenance actions while the PAM gateway records all commands and keystrokes for audits.
5. The time lease expires, the token is revoked, and administrative privileges are automatically stripped.

---

### Game 4: Zero Trust Architecture (Scenario MCQ)

---

**Q1.** If we secured our network perimeter with firewalls, why do we need to encrypt traffic between internal servers?

- **Option 1:** Perimeter Trust Containment — Relying on network boundary firewalls to authenticate and whitelist all traffic within the trusted zone.
- **Option 2:** Assume Breach — Treat the internal network as hostile and encrypt/verify all traffic.
- **Option 3:** Implicit Trust Delegation — Granting server-to-server communications dynamic routing paths based on internal domain memberships.

> ✅ **Correct: Option 2** — Zero Trust rejects the 'trusted internal networks' (castle-and-moat) model. By assuming breach, you treat all networks as untrusted, requiring all communications to be encrypted, authenticated, and authorized.

---

**Q2.** What network security technique restricts lateral traffic by segmenting workloads into small, isolated security zones?

- **Option 1:** Microsegmentation — Using granular security policies to isolate workloads from one another.
- **Option 2:** Virtual Private LAN Service (VPLS) — Bundling broadcast domains to optimize edge security routing.
- **Option 3:** Network Address Translation (NAT) Port Forwarding — Directing external ports to internal server nodes to hide IP addresses.

> ✅ **Correct: Option 1** — Microsegmentation divides networks into distinct security zones down to individual workload levels. This prevents attackers from moving laterally within the network if they compromise a single node.

---

**Q3.** A contractor has valid credentials and MFA but Zero Trust policy denies the session. What is most likely causing the denial?

- **Option 1:** Static Verification Tokens — Verifying credentials against static security challenge questions and caching domain cookies.
- **Option 2:** Explicit Verification of device state, compliance, location, and risk context.
- **Option 3:** Identity Profile Lookup — Authenticating solely based on user directory state and active group memberships.

> ✅ **Correct: Option 2** — Zero Trust mandates that all access requests are explicitly verified against multiple real-time context metrics: device health, location, network security posture, and data classification — not just credentials.

---

**Q4.** What technology evaluates the health and compliance of an endpoint device prior to granting access?

- **Option 1:** Device Health Attestation / Endpoint Compliance Policy.
- **Option 2:** ICMP Diagnostic Queries — Performing active ping scans and network interface diagnostics to confirm connectivity.
- **Option 3:** LDAP Schema Auditing — Verifying user record birth dates and directory profile parameters prior to access authorization.

> ✅ **Correct: Option 1** — Endpoint compliance systems inspect the requesting device's security configuration (antivirus active, patches current, disk encrypted) to verify the device meets security standards before authorizing connections.

---

**Q5.** A user completes MFA and starts downloading 10,000 files — their session is automatically terminated. Which Zero Trust concept is illustrated?

- **Option 1:** Single Sign-On (SSO) Session Lifecycle — Authenticating the identity once at ingress and maintaining session validity until explicit logout.
- **Option 2:** Continuous Risk Assessment and Session Authorization.
- **Option 3:** Dynamic IP Route Optimization — Rerouting high-bandwidth downloads to optimized edge servers to prevent system bottlenecks.

> ✅ **Correct: Option 2** — Zero Trust is not a one-time check at login. Access must be continuously authorized and monitored. If user risk scores spike or anomalous behavior is detected, the security engine dynamically revokes session access.

---

### Game 5: Identity Governance & Compliance (Scenario MCQ)

---

**Q1.** What identity governance process requires managers to regularly review and justify employee access rights?

- **Option 1:** Automated Group Policy Sync — Running nightly directory cleanup scripts to sync active employee lists.
- **Option 2:** Attestation / Access Certification Reviews — Regular audits where managers must justify and re-approve user access.
- **Option 3:** Log Retraction Policy — Purging access event histories quarterly to reduce security audit overhead.

> ✅ **Correct: Option 2** — Access certification reviews force managers or data owners to audit active user rights periodically. Access no longer required is revoked, preventing permissions accumulation and orphaned accounts.

---

**Q2.** An engineer moves from database administration to marketing but retains database edit permissions. Which stage of Identity Lifecycle Management failed?

- **Option 1:** Initial Onboarding Provisioning — Allocating default permission sets during the employee onboarding phase.
- **Option 2:** Access Mutation / Role Lifecycle Transition.
- **Option 3:** SDN Route Configuration — Updating network gateway routing profiles to segment developer traffic.

> ✅ **Correct: Option 2** — The 'Joiner-Mover-Leaver' (JML) framework governs user lifecycle states. When a mover changes roles, old permissions must be stripped to align with their new least privilege profile.

---

**Q3.** An accountant can both create vendor profiles AND approve payments, enabling unauthorized disbursements. What core principle prevents this?

- **Option 1:** Dual-Homed Firewall Configurations — Implementing redundant network barriers to filter finance traffic.
- **Option 2:** Segregation of Duties (SoD) — Splitting key roles so no single identity can perform fraud unchecked.
- **Option 3:** Symmetric Key Cryptography — Enforcing payload encryption using shared secrets to prevent record tampering.

> ✅ **Correct: Option 2** — Segregation of Duties (SoD) prevents fraud by dividing critical tasks between multiple users. A single user must not have enough privileges to initiate, authorize, and complete a financial transaction alone.

---

**Q4.** Active admin accounts are found with no corresponding active employee in the HR directory. What is the best way to prevent orphan accounts?

- **Option 1:** HR-Driven Provisioning — Automating account lifecycle triggers (creation, suspension) directly from HR database events.
- **Option 2:** Voluntary Offboarding Declarations — Enforcing policies where departing employees submit account deletion request forms.
- **Option 3:** Anonymous Administrative Identity Management — Issuing non-personally identifiable service accounts to run database tasks.

> ✅ **Correct: Option 1** — HR-driven provisioning coordinates active directory states directly with HR records. When HR terminates an employee, the synchronization system automatically disables all associated identity accounts.

---

**Q5.** A hacker with database write access tries to edit audit logs on the database host to erase their IP. How should security logs be archived?

- **Option 1:** Flat-File Hosting on Local Storage — Storing log streams as standard text files in secure directories on the database virtual machine.
- **Option 2:** Shipping logs immediately to a centralized, immutable storage repository (Write-Once-Read-Many / WORM) separated from database administration rights.
- **Option 3:** Administrative Log Reconciliation — Allowing administrative users write permissions to filter and format log entries for auditing consistency.

> ✅ **Correct: Option 2** — Security logs must be centralized, isolated, and immutable. Shipping logs to WORM storage ensures they cannot be altered or deleted, even if an attacker gains local root access to the database server.

---
---

## Module 3: Network Security — Secure Network Design

### Game 1: VPC & VNet Segmentations (Scenario MCQ)

---

**Q1.** What network segmentation strategy should be applied to isolate the database tier from direct external access?

- **Option 1:** Public-Private Subnet Split — Deploy databases in a private subnet with no public route, using virtual network boundary rules to restrict ingress to the web tier.
- **Option 2:** Direct Internet Gateways — Place both tiers in a public subnet and use database firewall rules to block inbound TCP port 1433 requests.
- **Option 3:** Single Security Domain — Deploy a unified subnet layout and rely on database OS credentials to prevent host access.

> ✅ **Correct: Option 1** — Private subnets do not associate with internet gateways. By separating web and database tiers into public and private subnets, you enforce physical routing boundaries.

---

**Q2.** What is the best cloud network topology to connect 10 VPCs while retaining central control?

- **Option 1:** Full-Mesh Peering — Establishing bidirectional VPC peering links between all ten spokes to allow direct, unmonitored communication.
- **Option 2:** Transit Gateway (TGW) Hub — Deploy a centralized cloud router to coordinate routing tables and transit traffic between spoke networks securely.
- **Option 3:** Public Proxy Overlay — Routing transit spoke traffic out to the public internet and back through client proxy gateways.

> ✅ **Correct: Option 2** — A Transit Gateway acts as a cloud router, simplifying network architecture from peer-to-peer links to a clean hub-and-spoke model.

---

**Q3.** What is the secure alternative to granting temporary remote administration access to private subnets?

- **Option 1:** Public Route Table Override — Temporarily routing private subnet traffic to the public internet gateway for debugging sessions.
- **Option 2:** Bastion Host / Identity-Aware Proxy (IAP) — Route admin traffic through a hardened tunnel gateway that enforces strict identity-based access control.
- **Option 3:** Direct SSH Gating — Open inbound SSH port 22 on the instance and restrict ingress to the developer's home IP.

> ✅ **Correct: Option 2** — Bastion hosts or Identity-Aware Proxies provide a single, audited checkpoint, avoiding direct public exposure of private assets.

---

**Q4.** Which technology establishes a private connection between your virtual network and provider services without routing over the public internet?

- **Option 1:** Private Service Endpoint / Private Link — Inject a private network interface into the VPC to route service traffic entirely inside the cloud network.
- **Option 2:** External NAT Gateway — Routing service requests through NAT gateways to translate VPC IPs to public internet addresses.
- **Option 3:** Internet Gateway Translation — Mapping service endpoints to public DNS records and letting internet switches handle routing.

> ✅ **Correct: Option 1** — Endpoints route traffic over the provider's internal fabric, avoiding public DNS/internet routing entirely.

---

**Q5.** What native cloud network auditing feature captures IP traffic logs going to and from network interfaces?

- **Option 1:** VPC Flow Logs — Capture and analyze metadata records of network sessions at network interfaces.
- **Option 2:** Operating System Syslogs — Parsing local machine logs to track IP routing table changes.
- **Option 3:** Application Access Tracing — Inspecting application-level HTTP header logs at the proxy gateway.

> ✅ **Correct: Option 1** — VPC Flow logs capture packet headers at the infrastructure level (NIC), ensuring logs cannot be tampered with by guest OS users.

---

### Game 2: NSG vs WAF Rules Mapping (Drag & Drop Format)

| Network Security Group (NSG/SG) — Layer 3/4 | Web Application Firewall (WAF) — Layer 7 |
|---|---|
| **Blocking inbound traffic from a specific malicious IP range (e.g. 198.51.100.0/24)** — IP address blocking operates at the packet header layer (Layer 3). | **Blocking SQL Injection (SQLi) attacks inside HTTP POST parameters** — SQLi checks require decoding and inspecting application-layer HTTP body payloads. |
| **Filtering traffic on TCP Port 22 (SSH) and Port 3389 (RDP)** — Port-level restrictions drop traffic at Layer 4 before reaching application hosts. | **Inspecting HTTP headers for Cross-Site Scripting (XSS) script injections** — XSS prevention audits HTTP request headers and URL strings for malicious JavaScript. |
| **Applying stateless port-level access rules at the virtual subnet layer** — Subnet access lists evaluate Layer 3/4 headers statelessly. | **Applying geographic IP rate limiting (Geo-blocking) to HTTP/HTTPS requests** — Geo-blocking inspects Layer 7 HTTP request headers. |

---

### Game 3: WAF Rules Configuration (Toggle Format)

| Toggle | Correct State | Why |
|---|---|---|
| SQL Injection Protection Rules | **ON** | SQLi rules inspect inputs for drop, union, or select commands, neutralizing database hijacking threats. |
| Cross-Site Scripting (XSS) Rules | **ON** | XSS rules prevent malicious scripts from being injected and executed on users' browsers. |
| OWASP Core Rule Set (CRS) | **ON** | The OWASP CRS shields against broad threat classes like session hijacking and protocol anomalies. |
| Geographic IP Restrictions | **OFF** | Your SaaS product serves global customers — geo-blocking would block legitimate users from valid regions. |
| Enforce Bot Control Limits | **ON** | Bot control mitigates credential-stuffing and scraping attempts, protecting server compute limits. |

---

### Game 4: DDoS Mitigation & Edge Defenses (Scenario MCQ)

---

**Q1.** What layer of security handles physical volumetric DDoS mitigation?

- **Option 1:** Cloud Infrastructure Shield — Deploying automated scrubbing centers at cloud network boundaries to absorb multi-gigabit traffic.
- **Option 2:** Application Server Scaling — Provisioning more VM database instances to handle millions of DNS lookup queries.
- **Option 3:** Shared Edge WAN Protocol — Mitigating layer-3 infrastructure attacks is coordinate-managed where customers deploy edge routing protocols.

> ✅ **Correct: Option 1** — Volumetric DDoS attacks must be mitigated at the cloud provider's ingress scrubbing centers before they reach virtual subnets.

---

**Q2.** Which technology mitigates HTTP Application-layer (Layer 7) DDoS attacks?

- **Option 1:** Layer 4 Infrastructure Firewall — Blocking all inbound UDP ports to secure application web engines.
- **Option 2:** WAF Rate Limiting / CDN Ingress — Enforcing request limits per client IP at the Edge Content Delivery Network (CDN).
- **Option 3:** Enlarging Subnet IP Allocations — Expanding the virtual network CIDR block to allow more IP sessions.

> ✅ **Correct: Option 2** — Layer 7 DDoS attacks are mitigated by rate limiting HTTP headers at edge caching nodes (CDNs) before they overload origin servers.

---

**Q3.** What is the network design best practice to protect cloud origins from direct IP attacks?

- **Option 1:** IP Obfuscation / CDN Origin Shield — Route all public traffic through CDNs and restrict origin firewalls to accept only CDN IPs.
- **Option 2:** Direct Access Mapping — Assigning public DNS records directly to origin VM servers to optimize connection speeds.
- **Option 3:** Dynamic DNS Rotation — Rotating origin IP addresses every 10 minutes to confuse attackers.

> ✅ **Correct: Option 1** — Restricting origin security groups to CDN-only IP ranges prevents attackers from bypassing edge controls and attacking origin servers directly.

---

**Q4.** What TCP/IP mechanism should be active to mitigate SYN flood attacks at the network layer?

- **Option 1:** SYN Cookies / Provider SYN proxying — Handshaking connection requests at the cloud edge before forwarding verified TCP connections to origin.
- **Option 2:** DNS TTL Reductions — Reducing DNS cache times to trigger rapid clients IP updates.
- **Option 3:** Symmetric Encryption Key changes — Changing network keys to invalidate handshakes.

> ✅ **Correct: Option 1** — SYN proxying validates connection integrity before initiating server-side handshakes, preventing connection table exhaustion.

---

**Q5.** What is the best cost mitigation strategy during sustained DDoS attacks?

- **Option 1:** DDoS Cost Protection / SLA Reimbursement — Enroll in cloud DDoS protection plans that credit back auto-scaling costs caused by verified attacks.
- **Option 2:** Disabling Auto-scaling — Freezing server count limits so the system crashes instead of billing higher.
- **Option 3:** Disabling Network Monitoring — Shutting down system alerts to ignore bill warnings.

> ✅ **Correct: Option 1** — Cloud providers offering advanced DDoS protection guarantee cost billing protection, shielding enterprises from scaling cost surges.

---
---

## Module 4: Data Security: Protection & Encryption

### Game 1: At Rest vs In Transit Encryption (Drag & Drop Format)

| Encryption At Rest — *Protecting stored data* | Encryption In Transit — *Protecting active traffic* |
|---|---|
| **Enabling BitLocker or Cloud Managed Volume Encryption on VM disks** — Disk volume encryption secures stored bits on physical hardware blocks. | **Enforcing TLS 1.3 cryptographic tunnels for HTTP connections** — TLS 1.3 encrypts active network connections in flight. |
| **Encrypting Cloud Storage buckets using KMS-managed root keys** — Object storage bucket policies encrypt files when saved, ensuring protection at rest. | **Securing site-to-site VPN tunnels using IPsec network protocols** — IPsec tunnels encrypt packet payloads while crossing public router boundaries. |
| **Transparent Data Encryption (TDE) configured on SQL Database servers** — TDE encrypts database pages, backup files, and transaction logs when written to disk. | **Encrypting API payloads via HTTPS using SSL certificates** — HTTPS encrypts API payloads between clients and API gateways. |

---

### Game 2: In-Use & Confidential Computing (Scenario MCQ)

---

**Q1.** Even with disk and TLS encryption in place, database admins can read cleartext RAM memory dumps. What technology isolates data in RAM during processing?

- **Option 1:** Confidential Computing / Secure Enclaves — Hardware-based memory encryption that isolates virtual workloads from hypervisors and host root administrators.
- **Option 2:** File-System Level Encryption — Encrypting local files inside OS directories to block directory listings.
- **Option 3:** RAM Memory Defragmentation — Running frequent defragmentation sweeps to overwrite database memory cells.

> ✅ **Correct: Option 1** — Confidential computing encrypts RAM at the hardware level, protecting data in use even from privileged host OS administrators.

---

**Q2.** Our compliance policies prohibit decrypting data at any point in the cloud. What emerging cryptographic technique permits processing of encrypted ciphertexts without ever decrypting them?

- **Option 1:** Homomorphic Encryption — Perform mathematical operations directly on encrypted data, yielding an encrypted result that only the customer can decrypt.
- **Option 2:** Asymmetric RSA Encryption — Generating public/private key pairs to decrypt files rapidly in system buffers.
- **Option 3:** Hashing algorithms — Computing SHA-256 hashes of datasets to extract calculations.

> ✅ **Correct: Option 1** — Homomorphic encryption allows analytical models to compute values on encrypted inputs, ensuring zero plaintext exposure in cloud RAM.

---

**Q3.** To verify that a Confidential Computing environment is authentic and running genuine enclave code, we need an independent audit proof. What process validates the integrity of a secure enclave workload?

- **Option 1:** Attestation / Cryptographic Verification — The hardware enclave generates a signed token verifying its configuration and authenticity.
- **Option 2:** Administrator Manual Review — Requesting host administrators to manually audit server motherboard logs.
- **Option 3:** ICMP Echo Requests — Ping auditing the enclave IP address to verify system responsiveness.

> ✅ **Correct: Option 1** — Remote attestation uses public-key cryptography to prove that an enclave is genuine, untampered, and running on compliant hardware.

---

**Q4.** What CPU-level hardware-isolated container isolates keys during memory execution?

- **Option 1:** Hardware Security Enclave (e.g. Intel SGX / AMD SEV) — Dedicated processor compartments that shield critical code blocks from external inspection.
- **Option 2:** Hyperthreading pools — Splitting processing queues across multiple physical cores.
- **Option 3:** Local System Temp directories — Storing keys in system temp files protected by user group policies.

> ✅ **Correct: Option 1** — Secure enclaves isolate memory pages at the hardware level, blocking access from host operating systems, hypervisors, and local root accounts.

---

**Q5.** A cloud employee physically accesses server memory chips (DIMMs) and tries to intercept data via a hardware debugger on the bus. What hardware feature mitigates this?

- **Option 1:** Hardware Memory Encryption (TME/MKTME) — Real-time cryptographic encryption of data moving between the CPU and external RAM DIMMs.
- **Option 2:** Chassis Intrusion Detection — Automatic system power cuts when physical server covers are opened.
- **Option 3:** Local Host Firewalls — Restricting inbound network access to memory addresses.

> ✅ **Correct: Option 1** — Total Memory Encryption (TME) encrypts RAM contents using key material generated inside the CPU, rendering bus probes useless.

---

### Game 3: KMS Key Rotation Workflow (Chronological Sorting)

Arrange the steps in this exact order (1 = first, 5 = last):

1. Create a new Key Version (cryptographic material) inside the Key Vault / KMS portal.
2. Update the KMS Key Alias to reference the new key version for all new encryption requests.
3. Encrypt all newly created database records using the updated active key reference.
4. Retain the old key version in active read-only state to decrypt legacy database records.
5. Deprecate and archive the legacy key version once all old records have been re-encrypted.

---

### Game 4: Key Vault & HSM Strategies (Scenario MCQ)

---

**Q1.** Our compliance framework requires complete ownership over encryption keys, including instant revocation without provider consent. Which key management strategy should be implemented?

- **Option 1:** Customer Managed Keys (CMK) / Bring Your Own Key (BYOK) — The customer generates and controls the root key, granting storage access via KMS IAM policies.
- **Option 2:** Provider Managed Keys — Enrolling in the provider's default storage encryption where the host automatically rotates keys.
- **Option 3:** Local Text File Storage — Saving database key strings in a text file in a private directory on our local backup servers.

> ✅ **Correct: Option 1** — CMKs put key governance in the customer's control. Disabling the CMK instantly cuts off the database from decrypted storage without provider intervention.

---

**Q2.** The database needs to encrypt millions of individual rows. Requesting the KMS API for each row creates massive latency. What design pattern resolves this?

- **Option 1:** Envelope Encryption — Request a master key from KMS, generate local Data Encryption Keys (DEKs) to encrypt data locally, and store the encrypted DEK alongside the data.
- **Option 2:** API Request Batching — Buffering 10,000 database rows and sending them in a single massive POST request to KMS.
- **Option 3:** Disabling Row Security — Encrypting only the primary ID column of the database to speed up performance.

> ✅ **Correct: Option 1** — Envelope encryption uses local DEKs for fast data operations, utilizing the KMS API only for decrypting/encrypting the local DEK.

---

**Q3.** We need cryptographic keys generated and stored on physical hardware certified to FIPS 140-2 Level 3 standards. What technology provides this?

- **Option 1:** Hardware Security Modules (HSMs) — Hardened physical appliances that process cryptographic operations within tamper-resistant boundaries.
- **Option 2:** Software Key Vault Containers — Virtual machines storing key material in encrypted filesystem volumes.
- **Option 3:** Local Active Directory databases — Saving keys inside standard domain controller schemas.

> ✅ **Correct: Option 1** — Dedicated Cloud HSM instances ensure cryptographic operations occur inside hardware boundaries, preventing keys from ever appearing in CPU registers outside the HSM.

---

**Q4.** What security control limits network entry pathways directly at the Key Vault resource level?

- **Option 1:** Key Vault Firewall & Service Endpoints — Enforce network routing rules at the vault layer to drop all traffic originating outside approved subnets.
- **Option 2:** User Authentication passwords — Strengthening user login complexity requirements to mitigate portal access.
- **Option 3:** Dynamic DNS routing — Mapping the vault endpoint to a changing private IP address range.

> ✅ **Correct: Option 1** — Resource firewalls drop connection requests at the networking layer, preventing external hosts from even attempting credential verification.

---

**Q5.** An attacker gains admin access and executes a command to delete the production Key Vault. Which Key Vault feature prevents immediate irreversible deletion?

- **Option 1:** Soft-Delete & Purge Protection — Retain deleted vaults in a recoverable state for a retention window, prohibiting immediate purge even by administrators.
- **Option 2:** IAM Password Complexity policies — Enforcing quarterly updates of administrative portal access credentials.
- **Option 3:** VPC Subnet peering — Linking the vault to redundant network zones to duplicate the databases.

> ✅ **Correct: Option 1** — Purge protection ensures that deleted keys are held in a secure cloud quarantine for a recovery window, safeguarding against malicious or accidental deletions.

---
---

## Module 5: Threat Awareness: Cloud Threat Landscape

### Game 1: Misconfiguration Audit Dashboard (Toggle Format)

| Toggle | Correct State | Why |
|---|---|---|
| Enforce Block Public Storage Access | **ON** | Blocking public storage ingress secures internal reports from automated directory enumeration bots. |
| Restrict Admin SSH/RDP Ports | **ON** | Closing public SSH/RDP access limits management to corporate VPN gateways, blocking brute force sweeps. |
| Disable Default Root Credentials | **ON** | Standard default passwords are compiled in attacker scripts and tested immediately upon discovery. |
| Activate Infrastructure Audit Logging | **ON** | Comprehensive auditing is essential to detect unauthorized configuration drift and construct incident timelines. |
| Revoke Inactive Access Keys | **ON** | Leaked or orphaned API credentials represent a massive attack surface. Expiry limits reduce exposure windows. |

---

### Game 2: Credential Attack Mitigations (Card Swiper)

Classify each credential scenario as **Secure** or **Vulnerable**:

| Scenario | Classification | Explanation |
|---|---|---|
| Scenario 1: Developer commits hardcoded AWS Access Key + Secret to public GitHub | **Vulnerable** | Hardcoded API keys in public repos are instantly scraped by automated threat crawlers. |
| Scenario 2: App requests credentials dynamically from IMDSv2 instance metadata | **Secure** | IMDSv2 leverages token-based request handshakes, neutralizing simple SSRF attacks. |
| Scenario 3: Manager writes database password on a sticky note on their monitor | **Vulnerable** | Exposed passwords permit rapid, unauthorized lateral access by internal actors. |
| Scenario 4: API service uses IAM Role to generate temporary credentials expiring every 60 min | **Secure** | IAM Roles eliminate static keys. Short-lived credentials limit the damage window if intercepted. |
| Scenario 5: Admins use standard API keys with rotation limit set to 'Never Expire' | **Vulnerable** | Non-expiring admin API keys grant permanent, unchecked access until manually deleted. |

---

### Game 3: Cloud Incident Response Pipeline (Chronological Sorting)

Arrange the steps in this exact order (1 = first, 5 = last):

1. Detect anomaly: Cloud security monitoring detects administrative actions originating from a known malicious IP.
2. Contain scope: Instantly revoke the compromised credentials and quarantine the affected virtual machines.
3. Investigate logs: Parse cloud audit trails (CloudTrail) to identify all resources modified by the compromised account.
4. Remediate gap: Close open access firewall paths, rotate all administrative secrets, and verify configuration state.
5. Post-incident audit: Review response telemetry, update detection signatures, and adjust compliance policies.

---

### Game 4: Cloud Threat Scenarios (Scenario MCQ)

---

**Q1.** A vulnerable web app with SSRF allows attackers to hit the cloud metadata endpoint (169.254.169.254) and retrieve IAM credentials. Which security control prevents this?

- **Option 1:** IMDSv2 / Session Tokens — Requiring HTTP PUT requests with session headers to retrieve metadata, blocking simple SSRF GET calls.
- **Option 2:** Subnet IP expansion — Changing local subnet routing ranges to hide the metadata IP.
- **Option 3:** Wavelength scaling — Scaling processor power to overload server responses.

> ✅ **Correct: Option 1** — IMDSv2 enforces session validation using local headers, which prevents attackers from retrieving credentials via simple SSRF URL queries.

---

**Q2.** We deleted a web app but forgot to remove the CNAME DNS record. An attacker registers the abandoned app name and hijacks our traffic. What threat vector is this?

- **Option 1:** DNS Subdomain Takeover — Attackers register the target resource name referenced in a hanging DNS record, taking control of the subdomain.
- **Option 2:** SQL Injection — Executing database queries in DNS TXT records.
- **Option 3:** Local Host Spoofing — Modifying the routing path on the client device.

> ✅ **Correct: Option 1** — Hanging CNAME records pointing to decommissioned resources can be registered by third parties, letting them serve malicious sites under your domain.

---

**Q3.** An attacker gains access to our container repository and configures containers to mine cryptocurrency in the background. What threat class is this?

- **Option 1:** Cryptojacking — Compromising system compute resources (like containers or VMs) to mine digital currency.
- **Option 2:** Volumetric DDoS — Overloading API gateway ports with connection requests.
- **Option 3:** Session Hijacking — Stealing session tokens from cookie storage.

> ✅ **Correct: Option 1** — Cryptojacking exploits compromised virtual machine or container compute capacities. Detected by CPU spikes, anomalous container images, and egress connections to mining pools.

---

**Q4.** Attackers compromise our cloud backups, encrypt them, and demand ransom. What design strategy guarantees backup resilience?

- **Option 1:** Immutable Backups / WORM Storage — Deploying write-once-read-many backup profiles that cannot be modified or deleted for a set retention duration.
- **Option 2:** Dual-site file sharing — Syncing files to folders on local developer machines.
- **Option 3:** Password strength updates — Requiring users to rotate console passwords.

> ✅ **Correct: Option 1** — Immutable backups use write-once-read-many locks. Even if admin credentials are stolen, the cloud host blocks backup deletion or editing during the lock window.

---

**Q5.** An administrator receives an email claiming data was exfiltrated and demanding payment. What network auditing metric helps verify if this actually occurred?

- **Option 1:** Egress Data Volume / NAT Gateway Telemetry — Audit network egress bandwidth logs to identify sudden data transfer peaks.
- **Option 2:** Inbound TCP SYN checks — Counting connection attempts on internal router interfaces.
- **Option 3:** Domain Name registration audits — Verifying DNS subdomain creation timestamps.

> ✅ **Correct: Option 1** — Data exfiltration triggers an abnormal volume of outbound (egress) network traffic. Auditing billing, NAT transfer logs, or firewall egress metrics confirms exfiltration volumes.
