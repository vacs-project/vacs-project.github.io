---
sidebar_position: 3
---

# Tabbed Layout
The **Tabbed Layout** is another phone interface option available in vacs, next to the **GEO Page Layout**. It provides structured access to sectors that can be contacted from a certain position.

Sectors are organized into **tabs**, allowing controllers to quickly switch between different groups of callable sectors.

The available tabs and sectors are configured in the dataset by your vACC. Depending on the position you are covering, different tabs and stations may be available.

---

## Opening the Tabbed Layout
If your vACC decided to use the Tabbed Layout in their configuration, it will be visible as soon as you log in to a position on VATSIM and connect to vacs.

---

## Navigation
Tabs are located in the **bottom-right area** of the interface.

<img
src="/img/interface/tabs.png"
alt="vacs Settings Page"
style={{
    width: "80%",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

Each tab represents a **group of sectors** Selecting a tab updates the **Direct Access Page** with the corresponding Direct Access Keys of the callable sectors.

Navigation works as follows:

- Select a **tab** to display the sectors assigned to it.
- Click a **Direct Access Key** of a sector to initiate a call.
- Use the **Phone** or **END** buttons to navigate one level upward within the tab structure.

### Cycling Direct Access Pages
Some datasets contain more Direct Access Pages (Tabs) than the 4 Tabs visible in the bottom control bar.

In this case, a Direct Access Page selector is displayed.

<img
src="/img/interface/dasel.png"
alt="vacs Settings Page"
style={{
    width: "80%",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

This control allows you to cycle between multiple Tabs, for example:

- **DA 1–4**
- **DA 5–6**

Selecting the control switches to the next set of Direct Access Keys.

<img
src="/img/interface/da56.png"
alt="vacs Settings Page"
style={{
    width: "80%",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

---

## Overview of the Tabbed Layout

The main part of the Tabbed Layout contains one of the selectable **Tabs (= Direct Access Pages)**.

<img
src="/img/interface/tabbed_annot.png"
alt="vacs Settings Page"
style={{
    width: "80%",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

Each button on the Direct Access Page represents a **Direct Access Key** corresponding to a specific station.

In the figure above, examples are:

- `ACC N1 EC`
- `ACC E1 EC`
- `APP VN-EC 118775`
- `BRA APP EC`

Depending on the type of button (refer to Interface/Overview/Direct Access Page), clicking a button will initiate different actions.

The available stations and layout are defined by your vACC dataset.

---

## Incoming Calls
An incoming call in the Tabbed-Layout is visible as indicated below:

<img
src="/img/interface/tabbed_incoming_call.gif"
alt="vacs Settings Page"
style={{
    width: "80%",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

When another station calls you:

- The corresponding Direct Access Key of the caller is highlighted in flashing green color on the relevant Direct Access Page (here **ACC N1 EC**). Also, the caller is visible in the call queue on the right side of the application.
- The corresponding Direct Access Key of the recipient is highlighted in static light green color on the relevant Direct Access Page (here **APP VB-EC 134675**). 
- The call can then be accepted using the standard call controls.

If multiple calls occur simultaneously, multiple buttons may highlight.

Priority calls are indicated specially (visually and audibly).

--- 

## Selecting a Call Source

As described in the [Interface/Overview](/interface/overview), it is possible to select a call source, so that the recipient of your call is aware of the precise sector calling him.

Two types of call sources exist:

| Type | Description |
|-----|-------------|
| **Fixed Call Source** | The default station used for outgoing calls. |
| **Temporary Call Source** | Used only for the **next call**, after which the fixed call source is used again. |

The selected call source is visually indicated on the relevant Direct Access Page.

<img
src="/img/interface/tabbed_call_source.png"
alt="vacs Settings Page"
style={{
    width: "80%",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

The call sources can be selected from the relevant Direct Access Page, including the sector you are covering. Clicking on the relevant (active) grey-buttons selects the call source. If you would like to set a **Fixed Call Source** (dark orange) click the relevant button twice, if you would like to select a **Temporary Call Source** (light orange) click the button once.

---

## Dataset Configuration
The Tabbed Layout is fully defined by the dataset provided by your vACC.

This dataset specifies:

- which **Direct Access Pages** exist
- which **sectors appear on each Direct Access Page**
- which stations are available depending on **your active position**
- the **layout of Direct Access Keys**

Because of this, the appearance and available stations may differ between vACCs and operational environments.

If you are interested in contributing, reach out to us on our [vacs Discord server](https://discord.gg/yu2nyCKU3R).