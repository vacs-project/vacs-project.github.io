---
sidebar_position: 1
---

# Known Issues & Limitations

This page lists problems we know about and limits that come from the platforms vacs runs on. For problems with call audio, see [Troubleshooting](../troubleshooting/audio.md). Linux users on a Wayland desktop should also read the [Wayland](./wayland.md) page.

## macOS says vacs is damaged and should be moved to the Trash

Our macOS releases are not yet signed with an Apple certificate, so macOS refuses to open them at first. Remove vacs from quarantine as described under [Installation](../getting-started/installation.md#macos).

## Hotkeys do nothing while my radar or radio client is focused (Windows)

If your radar client or radio client runs **as administrator**, Windows does not pass key presses made in its window on to programs running without administrator rights. Push-to-talk, push-to-mute and the radio integration key then stop working whenever that window has focus. Run vacs as administrator as well, or run the other program without administrator rights.

## Pressing push-to-talk right after accepting a call transmits on frequency

With a [radio integration](../settings/transmit.md#radio-integration) that shares one push-to-talk key between radio and call, the key keeps triggering your radio until the call is fully established. That usually takes a fraction of a second after the call is accepted. Wait for the green connection indicator in the [top status bar](../interface/overview.md#top-status-bar), or for the call start sound, before you start talking.

## Calls connect but fail after a few seconds, or never connect

Your firewall, antivirus or VPN may be blocking the connection between you and the other controller. Make sure vacs is allowed to make network connections. If you use a VPN, try the [Always relay calls](../settings/call.md#always-relay-calls) setting. [Troubleshooting](../troubleshooting/audio.md) covers calls with one-way audio.

## Echo during calls

vacs does not have echo cancellation. If you use speakers, your microphone picks up the other controller's voice and sends it back to them. Use a headset or headphones.

## The window renders incorrectly after leaving full screen (macOS)

After toggling full screen on macOS, parts of the window may not be drawn correctly. Resize the window slightly to make it render again, then use **Reset Size** in the [Miscellaneous settings](../settings/misc.md#reset-size) to restore its size.
