---
sidebar_position: 2
---

# Wayland

Wayland does not let an application observe the keyboard while another window has focus, so vacs binds its hotkeys through your desktop's global shortcuts portal instead. This has a few consequences:

- Keys are assigned in your desktop's shortcut settings, not in vacs. See [Platform support](../settings/hotkeys.md#platform-support) for how the Hotkeys and Transmit pages look on Wayland.
- On desktops whose portal offers no global shortcuts, for example GNOME before version 47 and older Plasma releases, keyboard shortcuts are unavailable altogether. vacs starts normally and says so on the Hotkeys and Transmit pages; joystick buttons and voice activation still work.
- If vacs reports that keyboard shortcuts are unavailable on a desktop that should support them, check that `xdg-desktop-portal` and the portal backend for your desktop are installed, for example `xdg-desktop-portal-kde`, `xdg-desktop-portal-gnome` or `xdg-desktop-portal-hyprland`.
- Wayland does not let one application press keys in another, so the [Audio for VATSIM](../settings/transmit.md#radio-integration) radio integration, which presses your Audio for VATSIM push-to-talk key for you, cannot work. TrackAudio is controlled directly and works as usual.
