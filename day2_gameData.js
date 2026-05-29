// Day 2 Curriculum Data Schema for HCLTech Cloud Security Simulator
// Replicates the structures of Day 1 but isolates all modules and games for Day 2

window.gameData = {
  modules: [
    {
      id: "day2_m1",
      title: "Threat Detection & Incident Response",
      description: "Master the 6-phase incident response lifecycle, SIEM solutions, and cloud-native threat detection with Sentinel, Defender XDR, GuardDuty, and Security Hub.",
      games: [
        {
          id: "m1_g1",
          title: "Incident Response Lifecycle",
          subtitle: "Chronological Sequence Sorting",
          description: "Use the up/down arrows (▲/▼) to arrange the 5 key phases of the incident response lifecycle in chronological order (from top to bottom).",
          type: "sorting",
          items: [
            {
              id: "ir_phase_identify",
              text: "Identification: Detect and qualify security events using logging analytics and threat intelligence.",
              correctIndex: 0,
              revealCause: "Incident response begins by identifying anomalies and validating them as actual security incidents."
            },
            {
              id: "ir_phase_contain",
              text: "Containment: Limit the scope and impact of the active breach by isolating affected resources.",
              correctIndex: 1,
              revealCause: "Containment must occur immediately upon validation to restrict lateral movement and data leakage."
            },
            {
              id: "ir_phase_eradicate",
              text: "Eradication: Remove the threat vector, patch the entry hole, and clean all infected nodes.",
              correctIndex: 2,
              revealCause: "Eradication removes the root cause of the incident before restoring operations."
            },
            {
              id: "ir_phase_recover",
              text: "Recovery: Restore systems from clean backups and return services to normal production states.",
              correctIndex: 3,
              revealCause: "Recovery brings systems back online after verifying that the threat has been completely removed."
            },
            {
              id: "ir_phase_lessons",
              text: "Lessons Learned: Document the response efficiency and update detection signatures to prevent recurrence.",
              correctIndex: 4,
              revealCause: "The final phase reviews the incident response lifecycle and feeds telemetry back into preparation controls."
            }
          ]
        },
        {
          id: "m1_g2",
          title: "Threat Detection Engines",
          subtitle: "Classifying Log Analytics & Alert Sources",
          description: "Drag and drop (or click to move) the 6 security actions into the correct column based on whether they feed into SIEM (Sentinel), XDR (Defender), or Native Detection (GuardDuty/Security Hub).",
          type: "drag_drop",
          leftBucket: "SIEM & XDR Engines",
          rightBucket: "Cloud-Native Detection",
          items: [
            {
              id: "item_det_sentinel",
              text: "Correlating multi-vendor firewall logs using query language to analyze security trends",
              correctBucket: "left",
              revealCause: "SIEM engines ingest heterogeneous log sources from diverse vendors to run multi-source correlations."
            },
            {
              id: "item_det_xdr",
              text: "Detecting malicious process injection on virtual machine operating systems",
              correctBucket: "left",
              revealCause: "XDR endpoint sensors inspect memory and processes on virtual machine operating systems directly."
            },
            {
              id: "item_det_guardduty",
              text: "Detecting API calls originating from known malicious exit nodes",
              correctBucket: "right",
              revealCause: "Cloud-native services like GuardDuty inspect control plane logs directly for threat patterns."
            },
            {
              id: "item_det_sechub",
              text: "Aggregating security framework compliance scores and resource posture checks",
              correctBucket: "right",
              revealCause: "Cloud Security Posture Management (CSPM) maps native resource states to security frameworks."
            },
            {
              id: "item_det_phish",
              text: "Analyzing and blocking suspicious links inside inbound communication streams",
              correctBucket: "left",
              revealCause: "XDR platforms protect user workloads (email, identities, files) before they interact with server assets."
            },
            {
              id: "item_det_flow",
              text: "Analyzing network connection traces to locate unauthorized outbound data transmissions",
              correctBucket: "right",
              revealCause: "Native threat detection engines audit cloud network logs to highlight communication anomalies."
            }
          ]
        },
        {
          id: "m1_g3",
          title: "Incident Containment",
          subtitle: "Active Breach Incident Response Scenarios",
          description: "Choose the correct containment action to limit damage during active cloud compromise scenarios.",
          type: "scenario",
          decisions: [
            {
              id: "m1_g3_d1",
              category: "incident_response",
              scenario: "An active virtual machine is detected communicating with a known command-and-control server, exfiltrating data volumes via outbound TCP.",
              question: "What is the most secure immediate containment step?",
              options: [
                "Modify the VM's Network Security Group (NSG) to block all outbound traffic except local monitoring routes.",
                "Deploy a backup VM instance in a separate subnet and initiate a data sync.",
                "Run a full anti-virus scan on the VM OS to identify and isolate the malicious binary."
              ],
              correctIndex: 0,
              revealCause: "Restricting network boundaries at the host plane (NSG) halts active exfiltration instantly, independent of VM OS response time."
            },
            {
              id: "m1_g3_d2",
              category: "incident_response",
              scenario: "A developer's AWS access key was committed to a public GitHub repository. CloudTrail logs indicate the key is currently creating unauthorized ec2 instances.",
              question: "How do we contain this active identity compromise?",
              options: [
                "Deactivate and delete the exposed Access Key in the IAM console immediately.",
                "E-mail the developer to change their password and rotate the key within 24 hours.",
                "Configure a firewall rule to block traffic originating from the unauthorized ec2 instances."
              ],
              correctIndex: 0,
              revealCause: "Deactivating the key cuts off credentials instantly, preventing further unauthorized API requests globally."
            },
            {
              id: "m1_g3_d3",
              category: "incident_response",
              scenario: "An internet-facing web server is subjected to a brute-force SSH attack, filling OS syslog records with login failures.",
              question: "Which control dynamically contains this attack?",
              options: [
                "Configure a network rule to block the attacking IP or route the server behind a Bastion/IAP.",
                "Increase OS password complexity limits to prevent successful cracking.",
                "Restart the virtual machine to clear the SSH connection pool."
              ],
              correctIndex: 0,
              revealCause: "Restricting network access or routing behind an Identity-Aware Proxy isolates the exposure and blocks brute-force probes."
            },
            {
              id: "m1_g3_d4",
              category: "incident_response",
              scenario: "Cloud storage access logs reveal that a database backup file was read by an unauthorized public IP address.",
              question: "What step halts further exposure of the storage assets?",
              options: [
                "Revoke public read grants on the storage bucket and rotate the vault KMS encryption keys.",
                "Delete the database backup file to prevent anyone else from reading it.",
                "Set up an automated email notification to alert administrators of subsequent reads."
              ],
              correctIndex: 0,
              revealCause: "Revoking public access closes the gateway immediately, and rotating KMS keys renders downloaded keys obsolete if rotation is enforced."
            },
            {
              id: "m1_g3_d5",
              category: "incident_response",
              scenario: "A user identity is suspected of lateral movement, logging into multiple storage servers within seconds from different geolocations.",
              question: "Which identity control contains this session compromise?",
              options: [
                "Revoke active session tokens in Entra ID / IAM and enforce an MFA re-challenge.",
                "Disable the user's primary password to prevent next week's logins.",
                "Send an alert to the user's team lead to confirm their current location."
              ],
              correctIndex: 0,
              revealCause: "Revoking active session tokens terminates current authorization immediately, forcing a re-authentication and MFA check."
            }
          ]
        }
      ]
    },
    {
      id: "day2_m2",
      title: "Vulnerability & Patch Management",
      description: "Understand CVSS scoring, risk-based prioritization, strategic patching, and cloud-native vulnerability tools including Defender TVM and AWS Inspector.",
      games: [
        {
          id: "m2_g1",
          title: "CVSS v3 Severity Scoring",
          subtitle: "Mapping Vulnerability Score Metrics",
          description: "Drag and drop the 6 CVSS v3 descriptors into their correct metric group to understand how vulnerability severity is calculated.",
          type: "drag_drop",
          leftBucket: "Base Metrics (Static)",
          rightBucket: "Temporal & Env Metrics",
          items: [
            {
              id: "item_cvss_av",
              text: "Requirement for remote network vs local physical access to execute the exploit",
              correctBucket: "left",
              revealCause: "Base metrics capture characteristics that are constant over time and user environments (like physical access requirements)."
            },
            {
              id: "item_cvss_pr",
              text: "The level of administrative authority or user credentials needed to run the exploit",
              correctBucket: "left",
              revealCause: "The level of privilege (None vs Low vs High) required to deploy an exploit is an intrinsic Base metric."
            },
            {
              id: "item_cvss_e",
              text: "Public availability of proof-of-concept scripts or active malware in the wild",
              correctBucket: "right",
              revealCause: "Temporal metrics shift over time as exploit codes transition from proof-of-concept to functional malware."
            },
            {
              id: "item_cvss_rl",
              text: "Status of a fix, such as an official vendor patch or temporary configuration workaround",
              correctBucket: "right",
              revealCause: "As vendors release official patches, the remediation level changes, lowering the temporal score."
            },
            {
              id: "item_cvss_cr",
              text: "Critical value mapping of the targeted asset based on data secrecy needs",
              correctBucket: "right",
              revealCause: "Environmental metrics customize the score based on the critical value of the asset in your network."
            },
            {
              id: "item_cvss_ui",
              text: "Whether a target victim must perform an action (e.g. clicking a link) to initiate the attack",
              correctBucket: "left",
              revealCause: "Whether user interaction is required is a constant characteristic of the vulnerability, mapped in Base metrics."
            }
          ]
        },
        {
          id: "m2_g2",
          title: "Patching Priorities",
          subtitle: "Strategic Risk Prioritization Scenarios",
          description: "Prioritize vulnerabilities for patching based on business critical systems and real-world exploit availability.",
          type: "scenario",
          decisions: [
            {
              id: "m2_g2_d1",
              category: "patching",
              scenario: "A critical SQL Injection (SQLi) vulnerability (CVSS 9.8) is found on the primary public-facing client billing portal. Cyber threat intelligence indicates active exploitation in the wild.",
              question: "When should this vulnerability be patched?",
              options: [
                "Patch immediately (Emergency Hotfix window within 24-48 hours).",
                "Defer patching to the next standard monthly maintenance cycle.",
                "Ignore, as network-level firewalls will block database queries."
              ],
              correctIndex: 0,
              revealCause: "Vulnerabilities on public-facing critical data paths with active exploits require emergency hotfix procedures."
            },
            {
              id: "m2_g2_d2",
              category: "patching",
              scenario: "A local privilege escalation bug (CVSS 7.2) is detected on a virtual machine located in an isolated testing environment with no outbound internet access.",
              question: "What is the appropriate patching timeline?",
              options: [
                "Resolve during the next scheduled maintenance or patching window.",
                "Trigger an emergency pipeline shutdown and patch immediately.",
                "Exclude the system from scanning to clear the audit log."
              ],
              correctIndex: 0,
              revealCause: "Isolated internal assets present a lower exploit likelihood, allowing for scheduled patching rather than emergency disruption."
            },
            {
              id: "m2_g2_d3",
              category: "patching",
              scenario: "A vulnerability scanner reports a denial-of-service vulnerability (CVSS 5.3) on an internal messaging server. A vendor patch is unavailable, but a configuration change mitigates the issue.",
              question: "What is the best immediate response?",
              options: [
                "Apply the recommended configuration mitigation and schedule the patch once released.",
                "Leave the server unpatched and turn off monitoring to avoid alarms.",
                "Rebuild the messaging server using a different Operating System."
              ],
              correctIndex: 0,
              revealCause: "Configuration workarounds mitigate risks immediately when official vendor patches are unavailable."
            },
            {
              id: "m2_g2_d4",
              category: "patching",
              scenario: "An outdated Java library is flagged inside a legacy repository that has been decommissioned and is not active in production pipelines.",
              question: "How do we resolve this threat?",
              options: [
                "Deprecate and archive/delete the legacy repository to remove the exposure vector.",
                "Re-deploy the repository to production to test if the library still works.",
                "Re-write the entire repository using Python to bypass the scan."
              ],
              correctIndex: 0,
              revealCause: "Archiving or deleting decommissioned repositories removes attack surface exposure safely."
            },
            {
              id: "m2_g2_d5",
              category: "patching",
              scenario: "A newly discovered Remote Code Execution (RCE) bug is announced for a web server framework used on all production servers. No exploit exists yet, but public interest is high.",
              question: "How should the operations team respond?",
              options: [
                "Prepare the patch deployment package and roll out to test environments within 72 hours.",
                "Wait until active exploitation is confirmed in the wild before patching.",
                "Uninstall the web server software to guarantee safety."
              ],
              correctIndex: 0,
              revealCause: "RCE threats require proactive testing and deployment preparation before exploits are weaponized."
            }
          ]
        },
        {
          id: "m2_g3",
          title: "Vulnerability Scanning Console",
          subtitle: "Configuring Threat & Vulnerability Audits",
          description: "Configure vulnerability scanner parameters. Discuss settings with the audience and toggle switches. Click verify configuration when aligned.",
          type: "toggle_dashboard",
          toggles: [
            {
              id: "agentless_scan",
              name: "Agentless Disk Scanning",
              desc: "Snapshots VM volumes and scans blocks offline, avoiding server overhead and agent maintenance.",
              defaultState: false,
              correctState: true
            },
            {
              id: "public_penetration",
              name: "External Port Penetration Test",
              desc: "Launches unauthenticated scans on external-facing endpoints to audit public perimeter visibility.",
              defaultState: true,
              correctState: true
            },
            {
              id: "credentialed_access",
              name: "Credentialed OS Audit",
              desc: "Supplies read-only credentials to let the scanner log in and check host patch registers.",
              defaultState: false,
              correctState: true
            },
            {
              id: "auto_patch_prod",
              name: "Auto-Patch Production Databases",
              desc: "Instantly deploys critical OS patches to live databases without pre-production testing.",
              defaultState: true,
              correctState: false
            },
            {
              id: "threat_intel_sync",
              name: "Threat Intelligence Correlation",
              desc: "Links scanning results with global feeds to flag issues that have active public exploits.",
              defaultState: false,
              correctState: true
            }
          ]
        }
      ]
    },
    {
      id: "day2_m3",
      title: "Compliance & Governance",
      description: "Navigate NIST, ISO 27001, SOC 2, GDPR, PCI DSS, and CIS frameworks with Azure Policy, Compliance Manager, AWS Config, and Artifact.",
      games: [
        {
          id: "m3_g1",
          title: "Compliance Frameworks",
          subtitle: "Classifying Regulatory Control Mandates",
          description: "Drag and drop the 6 compliance activities into their target framework to organize the governance system.",
          type: "drag_drop",
          leftBucket: "ISO 27001 & NIST CSF",
          rightBucket: "SOC 2 Type II Audits",
          items: [
            {
              id: "item_comp_isms",
              text: "Structuring the organization's overall information security policies and guidelines",
              correctBucket: "left",
              revealCause: "ISO 27001 compliance centers on establishing and auditing an organizational ISMS."
            },
            {
              id: "item_comp_soc2_6",
              text: "Verifying that security checks worked continuously during a half-year operational period",
              correctBucket: "right",
              revealCause: "SOC 2 Type II reports evaluate control design and operational effectiveness over a specified testing window (typically 6-12 months)."
            },
            {
              id: "item_comp_nist_f",
              text: "Grouping security practices under functional areas (Protect, Detect, Respond, etc.)",
              correctBucket: "left",
              revealCause: "NIST Cybersecurity Framework (CSF) structures its controls around these 5 functional pillars."
            },
            {
              id: "item_comp_soc2_tsc",
              text: "Evaluating security, confidentiality, and availability principles defined by the AICPA",
              correctBucket: "right",
              revealCause: "SOC 2 audits map controls directly to the AICPA Trust Services Criteria (TSC) pillars."
            },
            {
              id: "item_comp_risk_treat",
              text: "Creating a formal registry of identified hazards and approved mitigation plans",
              correctBucket: "left",
              revealCause: "ISO 27001 requires a formal Risk Treatment Plan mapping identified threats to business risk tolerance."
            },
            {
              id: "item_comp_soc2_evidence",
              text: "Providing approved pull-requests and configuration change approvals to external auditors",
              correctBucket: "right",
              revealCause: "SOC 2 auditors verify evidence showing that configuration changes went through formal approval cycles."
            }
          ]
        },
        {
          id: "m3_g2",
          title: "Cloud Governance Policy",
          subtitle: "Configuring Cloud Guardrail Rules",
          description: "Enforce cloud policy rules. Map constraints to prevent compliance violations without blocking standard pipelines. Toggle switches to align posture.",
          type: "toggle_dashboard",
          toggles: [
            {
              id: "block_public_s3",
              name: "Block Public Bucket Access",
              desc: "Restricts all cloud storage buckets from ever enabling public URL reads at the root account level.",
              defaultState: false,
              correctState: true
            },
            {
              id: "require_cost_tags",
              name: "Enforce Cost-Center Tags",
              desc: "Denies resource creation APIs if a resource does not include verified cost-center metadata tags.",
              defaultState: false,
              correctState: true
            },
            {
              id: "force_triple_region",
              name: "Enforce Triple-Region Sync",
              desc: "Blocks deployment of any database unless it is replicated to at least 3 global datacenter regions.",
              defaultState: true,
              correctState: false
            },
            {
              id: "restrict_root_login",
              name: "Disable Direct Root Logins",
              desc: "Blocks administrative root API logins, requiring IAM users to elevate via roles.",
              defaultState: false,
              correctState: true
            },
            {
              id: "enforce_us_residency",
              name: "Enforce US-Only Data Residency",
              desc: "Blocks database and storage bucket creation in European or Asian cloud datacenters.",
              defaultState: false,
              correctState: true
            }
          ]
        },
        {
          id: "m3_g3",
          title: "Compliance Audits",
          subtitle: "Third-Party Audits & Evidence Validation",
          description: "Navigate evidence collection and provider evaluation scenarios during internal and external audits.",
          type: "scenario",
          decisions: [
            {
              id: "m3_g3_d1",
              category: "auditing",
              scenario: "An external auditor requests the latest SOC 2 Type II report for our cloud provider to verify that the provider's physical datacenters are secure.",
              question: "How should we retrieve and share this audit report?",
              options: [
                "Use the cloud provider's console (e.g. AWS Artifact) to sign the NDA and download the official auditor report.",
                "E-mail the cloud provider support desk asking for a text summary of their physical security controls.",
                "Write a custom statement claiming that the cloud provider guarantees safety under the Shared Responsibility Model."
              ],
              correctIndex: 0,
              revealCause: "AWS Artifact and Azure Compliance portals offer direct, self-service downloads of provider compliance reports under NDA."
            },
            {
              id: "m3_g3_d2",
              category: "auditing",
              scenario: "We need to prove to auditors that our cloud databases are continuously evaluated for configuration compliance against the CIS Benchmarks.",
              question: "Which cloud service automates this evidence collection?",
              options: [
                "Deploy Cloud Configuration Rules (e.g., AWS Config or Azure Policy) to continuously record and audit resource settings.",
                "Ask developers to take weekly screenshots of the database configuration screens.",
                "Configure hourly database backups to prove configuration retention."
              ],
              correctIndex: 0,
              revealCause: "AWS Config and Azure Policy keep audit histories of configuration changes, providing continuous evidence for compliance frameworks."
            },
            {
              id: "m3_g3_d3",
              category: "auditing",
              scenario: "The compliance framework requires us to show clear boundaries for data access, detailing which company roles can query personal customer records.",
              question: "What is the best way to present this to auditors?",
              options: [
                "Produce a Role-Based Access Control (RBAC) matrix and show IAM policy bindings mapping roles to database objects.",
                "Provide the employee handbook stating that customer privacy is highly valued.",
                "Export a list of all database table structures with no user mapping data."
              ],
              correctIndex: 0,
              revealCause: "An RBAC mapping matrix tied to actual cloud IAM policy implementations validates active security boundaries to auditors."
            },
            {
              id: "m3_g3_d4",
              category: "auditing",
              scenario: "A SaaS vendor we use for processing client e-mails states they are compliant, but we must verify their security status for our SOC 2 audit.",
              question: "What evidence must be requested from the SaaS vendor?",
              options: [
                "Request their current SOC 2 Type II report and review their user entities controls.",
                "Request their business registration certificate and tax documents.",
                "Accept their website landing page marketing claims of secure architectures."
              ],
              correctIndex: 0,
              revealCause: "Reviewing a vendor's SOC 2 report ensures their internal security controls align with our compliance standards."
            },
            {
              id: "m3_g3_d5",
              category: "auditing",
              scenario: "The database configuration was changed during a high-priority incident, violating the compliance baseline. The incident has passed, but the audit is tomorrow.",
              question: "What is the correct audit response?",
              options: [
                "Document the change ticket, detail the security justification for the bypass, and restore the baseline configuration immediately.",
                "Manually modify the compliance logs to show that no baseline violation occurred.",
                "Pretend the server does not exist and exclude it from the audit scope."
              ],
              correctIndex: 0,
              revealCause: "Audit integrity requires documenting emergency exceptions with tickets and restoring security baselines promptly."
            }
          ]
        }
      ]
    },
    {
      id: "day2_m4",
      title: "Cloud Security Operations",
      description: "Build optimized SOCs with metrics-driven improvement, SOAR automation, and cloud-native tools including Sentinel, Logic Apps, Security Hub, and Lambda.",
      games: [
        {
          id: "m4_g1",
          title: "SOC Command Console",
          subtitle: "Optimizing Security Operations Center Parameters",
          description: "Establish active alert rules for the SOC team. Discuss noise suppression and playbook triggers with the audience. Click verify when aligned.",
          type: "toggle_dashboard",
          toggles: [
            {
              id: "auto_escalate_severity",
              name: "Auto-Escalate Critical Threats",
              desc: "Forwards verified malware alerts directly to senior Tier-3 responders, skipping the queue.",
              defaultState: false,
              correctState: true
            },
            {
              id: "alert_correlation_window",
              name: "Correlate Repeated Alarms",
              desc: "Combines 50 identical alerts from the same host into a single security incident to prevent alert fatigue.",
              defaultState: false,
              correctState: true
            },
            {
              id: "dump_syslog_channel",
              name: "Route Raw Syslog to Chat",
              desc: "Forwards all firewall logs to the primary response chat channel in real-time.",
              defaultState: true,
              correctState: false
            },
            {
              id: "automated_threat_hunt",
              name: "Hourly KQL Threat Hunting",
              desc: "Triggers automated log queries to scan database and user logins for suspicious patterns.",
              defaultState: false,
              correctState: true
            },
            {
              id: "manual_triage_low",
              name: "Manual Triage of Low Alerts",
              desc: "Requires human analysts to manually inspect and sign off on every low-severity log notification.",
              defaultState: true,
              correctState: false
            }
          ]
        },
        {
          id: "m4_g2",
          title: "SOAR Automated Playbook",
          subtitle: "Chronological Sequence Sorting",
          description: "Use the up/down arrows (▲/▼) to arrange the 5 steps of a SOAR automated playbook for a compromised user account in chronological order (from top to bottom).",
          type: "sorting",
          items: [
            {
              id: "soar_step_detect",
              text: "The SIEM system registers alert telemetry for rapid login failures followed by successful access",
              correctIndex: 0,
              revealCause: "The automated playbook begins when the SIEM engine triggers an alert rule for suspicious login patterns."
            },
            {
              id: "soar_step_block_ip",
              text: "The automated firewall service receives an API call to block the suspicious external IP",
              correctIndex: 1,
              revealCause: "The playbook quickly blocks the attacking IP to stop active automated brute-force attempts."
            },
            {
              id: "soar_step_disable_user",
              text: "The identity engine disables the user account and invalidates active session tokens",
              correctIndex: 2,
              revealCause: "Disabling the user account prevents the attacker from utilizing hijacked credentials or cookies."
            },
            {
              id: "soar_step_notify",
              text: "The ticketing system logs a new incident and alerts the SOC analysts via Slack channels",
              correctIndex: 3,
              revealCause: "The system logs the ticket and alerts analysts for verification and documentation."
            },
            {
              id: "soar_step_unlock",
              text: "The directory system forces a password rotation and locks the account until manager approval",
              correctIndex: 4,
              revealCause: "The final step ensures the user identity is verified and reset before administrative restoration."
            }
          ]
        },
        {
          id: "m4_g3",
          title: "Incident Response Priorities",
          subtitle: "Balancing Automation vs Business Disruption Scenarios",
          description: "Analyze scenarios where security response must balance risk containment against production uptime.",
          type: "scenario",
          decisions: [
            {
              id: "m4_g3_d1",
              category: "soc_ops",
              scenario: "An automated SOAR playbook is configured to instantly terminate and isolate any virtual machine displaying suspicious outgoing SSH scanning traffic.",
              question: "What is the operational risk if this rule triggers on a critical production billing server during high-load processing?",
              options: [
                "It may cause a major business outage and transaction failures (false positive impact).",
                "It will increase cloud billing costs by spinning up duplicate servers.",
                "It will corrupt the hypervisor hosting the billing database."
              ],
              correctIndex: 0,
              revealCause: "Hard-containment automation without human triage on critical business paths risks severe operational disruption."
            },
            {
              id: "m4_g3_d2",
              category: "soc_ops",
              scenario: "A virtual machine in the production VPC is flagged by GuardDuty for potential cryptojacking activity (mining cryptocurrency).",
              question: "What is the best balance of response to minimize downtime while containing the threat?",
              options: [
                "Isolate the VM using a security group, snapshot the disk for analysis, and inspect CPU logs without destroying the container.",
                "Delete the VM immediately, along with all associated database storage volumes.",
                "Ignore the alert, as cryptojacking does not access customer records."
              ],
              correctIndex: 0,
              revealCause: "Isolating and snapshotting VM volumes preserves evidence and blocks threat activity without causing permanent data loss."
            },
            {
              id: "m4_g3_d3",
              category: "soc_ops",
              scenario: "A senior executive's login credentials are leaked, and an active login is recorded from a residential IP address in a country where the company does not operate.",
              question: "What is the best immediate response?",
              options: [
                "Revoke all active session tokens immediately and trigger a mandatory MFA challenge.",
                "Send an e-mail to the executive asking if they are currently traveling.",
                "Monitor the session for 48 hours to collect intelligence on what files they access."
              ],
              correctIndex: 0,
              revealCause: "High-value credential compromise requires immediate session revocation and MFA verification to prevent lateral entry."
            },
            {
              id: "m4_g3_d4",
              category: "soc_ops",
              scenario: "A brute force attack is directed at the public web application login page, causing high database load and slowing down the site for customers.",
              question: "Which control mitigates this issue without blocking real customers?",
              options: [
                "Configure the WAF to block repeated requests from single IPs or enforce a CAPTCHA gate on the login route.",
                "Take the entire web application offline to stop the database load.",
                "Disable user logins temporarily for all users across the company."
              ],
              correctIndex: 0,
              revealCause: "WAF rate-limiting and CAPTCHA challenges block automated bots while allowing human clients access."
            },
            {
              id: "m4_g3_d5",
              category: "soc_ops",
              scenario: "Suspicious database modifications are detected originating from an internal network administrator's personal laptop IP address.",
              question: "How do we handle this internal threat context?",
              options: [
                "Temporarily revoke the admin's API keys, isolate their network segment, and contact them to verify the actions.",
                "Publicly announce that the administrator's account is compromised in company channels.",
                "Reset all cloud user passwords across the entire company."
              ],
              correctIndex: 0,
              revealCause: "Isolating access and segments allows for investigation of potential insider threats or credential theft without alerting attackers."
            }
          ]
        }
      ]
    },
    {
      id: "day2_m5",
      title: "Logging & Visibility",
      description: "Implement comprehensive logging with Azure Monitor, Log Analytics, AWS CloudTrail, and CloudWatch for full infrastructure visibility and threat detection.",
      games: [
        {
          id: "m5_g1",
          title: "Logging Tiers",
          subtitle: "Classifying Log Types & Storage Costs",
          description: "Drag and drop the 6 logging activities into the correct category based on whether they require Hot Analytics Tier or Cold Archive Tier storage.",
          type: "drag_drop",
          leftBucket: "Hot Analytics Tier",
          rightBucket: "Cold Archive Tier",
          items: [
            {
              id: "item_log_recent",
              text: "Storing the last 30 days of events for real-time security correlations",
              correctBucket: "left",
              revealCause: "Hot tiers keep logs indexed and queryable for immediate alert matching and active analyst searches."
            },
            {
              id: "item_log_compliance",
              text: "Storing regulatory audit trails in immutable storage for long-term compliance",
              correctBucket: "right",
              revealCause: "Regulatory compliance mandates long-term archiving of audit records, which can be stored in cheap, cold storage."
            },
            {
              id: "item_log_firewall",
              text: "Streaming active connection logs to detect live intrusion attempts",
              correctBucket: "left",
              revealCause: "Intrusion detection requires live streaming of network connections to identify threats instantly."
            },
            {
              id: "item_log_compress",
              text: "Saving database history packages for occasional post-incident forensics",
              correctBucket: "right",
              revealCause: "Forensic archives are rarely read and should be stored in high-latency, cost-effective cold tiers."
            },
            {
              id: "item_log_pci",
              text: "Archiving account access logs to meet long-term industry standards requirements",
              correctBucket: "right",
              revealCause: "Access logs must be kept for PCI-DSS compliance, but do not need hot indexing for daily queries."
            },
            {
              id: "item_log_api",
              text: "Ingesting active API request logs for immediate rate limit audits",
              correctBucket: "left",
              revealCause: "Active security enforcement needs access to telemetry logs to detect rate-limit violations."
            }
          ]
        },
        {
          id: "m5_g2",
          title: "Cloud Auditing Coverage",
          subtitle: "Configuring Infrastructure Log Coverage",
          description: "Enable logging configurations. Ensure auditing trails are active without generating excessive log storage bills. Click verify when aligned.",
          type: "toggle_dashboard",
          toggles: [
            {
              id: "cloudtrail_all_regions",
              name: "Global Trail Logging",
              desc: "Enables CloudTrail to log write activity globally across all regions, capturing unauthorized global deployments.",
              defaultState: false,
              correctState: true
            },
            {
              id: "vpc_flow_active",
              name: "VPC Flow Logs",
              desc: "Captures IP traffic details flowing in and out of network interfaces in the production VPC.",
              defaultState: false,
              correctState: true
            },
            {
              id: "verbose_app_debug",
              name: "Verbose Debug Logs",
              desc: "Forces application servers to write complete payload structures and database connection tokens to logs.",
              defaultState: true,
              correctState: false
            },
            {
              id: "log_bucket_cmk",
              name: "Key Vault Encrypted Logs",
              desc: "Encrypts the log storage bucket using Customer Managed Keys (CMK) and restricts access via policy.",
              defaultState: false,
              correctState: true
            },
            {
              id: "auto_purge_14",
              name: "Purge Logs After 14 Days",
              desc: "Automatically deletes all security event logs after two weeks to keep storage costs low.",
              defaultState: true,
              correctState: false
            }
          ]
        },
        {
          id: "m5_g3",
          title: "Log Tamper Prevention",
          subtitle: "Log File Integrity & Secure Storage Scenarios",
          description: "Protect security audit logs from modification or deletion by attackers or administrative accounts.",
          type: "scenario",
          decisions: [
            {
              id: "m5_g3_d1",
              category: "log_security",
              scenario: "An administrative user account is compromised. The attacker attempts to delete the primary cloud audit trail log files (S3/Blob) to cover their tracks.",
              question: "What control prevents the deletion of audit logs?",
              options: [
                "Enable S3 Object Lock / WORM storage in Compliance Mode on the log destination bucket.",
                "Configure a daily cron job to copy log files to another folder in the same bucket.",
                "E-mail administrators when a file is deleted from the storage account."
              ],
              correctIndex: 0,
              revealCause: "Object Lock in compliance mode enforces WORM (Write Once, Read Many) rules, preventing file deletion even by the root account for a set retention window."
            },
            {
              id: "m5_g3_d2",
              category: "log_security",
              scenario: "An attacker gains root access on a virtual machine and modifies local syslog files to remove records of their SSH login session.",
              question: "How do we preserve the integrity of host OS logs?",
              options: [
                "Configure real-time log forwarding to write log events immediately to an external, write-only central repository.",
                "Set local log files to read-only using guest OS permissions.",
                "Run a host script to encrypt local syslog files using a key stored on the server."
              ],
              correctIndex: 0,
              revealCause: "Forwarding logs to a central server in real-time ensures that records are preserved off-system before an attacker can modify them locally."
            },
            {
              id: "m5_g3_d3",
              category: "log_security",
              scenario: "We need to verify that our log archive files have not been modified or corrupted by administrators between the time they were written and the audit date.",
              question: "Which cryptographic control validates log file integrity?",
              options: [
                "Enable Log File Validation (cryptographic digest hashing) on the cloud trail settings.",
                "Manually check the file modification times on the storage dashboard.",
                "Enforce a policy requiring two administrators to view the log folders."
              ],
              correctIndex: 0,
              revealCause: "Log File Validation creates cryptographic hashes and signatures for log packages, allowing automatic verification of log authenticity."
            },
            {
              id: "m5_g3_d4",
              category: "log_security",
              scenario: "An auditor notes that our security log storage bucket has no network restriction, allowing anyone with the storage credentials to read audit records over the internet.",
              question: "What is the best way to secure this storage access?",
              options: [
                "Enforce storage bucket policies restricting access to designated VPC endpoints and KMS key owners.",
                "Change the names of the log folders to randomized characters.",
                "Zip the log files and password-protect the archive files using a shared password."
              ],
              correctIndex: 0,
              revealCause: "Restricting bucket policies to private network endpoints limits exposure to authorized internal services."
            },
            {
              id: "m5_g3_d5",
              category: "log_security",
              scenario: "Log storage costs are scaling fast because application servers are logging all database operations in plaintext.",
              question: "How should we adjust log collection boundaries?",
              options: [
                "Implement a lifecycle policy to compress and transition logs to cold storage tiers, and filter out low-value debugging lines.",
                "Disable all application logs and rely only on network flow logs.",
                "Delete old log files manually once the storage bucket hits 10 Terabytes."
              ],
              correctIndex: 0,
              revealCause: "Log lifecycle policies and targeted log level filtering optimize costs while preserving security audit paths."
            }
          ]
        }
      ]
    },
    {
      id: "day2_m6",
      title: "Application & API Security",
      description: "Protect web applications and APIs with WAF, secure coding practices, secrets management, and defense against OWASP Top 10 threats.",
      games: [
        {
          id: "m6_g1",
          title: "OWASP Top 10 Protections",
          subtitle: "Classifying Code Vulnerabilities",
          description: "Evaluate the 5 application design choices and classify them as Secure or Vulnerable to OWASP Top 10 exploits.",
          type: "swiper",
          items: [
            {
              id: "owasp_sqli",
              scenario: "A developer writes a login backend: 'SELECT * FROM users WHERE user = ' + req.body.username + ' AND pass = ' + req.body.password.",
              question: "Is this database query pattern Secure or Vulnerable?",
              correctAction: "vulnerable",
              revealCause: "String concatenation of raw input directly into SQL commands enables SQL Injection, allowing bypass of authentication checks."
            },
            {
              id: "owasp_param",
              scenario: "An API gateway endpoint validates incoming customer IDs using strict integer regex matching before forwarding queries to microservices.",
              question: "Is this API schema checking Secure or Vulnerable?",
              correctAction: "secure",
              revealCause: "Input sanitization and schema checking prevent malicious payloads from reaching application logic."
            },
            {
              id: "owasp_secrets",
              scenario: "A connection string for the production database is declared inside the `config.json` file in a public GitHub repository.",
              question: "Is this credential storage Secure or Vulnerable?",
              correctAction: "vulnerable",
              revealCause: "Hardcoding secrets in source files exposes credentials to public scanning bots, compromising the database boundary."
            },
            {
              id: "owasp_ratelimit",
              scenario: "The client authentication endpoint restricts clients to a maximum of 5 login attempts per username every 15 minutes.",
              question: "Is this login security configuration Secure or Vulnerable?",
              correctAction: "secure",
              revealCause: "Rate-limiting login endpoints blocks brute-force automation attacks while protecting user identities."
            },
            {
              id: "owasp_plain_pass",
              scenario: "User passwords are encrypted using MD5 with no salt, and stored in a shared flat file on the application server.",
              question: "Is this password storage structure Secure or Vulnerable?",
              correctAction: "vulnerable",
              revealCause: "MD5 has been cryptographically broken for years. Passwords must be hashed using strong, salted algorithms (e.g. bcrypt or Argon2)."
            }
          ]
        },
        {
          id: "m6_g2",
          title: "API Gateway Defenses",
          subtitle: "Configuring API Security Gateways",
          description: "Establish defensive parameters on the API Gateway. Balance developer access requirements against application security checks. Click verify when aligned.",
          type: "toggle_dashboard",
          toggles: [
            {
              id: "cors_restrict",
              name: "Restrict CORS Origin",
              desc: "Restricts Cross-Origin Resource Sharing (CORS) to specific trusted domain origins, blocking wildcard access (*).",
              defaultState: false,
              correctState: true
            },
            {
              id: "rate_limit_active",
              name: "Client Rate-Limiting",
              desc: "Limits API queries from single client IPs to a maximum of 200 requests per minute to prevent resource starvation.",
              defaultState: false,
              correctState: true
            },
            {
              id: "token_validate_gate",
              name: "Enforce JWT Verification",
              desc: "Verifies signature and claims of incoming OAuth bearer tokens before forwarding calls to microservices.",
              defaultState: false,
              correctState: true
            },
            {
              id: "payload_validation",
              name: "JSON Schema Validation",
              desc: "Audits API payloads against strict format rules, rejecting queries with unmapped parameter fields.",
              defaultState: false,
              correctState: true
            },
            {
              id: "allow_backend_bypass",
              name: "Allow Direct Microservice IPs",
              desc: "Allows client applications to bypass the gateway and query microservice server IPs directly.",
              defaultState: true,
              correctState: false
            }
          ]
        },
        {
          id: "m6_g3",
          title: "WAF Rules Configuration",
          subtitle: "Matching Firewalls to Web Exploits",
          description: "Apply WAF rules to block incoming web exploits and layer 7 threats.",
          type: "scenario",
          decisions: [
            {
              id: "m6_g3_d1",
              category: "waf_rules",
              scenario: "An HTTP request directed at a search API contains the parameter `?query=<script>document.cookie=...</script>`, attempting to steal session cookies.",
              question: "Which WAF rule blocks this vulnerability?",
              options: [
                "Enable OWASP Core Rule Set (CRS) script and Cross-Site Scripting (XSS) filters.",
                "Apply a rate-limiting rule to limit request volume to 100 per minute.",
                "Enable geographic IP blocklists for non-local traffic origins."
              ],
              correctIndex: 0,
              revealCause: "XSS filters scan incoming payloads for HTML tags and script elements, blocking script execution."
            },
            {
              id: "m6_g3_d2",
              category: "waf_rules",
              scenario: "An automated botnet is launching a slow HTTP header attack (Slowloris), keeping connections open and exhausting web server memory pools.",
              question: "What WAF or gateway control mitigates this attack?",
              options: [
                "Configure connection timeout limits and request rate-limiting metrics.",
                "Add a SQL Injection block rule targeting incoming form fields.",
                "Enforce multi-factor authentication for all incoming HTTP connection paths."
              ],
              correctIndex: 0,
              revealCause: "Slowloris exploits are mitigated by setting low connection timeout boundaries and limiting TCP connection counts per source IP."
            },
            {
              id: "m6_g3_d3",
              category: "waf_rules",
              scenario: "Attackers are trying to query administrative URLs like `/admin/config.php` and `/manager/html` on the public web application.",
              question: "How do we restrict access to these paths in the WAF?",
              options: [
                "Configure a path-matching URI rule that blocks public access to admin routes, allowing only local IP ranges.",
                "Run a script to rename the administrative directories on the host OS every hour.",
                "Apply SSL certificates to encrypt traffic directed at administrative paths."
              ],
              correctIndex: 0,
              revealCause: "URI path-matching filters block public traffic directed at sensitive subfolders before it reaches web root directories."
            },
            {
              id: "m6_g3_d4",
              category: "waf_rules",
              scenario: "Incoming logs reveal that competitive bots are scraping pricing databases by systematically querying every product ID thousands of times.",
              question: "Which WAF rule mitigates database scraping?",
              options: [
                "Enable WAF Bot Control with challenge challenges (CAPTCHA / JavaScript validation).",
                "Encrypt all product ID strings using AES-256 keys.",
                "Rotate the SSL certificates on the load balancer."
              ],
              correctIndex: 0,
              revealCause: "Bot control models identify scrapers based on query patterns and user-agent details, challenging bots while allowing real customers access."
            },
            {
              id: "m6_g3_d5",
              category: "waf_rules",
              scenario: "A high-priority vulnerability is announced for a web framework we use. A patch is not yet deployed, but attackers are actively scanning for the exploit payload.",
              question: "What is the best immediate virtual patching method?",
              options: [
                "Write a custom WAF signature targeting the unique exploit payload pattern to block requests.",
                "Shut down the web servers until security teams can deploy the patch manually.",
                "Set the web application database to read-only state."
              ],
              correctIndex: 0,
              revealCause: "Virtual patching via WAF blocks specific exploit signatures, protecting systems before official software patches are applied."
            }
          ]
        }
      ]
    },
    {
      id: "day2_m7",
      title: "Secure DevOps",
      description: "Integrate security into CI/CD pipelines, manage Infrastructure as Code risks, and build a DevSecOps culture with Defender for DevOps and CodePipeline.",
      games: [
        {
          id: "m7_g1",
          title: "CI/CD Pipeline Scanning Gates",
          subtitle: "Chronological Sequence Sorting",
          description: "Use the up/down arrows (▲/▼) to arrange the 5 stages of a secure DevSecOps software delivery pipeline in chronological order (from top to bottom).",
          type: "sorting",
          items: [
            {
              id: "devops_step_commit",
              text: "Developer pushes new code changes, initiating the automated pipeline execution",
              correctIndex: 0,
              revealCause: "The DevSecOps pipeline begins when code is committed and pushed to the repository."
            },
            {
              id: "devops_step_sast",
              text: "The scanner inspects the raw source files for security weaknesses and hardcoded patterns",
              correctIndex: 1,
              revealCause: "Static Application Security Testing (SAST) audits source code files before building binaries."
            },
            {
              id: "devops_step_sca",
              text: "The composition analyzer audits third-party library dependencies for known vulnerabilities",
              correctIndex: 2,
              revealCause: "Software Composition Analysis (SCA) checks package libraries against database records of known exploits."
            },
            {
              id: "devops_step_iac",
              text: "The configuration linter checks infrastructure templates for security settings before deployment",
              correctIndex: 3,
              revealCause: "Scanning Infrastructure-as-Code files verifies that configuration settings meet baseline guidelines before resources are provisioned."
            },
            {
              id: "devops_step_dast",
              text: "The automated testing tool executes dynamic web security scans on the running interface",
              correctIndex: 4,
              revealCause: "Dynamic Application Security Testing (DAST) tests the active web interface in a staging environment to identify runtime flaws."
            }
          ]
        },
        {
          id: "m7_g2",
          title: "IaC Configuration Audits",
          subtitle: "Evaluating Infrastructure as Code Security",
          description: "Audit the 5 Infrastructure as Code (IaC) configuration settings and classify them as Secure or Vulnerable.",
          type: "swiper",
          items: [
            {
              id: "iac_ssh_anywhere",
              scenario: "A Terraform file defines a security group rule: `ingress { from_port = 22, to_port = 22, cidr_blocks = ['0.0.0.0/0'] }`.",
              question: "Is this security group configuration Secure or Vulnerable?",
              correctAction: "vulnerable",
              revealCause: "Opening port 22 (SSH) to the entire internet allows brute-force attacks and scans to reach the host boundary."
            },
            {
              id: "iac_s3_private",
              scenario: "An AWS S3 resource is declared with configuration: `resource 'aws_s3_bucket' 'data' { acl = 'private' }`.",
              question: "Is this S3 bucket access configuration Secure or Vulnerable?",
              correctAction: "secure",
              revealCause: "Setting access controls to private blocks public reads, preserving data boundary limits."
            },
            {
              id: "iac_cleartext_db_pass",
              scenario: "A Terraform variables file defines the master database password: `variable 'db_password' { default = 'Admin123!' }`.",
              question: "Is this credential configuration Secure or Vulnerable?",
              correctAction: "vulnerable",
              revealCause: "Hardcoding passwords in variable files exposes credentials to anyone who has access to the codebase."
            },
            {
              id: "iac_lb_redirect",
              scenario: "A load balancer listener resource is configured to redirect all incoming port 80 (HTTP) traffic to port 443 (HTTPS).",
              question: "Is this listener configuration Secure or Vulnerable?",
              correctAction: "secure",
              revealCause: "Enforcing HTTPS redirection ensures that connection streams are encrypted, protecting credentials and data in flight."
            },
            {
              id: "iac_trail_global",
              scenario: "An IaC template provisions CloudTrail with configuration setting: `is_multi_region_trail = false`.",
              question: "Is this audit trail configuration Secure or Vulnerable?",
              correctAction: "vulnerable",
              revealCause: "Single-region trails fail to log write actions in unmonitored regions, allowing attackers to spin up resources unnoticed."
            }
          ]
        },
        {
          id: "m7_g3",
          title: "Secret Leakage Remediation",
          subtitle: "Managing Exposed Credentials Scenarios",
          description: "Respond to secret exposure incidents inside code repositories and automation pipelines.",
          type: "scenario",
          decisions: [
            {
              id: "m7_g3_d1",
              category: "devops_remediation",
              scenario: "An AWS access key key string is committed to a public GitHub repository. Security teams identify the leak within minutes of push.",
              question: "What is the first remediation step?",
              options: [
                "Deactivate the leaked key immediately in the AWS identity portal.",
                "E-mail the developer to change their password and delete the key from their local laptop.",
                "Delete the file from GitHub using the web browser editor."
              ],
              correctIndex: 0,
              revealCause: "Leaked credentials must be revoked immediately in the cloud system. Deleting the file on GitHub does not prevent historical commits from being scanned."
            },
            {
              id: "m7_g3_d2",
              category: "devops_remediation",
              scenario: "An API password was committed to a repository's git history 6 months ago. The file has been updated, but the credential is still visible in git logs.",
              question: "How do we remove the credential from repository history?",
              options: [
                "Use tools like `git-filter-repo` to completely scrub the credential from all branches and commit records.",
                "Create a new file in the repository claiming that the password is now obsolete.",
                "Delete the repository and start writing the application code from scratch."
              ],
              correctIndex: 0,
              revealCause: "Git history tools like `git-filter-repo` rewrite commit chains to completely remove secret patterns from the repository data."
            },
            {
              id: "m7_g3_d3",
              category: "devops_remediation",
              scenario: "A developer needs to reference a database password inside an automated deployment container in the pipeline.",
              question: "What is the secure way to supply the credential without exposing it in the pipeline definition files?",
              options: [
                "Retrieve the password dynamically during pipeline execution from a Key Vault or KMS using environment variables.",
                "Write the database password in a text file and save it in the build directory.",
                "Encode the password string in base64 and declare it as a plain variable inside the build script."
              ],
              correctIndex: 0,
              revealCause: "Secrets vaults resolve credential exposure by fetching secret strings dynamically during runtime and injecting them as environment variables."
            },
            {
              id: "m7_g3_d4",
              category: "devops_remediation",
              scenario: "We need to ensure that developers cannot commit code containing raw secret patterns or access key strings to company repositories.",
              question: "What control prevents secret pushes proactively?",
              options: [
                "Install pre-commit hooks (like Git Secrets or Gitleaks) to scan files locally before commits are allowed.",
                "Instruct team leads to manually review all lines of code changes before every commit.",
                "Block developers from committing code during off-hours."
              ],
              correctIndex: 0,
              revealCause: "Pre-commit scanning hooks audit files locally, stopping the commit process if secret patterns are detected."
            },
            {
              id: "m7_g3_d5",
              category: "devops_remediation",
              scenario: "A third-party library we use in our pipeline is found to contain a high-severity backdoor. The pipeline is currently deploying code to production.",
              question: "How do we handle the pipeline gate response?",
              options: [
                "Fail the pipeline scan gate immediately, block the release, and fall back to the last secure release container.",
                "Let the pipeline complete the deployment and schedule an investigation for next month.",
                "Exempt the library from scanning checks to let the build finish."
              ],
              correctIndex: 0,
              revealCause: "Pipeline gates block compromised container updates, and reverting to the last secure release maintains stability."
            }
          ]
        }
      ]
    }
  ]
};
