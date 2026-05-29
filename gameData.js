// Game Data for HCLTech Cloud Security & Identity Presentation Activity Deck
// Defines 10 activities with 5 different interactive formats.

const gameData = {
  modules: [
    {
      id: "module1",
      title: "Cloud Computing & Shared Responsibility",
      subtitle: "Understand IaaS, PaaS, SaaS, and security boundaries",
      description: "Master the Shared Responsibility Model. Determine who is responsible for protecting data, patching operating systems, and governing access control at the Infrastructure, Platform, and Software layers.",
      games: [
        {
          id: "m1_g1",
          title: "IaaS Infrastructure Security",
          subtitle: "Securing Virtualized Infrastructure",
          description: "Explore virtual machines, hypervisors, storage volumes, and network security group settings in an IaaS environment.",
          type: "scenario",
          decisions: [
            {
              id: "m1_g1_d1",
              category: "iaas",
              scenario: "An OS kernel vulnerability is detected in the Virtual Machines hosting the enterprise application database. The team is debating who is responsible for patching the guest operating system of these running VMs.",
              question: "Who is responsible for patching the Guest Operating System in an Infrastructure as a Service (IaaS) model?",
              options: [
                "Cloud Provider - They manage physical host hardware and hypervisors, so they automatically patch guest OS instances to maintain isolation.",
                "Customer IT Security Team - We deploy and manage the virtual machines, so Guest OS configuration, maintenance, and patching are our duty.",
                "Shared Responsibility Policy - The cloud provider patches security kernels automatically at the hypervisor layer, leaving customer applications unaffected."
              ],
              correctIndex: 1,
              revealCause: "Under IaaS, the cloud provider secures the physical infrastructure, hypervisor, and hardware virtualization layer. The customer (you) is completely responsible for the Guest OS, applications installed on it, and network firewall rules inside the VM."
            },
            {
              id: "m1_g1_d2",
              category: "iaas",
              scenario: "A company database VM is compromised. Forensic scans reveal that port 3306 (MySQL) was open to the entire public internet (0.0.0.0/0) in the cloud security group settings.",
              question: "Who is responsible for configuring firewall security groups and access ports in IaaS?",
              options: [
                "Cloud Provider Edge Gateway - Default security groups are monitored and automatically hardened at the perimeter boundary by the provider's default routing profiles.",
                "Database Host OS Engine - The underlying database runtime daemon is responsible for rejecting non-localhost connections regardless of security group definitions.",
                "Customer IT Security Team - Configuring inbound/outbound firewall rules (security groups) is a customer responsibility."
              ],
              correctIndex: 2,
              revealCause: "Firewall rules, network access lists, and virtual network security groups are customer-configured items in IaaS. The provider grants the tools, but you must define the access constraints."
            },
            {
              id: "m1_g1_d3",
              category: "iaas",
              scenario: "To comply with corporate privacy standards, we need to encrypt the raw backup block storage volumes attached to our virtual servers. The cloud provider offers encryption tools.",
              question: "Who is responsible for enabling encryption and managing key rotations for raw cloud storage volumes?",
              options: [
                "Customer IT Security Team - Data security and encryption settings for customer files are owned by us.",
                "Underlying Storage Fabric - The platform's managed block storage subsystem handles envelope encryption and rotation transparently using default infrastructure keys.",
                "Cloud Provider Security Services - The provider automatically encrypts all provisioned customer block storage by default using provider-managed root keys."
              ],
              correctIndex: 0,
              revealCause: "In IaaS, the customer owns their data. While the provider offers encryption mechanisms (like KMS APIs), enabling encryption at rest, managing key rotation schedules, and defining access policies are customer duties."
            },
            {
              id: "m1_g1_d4",
              category: "iaas",
              scenario: "A massive volumetric DDoS attack targets the physical network switches inside the cloud provider's datacenter, causing our VMs to suffer latency.",
              question: "Who is responsible for mitigating physical network infrastructure attacks and hardware outages?",
              options: [
                "Customer Network Team - We must deploy software DDoS shields on our virtual machines to protect the provider's physical routers.",
                "Cloud Provider - They own and manage the physical routers, switches, and internet gateways.",
                "Shared Edge WAN Protocol - Mitigating layer-3 infrastructure attacks is coordinate-managed where customers deploy edge routing protocols to absorb transit bandwidth."
              ],
              correctIndex: 1,
              revealCause: "Physical security, cooling, power, and physical network lines (routing, switching, and fiber infrastructure) are the sole responsibility of the cloud provider."
            },
            {
              id: "m1_g1_d5",
              category: "iaas",
              scenario: "A sophisticated hacker uses a CPU microcode exploit to achieve 'hypervisor breakout', letting them read raw RAM contents of neighboring VMs belonging to other customers on the same host.",
              question: "Who is responsible for tenant isolation and hypervisor security in cloud computing?",
              options: [
                "Cloud Provider - They must guarantee isolation between different customers sharing the same physical hardware.",
                "Customer DevSecOps Team - We must configure guest kernel modules and secure enclave virtualization containers to prevent inter-VM memory access.",
                "Cooperative Isolation Model - Hardware isolation is co-managed; tenants must configure software-defined memory segmentation overlays to prevent side-channel exploits."
              ],
              correctIndex: 0,
              revealCause: "Tenant isolation and securing the virtualization layer (hypervisor) is the core security commitment of a public cloud provider. A breakout means a failure in the provider's infrastructure security boundary."
            }
          ]
        },
        {
          id: "m1_g2",
          title: "PaaS Configuration Dashboard",
          subtitle: "Interactive Server Configuration Card",
          description: "Discuss and configure the security settings of a Platform as a Service (PaaS) web application. Set parameters to transition the security posture from Vulnerable to Secure.",
          type: "toggle_dashboard",
          items: [
            {
              id: "https_redirect",
              name: "HTTPS Redirection",
              desc: "Redirect all HTTP requests to secure HTTPS endpoints automatically.",
              correctState: true,
              revealCause: "HTTPS Redirection is critical to encrypt all client-server communications in transit, preventing session hijacking and credential sniffing."
            },
            {
              id: "cors_access",
              name: "Restricted CORS Policy",
              desc: "Disable wildcard '*' CORS headers and restrict access to trusted corporate domains.",
              correctState: true,
              revealCause: "Wildcard CORS headers (*) allow any external site to read app responses. Restricting CORS prevents Cross-Origin data leakage."
            },
            {
              id: "database_vault",
              name: "Key Vault Secret Reference",
              desc: "Remove database passwords from application config files and fetch them via dynamic Key Vault bindings.",
              correctState: true,
              revealCause: "Storing secrets in configuration files risks exposure in source control. Storing them in a Key Vault keeps credentials secure and auditable."
            },
            {
              id: "basic_auth",
              name: "Basic Authentication API Port",
              desc: "Disable standard username/password Basic Auth APIs in favor of OAuth2 Token auth.",
              correctState: false, // Disabling this setting is correct! Wait, let's frame the toggle as "Disable Basic Authentication".
              // Let's call the toggle "Disable Basic Auth" and make its correctState = true!
              // That way, turning it ON is securing it. Let's adjust names:
            }
          ],
          // Let's define the 5 toggles clearly:
          toggles: [
            {
              id: "toggle_https",
              name: "Enforce HTTPS Redirection",
              desc: "Redirect cleartext HTTP traffic to SSL/TLS endpoints.",
              defaultState: false,
              correctState: true,
              revealCause: "HTTPS redirection guarantees that all traffic is encrypted in transit. Disabling it leaves session cookies vulnerable to intercept."
            },
            {
              id: "toggle_cors",
              name: "Restrict CORS to Trusted Domains",
              desc: "Disable wildcard '*' origin sharing to block malicious browser read requests.",
              defaultState: false,
              correctState: true,
              revealCause: "Allowing wildcard CORS allows any script on the internet to read application session payload data. Restricting it enforces cross-origin boundaries."
            },
            {
              id: "toggle_secrets",
              name: "Enable Secrets Vault Bindings",
              desc: "Fetch database credentials dynamically from a Key Vault instead of hardcoded strings in code.",
              defaultState: false,
              correctState: true,
              revealCause: "Hardcoded connection strings are easily leaked in source control. Vault references secure the database keys and support rotation."
            },
            {
              id: "toggle_basicauth",
              name: "Disable Basic Authentication Protocols",
              desc: "Enforce Modern OAuth2 Token validation and disable simple password requests on legacy endpoints.",
              defaultState: false,
              correctState: true,
              revealCause: "Basic Authentication protocols do not support interactive MFA challenges and are easily targeted in credential stuffing attacks."
            },
            {
              id: "toggle_ratelimit",
              name: "Enable API Rate Limiting",
              desc: "Restrict IP requests to 100 per minute to mitigate denial of service attacks.",
              defaultState: false,
              correctState: true,
              revealCause: "Without rate limiting, public API endpoints can be flooded with requests, exhausting server resources and causing downtime."
            }
          ]
        },
        {
          id: "m1_g3",
          title: "SaaS Access Governance",
          subtitle: "Securing Cloud Enterprise Applications",
          description: "Govern the identities, authentication requirements, and data sharing privileges within Software as a Service (SaaS) environments.",
          type: "scenario",
          decisions: [
            {
              id: "m1_g3_d1",
              category: "saas",
              scenario: "A disgruntled employee is discharged. However, due to a delay in removing their accounts, they log in from their home terminal and download confidential records from the cloud-hosted SaaS CRM.",
              question: "Who is responsible for identity lifecycle management (onboarding, offboarding, and auditing access) in a SaaS model?",
              options: [
                "SaaS Vendor - The vendor’s cloud service is responsible for listening to corporate directory updates and terminating sessions automatically.",
                "Customer IT Security Team - We own access governance, user account management, and offboarding workflows.",
                "SaaS Identity Provider (IdP) - The cloud software vendor operates federated identity synchronizers that automatically audit and revoke active sessions based on local AD state changes."
              ],
              correctIndex: 1,
              revealCause: "In Software as a Service (SaaS), you do not manage infrastructure or application code, but you ALWAYS own access management: user accounts, group memberships, and role assignments are the customer's duty."
            },
            {
              id: "m1_g3_d2",
              category: "saas",
              scenario: "An administrator shares a corporate budget spreadsheet from a SaaS file service using a public link configuration ('Anyone with this link can view'). The link is leaked, revealing confidential supply costs.",
              question: "Who is responsible for configuring data sharing options and information security policies within a SaaS application?",
              options: [
                "Customer IT Security Team - We are responsible for setting sharing restrictions, file classifications, and DLP policies.",
                "SaaS Provider - They must block all sharing requests containing file types like spreadsheets.",
                "SaaS Application Security Layer - The host application dynamically audits file classifications and restricts unauthorized sharing links automatically by scanning document contents."
              ],
              correctIndex: 0,
              revealCause: "Even in SaaS, the provider only hosts the data and configuration panels. The customer is responsible for defining who can access what, enabling data loss prevention (DLP), and setting document classification rules."
            },
            {
              id: "m1_g3_d3",
              category: "saas",
              scenario: "A major vulnerability is discovered in the core database code of the SaaS email vendor, allowing unauthorized actors to read confidential logs stored on their shared multi-tenant database clusters.",
              question: "Who is responsible for fixing software vulnerabilities and database isolation bugs in a SaaS application?",
              options: [
                "Customer IT Security Team - We must hire developers to patch the SaaS provider's codebase.",
                "SaaS Vendor - They own, update, patch, and secure the software code, infrastructure, and databases.",
                "Shared Vulnerability SLA - The customer must apply hotfixes and patch database integrations via custom client-side API script extensions."
              ],
              correctIndex: 1,
              revealCause: "In SaaS, the vendor provides the software as a complete service. The customer has no access to the application source code or backend databases. Therefore, security patching, bug fixing, and backend configurations belong entirely to the SaaS vendor."
            },
            {
              id: "m1_g3_d4",
              category: "saas",
              scenario: "Our SaaS accounts are compromised because administrators did not enable Multi-Factor Authentication (MFA), allowing hackers to guess a password and hijack the accounting ledger.",
              question: "Who is responsible for enabling and enforcing MFA policies for users of a SaaS platform?",
              options: [
                "SaaS Vendor - They should enforce MFA on every account globally and refuse connection if a phone is missing.",
                "Customer IT Security Team - The vendor provides the MFA settings, but the customer must enable and enforce them.",
                "SaaS IAM Services - The vendor's identity control plane automatically enforces MFA based on global tenant risk score metrics, overriding customer group policies."
              ],
              correctIndex: 1,
              revealCause: "While the SaaS vendor must build secure authentication features (like MFA, SAML SSO integration, and IP gating), it is the customer's responsibility to configure, enable, and enforce these security features for their users."
            },
            {
              id: "m1_g3_d5",
              category: "saas",
              scenario: "An intruder attempts to break into the physical server facility where our SaaS vendor hosts the storage hardware.",
              question: "Who is responsible for physical security (guards, CCTV, locks, cages) of the SaaS servers?",
              options: [
                "Customer IT Security Team - We must deploy guards to secure the vendor's physical server cages.",
                "SaaS Vendor / Cloud Host - They are responsible for the physical security of their data center facilities.",
                "Coordinated Facility Governance - The customer audit team co-manages site entry control logs and validates security badge credentials at the vendor facility boundary."
              ],
              correctIndex: 1,
              revealCause: "Physical security of the server facility, backup storage units, cooling pipelines, and power supplies is always the responsibility of the cloud provider/vendor hosting the software infrastructure."
            }
          ]
        },
        {
          id: "m1_g4",
          title: "Shared Responsibility Matrix",
          subtitle: "Customer vs Provider Duties Mapping",
          description: "Drag and drop (or click to move) the 6 security duties into the correct column based on whether the Customer or the Cloud Provider holds the responsibility.",
          type: "drag_drop",
          leftBucket: "Customer Responsibility",
          rightBucket: "Provider Responsibility",
          items: [
            {
              id: "item_patch_guest",
              text: "Patching Guest Operating System (in IaaS VMs)",
              correctBucket: "left",
              revealCause: "In IaaS, the customer deploys the VM OS, and is fully responsible for patching and configuring it."
            },
            {
              id: "item_data_classification",
              text: "Data Classification & Content Compliance",
              correctBucket: "left",
              revealCause: "Regardless of the cloud model (IaaS, PaaS, SaaS), the customer always owns their own data and compliance."
            },
            {
              id: "item_firewall_rules",
              text: "Configuring Network Security Groups & Port Rules",
              correctBucket: "left",
              revealCause: "Setting rules to block or allow access (e.g. closing SSH/RDP ports) is managed by customer administrators."
            },
            {
              id: "item_physical_guard",
              text: "Physical Datacenter Security (Guards, Cages, CCTV)",
              correctBucket: "right",
              revealCause: "The cloud host secures the physical infrastructure, facility access, cooling, and power lines."
            },
            {
              id: "item_media_shredding",
              text: "Safe Destruction of Decommissioned Hard Drives",
              correctBucket: "right",
              revealCause: "Physical media lifecycle management and shredding is handled by the cloud provider's operations team."
            },
            {
              id: "item_hypervisor_secure",
              text: "Securing the Hypervisor & Server Virtualization Layer",
              correctBucket: "right",
              revealCause: "The provider is responsible for ensuring secure tenant isolation at the hypervisor level."
            }
          ]
        },
        {
          id: "m1_g5",
          title: "Hybrid Cloud Connectivity",
          subtitle: "Connecting Local to Cloud Assets",
          description: "Establish and protect the network bridges between local physical corporate servers and the public cloud network.",
          type: "scenario",
          decisions: [
            {
              id: "m1_g5_d1",
              category: "shared",
              scenario: "The IPsec VPN tunnel between our local command office and the cloud network drops. The outage is traced to a mismatched Pre-Shared Key (PSK) configured on our local physical office router.",
              question: "Who is responsible for configuration and maintenance of local on-premises network appliances in a hybrid cloud?",
              options: [
                "Cloud Provider - They must remotely log in and fix our office router configurations under default management SLAs.",
                "Customer IT Security Team - Managing, patching, and configuring on-premises hardware is our responsibility.",
                "Telecom Link Provider - The ISP or carrier managing the transit circuit is responsible for modifying client premises gateway tunnel configs."
              ],
              correctIndex: 1,
              revealCause: "In a hybrid cloud model, the customer is fully responsible for all on-premises hardware, local routing, VPN client setups, and configurations of local boundary firewalls."
            },
            {
              id: "m1_g5_d2",
              category: "shared",
              scenario: "We sync our local Active Directory database to the cloud. An administrator changes password complexity requirements in local AD, but due to a configuration error in the hybrid sync agent on our server, passwords stop syncing.",
              question: "Who is responsible for configuring and monitoring hybrid directory synchronization tools?",
              options: [
                "Customer IT Security Team - Synchronizing local user databases and managing active sync agents is the customer's responsibility.",
                "Cloud Provider - They must audit our local servers and fix the synchronization software.",
                "Identity Sync Engine API - The platform agent operates under auto-remediation policies where sync exceptions are auto-patched and resolved at the vendor's cloud console level."
              ],
              correctIndex: 0,
              revealCause: "Directory sync tools (like Azure AD Connect or Okta Directory Sync agents) are deployed and managed by the customer. Ensuring correct routing, credential synchronization, and synchronization agent updates is your duty."
            },
            {
              id: "m1_g5_d3",
              category: "shared",
              scenario: "A dedicated physical fiber optic line links our local server room directly to the cloud edge. A construction drill cuts the cable 1 kilometer outside the cloud data center boundary.",
              question: "Who coordinates the repair and physical restoration of dedicated high-speed cloud trunk lines?",
              options: [
                "Customer Network Team - We must dispatch fiber-splicing engineers to repair physical core trunk segments located outside the corporate facility.",
                "Cloud Provider / Telecommunication Carrier - The provider manages network trunks and physical links up to the edge of their facility.",
                "Local Utility Board - Physical routing cuts on public rights-of-way must be municipal-repaired and synchronized without provider carrier intervention."
              ],
              correctIndex: 1,
              revealCause: "Physical trunk line connections, carrier agreements, and provider-side edge routers are managed by the cloud host or their authorized network carrier. The customer's responsibility stops at their own endpoint router."
            },
            {
              id: "m1_g5_d4",
              category: "shared",
              scenario: "Our hybrid API gateway (which routes traffic between cloud applications and local on-premises mainframes) is overwhelmed by a denial of service attack because request rate limits were left unset.",
              question: "Who is responsible for setting API rate limiting and traffic management rules on a hybrid API gateway?",
              options: [
                "Customer IT Security Team - We must configure security profiles, rate ceilings, and request filters.",
                "Cloud Provider Web Layer - The cloud host automatically implements volumetric Layer 7 blocklists at the ingress hub to secure all downstream hybrid endpoints.",
                "Target Mainframe System - The destination backend database or mainframe OS must throttle concurrent socket calls at the kernel TCP layer to prevent overload."
              ],
              correctIndex: 0,
              revealCause: "Gateway security, rate limits, CORS configurations, and authorization headers are application-security attributes configured and managed by the customer."
            },
            {
              id: "m1_g5_d5",
              category: "shared",
              scenario: "A capacitor blows on a server motherboard inside our local physical server rack, causing our backup hybrid databases to crash.",
              question: "Who is responsible for server hardware maintenance and parts replacement for local hybrid nodes?",
              options: [
                "Cloud Provider Hardware Depot - The provider must ship replacement boards and dispatch local technicians under hybrid platform lease agreements.",
                "Customer IT Security Team - We own the local physical infrastructure, so hardware repairs and data center cooling are our responsibility.",
                "Hardware Warranty Carrier - The cloud platform SLA covers automated physical part swap-outs and technician dispatches for customer-premises servers."
              ],
              correctIndex: 1,
              revealCause: "In hybrid setups, the public cloud provider's SLA only covers cloud resources. On-premises server rooms, hardware procurement, disk swaps, cooling, and electrical grounding are entirely managed by the customer."
            }
          ]
        },
      ]
    },
    {
      id: "module2",
      title: "Identity Security & Zero Trust",
      subtitle: "AuthN, AuthZ, MFA, PAM, and Zero Trust architectures",
      description: "Master access control models. Learn the difference between authentication and authorization, secure identities with phishing-resistant MFA, control administrative scope using PAM, and implement Zero Trust principles.",
      games: [
        {
          id: "m2_g1",
          title: "Authentication vs Authorization",
          subtitle: "Identity Verification vs Permissions Mapping",
          description: "Drag and drop (or click to move) the 6 security actions into the correct column based on whether they represent Authentication (AuthN) or Authorization (AuthZ).",
          type: "drag_drop",
          leftBucket: "Authentication (AuthN)",
          rightBucket: "Authorization (AuthZ)",
          items: [
            {
              id: "item_authn_pass",
              text: "Validating a user's password and login ID",
              correctBucket: "left",
              revealCause: "Checking login credentials verifies the identity of the user, which is Authentication."
            },
            {
              id: "item_authn_mfa",
              text: "Verifying an offline TOTP code from an authenticator app",
              correctBucket: "left",
              revealCause: "MFA forms an extra verification check of the user's identity, belonging to Authentication."
            },
            {
              id: "item_authn_finger",
              text: "Scanning a user's fingerprint on a biometric reader",
              correctBucket: "left",
              revealCause: "Biometrics check physical identity attributes to authenticate who the user is."
            },
            {
              id: "item_authz_role",
              text: "Checking if a user belongs to the 'Global Admins' group",
              correctBucket: "right",
              revealCause: "Reviewing group memberships determines what operations the user has permissions to run (Authorization)."
            },
            {
              id: "item_authz_scope",
              text: "Restricting API access using OAuth scopes like 'read:billing'",
              correctBucket: "right",
              revealCause: "OAuth scopes define access limitations to resources, representing Authorization."
            },
            {
              id: "item_authz_time",
              text: "Limiting server write access to on-duty hours (ABAC context)",
              correctBucket: "right",
              revealCause: "Enforcing environmental access parameters controls what actions are authorized in real-time."
            }
          ]
        },
        {
          id: "m2_g2",
          title: "Multi-Factor Authentication Checkpoint",
          subtitle: "Card Swiper Activity: Safe vs Vulnerable",
          description: "Evaluate 5 authentication event cards. Click 'Vulnerable' (swipe left) or 'Secure' (swipe right) to classify each authentication event.",
          type: "swiper",
          items: [
            {
              id: "mfa_card_1",
              title: "Scenario Card 1",
              scenario: "An administrator receives a SMS verification code out of the blue, followed by an SMS message claiming to be from IT support asking to repeat the code to verify system updates.",
              question: "Is this authentication scenario Secure or Vulnerable?",
              correctAction: "vulnerable",
              revealCause: "This is a phished SMS OTP attack. SMS codes are not phishing-resistant and should never be shared with anyone."
            },
            {
              id: "mfa_card_2",
              title: "Scenario Card 2",
              scenario: "An engineer logs in using a FIDO2 WebAuthn hardware key. The authentication verifies origin domains cryptographically on the device before signing the challenge.",
              question: "Is this authentication scenario Secure or Vulnerable?",
              correctAction: "secure",
              revealCause: "FIDO2 security keys use public-key origin-bound cryptography, making them immune to standard credential phishing and SIM-swapping."
            },
            {
              id: "mfa_card_3",
              title: "Scenario Card 3",
              scenario: "An administrator is flooded with 30 authenticator app push requests at 2:30 AM. Exhausted by the continuous notifications, the administrator clicks 'Approve' to silence their phone.",
              question: "Is this authentication scenario Secure or Vulnerable?",
              correctAction: "vulnerable",
              revealCause: "This is an MFA Push Fatigue exploit. Without settings like 'Number Matching', administrators can be tricked into approving rogue logins."
            },
            {
              id: "mfa_card_4",
              title: "Scenario Card 4",
              scenario: "An on-site developer logs into the portal using an authenticator app generating TOTP codes offline. The app computes the code based on a pre-shared secret key and the local system clock.",
              question: "Is this authentication scenario Secure or Vulnerable?",
              correctAction: "secure",
              revealCause: "TOTP codes are generated locally and require no internet/network connectivity to function, eliminating cellular interception risks."
            },
            {
              id: "mfa_card_5",
              title: "Scenario Card 5",
              scenario: "A legacy billing tool logs in using simple SMTP Basic Authentication (username and password) without supporting MFA checkpoints, targeting an exclusions list on the firewall.",
              question: "Is this authentication scenario Secure or Vulnerable?",
              correctAction: "vulnerable",
              revealCause: "Legacy basic authentication protocols do not support interactive MFA challenges, making them major targets for automated credential stuffing."
            }
          ]
        },
        {
          id: "m2_g3",
          title: "PAM Just-In-Time Elevation",
          subtitle: "Chronological Ordering Activity",
          description: "Use the up/down arrows (▲/▼) to arrange the 5 steps of a Just-In-Time (JIT) privileged access elevation workflow in chronological order (from top to bottom).",
          type: "sorting",
          items: [
            {
              id: "jit_step_request",
              text: "User requests temporary administrative access in the PAM portal, stating a clear business justification.",
              correctIndex: 0,
              revealCause: "The JIT workflow begins when a user submits an elevation request stating a valid business justification."
            },
            {
              id: "jit_step_approve",
              text: "A security manager or designated data owner reviews the request and grants approval for a specific time window.",
              correctIndex: 1,
              revealCause: "Following submission, the request must be approved by an authorized manager or automated compliance gateway."
            },
            {
              id: "jit_step_token",
              text: "The PAM system issues a temporary security token and injects the credentials directly into the target session.",
              correctIndex: 2,
              revealCause: "Upon approval, the system provisions access. Secrets are injected directly, preventing the user from seeing cleartext passwords."
            },
            {
              id: "jit_step_audit",
              text: "User performs maintenance actions while the PAM gateway records all commands and keystrokes for audits.",
              correctIndex: 3,
              revealCause: "During the elevated session, the PAM system monitors and logs terminal commands for accountability."
            },
            {
              id: "jit_step_expire",
              text: "The time lease expires, the token is revoked, and administrative privileges are automatically stripped.",
              correctIndex: 4,
              revealCause: "Once the time limit ends, privileges are automatically terminated, ensuring zero standing administrative access."
            }
          ]
        },
        {
          id: "m2_g4",
          title: "Zero Trust Architecture",
          subtitle: "Implementing Zero Trust Principles",
          description: "Rebuild the security perimeter. Apply the core principles: Assume Breach, Verify Explicitly, and Never Trust, Always Verify.",
          type: "scenario",
          decisions: [
            {
              id: "m2_g4_d1",
              category: "identity",
              scenario: "A board member asks: 'If we secured our corporate network perimeter with firewalls, why do we need to encrypt and authenticate network traffic between servers in our internal data center?'",
              question: "Which Zero Trust principle addresses this question?",
              options: [
                "Perimeter Trust Containment - Relying on network boundary firewalls to authenticate and whitelist all traffic within the trusted zone.",
                "Assume Breach - Treat the internal network as hostile and encrypt/verify all traffic.",
                "Implicit Trust Delegation - Granting server-to-server communications dynamic routing paths based on internal domain memberships."
              ],
              correctIndex: 1,
              revealCause: "Zero Trust rejects the old model of 'trusted internal networks' (castle-and-moat). By assuming breach, you treat all networks as untrusted, requiring all communications to be encrypted, authenticated, and authorized."
            },
            {
              id: "m2_g4_d2",
              category: "identity",
              scenario: "A hacker compromises a front-end web server. In our old network, they were able to pivot and compromise the database instantly. We want to restrict lateral movement between adjacent servers.",
              question: "What network security technique restricts lateral traffic by segmenting workloads into small, isolated security zones?",
              options: [
                "Microsegmentation - Using granular security policies to isolate workloads from one another.",
                "Virtual Private LAN Service (VPLS) - Bundling broadcast domains to optimize edge security routing.",
                "Network Address Translation (NAT) Port Forwarding - Directing external ports to internal server nodes to hide IP addresses."
              ],
              correctIndex: 0,
              revealCause: "Microsegmentation divides networks into distinct security zones down to individual workload levels. This prevents attackers from moving laterally (sideways) within the network if they compromise a single node."
            },
            {
              id: "m2_g4_d3",
              category: "identity",
              scenario: "A user attempts to log in from a personal device in a new country. Even though they entered the correct password and completed MFA, the system blocks access because the device lacks corporate patch compliance.",
              question: "What Zero Trust evaluation criteria determines access in this scenario?",
              options: [
                "Static Verification Tokens - Verifying credentials against static security challenge questions and caching domain cookies.",
                "Explicit Verification of device state, compliance, location, and risk context.",
                "Identity Profile Lookup - Authenticating solely based on user directory state and active group memberships."
              ],
              correctIndex: 1,
              revealCause: "Zero Trust mandates that all access requests are explicitly verified against multiple real-time context metrics, including device health, location, network security posture, and data classification, rather than just credentials."
            },
            {
              id: "m2_g4_d4",
              category: "identity",
              scenario: "We want to verify that user laptops connecting to our cloud have active firewalls, recent security patches installed, and disk encryption enabled before allowing access to corporate data.",
              question: "What technology evaluates the health and compliance of an endpoint device prior to granting access?",
              options: [
                "Device Health Attestation / Endpoint Compliance Policy.",
                "ICMP Diagnostic Queries - Performing active ping scans and network interface diagnostics to confirm connectivity.",
                "LDAP Schema Auditing - Verifying user record birth dates and directory profile parameters prior to access authorization."
              ],
              correctIndex: 0,
              revealCause: "Endpoint compliance systems inspect the requesting device's security configuration (antivirus active, patches current, disk encrypted) to verify the device meets security standards before authorizing connections."
            },
            {
              id: "m2_g4_d5",
              category: "identity",
              scenario: "A user logs in, completes MFA, and starts downloading 10,000 sensitive files. Ten minutes into the download, their account behavior is flagged as high-risk, and their session is automatically terminated.",
              question: "Which Zero Trust concept is illustrated by this automatic session termination?",
              options: [
                "Single Sign-On (SSO) Session Lifecycle - Authenticating the identity once at ingress and maintaining session validity until explicit logout.",
                "Continuous Risk Assessment and Session Authorization.",
                "Dynamic IP Route Optimization - Rerouting high-bandwidth downloads to optimized edge servers to prevent system bottlenecks."
              ],
              correctIndex: 1,
              revealCause: "Zero Trust is not a one-time check at login. Access must be continuously authorized and monitored. If user risk scores spike or anomalous behavior is detected, the security engine dynamically revokes session access."
            }
          ]
        },
        {
          id: "m2_g5",
          title: "Identity Governance & Compliance",
          subtitle: "Compliance, Auditing & Access Lifecycles",
          description: "Govern identity lifecycles. Learn about Segregation of Duties, access certification reviews, and immutable auditing records.",
          type: "scenario",
          decisions: [
            {
              id: "m2_g5_d1",
              category: "identity",
              scenario: "During an audit, we discover that former employees still have active accounts in our customer data portal because managers did not audit access rosters.",
              question: "What identity governance process requires managers to regularly review and justify employee access rights?",
              options: [
                "Automated Group Policy Sync - Running nightly directory cleanup scripts to sync active employee lists.",
                "Attestation / Access Certification Reviews - Regular audits where managers must justify and re-approve user access.",
                "Log Retraction Policy - Purging access event histories quarterly to reduce security audit overhead."
              ],
              correctIndex: 1,
              revealCause: "Access certification reviews force managers or data owners to audit active user rights periodically. Access that is no longer required is revoked, preventing permissions accumulation and orphaned accounts."
            },
            {
              id: "m2_g5_d2",
              category: "identity",
              scenario: "An engineer transfers from database administration to marketing, but retains their database edit permissions because their account was not processed for role changes.",
              question: "Which stage of Identity Lifecycle Management failed in this transition?",
              options: [
                "Initial Onboarding Provisioning - Allocating default permission sets during the employee onboarding phase.",
                "Access Mutation / Role Lifecycle Transition.",
                "SDN Route Configuration - Updating network gateway routing profiles to segment developer traffic."
              ],
              correctIndex: 1,
              revealCause: "The 'Joiner-Mover-Leaver' (JML) framework governs user lifecycle states. When a mover changes roles, old permissions must be stripped ('Mover access remediation') to align with their new least privilege profile."
            },
            {
              id: "m2_g5_d3",
              category: "identity",
              scenario: "An accountant is able to both create a new vendor profile in the finance system AND approve payments to that same vendor, enabling them to execute unauthorized disbursements.",
              question: "What core internal control principle prevents users from executing conflicting sensitive actions?",
              options: [
                "Dual-Homed Firewall Configurations - Implementing redundant network barriers to filter finance traffic.",
                "Segregation of Duties (SoD) - Splitting key roles so no single identity can perform fraud unchecked.",
                "Symmetric Key Cryptography - Enforcing payload encryption using shared secrets to prevent record tampering."
              ],
              correctIndex: 1,
              revealCause: "Segregation of Duties (SoD) prevents fraud by dividing critical tasks between multiple users. A single user must not have enough privileges to initiate, authorize, and complete a financial transaction alone."
            },
            {
              id: "m2_g5_d4",
              category: "identity",
              scenario: "Active administrative accounts are discovered that do not correspond to any active employee in the HR directory, indicating they are orphan credentials.",
              question: "What is the best way to prevent orphan accounts in cloud identity systems?",
              options: [
                "HR-Driven Provisioning - Automating account lifecycle triggers (creation, suspension) directly from HR database events.",
                "Voluntary Offboarding Declarations - Enforcing policies where departing employees submit account deletion request forms.",
                "Anonymous Administrative Identity Management - Issuing non-personally identifiable service accounts to run database tasks."
              ],
              correctIndex: 0,
              revealCause: "HR-driven provisioning coordinates active directory states directly with HR records. When HR changes an employee status to 'terminated', the synchronization system automatically disables all associated identity accounts."
            },
            {
              id: "m2_g5_d5",
              category: "identity",
              scenario: "A hacker gains database write access and attempts to cover their tracks by editing the security audit logs stored on the local database host to erase their IP address.",
              question: "How should security logs be archived to ensure their integrity and compliance with audits?",
              options: [
                "Flat-File Hosting on Local Storage - Storing log streams as standard text files in secure directories on the database virtual machine.",
                "Shipping logs immediately to a centralized, immutable storage repository (Write-Once-Read-Many / WORM) separated from database administration rights.",
                "Administrative Log Reconciliation - Allowing administrative users write permissions to filter and format log entries for auditing consistency."
              ],
              correctIndex: 1,
              revealCause: "Security logs must be centralized, isolated, and immutable. Shipping logs to WORM storage ensures they cannot be altered or deleted, even if an attacker gains local root access to the database server."
            }
          ]
        }
      ]
    },
    {
      id: "module3",
      title: "Network Security: Secure Network Design",
      subtitle: "Building secure cloud networks with proper segmentation, traffic filtering, DDoS protection, and web application firewalls",
      description: "Design resilient cloud networks. Implement public-private subnet separation, cloud routers, web application firewalls (WAF) to block application exploits, and infrastructure protection to absorb volumetric DDoS attacks.",
      games: [
        {
          id: "m3_g1",
          title: "VPC & VNet Segmentations",
          subtitle: "Network Isolation & Routing Scenarios",
          description: "Establish public-private boundaries. Configure route tables, Transit Gateways, Bastion Hosts/IAPs, and Flow Logs to secure and audit network traffic.",
          type: "scenario",
          decisions: [
            {
              id: "m3_g1_d1",
              category: "network",
              scenario: "Designing a multi-tier web application network. Web servers need public access, but databases must be completely private.",
              question: "What is the optimal subnet architecture to secure the application database tier?",
              options: [
                "Public-Private Subnet Split - Deploy databases in a private subnet with no public route, using virtual network boundary rules to restrict ingress to the web tier.",
                "Direct Internet Gateways - Place both tiers in a public subnet and use database firewall rules to block inbound TCP port 1433 requests.",
                "Single Security Domain - Deploy a unified subnet layout and rely on database operating system credentials to prevent host access."
              ],
              correctIndex: 0,
              revealCause: "Private subnets do not associate with internet gateways. By separating web and database tiers into public and private subnets, you enforce physical routing boundaries."
            },
            {
              id: "m3_g1_d2",
              category: "network",
              scenario: "Connecting ten distinct VPCs in a hub-and-spoke mesh without creating complex point-to-point peering connections.",
              question: "What is the best cloud network topology to connect these VPCs while retaining central control?",
              options: [
                "Full-Mesh Peering - Establishing bidirectional VPC peering links between all ten spokes to allow direct, unmonitored communication.",
                "Transit Gateway (TGW) Hub - Deploy a centralized cloud router to coordinate routing tables and transit traffic between spoke networks securely.",
                "Public Proxy Overlay - Routing transit spoke traffic out to the public internet and back through client proxy gateways."
              ],
              correctIndex: 1,
              revealCause: "A Transit Gateway acts as a cloud router, simplifying network architecture from peer-to-peer links to a clean hub-and-spoke model."
            },
            {
              id: "m3_g1_d3",
              category: "network",
              scenario: "A developer needs temporary access to debug a private database server. They suggest attaching a public IP address directly to the database instance.",
              question: "What is the secure alternative to granting temporary remote administration access to private subnets?",
              options: [
                "Public Route Table Override - Temporarily routing private subnet traffic to the public internet gateway for debugging sessions.",
                "Bastion Host / Identity-Aware Proxy (IAP) - Route admin traffic through a hardened tunnel gateway that enforces strict identity-based access control.",
                "Direct SSH Gating - Open inbound SSH port 22 on the instance and restrict ingress to the developer's home IP."
              ],
              correctIndex: 1,
              revealCause: "Bastion hosts or Identity-Aware Proxies provide a single, audited checkpoint, avoiding direct public exposure of private assets."
            },
            {
              id: "m3_g1_d4",
              category: "network",
              scenario: "Securing communication between VPC resources and cloud managed services (like cloud databases or object storage) without routing packets over the public internet.",
              question: "Which technology establishes a private connection between your virtual network and provider services?",
              options: [
                "Private Service Endpoint / Private Link - Inject a private network interface into the VPC to route service traffic entirely inside the cloud network.",
                "External NAT Gateway - Routing service requests through NAT gateways to translate VPC IPs to public internet addresses.",
                "Internet Gateway Translation - Mapping service endpoints to public DNS records and letting internet switches handle routing."
              ],
              correctIndex: 0,
              revealCause: "Endpoints route traffic over the provider's internal fabric, avoiding public DNS/internet routing entirely."
            },
            {
              id: "m3_g1_d5",
              category: "network",
              scenario: "Analyzing traffic patterns and auditing failed connection attempts to detect unauthorized traversal attempts in cloud subnets.",
              question: "What native cloud network auditing feature captures IP traffic logs going to and from network interfaces?",
              options: [
                "VPC Flow Logs - Capture and analyze metadata records of network sessions at network interfaces.",
                "Operating System Syslogs - Parsing local machine logs to track IP routing table changes.",
                "Application Access Tracing - Inspecting application-level HTTP header logs at the proxy gateway."
              ],
              correctIndex: 0,
              revealCause: "VPC Flow logs capture packet headers at the infrastructure level (NIC), ensuring logs cannot be tampered with by guest OS users."
            }
          ]
        },
        {
          id: "m3_g2",
          title: "NSG vs WAF Rules Mapping",
          subtitle: "Traffic Filtering Controls",
          description: "Drag and drop (or click to move) the 6 security actions into the correct column based on whether they belong to Layer 3/4 Network Security Groups or Layer 7 Web Application Firewalls.",
          type: "drag_drop",
          leftBucket: "Network Security Group (NSG/SG)",
          rightBucket: "Web Application Firewall (WAF)",
          items: [
            {
              id: "item_nsg_block_ip",
              text: "Blocking inbound traffic from a specific malicious IP range (e.g. 198.51.100.0/24)",
              correctBucket: "left",
              revealCause: "IP address blocking operates at the packet header layer, representing standard Layer 3 NSG routing filters."
            },
            {
              id: "item_nsg_block_port",
              text: "Filtering traffic on TCP Port 22 (SSH) and Port 3389 (RDP)",
              correctBucket: "left",
              revealCause: "Port-level restrictions drop traffic at Layer 4 before reaching application hosts, managed by NSGs."
            },
            {
              id: "item_waf_sqli",
              text: "Blocking SQL Injection (SQLi) attacks inside HTTP POST parameters",
              correctBucket: "right",
              revealCause: "SQLi checks require decoding and inspecting application-layer HTTP body payloads, managed by WAFs."
            },
            {
              id: "item_waf_xss",
              text: "Inspecting HTTP headers for Cross-Site Scripting (XSS) script injections",
              correctBucket: "right",
              revealCause: "XSS prevention audits HTTP request headers and URL strings for malicious JavaScript, requiring a WAF."
            },
            {
              id: "item_nsg_stateless",
              text: "Applying stateless port-level access rules at the virtual subnet layer",
              correctBucket: "left",
              revealCause: "Subnet access lists evaluate Layer 3/4 headers and run statelessly, standard for NSGs/ACLs."
            },
            {
              id: "item_waf_geoblock",
              text: "Applying geographic IP rate limiting (Geo-blocking) to HTTP/HTTPS requests",
              correctBucket: "right",
              revealCause: "Geo-blocking and rate limiting on web requests inspect Layer 7 HTTP request headers, handled by WAFs."
            }
          ]
        },
        {
          id: "m3_g3",
          title: "WAF Rules Configuration",
          subtitle: "Enforcing Layer 7 Inspections",
          description: "Interact with the Web Application Firewall (WAF) dashboard settings. Enable the correct rules to secure web endpoints from SQLi, XSS, and automated bot attacks.",
          type: "toggle_dashboard",
          toggles: [
            {
              id: "toggle_sqli",
              name: "SQL Injection Protection Rules",
              desc: "Detect and block database-specific query tags inside client parameter inputs.",
              defaultState: false,
              correctState: true,
              revealCause: "SQLi rules inspect inputs for drop, union, or select commands, neutralizing database hijacking threats."
            },
            {
              id: "toggle_xss",
              name: "Cross-Site Scripting (XSS) Rules",
              desc: "Sanitize request strings and block inline script tags to protect browser sessions.",
              defaultState: false,
              correctState: true,
              revealCause: "XSS rules prevent malicious scripts from being injected into the web application and executed on users' browsers."
            },
            {
              id: "toggle_owasp",
              name: "OWASP Core Rule Set (CRS)",
              desc: "Apply the standard base configuration covering common web vulnerability exploits.",
              defaultState: false,
              correctState: true,
              revealCause: "The OWASP Core Rule Set shields applications against broad threat classes like session hijacking and protocol anomalies."
            },
            {
              id: "toggle_geoblock",
              name: "Geographic IP Restrictions",
              desc: "Filter web access based on country-of-origin headers to restrict high-risk locations.",
              defaultState: false,
              correctState: true,
              revealCause: "Geoblocking blocks connections from regions where the enterprise has no operational or customer presence, reducing scan exposures."
            },
            {
              id: "toggle_botcontrol",
              name: "Enforce Bot Control Limits",
              desc: "Analyze connection heuristics to identify and rate limit automated search spiders or scrape bots.",
              defaultState: false,
              correctState: true,
              revealCause: "Bot control mitigates credential-stuffing and scraping attempts, protecting server compute limits from overload."
            }
          ]
        },
        {
          id: "m3_g4",
          title: "DDoS Mitigation & Edge Defenses",
          subtitle: "Absorbing Volumetric & Protocol Floods",
          description: "Protect application endpoints from volumetric network outages. Configure scrubbing centers, CDN caching, and SYN cookies to maintain availability.",
          type: "scenario",
          decisions: [
            {
              id: "m3_g4_d1",
              category: "ddos",
              scenario: "A sudden spike in volumetric DNS query reflection traffic targets our public cloud DNS zone, threatening to make application domain names unresolvable.",
              question: "What layer of security handles physical volumetric DDoS mitigation?",
              options: [
                "Cloud Infrastructure Shield - Deploying automated scrubbing centers at cloud network boundaries to absorb multi-gigabit traffic.",
                "Application Server Scaling - Provisioning more VM database instances to handle millions of DNS lookup queries.",
                "Shared Edge WAN Protocol - Mitigating layer-3 infrastructure attacks is coordinate-managed where customers deploy edge routing protocols."
              ],
              correctIndex: 0,
              revealCause: "Volumetric DDoS attacks must be mitigated at the cloud provider's ingress scrubbing centers before they reach virtual subnets."
            },
            {
              id: "m3_g4_d2",
              category: "ddos",
              scenario: "An attacker is flooding our HTTP endpoints with rapid page reload requests, causing application server CPUs to hit 100%.",
              question: "Which technology mitigates HTTP Application-layer (Layer 7) DDoS attacks?",
              options: [
                "Layer 4 Infrastructure Firewall - Blocking all inbound UDP ports to secure application web engines.",
                "WAF Rate Limiting / CDN Ingress - Enforcing request limits per client IP at the Edge Content Delivery Network (CDN).",
                "Enlarging Subnet IP Allocations - Expanding the virtual network CIDR block to allow more IP sessions."
              ],
              correctIndex: 1,
              revealCause: "Layer 7 DDoS attacks are mitigated by rate limiting HTTP headers at edge caching nodes (CDNs) before they overload origin servers."
            },
            {
              id: "m3_g4_d3",
              category: "ddos",
              scenario: "The corporate security team debates whether to keep our cloud origin IP addresses publicly discoverable in DNS settings or hide them behind a CDN/Proxy.",
              question: "What is the network design best practice to protect cloud origins from direct IP attacks?",
              options: [
                "IP Obfuscation / CDN Origin Shield - Route all public traffic through Content Delivery networks and restrict origin firewalls to accept only CDN IPs.",
                "Direct Access Mapping - Assigning public DNS records directly to origin VM servers to optimize connection speeds.",
                "Dynamic DNS Rotation - Rotating origin IP addresses every 10 minutes to confuse attackers."
              ],
              correctIndex: 0,
              revealCause: "Restricting origin security groups to CDN-only IP ranges prevents attackers from bypassing edge controls and attacking origin servers directly."
            },
            {
              id: "m3_g4_d4",
              category: "ddos",
              scenario: "A DDoS attack is flooding our cloud servers with TCP SYN packets, exhausting the system connection tables.",
              question: "What TCP/IP mechanism should be active to mitigate SYN flood attacks at the network layer?",
              options: [
                "SYN Cookies / Provider SYN proxying - Handshaking connection requests at the cloud edge before forwarding verified TCP connections to origin.",
                "DNS TTL Reductions - Reducing DNS cache times to trigger rapid clients IP updates.",
                "Symmetric Encryption Key changes - Changing network keys to invalidate handshakes."
              ],
              correctIndex: 0,
              revealCause: "SYN proxying validates connection integrity before initiating server-side handshakes, preventing connection table exhaustion."
            },
            {
              id: "m3_g4_d5",
              category: "ddos",
              scenario: "Our cloud application auto-scales up during a DDoS attack, but this dramatically inflates our cloud bill because we are paying for malicious traffic servers.",
              question: "What is the best cost mitigation strategy during sustained DDoS attacks?",
              options: [
                "DDoS Cost Protection / SLA Reimbursement - Enroll in cloud DDoS protection plans that credit back auto-scaling costs caused by verified attacks.",
                "Disabling Auto-scaling - Freezing server count limits so the system crashes instead of billing higher.",
                "Disabling Network Monitoring - Shutting down system alerts to ignore bill warnings."
              ],
              correctIndex: 0,
              revealCause: "Cloud providers offering advanced DDoS protection guarantee cost billing protection, shielding enterprises from scaling cost surges."
            }
          ]
        }
      ]
    },
    {
      id: "module4",
      title: "Data Security: Protection & Encryption",
      subtitle: "Implementing comprehensive data protection through encryption at rest, in transit, in use, and robust key management strategies",
      description: "Secure critical business records. Classify and apply encryption at rest, encrypt data in transit via TLS, protect data in use in CPU RAM enclaves, and administer HSM Key Vault operations.",
      games: [
        {
          id: "m4_g1",
          title: "At Rest vs In Transit Encryption",
          subtitle: "Classifying Cryptographic Enforcements",
          description: "Drag and drop (or click to move) the 6 cryptographic controls into the correct column based on whether they protect Data At Rest or Data In Transit.",
          type: "drag_drop",
          leftBucket: "Encryption At Rest",
          rightBucket: "Encryption In Transit",
          items: [
            {
              id: "item_enc_tls",
              text: "Enforcing TLS 1.3 cryptographic tunnels for HTTP connections",
              correctBucket: "right",
              revealCause: "TLS 1.3 encrypts active network connections in flight, protecting data in transit."
            },
            {
              id: "item_enc_bitlocker",
              text: "Enabling BitLocker or Cloud Managed Volume Encryption on VM disks",
              correctBucket: "left",
              revealCause: "Disk volume encryption secures stored bits on physical hardware blocks (data at rest)."
            },
            {
              id: "item_enc_s3kms",
              text: "Encrypting Cloud Storage buckets using KMS-managed root keys",
              correctBucket: "left",
              revealCause: "Object storage bucket policies encrypt files when saved, ensuring protection at rest."
            },
            {
              id: "item_enc_vpn",
              text: "Securing site-to-site VPN tunnels using IPsec network protocols",
              correctBucket: "right",
              revealCause: "IPsec tunnels encrypt packet payloads while crossing public router boundaries (in transit)."
            },
            {
              id: "item_enc_tde",
              text: "Transparent Data Encryption (TDE) configured on SQL Database servers",
              correctBucket: "left",
              revealCause: "TDE encrypts database pages, backup files, and transaction logs when written to disk (at rest)."
            },
            {
              id: "item_enc_https",
              text: "Encrypting API payloads via HTTPS using SSL certificates",
              correctBucket: "right",
              revealCause: "HTTPS encrypts API payloads between clients and API gateways (in transit)."
            }
          ]
        },
        {
          id: "m4_g2",
          title: "In-Use & Confidential Computing",
          subtitle: "Runtime Data Isolation Checkpoint",
          description: "Protect plaintext data while it is active in system memory. Explore secure RAM enclaves, remote hardware attestation, and total memory encryption.",
          type: "scenario",
          decisions: [
            {
              id: "m4_g2_d1",
              category: "cryptography",
              scenario: "An enterprise application processes highly sensitive database records. Even though disk storage and TLS networking are encrypted, database administrators with root access can read cleartext RAM memory dumps during CPU execution.",
              question: "What technology isolates data in RAM during processing to prevent administrative snooping?",
              options: [
                "Confidential Computing / Secure Enclaves - Hardware-based memory encryption that isolates virtual workloads from hypervisors and host root administrators.",
                "File-System Level Encryption - Encrypting local files inside OS directories to block directory listings.",
                "RAM Memory Defragmentation - Running frequent defragmentation sweeps to overwrite database memory cells."
              ],
              correctIndex: 0,
              revealCause: "Confidential computing encrypts RAM at the hardware level, protecting data in use even from privileged host OS administrators."
            },
            {
              id: "m4_g2_d2",
              category: "cryptography",
              scenario: "We want to run calculations and analysis on a dataset hosted in the cloud, but our compliance policies prohibit decrypting the data at any point in the cloud environment.",
              question: "What emerging cryptographic technique permits processing of encrypted ciphertexts without ever decrypting them?",
              options: [
                "Homomorphic Encryption - Perform mathematical operations directly on encrypted data, yielding an encrypted result that only the customer can decrypt.",
                "Asymmetric RSA Encryption - Generating public/private key pairs to decrypt files rapidly in system buffers.",
                "Hashing algorithms - Computing SHA-256 hashes of datasets to extract calculations."
              ],
              correctIndex: 0,
              revealCause: "Homomorphic encryption allows analytical models to compute values on encrypted inputs, ensuring zero plaintext exposure in cloud RAM."
            },
            {
              id: "m4_g2_d3",
              category: "cryptography",
              scenario: "To verify that a Confidential Computing environment is authentic and running genuine, unaltered enclave code on certified hardware, we need an independent audit proof.",
              question: "What process validates the integrity of a secure enclave workload prior to sending sensitive data?",
              options: [
                "Attestation / Cryptographic Verification - The hardware enclave generates a signed token verifying its configuration and authenticity.",
                "Administrator Manual Review - Requesting host administrators to manually audit server motherboard logs.",
                "ICMP Echo Requests - Ping auditing the enclave IP address to verify system responsiveness."
              ],
              correctIndex: 0,
              revealCause: "Remote attestation uses public-key cryptography to prove that an enclave is genuine, untampered, and running on compliant hardware."
            },
            {
              id: "m4_g2_d4",
              category: "cryptography",
              scenario: "Developers are designing microservices that process encryption keys. They want to ensure keys are never exposed in plaintext in CPU registers when decrypting payloads.",
              question: "What CPU-level hardware-isolated container isolates keys during memory execution?",
              options: [
                "Hardware Security Enclave (e.g. Intel SGX / AMD SEV) - Dedicated processor compartments that shield critical code blocks from external inspection.",
                "Hyperthreading pools - Splitting processing queues across multiple physical cores.",
                "Local System Temp directories - Storing keys in system temp files protected by user group policies."
              ],
              correctIndex: 0,
              revealCause: "Secure enclaves isolate memory pages at the hardware level, blocking access from host operating systems, hypervisors, and local root accounts."
            },
            {
              id: "m4_g2_d5",
              category: "cryptography",
              scenario: "A cloud service provider employee gains physical access to the server memory chips (DIMMs) and attempts to intercept data by connecting a hardware debugger to the bus.",
              question: "What hardware feature mitigates physical bus probing and memory interception attacks on RAM chips?",
              options: [
                "Hardware Memory Encryption (TME/MKTME) - Real-time cryptographic encryption of data moving between the CPU and external RAM DIMMs.",
                "Chassis Intrusion Detection - Automatic system power cuts when physical server covers are opened.",
                "Local Host Firewalls - Restricting inbound network access to memory addresses."
              ],
              correctIndex: 0,
              revealCause: "Total Memory Encryption (TME) encrypts RAM contents using key material generated inside the CPU, rendering bus probes useless."
            }
          ]
        },
        {
          id: "m4_g3",
          title: "KMS Key Rotation Workflow",
          subtitle: "Chronological Sequence Sorting",
          description: "Use the up/down arrows (▲/▼) to arrange the 5 steps of a Key Management Service (KMS) manual key rotation and database data migration workflow in chronological order (from top to bottom).",
          type: "sorting",
          items: [
            {
              id: "key_step_create",
              text: "Create a new Key Version (cryptographic material) inside the Key Vault / KMS portal.",
              correctIndex: 0,
              revealCause: "The rotation begins by generating fresh key material inside the HSM cluster."
            },
            {
              id: "key_step_alias",
              text: "Update the KMS Key Alias to reference the new key version for all new encryption requests.",
              correctIndex: 1,
              revealCause: "Updating the alias redirects all subsequent encryption calls to the new key without breaking application configuration references."
            },
            {
              id: "key_step_encrypt",
              text: "Encrypt all newly created database records using the updated active key reference.",
              correctIndex: 2,
              revealCause: "New application write operations utilize the newly referenced version transparently."
            },
            {
              id: "key_step_retain",
              text: "Retain the old key version in active read-only state to decrypt legacy database records.",
              correctIndex: 3,
              revealCause: "Legacy keys must be preserved to decrypt historical rows that have not yet been rewritten."
            },
            {
              id: "key_step_archive",
              text: "Deprecate and archive the legacy key version once all old records have been re-encrypted.",
              correctIndex: 4,
              revealCause: "Once background jobs re-encrypt all historical data, the legacy key material can be safely archived."
            }
          ]
        },
        {
          id: "m4_g4",
          title: "Key Vault & HSM Strategies",
          subtitle: "CMK, Envelope Encryption & HSM Bounds",
          description: "Establish secure key storage parameters. Learn the difference between Customer Managed Keys, hardware security modules, and recovery protections.",
          type: "scenario",
          decisions: [
            {
              id: "m4_g4_d1",
              category: "key_management",
              scenario: "Our compliance framework dictates that we must maintain complete ownership over our database encryption keys, including the ability to instantly revoke cloud database access without provider consent.",
              question: "Which key management strategy should be implemented to meet this requirement?",
              options: [
                "Customer Managed Keys (CMK) / Bring Your Own Key (BYOK) - The customer generates and controls the root key, granting storage access via KMS IAM policies.",
                "Provider Managed Keys - Enrolling in the provider's default storage encryption, where the host automatically rotates keys.",
                "Local Text File Storage - Saving database key strings in a text file in a private directory on our local backup servers."
              ],
              correctIndex: 0,
              revealCause: "CMKs put key governance in the customer's control. Disabling the CMK instantly cuts off the database from the decrypted storage without provider intervention."
            },
            {
              id: "m4_g4_d2",
              category: "key_management",
              scenario: "The database needs to encrypt millions of individual rows. Requesting the KMS API to encrypt each row individually creates massive network latency and hits API rate limits.",
              question: "What design pattern resolves database row-level encryption latency?",
              options: [
                "Envelope Encryption - Request a master key from KMS, generate local Data Encryption Keys (DEKs) to encrypt data locally, and store the encrypted DEK alongside the data.",
                "API Request Batching - Buffering 10,000 database rows and sending them in a single massive POST request to KMS.",
                "Disabling Row Security - Encrypting only the primary ID column of the database to speed up performance."
              ],
              correctIndex: 0,
              revealCause: "Envelope encryption uses local DEKs for fast data operations, utilizing the KMS API only for decrypting/encrypting the local DEK."
            },
            {
              id: "m4_g4_d3",
              category: "key_management",
              scenario: "We need to guarantee that cryptographic keys are generated and stored only on physical hardware modules that are certified to FIPS 140-2 Level 3 standards and cannot be extracted by anyone.",
              question: "What technology hosts keys under FIPS 140-2 Level 3 hardware security guarantees?",
              options: [
                "Hardware Security Modules (HSMs) - Hardened physical appliances that process cryptographic operations within tamper-resistant boundaries.",
                "Software Key Vault Containers - Virtual machines storing key material in encrypted filesystem volumes.",
                "Local Active Directory databases - Saving keys inside standard domain controller schemas."
              ],
              correctIndex: 0,
              revealCause: "Dedicated Cloud HSM instances ensure that cryptographic operations occur inside hardware boundaries, preventing keys from ever appearing in CPU registers outside the HSM."
            },
            {
              id: "m4_g4_d4",
              category: "key_management",
              scenario: "An administrator accidentally grants public read permissions to our Key Vault database, but database connections are still blocked. We want to configure the vault so that network access is restricted to our specific application subnet.",
              question: "What security control limits network entry pathways directly at the Key Vault resource level?",
              options: [
                "Key Vault Firewall & Service Endpoints - Enforce network routing rules at the vault layer to drop all traffic originating outside approved subnets.",
                "User Authentication passwords - Strengthening user login complexity requirements to mitigate portal access.",
                "Dynamic DNS routing - Mapping the vault endpoint to a changing private IP address range."
              ],
              correctIndex: 0,
              revealCause: "Resource firewalls drop connection requests at the networking layer, preventing external hosts from even attempting credential verification."
            },
            {
              id: "m4_g4_d5",
              category: "key_management",
              scenario: "An attacker compromises an administrator's account and executes a command to delete the production Key Vault. We want to prevent immediate, irreversible deletion of our cryptographic keys.",
              question: "Which Key Vault feature prevents immediate key deletion by administrators?",
              options: [
                "Soft-Delete & Purge Protection - Retain deleted vaults in a recoverable state for a retention window, prohibiting immediate purge even by administrators.",
                "IAM Password Complexity policies - Enforcing quarterly updates of administrative portal access credentials.",
                "VPC Subnet peering - Linking the vault to redundant network zones to duplicate the databases."
              ],
              correctIndex: 0,
              revealCause: "Purge protection ensures that deleted keys are held in a secure cloud quarantine for a recovery window, safeguarding against malicious or accidental deletions."
            }
          ]
        }
      ]
    },
    {
      id: "module5",
      title: "Threat Awareness: Cloud Threat Landscape",
      subtitle: "Understanding real-world cloud threats, attack patterns, misconfiguration risks, and building effective detection and response capabilities",
      description: "Analyze attack paths and secure threat boundaries. Identify cloud misconfigurations, mitigate credential leakage, order incident response workflows, and secure endpoints against SSRF and ransomware.",
      games: [
        {
          id: "m5_g1",
          title: "Misconfiguration Audit Dashboard",
          subtitle: "Hardening Resource Settings",
          description: "Govern cloud resource properties. Scan your cloud dashboard settings and toggle variables to eliminate common configuration errors like open storage or management ports.",
          type: "toggle_dashboard",
          toggles: [
            {
              id: "toggle_s3public",
              name: "Enforce Block Public Storage Access",
              desc: "Disable anonymous internet read access on object storage containers.",
              defaultState: false,
              correctState: true,
              revealCause: "Blocking public storage ingress secures internal reports from automated directory enumeration bots."
            },
            {
              id: "toggle_sshanywhere",
              name: "Restrict Admin SSH/RDP Ports",
              desc: "Close port 22/3389 access from the open internet (0.0.0.0/0).",
              defaultState: false,
              correctState: true,
              revealCause: "Closing public SSH/RDP access limits management access to corporate VPN gateways, blocking brute force sweeps."
            },
            {
              id: "toggle_defaultcreds",
              name: "Disable Default Root Credentials",
              desc: "Rotate pre-configured administrative passwords on runtime databases.",
              defaultState: false,
              correctState: true,
              revealCause: "Standard default passwords are compiled in attacker scripts and tested immediately upon discovery."
            },
            {
              id: "toggle_auditlogging",
              name: "Activate Infrastructure Audit Logging",
              desc: "Enforce writing console and resource mutation operations to secure logs.",
              defaultState: false,
              correctState: true,
              revealCause: "Comprehensive auditing is essential to detect unauthorized configuration drift and construct incident timelines."
            },
            {
              id: "toggle_orphankeys",
              name: "Revoke Inactive Access Keys",
              desc: "Deprecate developer API keys older than 90 days that show no recent activity.",
              defaultState: false,
              correctState: true,
              revealCause: "Leaked or orphaned API credentials represent a massive attack surface. Enforcing expiry limits limits exposure windows."
            }
          ]
        },
        {
          id: "m5_g2",
          title: "Credential Attack Mitigations",
          subtitle: "Card Swiper Activity: Safe vs Vulnerable",
          description: "Evaluate 5 identity event scenarios. Swipe left ('Vulnerable') or right ('Secure') to evaluate user and service authentication configurations.",
          type: "swiper",
          items: [
            {
              id: "id_card_1",
              title: "Credential Scenario 1",
              scenario: "A developer commits a configuration file to a public GitHub repository. The file contains a hardcoded AWS Access Key ID and Secret Access Key.",
              question: "Is this credential configuration Secure or Vulnerable?",
              correctAction: "vulnerable",
              revealCause: "Hardcoded API keys committed to public repos are instantly scraped by automated threat crawlers and leveraged for compute hijacking."
            },
            {
              id: "id_card_2",
              title: "Credential Scenario 2",
              scenario: "An application requests credentials dynamically from an on-instance Metadata Service (IMDSv2) using temporary, short-lived session tokens.",
              question: "Is this credential configuration Secure or Vulnerable?",
              correctAction: "secure",
              revealCause: "IMDSv2 leverages token-based request handshakes, which neutralizes simple SSRF attacks seeking to extract instance roles."
            },
            {
              id: "id_card_3",
              title: "Credential Scenario 3",
              scenario: "A marketing manager writes their database password on a sticky note and pastes it onto their physical desk monitor in the shared office.",
              question: "Is this credential configuration Secure or Vulnerable?",
              correctAction: "vulnerable",
              revealCause: "Physical security is the foundational layer of authentication. Exposed passwords permit rapid, unauthorized lateral access by internal actors."
            },
            {
              id: "id_card_4",
              title: "Credential Scenario 4",
              scenario: "An API service communicates with database hosts using an IAM Role. The server generates dynamic, temporary access credentials that expire every 60 minutes.",
              question: "Is this credential configuration Secure or Vulnerable?",
              correctAction: "secure",
              revealCause: "IAM Roles eliminate static keys entirely. Generating short-lived credentials limits the damage window if a key is intercepted."
            },
            {
              id: "id_card_5",
              title: "Credential Scenario 5",
              scenario: "Administrators utilize standard API keys to manage cloud infrastructure, configuring key rotation limits to 'Never Expire' to ensure operational stability.",
              question: "Is this credential configuration Secure or Vulnerable?",
              correctAction: "vulnerable",
              revealCause: "Non-expiring administrative API keys are highly dangerous. If leaked, they grant permanent, unchecked access until manually deleted."
            }
          ]
        },
        {
          id: "m5_g3",
          title: "Cloud Incident Response Pipeline",
          subtitle: "Containment Sequence Sorting",
          description: "Use the up/down arrows (▲/▼) to arrange the 5 steps of a cloud security incident response workflow in chronological order (from top to bottom).",
          type: "sorting",
          items: [
            {
              id: "ir_step_detect",
              text: "Detect anomaly: Cloud security monitoring detects administrative actions originating from a known malicious IP.",
              correctIndex: 0,
              revealCause: "The IR lifecycle starts by identifying alert anomalies via network logging or threat analysis systems."
            },
            {
              id: "ir_step_contain",
              text: "Contain scope: Instantly revoke the compromised credentials and quarantine the affected virtual machines.",
              correctIndex: 1,
              revealCause: "Containment must occur immediately upon detection to restrict lateral movement and stop active data leakage."
            },
            {
              id: "ir_step_investigate",
              text: "Investigate logs: Parse cloud audit trails (CloudTrail) to identify all resources modified by the compromised account.",
              correctIndex: 2,
              revealCause: "After containment, analysts audit audit logs to identify the extent of configuration mutations and asset access."
            },
            {
              id: "ir_step_remediate",
              text: "Remediate gap: Close open access firewall paths, rotate all administrative secrets, and verify configuration state.",
              correctIndex: 3,
              revealCause: "Remediation addresses the root vulnerability, locking the entryway before services are brought back online."
            },
            {
              id: "ir_step_post",
              text: "Post-incident audit: Review response telemetry, update detection signatures, and adjust compliance policies.",
              correctIndex: 4,
              revealCause: "The final step reviews operational response efficiency, feeding lessons back to optimize detection controls."
            }
          ]
        },
        {
          id: "m5_g4",
          title: "Cloud Threat Scenarios",
          subtitle: "Mitigating Advanced Threat Vectors",
          description: "Analyze advanced cloud attacks. Learn to block SSRF metadata extraction, subdomain takeovers, cryptojacking, and backup ransomware.",
          type: "scenario",
          decisions: [
            {
              id: "m5_g4_d1",
              category: "threats",
              scenario: "A vulnerable web application with SSRF (Server-Side Request Forgery) allows attackers to send requests to the cloud metadata endpoint (169.254.169.254) and retrieve IAM credentials.",
              question: "Which security control prevents SSRF metadata credential extraction?",
              options: [
                "IMDSv2 / Session Tokens - Requiring HTTP PUT requests with session headers to retrieve metadata, blocking simple SSRF GET calls.",
                "Subnet IP expansion - Changing local subnet routing ranges to hide the metadata IP.",
                "Wavelength scaling - Scaling processor power to overload server responses."
              ],
              correctIndex: 0,
              revealCause: "IMDSv2 enforces session validation using local headers, which prevents attackers from retrieving credentials via simple SSRF URL queries."
            },
            {
              id: "m5_g4_d2",
              category: "threats",
              scenario: "We delete a cloud web application, but forget to remove the corresponding CNAME record pointing to it in our DNS settings. An attacker registers the abandoned app name and hijacks our corporate traffic.",
              question: "What threat vector is illustrated by this hijacked DNS record?",
              options: [
                "DNS Subdomain Takeover - Attackers register the target resource name referenced in a hanging DNS record, taking control of the subdomain.",
                "SQL Injection - Executing database queries in DNS TXT records.",
                "Local Host Spoofing - Modifying the routing path on the client device."
              ],
              correctIndex: 0,
              revealCause: "Hanging CNAME records pointing to decommissioned resources can be registered by third parties, letting them serve malicious sites under your domain."
            },
            {
              id: "m5_g4_d3",
              category: "threats",
              scenario: "An attacker gains access to our developer container repository. They configure our deployed containers to mine cryptocurrency in the background, inflating our server compute bill.",
              question: "What threat class describes unauthorized resource consumption for mining?",
              options: [
                "Cryptojacking - Compromising system compute resources (like containers or VMs) to mine digital currency.",
                "Volumetric DDoS - Overloading API gateway ports with connection requests.",
                "Session Hijacking - Stealing session tokens from cookie storage."
              ],
              correctIndex: 0,
              revealCause: "Cryptojacking exploits compromised virtual machine or container compute capacities. It is detected by CPU spikes, anomalous container images, and egress connections to mining pools."
            },
            {
              id: "m5_g4_d4",
              category: "threats",
              scenario: "Attackers compromise our cloud backups. They encrypt the master backup files and demand ransom payments to restore access.",
              question: "What design strategy guarantees backup resilience against ransomware encryption?",
              options: [
                "Immutable Backups / WORM Storage - Deploying write-once-read-many backup profiles that cannot be modified or deleted for a set retention duration.",
                "Dual-site file sharing - Syncing files to folders on local developer machines.",
                "Password strength updates - Requiring users to rotate console passwords."
              ],
              correctIndex: 0,
              revealCause: "Immutable backups use write-once-read-many locks. Even if administrative credentials are stolen, the cloud host blocks backup deletion or editing during the lock window."
            },
            {
              id: "m5_g4_d5",
              category: "threats",
              scenario: "An administrator receives an email claiming a database has been exfiltrated and demanding payment. The administrator needs to verify if a large volume of data actually left our network.",
              question: "What network auditing metric helps verify data exfiltration events?",
              options: [
                "Egress Data Volume / NAT Gateway Telemetry - Audit network egress bandwidth logs to identify sudden data transfer peaks.",
                "Inbound TCP SYN checks - Counting connection attempts on internal router interfaces.",
                "Domain Name registration audits - Verifying DNS subdomain creation timestamps."
              ],
              correctIndex: 0,
              revealCause: "Data exfiltration triggers an abnormal volume of outbound (egress) network traffic. Auditing billing, NAT transfer logs, or firewall egress metrics confirms exfiltration volumes."
            }
          ]
        }
      ]
    }
  ]
};

// Export to window object for browser accessibility
window.gameData = gameData;
