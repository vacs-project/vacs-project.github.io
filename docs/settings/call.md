---
sidebar_position: 5
---

# Call Settings

The **Call Config** Menu allows you to change various call-related settings, customising how calls behave, with options for priority calls, visual highlights, and start/end sound effects.

---

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

{/* TODO(screenshot): /img/settings/CallConfig.png - Settings > Call Config, showing the full list
    of options including the new "Always relay calls" entry at the bottom. Supersedes the current
    /img/settings/CallConfig.png, which predates that option and can be deleted. */}

The Call Config page will display the available options, which can be enabled or disabled by the checkbox next to the options. All of them are enabled by default, except **Always relay calls**.

---

## Available Settings
The following settings are available:

### Highlight incoming target
When enabled, the target of an incoming call will be visually highlighted (light green).

### Enable priority calls
When enabled, priority calls are accepted.

Priority calls can be distinguished from normal calls by a yellow border visible in the call-sequence, as well as a special sound.  They can be initiated by clicking the **PRIO** button before commencing a call.

### Play call start sound
When enabled, a notification sound is played when a call is successfully initiaed. This provide audible confirmation that the call has been successfully established.

:::info[Call Establishment Delay]
When initiating or receiving a call, there is a short delay of approximately **50–200 milliseconds** before the call is fully established.

This delay is visually indicated by the **orange circle** in the top-left corner, which turns **green** once the connection is active.

If **Play Call Start Sound** is enabled, this state change is also confirmed audibly.
:::

### Play call end sound
When enabled, a notification sound is played when a call ends. This confirms that the call has been terminated.

### Automatic default call source
When enabled, vacs automatically sets your default call source based on the position you are logged in with. The first matching station defined in the dataset by your vACC and currently controlled by you is selected. You can still override this manually at any time.

If disabled, no default call source is set automatically and you will need to select one yourself.

### Always relay calls
Available from **vacs 2.6.0**.

When enabled, call audio is always sent through one of our relay servers instead of directly to the other controller. This setting is **disabled** by default.

Normally vacs sends call audio **directly** between the two controllers, which keeps latency as low as possible. A relay server is only used when a direct connection cannot be established. Turning this setting on skips the direct attempt entirely and always uses the relay.

You should only enable this if you regularly have trouble hearing the other controller. See [One-way audio](/troubleshooting/audio#one-way-audio-you-cannot-hear-the-other-controller) for when that applies and what vacs already does about it on its own.

This setting only affects **your** client. It does not require anything of the controller you are calling, and it works regardless of which version they are running.

:::note[Latency]
Relaying adds a detour through our server, so calls connect and carry audio slightly slower than a direct connection. The difference is small and usually not noticeable in conversation, but there is no reason to leave this on if your calls work fine without it.
:::

The relay servers are run by the vacs core maintainers, and relayed audio is not recorded or stored. See [About the relay servers](/troubleshooting/audio#about-the-relay-servers), our [Privacy Policy](/legal/privacy-policy#34-audio-data) and our [Terms of Use](/legal/disclaimer).
