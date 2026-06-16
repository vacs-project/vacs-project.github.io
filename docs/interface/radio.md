---
sidebar_position: 3
---

# Radio Page

The **Radio page** integrates with [TrackAudio](https://github.com/pierr3/TrackAudio) and lets you manage your radio stack without leaving the vacs window. It is only available when TrackAudio is running and connected.

:::warning
The Radio page is currently only available if the TrackAudio radio integration is selected in the transmit configuration. See [Transmit Modes](/settings/transmit) for more information.

The page remains inactive if you use the Audio for Vatsim radio integration. 
:::

<img
src="/img/radio/radio_overview.png"
alt="Radio Page"
style={{
    width: "80%",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

---

## Add a station

To add a station, enter the desired callsign in the text field and hit enter or click the "+" button next to it. Manually adding a frequency is not supported.

:::info
This will only add the exact station you entered due to a limitation of the TrackAudio API.
Adding all child stations automatically is not possible.
:::

:::note
Removing a station is currently not supported due to a limitation of the TrackAudio API.
:::

## Frequency Object

A frequency object represents a single station in its current state and controls its usage.

<img
src="/img/radio/radio_freqobj.png"
alt="Frequency Object"
style={{
    width: "10.5rem",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

---

You can toggle receiving and transmitting by clicking either Rx or Tx. Clicking Tx automatically enables Rx.

<div style={{display: "flex", gap: "2rem", justifyContent: "center", alignItems: "center", marginBottom: "var(--ifm-leading)"}}>
<img
src="/img/radio/radio_freqobj_rx.png"
alt="Frequency Object Rx"
style={{
    width: "10.5rem",
    display: "block",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

<img
src="/img/radio/radio_freqobj_tx.png"
alt="Frequency Object Tx"
style={{
    width: "10.5rem",
    display: "block",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>
</div>

If you actively receive or transmit on that station, the respective button will be blue.

<div style={{display: "flex", gap: "2rem", justifyContent: "center", alignItems: "center", marginBottom: "var(--ifm-leading)"}}>
<img
src="/img/radio/radio_freqobj_rx_active.png"
alt="Frequency Object Rx Active"
style={{
    width: "10.5rem",
    display: "block",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

<img
src="/img/radio/radio_freqobj_tx_active.png"
alt="Frequency Object Tx Active"
style={{
    width: "10.5rem",
    display: "block",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>
</div>

By clicking the speaker icon, audio output can be toggled to the speaker device configured in TrackAudio.

<img
src="/img/radio/radio_freqobj_speaker.png"
alt="Frequency Object Speaker"
style={{
    width: "10.5rem",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

:::warning
The headset and speaker devices playing the radio transmissions are **separate** from the ones in vacs and need to be configured in TrackAudio.
:::

## Cross Coupling

Two coupling modes are available, configurable in the [Advanced Settings](/settings/advanced).

**Original mode** — Click **CPL** to enter Couple Mode, then click the desired frequency objects one by one. Click **CPL** again to exit Couple Mode. You can also **double-click CPL** outside of Couple Mode to immediately couple all TX-enabled frequencies at once.

<img
src="/img/radio/radio_cross_couple_original.gif"
alt="Frequency Cross Couple (Original mode)"
style={{
    width: "80%",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

:::note
In Original mode, do not click the Rx, Tx or speaker button when selecting frequencies to couple — click the left side of the frequency object instead.

Cross coupling automatically enables Tx and Rx.
:::

---

**Fast mode** — Click **FAST CPL** to immediately couple all TX-enabled frequencies at once, without entering Couple Mode. The button label changes from **CPL** to **FAST CPL** when this mode is active. To uncouple an individual frequency in Fast mode, toggle its **TX** off.

<img
src="/img/radio/radio_cross_couple_fast.gif"
alt="Frequency Cross Couple (Original mode)"
style={{
    width: "80%",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

---

A cross coupled frequency is indicated by two arrows next to the speaker.

<img
src="/img/radio/radio_freqobj_cross_coupled.png"
alt="Frequency Object Speaker"
style={{
    width: "10.5rem",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>