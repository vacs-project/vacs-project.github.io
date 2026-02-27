---
sidebar_position: 5
---

# Call Settings

The **Call Config** Menu allows you to change various call-related settings, customising how calls behave, with options for priority calls, visual highlights, and start/end sound effects.

## Opening Call Config

The **Call Config** Menu can be accessed from the settings page, by clicking the **Call** button.

<img
src="/img/settings/CallConfig.png"
alt="vacs Settings Page"
style={{
    width: "80%",
    display: "block",
    margin: "1.5rem auto",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
  }}
/>

The Call Config page will display the available options, which can be enabled or disabled by the checkbox next to the options. By default, they are all enabled.


## Available Settings
The following settings are available:

### Highlight incoming target
When enabled, the target of an incoming call will be visually highlighted (light green).

### Enable priority calls
When enabled, priority calls are accepted.

Priority calls can be distinguished from normal calls by a yellow border visible in the call-sequence, as well as a special sound.  They can be initiated by clicking the **PRIO** button before commencing a call.

### Play call start sound
When enabled, a notification sound is played when a call is successfully initiaed. This provide audible confirmation that the call has been successfully established.

:::info Call Establishment Delay
When initiating or receiving a call, there is a short delay of approximately **50–200 milliseconds** before the call is fully established.

This delay is visually indicated by the **orange circle** in the top-left corner, which turns **green** once the connection is active.

If **Play Call Start Sound** is enabled, this state change is also confirmed audibly.
:::

### Play call end sound
When enabled, a notification sound is played when a call ends. This confirms that the call has been terminated.
