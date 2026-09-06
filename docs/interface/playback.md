---
sidebar_position: 4
---

# Playback Page

The **Playback page** lets you review recent radio transmissions received while connected. It is opened by pressing the **PLAY BACK** button in the top function button row. Playback is only available when using the [TrackAudio](/settings/transmit#radio-integration) or [Audio for VATSIM](/settings/transmit#radio-integration) radio integration.

:::note
The Playback page must be enabled in the [Advanced Settings](/settings/advanced#playback) before use. Recording via TrackAudio is supported on Windows and Linux systems using PipeWire; recording via Audio for VATSIM is supported on Windows only. macOS is not supported for either integration.

Currently only received (Rx) radio transmissions are recorded; Tx recording will be supported in a future release. Phone calls are never recorded.

Recordings made via Audio for VATSIM are limited: since AFV does not expose per-transmission metadata, these clips won't show a callsign or frequency (see the recording list below).
:::

<img
src="/img/playback/playback_overview.png"
alt="Playback Page"
class="screenshot"
style={{
    width: "80%"
  }}
/>

---

## Recording list

The recording list shows all captured transmissions in reverse chronological order. Each entry displays:

- Whether the transmission was received (**Rx**) or transmitted (**Tx**), supported in the future
- The **time** of the transmission
- The **duration** in seconds
- The **callsign(s) and frequency** — if multiple callsigns were transmitting during a clip they are separated by pipes (e.g. `AUA123|AUA88\122.125`). Clips recorded via Audio for VATSIM show `<UNKNOWN>` instead, since callsign and frequency information isn't available for that integration.

Clicking an entry selects it for playback, export or deletion.

---

## Filter

The filter panel currently has no functionality.

---

## Controls

<img
src="/img/playback/playback_controls.png"
alt="Playback Controls"
class="screenshot"
style={{
    width: "80%"
  }}
/>

| # | Button | Description |
|---|--------|-------------|
| 1 | **Play** | Starts playback of the selected recording. Press again to pause; the button blinks while paused. Press again to resume. |
| 2 | **Continuous play** | Starts playback of the selected recording and automatically advances through subsequent clips. Only available if a next clip exists. Press again to pause; the button blinks while paused. Press again to resume. |
| 3 | **Previous clip** | Jumps to the previous recording in the list. Only available during playback when a previous clip exists. |
| 4 | **Next clip** | Jumps to the next recording in the list. Only available during playback when a next clip exists. |
| 5 | **Headset / Speaker** | Toggles playback output between the headset and speaker device. |
| 6 | **Stop** | Stops playback. |
| 7 | **Rewind** | Seeks back 1 second within the current clip. |
| 8 | **Fast forward** | Seeks forward 1 second within the current clip. |
| 9 | **Export** | Exports the selected recording. Exported files are saved to `%LOCALAPPDATA%\app.vacs.vacs-client\playback\saved` on Windows and `$XDG_DATA_HOME/app.vacs.vacs-client/playback/saved` (or `$HOME/.local/share/app.vacs.vacs-client/playback/saved`) on Linux. |
| 10 | **Delete** | Deletes the selected recording. |
| 11 | **Delete all** | Deletes all recordings. |

The following demonstrates controls 1–8 in use:

<img
src="/img/playback/playback_controls.gif"
alt="Playback Controls Demo"
class="screenshot"
style={{
    width: "80%"
  }}
/>

---

## Say Again

**SAY AGAIN** is a button in the upper function button row, to the right of **PLAY BACK**. It replays the most recent recorded transmission immediately, so you can hear a readback again without opening the Playback page.

{/* TODO(screenshot): /img/playback/say-again-button.png - the upper function button row with the SAY AGAIN button visible, radio connected, button in its idle cyan state. */}

Press **SAY AGAIN** to replay the newest recording from the start. The button stays blue for as long as it owns the replay, including while the clip is paused from the Playback page, and pressing it again stops the replay. If nothing has been recorded yet, pressing the button does nothing. A transmission that is still in progress is not replayed; only the newest finished recording is.

The clip plays through the output that the headset/speaker toggle on the Playback page currently selects, the headset by default. If the Playback page is open, it shows that same clip as the selected one and reflects that it is playing, so the stop, pause and seek controls there apply to it. Closing the page does not stop a replay started with **SAY AGAIN**.

The button is greyed out and cannot be pressed under the same conditions that make the Playback page show a notice: radio playback is not supported on your platform, no radio integration is configured, or **Enable radio playback** is off. While the radio is disconnected the button keeps its normal text but stays inactive until the connection is back. Losing the radio connection also stops a replay that is playing.

:::note
There is no keyboard shortcut for SAY AGAIN in this release; the button is the only way to trigger it.
:::
