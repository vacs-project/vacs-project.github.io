---
sidebar_position: 3
---

# Transmit Modes
The **Transmit Config** section defines how your microphone behaves during calls and, depending on the selected mode, during radio transmissions.

Each transmission mode determines when your microphone is active and how it reacts to the assigned hotkey.

---

## Opening Transmit Config
The **Transmit Config** can be accessed from the settings page, by clicking the **Transmit** button.

<img
src="/img/settings/TransmitConfig.png"
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

## Available Modes
There are multiple transmission modes available in vacs, allowing you, to facilitate different hardware constellations.

### Voice Activation
**Behavior during calls:**
- The microphone remains **unmuted**.
- You can toggle the **RADIO PRIO** button to mute your microphone.

In this mode, your microphone is permanently active, unless it is manually muted using the RADIO PRIO button. This allows immediate speech transmission without pressing a key.

:::warning
Voice activation may transmit unintended background noise if your microphone isn't muted manually.

While filtering of background noises is performed using this mode, the corresponding input-gate is very low, accordingly, background noises can be transmitted. Therefore, consider your microphone to be **permanently unmuted**.
:::


### Push-to-Talk (PTT)
**Behavior during calls:**
- The microphone is **muted by default**.
- Press and hold the assigned key to unmute your microphone and to speak.

Audio is transmitted only while the corresponding key is pressed.

### Push-to-Mute
**Behavior during calls:**
- The microphone is **unmuted by default**.
- Press and hold the assigned key to mute.

This mode allows continuous transmission while providing the ability to temporarily mute when necessary.

### Radio Integration
This mode integrates vacs with external radio communication software (e.g., TrackAudio, Audio for VATSIM standalone client).

**Behavior:**
- When **not in a call**:
    - Press and hold the assigned key to transmit on the radio.
- During a **call** (as soon as the connection is established)[^establish]:
    - The assigned key behaves like a Push-to-Talk key within vacs, and does not transmit on the radio frequency.
    - Toggling **RADIO PRIO** forces transmission on the radio frequency during a call.

This allows you to seamlessly communicate on the radio frequency and coordinate on vacs using only one button assignment.

:::tip Recommended Radio Client
For **Radio Integration**, the use of **[TrackAudio](https://github.com/pierr3/TrackAudio)** is recommended.

TrackAudio provides reliable radio transmission handling and seamless integration with vacs.
:::

[^establish]: A call is considered to be established, as soon as the green circle in the top left corner (see Interface/Overview) is visible and/or the corresponding sound has been played.

---

## Configuration of Transmit Modes
Depending on your chosen Transmission Mode, different settings are nessecary in the **Transmit Config** window. 

### Voice Activation
If you decide to use **Voice Activation** no key-binding in the **Mode Part** (top part) of the **Transmit Config** dialog can be set.

The **Radio Integration** (lower part) of the **Transmit Config** dialog can be ignored.

### Push-to-talk/Push-to-mute
If you decide to use **Push-to-talk** or **Push-to-mute**, the relevant key has to be assigned in the **Mode Part** (top part) of the **Transmit Config** dialog. You can assign a key, by clicking into the field next to your selected transmission mode, and then pressing your desired button-assignment once.

The **Radio Integration** (lower part) of the **Transmit Config** dialog can be ignored.

### Radio Integration




