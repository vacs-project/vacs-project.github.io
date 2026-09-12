---
sidebar_position: 2
---

# Wayland

Wayland does not let an application observe the keyboard while another window has focus, so vacs binds its hotkeys through your desktop's global shortcuts portal instead. Two things follow from that:

- Keys are assigned in your desktop's shortcut settings, not in vacs. See [Platform support](/settings/hotkeys#platform-support) for how the Hotkeys and Transmit pages look on Wayland.
- On desktops whose portal offers no global shortcuts, for example GNOME before version 47 and older Plasma releases, keyboard shortcuts are unavailable altogether. vacs starts normally and says so on the Hotkeys and Transmit pages; joystick buttons and voice activation still work.
