---
sidebar_position: 1
---

:::danger Work in Progress
This page is currently under active development and may be incomplete or subject to change.
:::

# Overview
This page provides a complete overview of the vacs interface, including layout structure, button groups, basic call handling and basic call source selection.

## General Layout

The interface is divided into several functional areas:

---
### Top Status Bar
The top bar displays:

- The current time
- The VATSIM CID used for your vacs connection
- The active station (e.g., 'LOWW_APP')
- The running vacs version
- (If you are not using the latest version, that an update is available.)

The small status indicator in the top-left corner shows call state:
- 🟢 Green → Ready / Connected
- 🟠 Orange → Connecting
- ⚫ Gray → Idle / Not connected

### Function Buttons
The upper button row contains operational controls such aus:

- **PRIO** – Priority call handling
- **HOLD**
- **PICKUP**
- **SUITE PICKUP**
- **TRANS**
- **DIV**
- **PLAYBACK**
- **PLC LSP on/off**
- **SPLIT**

Of these buttons, currently only the PRIO button is simulated.

A PRIO Call indicates to the reciever of the call, that the caller considers this call to be urgent. It is highlighted with a yellow border in the recievers vacs, and uses a special sound, to gain attention.

PRIO-Calls can be disabled, see [Call Settings](/docs/settings/call).

--- 

### Direct Access Page

:::info Terminology Definition

For clarity within this documentation, the following terms are used:

- **Direct Access Page** → The central station grid containing all available coordination positions.
- **Direct Access Key** → An individual station button within the Direct Access Page used to initiate or receive calls.

These terms are used consistently throughout the documentation.
:::

The direct access page contains all available coordination stations.

Each title represents one station and my appear in different states:

1. Button that does not reference a station (disabled button with grey text).
2. Station that is online and callable (enabled button with blank text).
3. Button referencing a station not currently online on vacs (disabled button with black text).
4. Station currently controlled by your position (enabled button with grey text).

The direct access page is the primary interaction area for initiating and receiving calls.

### Bottom Control Bar


---

:::danger Moving
Most probably to be moved into using-vacs section.
:::

## Call States

### Incoming Call

When a station calls you:
- The calling station is highlighted.
- The call can be accepted by clicking on one of the blinking green buttons.
- Visual and audible feedback indicates, that the call has been established (sound + green indicator).

In the shown example, the sector **ACC N1 EC** calls **APP-VB EC**.

### Outgoing Call (No Call Source)

In the simplest terms initating a call in vacs (which is without selecting a specific source, for that, see below) can be done as follows:

- Click the Station you intend to call.
- This corresponding button will be displayed in green with a grey border, until the recipient of the call has picked up. The button will then turn green without a grey border.
- As no recipient was selected in this case, a generic sector identifier is displayed as call origin on the recipients end. Here this would be LOWW APP.

In the shown example, the sector **ACC E1 EC** is being called without manually selecting a source.

---

## Call Source Selection




