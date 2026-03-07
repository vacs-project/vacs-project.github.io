---
sidebar_position: 5
---

# Remote Access

vacs includes a built-in remote access feature that lets you use the full vacs interface from a web browser on another device such as a tablet, phone, or a second monitor on a different machine. The desktop application acts as the server, and the browser connects to it over your local network.

This can be useful if you want to keep your primary screen free for your radar client while operating vacs from a secondary device.

## How it works

When remote access is enabled, vacs starts a small web server alongside the desktop application. This server:

- Serves the same vacs frontend you see in the desktop application, accessible from any modern web browser.
- Opens a WebSocket connection between the browser and the desktop application, so all actions taken in the browser are executed on the desktop - audio, calls, signaling, and settings all stay in sync.

The remote client is a full mirror of the desktop interface. You can make and receive calls, manage settings, and monitor your session just as you would on the desktop.

:::info
The audio devices used for calls are always the ones configured on the **desktop** machine. The remote browser does not handle audio directly - it only controls the desktop application.

Your remote device's microphone and speakers are not used for calls and no sounds are played on it. All audio input and output happens on the machine running the vacs desktop application.
:::

## Enabling remote access

Remote access is disabled by default. To enable it, you need to edit the vacs configuration file.

1. Open the vacs configuration directory. You can do this from the Settings page by clicking **Open Config**, or navigate to it manually:
   - **Windows:** `%APPDATA%\app.vacs.vacs-client\`
   - **Linux:** `~/.config/app.vacs.vacs-client/`
   - **macOS:** `~/Library/Application Support/app.vacs.vacs-client/`

2. Open (or create) the file `config.toml` in that directory and add:

```toml
[remote]
enabled = true
```

3. Save the file and restart vacs.

That's it - vacs will start the remote access server on port **9600** by default.

### Changing the port

If port 9600 is already in use or you'd like to use a different one, you can specify the full listen address:

```toml
[remote]
enabled = true
listen_addr = "0.0.0.0:8080"
```

The `0.0.0.0` address means vacs will accept connections from any device on the network. If you'd like to restrict it to only the local machine, use `127.0.0.1` instead.

## Connecting from a browser

Once vacs is running with remote access enabled:

1. Find the IP address of the machine running vacs on your local network (e.g. `192.168.1.69`).
2. Open a browser on your other device and navigate to:

```
http://192.168.1.69:9600
```

The vacs interface will load in your browser. You can start using it immediately - the remote client will automatically synchronize with the current state of the desktop application.

:::tip
Bookmark the URL on your secondary device for quick access in future sessions.
:::

## Limitations

- **Audio stays on the desktop** - The remote client controls the desktop application, but all audio input and output happens on the machine running vacs. You cannot use the remote device's microphone or speakers.
- **Desktop-only actions** - A few operations are only available on the desktop client, such as quitting the application, toggling fullscreen/always-on-top, opening file dialogs, and opening system shortcut settings. These will show an informational error if attempted from a remote client.
- **No built-in authentication** - The remote access server does not require a password. Anyone on the same network who knows the address can connect. Only enable remote access on networks you trust.
- **Single desktop instance** - Multiple browser clients can connect simultaneously, but they all control the same desktop application. Actions taken by one remote client are visible to all others.

:::warning Security
The remote access server has no authentication or encryption. Do **not** expose it to the public internet. Only use it on private, trusted networks (e.g. your home network or a VPN).
:::

## Troubleshooting

### The browser cannot connect

- Make sure vacs is running and remote access is enabled in `config.toml`.
- Verify that you're using the correct IP address and port.
- Check that your firewall allows incoming connections on the configured port (default: 9600).
- On Linux, ensure the port is not blocked by `iptables`, `ufw`, or a similar firewall.

### The interface loads but nothing happens

- Check that the desktop application is fully started and logged in. The remote client mirrors the desktop state - if the desktop is on the login screen, the remote will be too.

### Actions show "Desktop only" errors

This is expected for certain operations that require direct access to the desktop environment. See [Limitations](#limitations) above.
