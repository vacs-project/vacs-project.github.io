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

This can also be supplemented by an audible indication. For futher information, see [Call Settings](/settings/call).

<img
src="/img/interface/topbar.png"
alt="vacs Settings Page"
style={{
    width: "80%",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

### Function Buttons
The upper button row contains operational controls such aus:

- **PRIO**: Initiate PRIO Calls, see below.
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

<img
src="/img/interface/tabbed_incoming_call_prio.gif"
alt="vacs Settings Page"
style={{
    width: "80%",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

PRIO-Calls can be disabled, see [Call Settings](/settings/call).

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

<img
src="/img/interface/directaccesspage.png"
alt="vacs Settings Page"
style={{
    width: "80%",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

The direct access page is the primary interaction area for initiating and receiving calls.

### Bottom Control Bar

The lower section contains further buttons, which are important during the useage of vacs.

<img
src="/img/interface/bottom.png"
alt="vacs Settings Page"
style={{
    width: "80%",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

#### Radio 
The Radio button indicates the current state of the [radio integration](/settings/transmit) and allows reconnecting when necessary. The button color and state reflect the current radio status.

| Button Color    | Text Color | Enabled  | State                            | Description                                                                                                                                                                              |
| --------------- | ---------- | -------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gray            | Gray       | Disabled | Radio Integration not configured | Radio integration is not configured. This occurs when another transmit mode is selected or when the required radio key configuration is missing (e.g., no second key configured in AfV). |
| Gray            | Black      | Disabled | Not connected                    | Radio integration is configured, but no connection to TrackAudio exists. *(In Audio for VATSIM this state usually does not occur.)*                                                      |
| Gray            | Black      | Enabled  | Connected, no RX                 | A connection to the radio client exists, but no frequency is currently being received. *(In Audio for VATSIM this state usually does not occur.)*                                        |
| Emerald         | Black      | Enabled  | Idle                             | At least one frequency is tuned and ready, but nobody is currently transmitting and you are not transmitting.                                                                            |
| Cornflower Blue | Black      | Enabled  | Active transmission              | Either you or another controller is currently transmitting on the tuned frequency.                                                                                                       |
| Red             | Black      | Enabled  | Error                            | A radio-related error has occurred.                                                                                                                                                      |


#### CPL 
This button is not implemented.

#### RADIO PRIO 
This button allows you to prioritize Radio Calls while being in vacs-calls in certain transmit modes. For a more detailed explanation depending on your chosen transmit mode, please refer to [Transmit Modes](/settings/transmit).

#### Phone
The Phone button provides quick navigation back to the main phone interface and indicates active phone communication.

| Button Behavior | Description |
|-----------------|-------------|
| Blinking | The Phone button blinks when a phone call is active. |
| Idle | When no phone call is active, the button remains static. |

_On click behavior_

Clicking the **Phone** button always navigates back toward the top level of the phone interface.

| Current Location | Result |
|------------------|--------|
| Inside any menu (e.g. settings page, sub-settings page, mission page, telephone directory) | The interface exits the current menu and returns to the phone interface. |
| Inside a tabbed profile | The interface navigates one page level upward within the tab structure. |
| Inside a non-tabbed profile | The interface navigates directly to the top-level page. |
| Already on the top level | The fallback profile is displayed. |

#### END 
The END button is used to terminate calls and to exit menus, returning the interface toward the main level.

| Button Behavior | Description |
|-----------------|-------------|
| Static | The END button does not change its appearance and does not indicate any state. |

_On click behavior_

Clicking the **END** button performs two actions depending on the current interface state.

| Current Situation | Result |
|-------------------|--------|
| Active outgoing call | The outgoing call is cancelled. |
| Active call | The call is terminated. |
| Rejected / error call display | The call entry is cleared from the display. |
| Inside any menu (e.g. settings page, sub-settings page, mission page, telephone directory) | The interface exits the current menu. |
| Inside a tabbed profile | The interface navigates one page level upward within the tab structure. |
| Inside a non-tabbed profile | The interface navigates directly to the top-level page. |
| Already on the top level | The fallback profile remains displayed. |



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




