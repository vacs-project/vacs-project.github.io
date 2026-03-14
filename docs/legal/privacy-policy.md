---
sidebar_position: 1
title: Privacy & Data Handling Policy
---

# Privacy & Data Handling Policy

**Effective date:** March 13, 2026  
**Last updated:** March 13, 2026

## 1. Introduction and Scope

This Privacy & Data Handling Policy ("Policy") describes how the **vacs** (VATSIM ATC Communication System) project collects, processes, stores, and protects personal data when you use our software, services, and website.

vacs is a free, open-source, cross-platform ground-to-ground voice coordination tool designed for air traffic controllers on the [VATSIM](https://vatsim.net) flight simulation network. The project is developed and maintained by a team of volunteer core maintainers. vacs is **not** a commercial product and is provided free of charge to all users. There is no legal entity behind the project; it is a personal open-source project.

This Policy is written in accordance with:

- **Regulation (EU) 2016/679** (General Data Protection Regulation, "GDPR")
- **Austrian Data Protection Act** (_Datenschutzgesetz_, "DSG")

We are committed to transparency and to protecting your privacy. Because vacs is open source, you can inspect [the entire codebase](https://github.com/vacs-project/vacs) to verify every claim made in this Policy.

### 1.1 What This Policy Covers

This Policy applies to:

- The **vacs desktop application** (the "Client"), available for Windows, macOS, and Linux
- The **official vacs signaling servers** operated by the core maintainers (collectively, the "Official Servers"; individually, a "Server"): the production instance at `vacs.network` and the development instance at `dev.vacs.network`
- The **vacs project website** at [vacs.network](https://vacs.network) and its subdomains, including the documentation at [docs.vacs.network](https://docs.vacs.network)

### 1.2 What This Policy Does Not Cover

- **Self-hosted server instances.** vacs is designed to allow anyone to host their own signaling server. If you connect to a third-party or self-hosted vacs server, the operator of that server is solely responsible for their own data handling practices. This Policy covers only the Official Servers operated by the core maintainers.
- **Third-party services.** This Policy does not govern the data practices of VATSIM, Cloudflare, or any other third party. Where relevant, we link to their respective privacy policies.
- **The vacs dataset repository.** The [vacs-data](https://github.com/vacs-project/vacs-data) repository contains only publicly available virtual air traffic control station and position definitions. It does not contain any personal data.

---

## 2. Data Controller

The data controller for processing activities described in this Policy is:

**Nick Müller**  
on behalf of the vacs project core maintainers

Contact for privacy inquiries: [privacy@vacs.network](mailto:privacy@vacs.network)

As a personal open-source project without a legal entity, the data controller is a natural person within the meaning of Article 4(7) GDPR. We are based in **Austria** and subject to the GDPR and the Austrian DSG.

We have not appointed a Data Protection Officer (DPO) under Article 37 GDPR, as the processing we carry out does not meet the thresholds that require one. However, you may direct all privacy-related inquiries to the contact address above.

---

## 3. Data We Process

We follow the principle of **data minimisation** (Article 5(1)(c) GDPR). We only process personal data that is strictly necessary for the operation of the service. We do **not** collect names, email addresses, physical addresses, payment information, or any other personal identifiers beyond what is described below. We do **not** process any special categories of personal data within the meaning of Article 9 GDPR (e.g., health data, biometric data, racial or ethnic origin, political opinions, or religious beliefs).

### 3.1 VATSIM Certificate Identification (CID)

When you log in to vacs, you authenticate via **VATSIM Connect** (OAuth 2.0). Through this process, we receive your **VATSIM Certificate Identification ("CID")** - a numeric identifier assigned to you by VATSIM.

- **Purpose:** Your CID is required for call routing, session management, and to identify you to other controllers on the network. It is the sole user identifier within vacs.
- **How it is processed:** Your CID is held in server memory for the duration of your session and is included in server log files. It is not written to any persistent database.
- **What we do NOT receive:** We do **not** request or receive your VATSIM password. The OAuth 2.0 flow ensures your credentials are exchanged only with VATSIM's authorization server. The temporary OAuth access token we receive is used exactly once to retrieve your CID, and is then **immediately discarded** - it is not stored, cached, or logged.

### 3.2 Session Data

When you authenticate, a server-side session is created and stored in **Redis** (an in-memory data store).

- **Contents:** Session identifier, your CID, authentication state, and a CSRF protection token.
- **Duration:** Sessions expire automatically after **7 days** of inactivity.
- **Cookie:** A signed, HTTP-only session cookie is set in the Client to maintain your authenticated session. See [Section 9 (Cookies)](#9-cookies) for details.

### 3.3 IP Addresses

Your **IP address** is processed in the following contexts:

| Context               | Purpose                                           | Retention                                                                                 |
| --------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Server access logs    | Service operation, debugging, abuse prevention    | 14 days                                                                                   |
| WebSocket connections | Maintaining your real-time connection             | In-memory only (duration of connection)                                                   |
| Cloudflare TURN relay | NAT traversal for WebRTC audio calls              | Subject to [Cloudflare's privacy policy](https://www.cloudflare.com/en-gb/privacypolicy/) |
| WebRTC peer-to-peer   | Direct audio connection between call participants | Not stored (transient, in-flight only)                                                    |

:::warning[Important: IP Visibility in Peer-to-Peer Calls]
Due to the nature of **WebRTC** peer-to-peer technology, your IP address may be visible to the other participant(s) in a call. This is an inherent property of direct peer-to-peer communication and cannot be prevented by vacs. When a TURN relay is used (as a fallback when all other direct connection attempts fail), audio traffic is relayed through the TURN server, which may reduce direct IP exposure between peers, but your IP address is then visible to the TURN server operator (by default, Cloudflare).
:::

### 3.4 Audio Data

**vacs does not record, store, or transmit audio through the Server.** All voice communication is **direct peer-to-peer** between call participants using WebRTC. Audio data never passes through the vacs signaling server. No audio recordings are made at any point.

When a direct peer-to-peer connection cannot be established, audio traffic may be **relayed through a TURN server** (by default, Cloudflare's Realtime TURN Service). In this case, the audio data passes through the TURN server encrypted in transit but is not recorded or stored. See [Section 7.2](#72-cloudflare-turn-service) for details.

---

## 4. Legal Bases for Processing

Under Article 6(1) GDPR, every processing activity requires a legal basis. The following table summarizes the legal bases we rely on:

| Processing Activity                     | Legal Basis                             | Justification                                                                                                                                                                                                                                |
| --------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| VATSIM CID (authentication and session) | **Contract performance** (Art. 6(1)(b)) | Processing your CID is necessary to provide the service you have requested by logging in and accepting the [Terms of Use](/legal/disclaimer). Your CID is the sole identifier used for authentication, call routing, and session management. |
| Session data (Redis)                    | **Contract performance** (Art. 6(1)(b)) | Technically necessary to maintain your authenticated session. Without session data, the service cannot function.                                                                                                                             |
| Session cookie                          | **Contract performance** (Art. 6(1)(b)) | Strictly necessary for session management. Exempt from consent requirements under the ePrivacy Directive (see [Section 9](#9-cookies)).                                                                                                      |
| IP addresses in server logs             | **Legitimate interest** (Art. 6(1)(f))  | Necessary for server security, abuse prevention, and debugging. Our interest in maintaining a secure and operational service outweighs the minimal intrusion, especially given the 14-day retention limit.                                   |
| IP visibility via WebRTC                | **Contract performance** (Art. 6(1)(b)) | Inherent to the peer-to-peer technology that enables low-latency voice communication, which is the core purpose of the service.                                                                                                              |
| Cloudflare TURN relay                   | **Contract performance** (Art. 6(1)(b)) | Provides fallback connectivity when direct peer-to-peer connections are not possible. Users may opt out by configuring alternative STUN/TURN servers (see [Section 7.2](#72-cloudflare-turn-service)).                                       |

### 4.1 Legitimate Interest Balancing

Where we rely on legitimate interest, we have conducted a balancing assessment as required by Article 6(1)(f) GDPR:

- **Our interest:** Providing a functional, secure, and reliable voice communication service to the VATSIM controller community.
- **Your rights and freedoms:** We process only minimal, mostly technical data. We do not build user profiles, serve advertisements, or share data with third parties for commercial purposes.
- **Safeguards:** Short retention periods (14 days for logs, 7 days for sessions), no persistent user database, data minimisation by design, and full transparency through open-source code.

We believe our legitimate interests do not override your fundamental rights and freedoms, given the minimal nature of the data processed and the safeguards in place.

---

## 5. Data Retention

We adhere to the principle of **storage limitation** (Article 5(1)(e) GDPR). Personal data is kept only for as long as necessary for the purposes for which it was collected.

| Data Category                                       | Retention Period                                     |
| --------------------------------------------------- | ---------------------------------------------------- |
| Server log files (containing CIDs and IP addresses) | **14 days**, then automatically purged               |
| Redis session data                                  | **7 days** of inactivity, then automatically expired |
| Audio data (WebRTC peer-to-peer and TURN relay)     | Not stored at all; transient in-flight only          |

We do **not** maintain a persistent user database. There is no long-term storage of user accounts, profiles, or usage history.

---

## 6. Your Rights Under the GDPR

Under the GDPR, you have the following rights regarding your personal data. You may exercise any of these rights by contacting us at [privacy@vacs.network](mailto:privacy@vacs.network). We will respond to all data subject requests within the timeframes prescribed by the GDPR and applicable national law.

### 6.1 Right of Access (Article 15)

You have the right to obtain confirmation as to whether we are processing your personal data and, if so, to receive a copy of that data along with information about the processing.

Given the minimal data we process, a response to an access request will typically confirm:

- Whether your CID appears in our current log files (retained for 14 days)
- Whether you have an active session

### 6.2 Right to Rectification (Article 16)

You have the right to have inaccurate personal data corrected. Since we process only your VATSIM CID (which is assigned by VATSIM and cannot be changed by us), rectification requests related to your CID should be directed to [VATSIM](https://vatsim.net/docs/policy/data-protection-and-handling-policy).

### 6.3 Right to Erasure (Article 17)

You have the right to request the deletion of your personal data ("right to be forgotten"). Upon receiving a valid erasure request, we will:

- Terminate any active sessions associated with your CID
- Remove your CID and IP address from server log files within a reasonable timeframe

Please note that log files are automatically purged after 14 days, and session data expires after 7 days. In most cases, your data will be fully deleted through these automated processes without requiring manual intervention.

### 6.4 Right to Restriction of Processing (Article 18)

You have the right to request that we restrict the processing of your personal data under certain circumstances, such as when you contest the accuracy of the data or when you have objected to our processing.

### 6.5 Right to Data Portability (Article 20)

You have the right to receive your personal data in a structured, commonly used, and machine-readable format, and to transmit that data to another controller. Given that the only personal data we process is your VATSIM CID (which you already know and which is assigned by VATSIM), the practical scope of this right is limited in our context.

### 6.6 Right to Object (Article 21)

You have the right to object to the processing of your personal data where we rely on legitimate interest as the legal basis. Upon receiving an objection, we will cease processing unless we can demonstrate compelling legitimate grounds that override your interests, rights, and freedoms.

If you object to the processing of your IP address in log files, we will anonymize or delete relevant log entries within a reasonable timeframe.

### 6.7 Right Not to Be Subject to Automated Decision-Making (Article 22)

You have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects concerning you or similarly significantly affects you. We do not engage in any automated decision-making or profiling.

### 6.8 Right to Lodge a Complaint (Article 77)

You have the right to lodge a complaint with a supervisory authority if you believe that our processing of your personal data infringes the GDPR.

As we are based in Austria, the competent supervisory authority is:

**Austrian Data Protection Authority**  
(_Österreichische Datenschutzbehörde_)  
Barichgasse 40-42  
1030 Vienna, Austria  
Email: [dsb@dsb.gv.at](mailto:dsb@dsb.gv.at)  
Website (German): [https://www.dsb.gv.at](https://www.dsb.gv.at)  
Website (English): [https://www.data-protection-authority.gv.at](https://www.data-protection-authority.gv.at)

You also have the right to lodge a complaint with the supervisory authority in your own EU/EEA member state of habitual residence, place of work, or place of the alleged infringement.

---

## 7. Third-Party Services and Data Sharing

We do **not** sell, rent, trade, or otherwise share your personal data with third parties for their own purposes. We do not use any analytics services, advertising networks, or tracking technologies.

The following third-party services are involved in the operation of vacs:

### 7.1 VATSIM Connect (Authentication)

vacs uses **VATSIM Connect** (OAuth 2.0) as its sole authentication provider. When you log in:

1. You are redirected to VATSIM's authorization server
2. You authenticate with your VATSIM credentials (which are **never** shared with vacs)
3. VATSIM issues a temporary authorization code to vacs
4. vacs exchanges this code for a temporary access token
5. vacs uses the token once to retrieve your CID, then immediately discards the token

We receive only your CID from VATSIM. We do not request or receive your name, email address, VATSIM rating, or any other profile information.

VATSIM is an independent third party. Their processing of your data is governed by their own privacy and data handling policies:

- [VATSIM Privacy and Data Handling Policy](https://vatsim.net/docs/policy/data-protection-and-handling-policy)

### 7.2 Cloudflare TURN Service

By default, vacs uses **Cloudflare's Realtime TURN Service** to provide NAT traversal capabilities for WebRTC audio calls. TURN (Traversal Using Relays around NAT) servers relay audio traffic when a direct peer-to-peer connection cannot be established.

When the Cloudflare TURN service is used:

- Your **IP address** is visible to Cloudflare
- **Audio data** may be relayed through Cloudflare's infrastructure (encrypted in transit)
- Cloudflare may process this data in accordance with their own privacy practices

Cloudflare's data processing is governed by:

- [Cloudflare Privacy Policy](https://www.cloudflare.com/en-gb/privacypolicy/)

**You may opt out of using Cloudflare's TURN service** by configuring alternative STUN/TURN servers in the vacs application settings. If you do so, no data will be sent to Cloudflare. See the [configuration documentation](/advanced/configuration) for details.

### 7.3 Hetzner (Server Hosting)

The Official Servers are hosted in **Hetzner** data centers located in **Nuremberg, Germany**. Hetzner acts as a data processor. Hetzner's data processing is governed by:

- [Hetzner Data Privacy Policy](https://www.hetzner.com/legal/privacy-policy/)

### 7.4 GitHub Pages (Documentation Hosting)

The documentation website at [docs.vacs.network](https://docs.vacs.network) is hosted on **GitHub Pages**, a static site hosting service provided by GitHub, Inc. (a subsidiary of Microsoft Corporation). When you visit the documentation website, GitHub may process your **IP address** and standard HTTP request metadata (such as your browser's user agent string) as part of serving the pages.

We do not have access to any visitor data collected by GitHub Pages. GitHub's data processing is governed by:

- [GitHub Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement)

---

## 8. International Data Transfers

The Official Servers are located in **Nuremberg, Germany** (European Union). For users within the European Economic Area (EEA), your data remains within the EU during server-side processing.

### 8.1 Cloudflare

Cloudflare, Inc. is headquartered in the United States but operates a global network, including infrastructure within the EU. When the Cloudflare TURN service is used, your data may be processed in locations outside the EEA. Cloudflare is bound by the **Data Privacy Framework (DPF)** for international data transfers. You may opt out of Cloudflare processing by configuring alternative STUN/TURN servers as described in [Section 7.2](#72-cloudflare-turn-service).

### 8.2 WebRTC Peer-to-Peer

Due to the peer-to-peer nature of WebRTC, audio data and IP addresses are exchanged **directly between call participants**. If you are calling a controller located in a different country, your audio data and IP address are transferred directly to that participant's device. These transfers are:

- **Encrypted in transit** using DTLS-SRTP (as mandated by the WebRTC standard)
- **Transient** - no audio data is stored by vacs at any point
- **Inherent to the service** - peer-to-peer communication is the core functionality of vacs

As the vacs project cannot control where individual users are located, we cannot guarantee that peer-to-peer audio transfers will remain within any particular jurisdiction. By using vacs, you acknowledge that your audio data and IP address may be transferred to other users in countries outside the EEA that may not offer an equivalent level of data protection.

### 8.3 VATSIM

When you authenticate via VATSIM Connect, you interact directly with VATSIM's servers, which may be located outside the EEA. This interaction is governed by VATSIM's own privacy policy and is not a data transfer initiated by vacs.

### 8.4 GitHub Pages

GitHub, Inc. is headquartered in the United States. When you visit [docs.vacs.network](https://docs.vacs.network), your request may be served from GitHub's global infrastructure, which may include servers outside the EEA. GitHub is bound by the **Data Privacy Framework (DPF)** and other mechanisms as described in their privacy statement to provide appropriate safeguards for international data transfers.

---

## 9. Cookies

The vacs application uses a **single session cookie** to maintain your authenticated session with the Server. This cookie:

- Is **signed** and **HTTP-only** (not accessible to JavaScript)
- Contains only a **session identifier** - no personal data, tracking identifiers, or analytics data
- Is **strictly necessary** for the service to function (you cannot use vacs without a session)
- Expires when your session ends or after 7 days of inactivity

This cookie is classified as a **strictly necessary cookie** under the ePrivacy Directive (2002/58/EC, Article 5(3)) and is therefore **exempt from consent requirements**. It is used solely to provide the service you have explicitly requested.

We do **not** use any tracking cookies, analytics cookies, advertising cookies, or any other cookies beyond the single session cookie described above. The vacs project website ([vacs.network](https://vacs.network)) and its documentation subdomain ([docs.vacs.network](https://docs.vacs.network)) do **not** set any cookies.

---

## 10. Data Security

We implement appropriate technical and organizational measures to protect your personal data in accordance with Article 32 GDPR:

### 10.1 Technical Measures

- **Encryption in transit:** All connections to the Server use TLS (HTTPS/WSS). WebRTC audio is encrypted end-to-end using DTLS-SRTP.
- **Signed session cookies:** Session cookies are cryptographically signed to prevent tampering.
- **No persistent user database:** By design, there is no long-term storage of personal data. This significantly reduces the risk and impact of any potential data breach.
- **Minimal data collection:** We collect only the data strictly necessary for the service to function.
- **Automatic data deletion:** Log files and aggregated metrics are automatically purged after 14 days. Sessions expire after 7 days.
- **Open-source codebase:** The entire application is open source, allowing independent verification of our security and privacy practices.
- **Build attestations:** Official Client releases are published with build provenance attestations, allowing you to verify that a downloaded binary was built from the authentic source code through our CI/CD pipeline and has not been tampered with.

### 10.2 Organizational Measures

- **Access control:** Server access is restricted to core maintainers with a legitimate operational need.
- **Infrastructure security:** Servers are hosted in Hetzner data centers in Germany, which comply with ISO 27001 and other security standards.
- **Dependency management:** We use automated tools (Dependabot, cargo-deny) to monitor and update dependencies for known security vulnerabilities.

---

## 11. Children's Privacy

vacs is designed for use by VATSIM air traffic controllers and requires a valid VATSIM account to function. VATSIM's membership requirements - at the time of writing - include a minimum age:

- For accounts created **before January 1, 2026**: Users must be at least **13 years old**
- For accounts created **on or after January 1, 2026**: Users must be at least **16 years old**

We do not knowingly collect or process personal data from children below VATSIM's applicable minimum age requirements. Since authentication is handled entirely by VATSIM, we rely on VATSIM to enforce their own age restrictions.

We do not specifically cater to children and our service is not intended for use by minors below the applicable VATSIM minimum age.

If you believe that a child below the applicable minimum age is using vacs, please contact us at [privacy@vacs.network](mailto:privacy@vacs.network).

---

## 12. Self-Hosted Instances

vacs is designed to be self-hostable. Anyone may operate their own vacs signaling server. If you connect to a self-hosted or third-party vacs server:

- **This Policy does not apply.** The operator of that server is independently responsible for their own data handling, privacy practices, and compliance with applicable data protection laws.
- We have **no control over and accept no responsibility for** the data practices of third-party server operators.
- We encourage self-hosted server operators to publish their own privacy policies and to comply with applicable data protection regulations.

The vacs Client allows users to configure which server they connect to. If you are unsure which server you are connected to, check your application settings. By default, you will automatically be connected to the Official Servers operated by the core maintainers, which are covered by this Policy.

---

## 13. Data Breach Notification

In the event of a personal data breach that is likely to result in a risk to your rights and freedoms, we will:

1. **Notify the Austrian Data Protection Authority** within 72 hours of becoming aware of the breach, as required by Article 33 GDPR.
2. **Publish a public notice** via a [GitHub Security Advisory](https://github.com/vacs-project/vacs/security/advisories) on our repository and on our [community Discord server](https://discord.gg/yu2nyCKU3R).

Because we do not collect email addresses or other direct contact information, we are unable to individually notify affected users. The public notice will include the nature of the breach, the categories of data affected, the likely consequences, and the measures taken to address it.

---

## 14. Changes to This Policy

We may update this Policy from time to time to reflect changes in our data practices, legal requirements, or the functionality of vacs. When we make changes:

- The updated Policy will be published on this page
- The "Last updated" date at the top of this Policy will be revised
- For material changes, we will post a notice on our [community Discord server](https://discord.gg/yu2nyCKU3R)

We encourage you to review this Policy periodically. Your continued use of vacs after any changes constitutes acceptance of the updated Policy.

---

## 15. Applicable Law and Jurisdiction

This Policy, and any dispute arising from or in connection with it, is governed by **Austrian law**. The courts of **Austria** have exclusive jurisdiction over any disputes relating to this Policy, without prejudice to your right under Article 79(2) GDPR to bring proceedings before the courts of your EU/EEA member state of habitual residence.

---

## 16. GDPR Principles Summary

In accordance with Article 5 GDPR, we adhere to the following principles in all our processing activities:

| Principle                                  | How We Comply                                                                                                                                                   |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Lawfulness, fairness, and transparency** | We process data based on performance of a contract and legitimate interest, treat users fairly, and fully disclose our practices in this Policy and through our open-source code. |
| **Purpose limitation**                     | Data is collected only for the specific purposes outlined in this Policy (service operation, security, debugging).                                              |
| **Accuracy**                               | CIDs are sourced directly from VATSIM's authoritative system. Log data is generated automatically and is accurate by nature.                                    |
| **Accountability**                         | This Policy documents our compliance. Our open-source codebase provides full transparency. We respond to all data subject requests.                             |

---

## 17. Contact

For any questions, concerns, or requests related to this Policy or our data handling practices:

**Email:** [privacy@vacs.network](mailto:privacy@vacs.network)  
**GitHub:** [github.com/vacs-project/vacs](https://github.com/vacs-project/vacs)

We will respond to all privacy-related inquiries within **one month** of receipt, as required by Article 12(3) GDPR. If the request is complex, we may extend the response period by a further two months, in which case we will inform you of the extension within the initial one-month period.
