---
sidebar_position: 2
---

# GEO
The **GEO Page** provides a **geographical overview of the surrounding ATC sectors** that can be called via vacs for your position.

Instead of searching for individual stations in a tabbed layout, the GEO page allows controllers to quickly locate and call adjacent sectors based on their geographical layout and their categorization into different categories.

The sectors and their layout are configured in the dataset by your vACCs Sector Maintainers. Accordingly, the available sectors and their arrangement may differ between positions.

---

## Opening the GEO Page
If your vACC decided to use the GEO page option in their configuration, it will be visible as soon as you log in to a position on VATSIM and connect to vacs. 

If you are in a subpage of the GEO page, you can return to the top-level (main) view of the GEO page, by either pressing the **END** or the **Phone** button.

---

## Navigation
Navigation on the GEO page works as follows:

- Selecting a **region** opens the corresponding **sector page**.
- Selecting a **station** initiates a call.
- The **Phone** and **END** buttons can always be used to return to higher-level pages.

For more information about these buttons, see the **Interface Overview** section.

---

## Overview of the GEO Page
The "top-level" of the GEO Page displays large buttons representing sector groups in a geographical layout. 

<img
src="/img/interface/geo.png"
alt="vacs Settings Page"
style={{
    width: "80%",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

In this example, all sectors matching the description **E / APP** (standing for LOVVs E-ACC sectors and LOWW APP and below), are combined into one category.

Selecting one of the buttons on the "top-level" of the GEO-Page opens a sub-page containing the specific sectors that can be called and fall within the selected region. 

In the example from above, if we click on the **E / APP** button, we open a page, which allows us to choose which sector within the category we want to call exactly (e.g. the ACC-Sector E3, which is a sector that falls into the selected ACC-E / APP group, represented by the **350 E3 PLC** button), and then call this sector by clicking on the relevant Direct Access Key.

<img
src="/img/interface/geo_page.png"
alt="vacs Settings Page"
style={{
    width: "80%",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

:::note Call Source Selection
If a sector displayed on the GEO sector sub-page is **covered by you**, it can be selected here as a **call source**.

As described in the [Interface Overview](/interface/overview), you can select one of these sectors as your **fixed** or **temporary call source** before placing a call.
:::

---

## Incoming Calls
An incoming call in the GEO-Page layout is visible as indicated below:

<img
src="/img/interface/geo_incoming_call.gif"
alt="vacs Settings Page"
style={{
    width: "80%",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

When a sector calls you:

- The corresponding sector button of the caller is highlighted in flashing green color on the "top-level" of the GEO Page (here **E APP**). Also, the caller is visible in the call queue on the right side of the application.
- The corresponding sector button of the recipient of the call is highlighted in light green on the "top-level" of the GEO Page (here **N LOWL**).
- The call can then be accepted using the standard call controls.

Further details about an incoming call can be found by clicking onto the relevant buttons on the "top-level" of the GEO Page. There, the recipient and caller of an incoming call can be detected in the same way as decribed above:

<img
src="/img/interface/geo_page_incoming_call.gif"
alt="vacs Settings Page"
style={{
    width: "80%",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

Here, we have opened the **E / APP** sub-page of the GEO-Page. Here, we can see that **APP VB PLN** (caller, flashing green) is calling **310- E1 PLC** (recipient, static light green). The call can be accepted using the standard call controls.

---

## Selecting a Call Source

As described in the [Interface/Overview](/interface/overview), it is possible to select a call source, so that the recipient of your call is aware of the precise sector calling him.

Two types of call sources exist:

| Type | Description |
|-----|-------------|
| **Fixed Call Source** | The default station used for outgoing calls. |
| **Temporary Call Source** | Used only for the **next call**, after which the fixed call source is used again. |

The selected call source is visually indicated in the grid.

These call sources can be selected by opening a Sector-Page from the "top-level" of the GEO-Page, which consists of sectors, that your station is covering. Clicking on the relevant (active) grey-buttons selects the call source. If you would like to set a **Fixed Call Source** (dark orange) click the relevant button twice, if you would like to select a **Temporary Call Source** (light orange) click the button once.

<img
src="/img/interface/geo_page_call_source.png"
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

## Dataset Configuration
The GEO page layout is **not hardcoded in VACS**. Instead, it is defined in the **dataset provided by your vACC**.  

This dataset specifies:

- Which sectors appear on the GEO page
- How they are grouped geographically
- Which stations can be called from each page

As a result, the layout may differ depending on the FIR or vACC configuration, or even the provieded configuration of the exact position you are staffing.

If you are interested in contributing, reach out to us on our [vacs Discord server](https://discord.gg/yu2nyCKU3R).