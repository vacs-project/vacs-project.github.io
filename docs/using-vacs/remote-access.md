---
sidebar_position: 5
---

# Remote Access

vacs includes a built-in remote access feature that lets you use the full vacs interface from a web browser on another device such as a tablet, phone, or a second monitor on a different machine. The desktop application acts as the server, and the browser connects to it over your local network.

This can be useful if you want to keep your primary screen free for your radar client while operating vacs from a secondary device.

:::tip Quick Start

1. Enable remote access in settings (see [Enabling remote access](#enabling-remote-access))
2. Open `http://<your-pc-ip>:9600` in a browser on any device on the same network

:::

## How it works

When remote access is enabled, vacs starts a small web server alongside the desktop application. This server:

- Serves the same vacs frontend you see in the desktop application, accessible from any modern web browser.
- Maintains a WebSocket connection between the browser and the desktop application, so all actions taken in the browser are executed on the desktop - audio, calls, signaling, and settings all stay in sync.

The remote client is a full mirror of the desktop interface. You can make and receive calls, manage settings, and monitor your session just as you would on the desktop.

:::info
The audio devices used for calls are always the ones configured on the **desktop** machine. The remote browser does not handle audio directly - it only controls the desktop application.

Your remote device's microphone and speakers are not used for calls and no sounds are played on it. All audio input and output happens on the machine running the vacs desktop application.
:::

## Enabling remote access

Remote access is disabled by default. To enable it, head to the [Settings page](/settings/overview) and enable the **Remote Access** option.

That's it - vacs will start the remote access server on port **9600**, accepting connections from any device on the network by default.

### Changing the listen address or port

You can change the listen address on the [Settings page](/settings/overview) using the address input field. The format is `IP:PORT`, using `0.0.0.0:9600` as the default.

- To **change the port**, replace the number after the colon. For example, `0.0.0.0:8080` will listen on port 8080 instead of 9600.
- To **restrict access to only the local machine**, change the IP part to `127.0.0.1` (e.g. `127.0.0.1:9600`). This prevents other devices on the network from connecting.
- The default address `0.0.0.0:9600` means vacs accepts connections from any device on the network on port 9600.

## Connecting from a browser

Once vacs is running with remote access enabled:

1. Find the IP address of the machine running vacs on your local network (e.g. `192.168.1.69`).[^find-ip]
2. Open a browser on your other device and navigate to:

```
http://192.168.1.69:9600
```

The vacs interface will load in your browser. You can start using it immediately - the remote client will automatically synchronize with the current state of the desktop application.

:::tip
Bookmark the URL on your secondary device for quick access in future sessions.
:::

[^find-ip]: **Finding your local IP address:**

    - **Windows:** Open **Settings > Network & internet** and select your active connection (Wi-Fi or Ethernet) to see your IPv4 address. Alternatively, open a terminal and run `ipconfig`, looking for the `IPv4 Address` of your active network adapter.
    - **macOS:** Open **System Settings > Network**, select your active connection, and look for the IP address. Alternatively, open Terminal and run `ipconfig getifaddr en0`.
    - **Linux:** Open your desktop's **Network** or **Wi-Fi** settings to find the IP address. Alternatively, open a terminal and run `ip addr` or `hostname -I`.

## Limitations

- **Audio stays on the desktop** - The remote client controls the desktop application, but all audio input and output happens on the machine running vacs. You cannot use the remote device's microphone or speakers.
- **Desktop-only actions** - A few operations are only available on the desktop client, such as quitting the application, toggling fullscreen/always-on-top, opening file dialogs, initiating the VATSIM login flow, and opening system shortcut settings. These will show an informational error if attempted from a remote client.
- **No built-in authentication** - The remote access server does not require a password. Anyone on the same network who knows the address can connect. Only enable remote access on networks you trust.
- **Single desktop instance** - Multiple browser clients can connect simultaneously, but they all control the same desktop application. Actions taken by one remote client are visible to all others.

:::warning Security
The remote access server has no authentication or encryption. Do **not** expose it to the public internet. Only use it on private, trusted networks (e.g. your home network or a VPN).
:::

## Troubleshooting

### The browser cannot connect

- Make sure vacs is running and remote access is enabled in the settings. You should see a "Remote control server listening on" message in the logs.
- Verify that you're using the correct IP address and port.
- Check that your firewall allows incoming connections on the configured port (default: 9600).
- On Linux, ensure the port is not blocked by `iptables`, `ufw`, or a similar firewall.

### The interface loads but nothing happens

- Check that the desktop application is fully started and logged in. The remote client mirrors the desktop state - if the desktop is on the login screen, the remote will be too.

### Actions show "Desktop only" errors

This is expected for certain operations that require direct access to the desktop environment. See [Limitations](#limitations) above.
