---
sidebar_position: 2
sidebar_label: What's New
---

# What's New in v2.0.0

[v2.0.0](https://github.com/vacs-project/vacs/releases/tag/v2.0.0) is a major release with a ground-up rework of both how calls work and how the interface looks.

You can find a complete list of changes in the [v2.0.0 release notes](https://github.com/vacs-project/vacs/releases/tag/v2.0.0) on our [GitHub repository](https://github.com/vacs-project/vacs). Below is a summary of the most important changes and additions.

---

## Station-based calling

The biggest change in v2.0.0 is how you initiate calls.

Previously, you would select a specific **client** (a VATSIM controller connected to vacs) to call, meaning you would have to know which controller was responsible for a certain sector and find them in the list of connected clients. While already an improvement over the established workarounds of TeamSpeak and Discord, this was cumbersome to use and different from how real-life coordination works.

In v2.0.0, you now call a **station** instead. Select the ATC station you want to reach (e.g., "TWR LOWL", "N1 ACC", "DEL LOWW"), and vacs will automatically route your call to the correct controller currently in charge of that station. Top-down coverage and sector inheritance typical to VATSIM are automatically handled for you, ensuring your call always reaches the right person. If a station is covered by multiple controllers (e.g., during a coordinator/mentoring session), they will all receive the call and can choose to answer it.

Additionally, you'll now be able to select the station you are calling from. This provides more context to the recipient of your call as it'll indicate the region they should expect to coordinate with you on. Check out [Making a call](/using-vacs/making-a-call#call-source) for more details on how to select a call source.

This brings the coordination workflow much closer to real-life equivalents, where you dial a position rather than a specific person.

---

## Redesigned interface

In order to properly support station-based calling, we've redesigned our interface from ground up. Depending on your VATSIM connection, vacs will now automatically choose the most suitable layout for you, as defined by your FIR's responsible staff.

Two main layouts are currently supported:

- **GEO layout**: stations are arranged geographically, giving you a spatial overview of your neighbouring units and making it fast and intuitive to find the station you want to call. You can find a more detailed description of the GEO layout in the [GEO documentation](/interface/phone/geo).
- **Tabbed layout**: the interface is organised into tabs, allowing for stations to be grouped logically. More details can be found in the [Tabbed layout documentation](/interface/phone/tabbed).

---

## Call sounds

v2.0.0 adds subtle audio cues when calls successfully establish or end. No more watching the connection status indicator to know when your call has been answered - you'll know when to start talking right away.

These sounds can be toggled on or off individually on [Call](/interface/settings#call-sounds) subpage of the [Settings](/interface/settings) page.

---

## Priority calls

You can now mark calls as "priority" when coordination is urgent. Priority calls are visually distinct on the receiving end and will trigger a different, more attention-grabbing sound to ensure they don't go unnoticed.

Priority calls can be disabled locally on the [Call](/interface/settings#priority-calls) subpage of the [Settings](/interface/settings) page. All received priority calls will be treated as normal ones when this setting is disabled.

---

## Window zoom hotkeys

You can now adjust the zoom level of the vacs window using the well-known `Ctrl +` and `Ctrl -` keyboard shortcuts. This is especially useful if you've resized the window and would like to ensure best readability and layouting. `Ctrl 0` will reset the zoom level to default.

---

## Migrating from v1.x

v2.0.0 introduces breaking changes that affect how clients communicate with the server. **You must update before you can connect** - older clients are not compatible with the v2.0.0 server.

Your client will automatically prompt you to update and will refuse to connect until you do. Head over to the [Updating](/getting-started/updating) guide for instructions on how to get the latest version of vacs.

Your local settings and [Configuration](/configuration) will be preserved during the update and will (mostly) continue to work as expected. However, the previous `stations.toml` and the associated custom stations configuration have been removed in favour of our new, reworked [interface](/interface/overview). Refer to our [Clients page](/interface/phone/clients) for details on the latest UI and how to configure it.
