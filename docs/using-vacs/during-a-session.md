---
sidebar_position: 4
---

# During a session

Once vacs is connected and your station is operational, the system supports your **verbal coordination workflow** with other controllers.

This page provides a **short operational overview** of the most important actions during a session.

Note, that most of the content on this page has already been mentioned before. This page serves as a summary.

---

## Selecting a Call Source

At the beginning of a session, it is recommended to select a **fixed call source** (double click onto your relevant sector (active button with grey text), then turns dark orange) representing the sector from which you will primarily initiate calls.

<img
src="/img/using-vacs/tabbed_call_source.png"
alt="Call Source"
style={{
    width: "80%",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

Setting a call source ensures that other controllers immediately recognize **which sector is calling them**.

If necessary, you can temporarily change the call source before placing an individual call. By doing so, you will set a **temporary call source** (single click onto your relevant sector (active button with grey text), then turns light orange).

If **no call source is selected**, vacs will use a **default identifier for your station**, which will be visible to the receiving controller.

---

## Placing Calls

To initiate a coordination call:

1. Ensure the correct **call source** (fixed or temporary) is selected.
2. Click the **Direct Access Key** of the **sector, which you want to call**.

vacs will automatically route the call to the controller currently covering that sector.

If urgent coordination is required, you may activate the **PRIO** button before placing the call.  
This marks the call as a **priority call** for the receiving controller.

For detailed information, see:  
[Making a Call](/using-vacs/making-a-call)

---

## Receiving Calls

Incoming calls are indicated visually within the interface.

<img
src="/img/using-vacs/tabbed_incoming_call.gif"
alt="Incoming Call"
style={{
    width: "80%",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

When another controller calls you:

- the relevant Direct Access Key will indicate the incoming call in color
- the Phone button will highlight
- an optional sound notification will play.

You can accept the incoming call by pressing the highlighted Direct Access Key of the caller.

For detailed behaviour and examples, see:  
[Receiving a Call](/using-vacs/receiving-a-call)

---

## Speaking During a Call

How you transmit audio during coordination depends on your configured **Transmit Mode**.

Possible configurations include:

- **Separate push-to-talk/mute keys** for radio and phone.
- **Shared transmission key** (Radio Integration) for both communication channels.
- **Voice Activation**.

These settings are explained in:

- [Audio Settings](/settings/audio)  
- [Transmit Settings](/settings/transmit)

---

## RADIO PRIO

During high workload situations, radio communication often remain the highest priority.

Depending on your selected [Transmit Mode](/settings/transmit), the **RADIO PRIO** button has a different function.

If you are using the Radio Integration transmit mode, you can prioritize Radio communications while being in an active call. Accordingly, instead of transmitting in the active vacs call, you will transmit on the frequency using your selected Push-to-Talk.

--- 

## Ending a Call

To terminate a coordination call, press the **END** button in the bottom control bar.

This immediately closes the call and returns the interface to its normal state.

---

## Reminder

During a session, it is recommended to:

- set a **call source** at the beginning of the session
- monitor the interface for **incoming calls**
- place and accept calls as convenient
- use your Push-to-Talk/Mute and/or RADIO PRIO, as required

