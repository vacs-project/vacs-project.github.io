---
sidebar_position: 7
---

# Frequently Asked Questions (FAQ)

## Calls

<details>
<summary><strong>My call partner picked up the call, but we can't hear each other immediately.</strong></summary>

After a call is accepted, vacs requires a short moment to establish the audio connection.

Typically the connection becomes active after **150-200 milliseconds**.

You can verify that the call is established in two ways:

- The **green status indicator** in the top status bar  
  (see [Top Status Bar](/overview#top-status-bar)).

- An **audible call start sound**, if enabled  
  (see [Play Call Start Sound](/settings/call#play-call-start-sound)).

Until the connection is fully established, audio may not be transmitted. 

This short delay is normal.
</details>

## Audio

## Radio Integration

## Connection

## Interface

<details>
<summary><strong>I cannot find the station by its VATSIM logon</strong></summary>

vacs does not organize stations by their **VATSIM login name**.

Instead, your vACC defines **profiles** (and chooses either the **GEO layout** or the **Tabbed layout**) in the dataset. These profiles usually reference **sectors**, not individual controller logons.

vacs automatically determines which controller is responsible for a sector by evaluating the **current coverage on VATSIM** (including top-down coverage rules). The corresponding sector buttons are then activated in the interface.

To place a call, simply **click the sector you want to coordinate with**. vacs will automatically route the call to the controller currently covering that sector.

This means that even if a controller logs on with a different callsign, the corresponding sector can still be contacted through the corresponding **Direct Access Key**.

:::note
vacs also handles situations where a controller is **connected to VATSIM but not using vacs**.  

In this case, the system automatically adapts the sector coverage accordingly so that calls can still be routed to the controller responsible for that sector.
:::

</details>

<details>
<summary><strong>A station claims they are using vacs, but I cannot see them on my GEO/Tabbed Page (the button is greyed out)</strong></summary>

If a station reports that they are using vacs but the corresponding **sector button appears inactive and grey** on your GEO or Tabbed layout, this is usually related to the **dataset configuration**.

vacs interfaces such as the **GEO Page** or **Tabbed Layout**, all buttons, call routing-rules and the coverage of sectors, are defined by the dataset provided by your vACC. Only sectors that are included in this dataset will appear as **active and callable buttons**.

If the relevant position is not yet configured in your vACC's dataset, the corresponding button will remain inactive even if the controller is connected and using vacs.

This situation can also occur if a neighbouring vACC has not yet configured their dataset and thus, the sector is not yet defined on their end, to be used by your vACC.

In such cases, the controller may still be connected to vacs, but the sector cannot be reached via the predefined interface buttons. Instead, we recommend using the [Telephone Directory](/interface/telephone#telephone-directory) to call this station.

</details>