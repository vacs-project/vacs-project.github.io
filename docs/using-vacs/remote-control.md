---
sidebar_position: 5
---

# Remote Control

vacs includes a built-in remote control feature that lets you use the full vacs interface from a web browser on another device such as a tablet, phone, or a second monitor on a different machine. The desktop application acts as the server, and the browser connects to it over your local network.

This can be useful if you want to keep your primary screen free for your radar client while operating vacs from a secondary device.

:::tip[Quick Start]

1. Enable remote control in settings (see [Enabling remote control](#enabling-remote-control))
2. Open `http://<your-local-ip>:9600` in a browser on any device on the same network

:::

## How it works

When remote control is enabled, vacs starts a small web server alongside the desktop application. This server:

- Serves the same vacs frontend you see in the desktop application, accessible from any modern web browser.
- Maintains a WebSocket connection between the browser and the desktop application, so all actions taken in the browser are executed on the desktop - audio, calls, signaling, and settings all stay in sync.

The remote client is a full mirror of the desktop interface. You can make and receive calls, manage settings, and monitor your session just as you would on the desktop.

:::info
The audio devices used for calls are always the ones configured on the **desktop** machine. The remote browser does not handle audio directly - it only controls the desktop application.

Your remote device's microphone and speakers are not used for calls and no sounds are played on it. All audio input and output happens on the machine running the vacs desktop application.
:::

## Enabling remote control

Remote control is disabled by default. To enable it, head to the [Advanced Settings page](/settings/advanced) and enable the **Remote Control** option.

That's it - vacs will start the remote control server on port **9600**, accepting connections from any device on the network by default.

### Changing the listen address or port

You can change the listen address on the [Advanced Settings page](/settings/advanced) using the address input field. The format is `IP:PORT`, using `0.0.0.0:9600` as the default.

- To **change the port**, replace the number after the colon. For example, `0.0.0.0:8080` will listen on port 8080 instead of 9600.
- To **restrict access to only the local machine**, change the IP part to `127.0.0.1` (e.g. `127.0.0.1:9600`). This prevents other devices on the network from connecting.
- The default address `0.0.0.0:9600` means vacs accepts connections from any device on the network on port 9600.

## Connecting from a browser

Once vacs is running with remote control enabled:

1. Find the IP address of the machine running vacs on your local network.[^find-ip]
2. Open a browser on your other device and navigate to:

```
http://<your-local-ip>:9600
```

The vacs interface will load in your browser. You can start using it immediately - the remote client will automatically synchronize with the current state of the desktop application.

:::tip
Bookmark the URL on your secondary device for quick access in future sessions.
:::

[^find-ip]: **Finding your local IP address:**

    - **Windows:** Open **Settings > Network & internet**, select your active connection (Wi-Fi or Ethernet) and look for **IPv4 address**. Alternatively, press <kbd>Win</kbd>+<kbd>R</kbd>, type `cmd`, press <kbd>Enter</kbd> and run `ipconfig`. Use the `IPv4 Address` line of the adapter you are actually connected through (usually named "Wireless LAN adapter Wi-Fi" or "Ethernet adapter Ethernet").
    - **macOS:** Open **System Settings > Network**, select your active connection, and look for the IP address. Alternatively, open Terminal and run `ipconfig getifaddr en0`.
    - **Linux:** Open your desktop's **Network** or **Wi-Fi** settings to find the IP address. Alternatively, open a terminal and run `ip addr` or `hostname -I`.

    On a home network the address usually starts with `192.168.` or `10.`. Things that look similar but are **not** the right address: the **Default Gateway** (that is your router), addresses of virtual adapters such as `vEthernet`, `WSL`, `VirtualBox`, `VMware` or a VPN, `169.254.x.x` addresses (the adapter has no network), and the "public IP" shown by websites (that is your internet connection, not your PC).

## Limitations

- **Audio stays on the desktop** - The remote client controls the desktop application, but all audio input and output happens on the machine running vacs. You cannot use the remote device's microphone or speakers.
- **Desktop-only actions** - A few operations are only available on the desktop client, such as quitting the application, toggling fullscreen/always-on-top, opening file dialogs, initiating the VATSIM login flow, and opening system shortcut settings. These will show an informational error if attempted from a remote client.
- **No built-in authentication** - The remote control server does not require a password. Anyone on the same network who knows the address can connect. Only enable remote control on networks you trust.
- **Single desktop instance** - Multiple browser clients can connect simultaneously, but they all control the same desktop application. Actions taken by one remote client are visible to all others.

:::warning[Security]
The remote control server has no authentication or encryption. Do **not** expose it to the public internet. Only use it on private, trusted networks (e.g. your home network or a VPN).
:::

## Troubleshooting

### The browser cannot connect

Narrow the problem down in three steps, each on the device named:

1. **On the PC running vacs**, open `http://localhost:9600`. If this fails, remote control is not running: check that it is enabled in the settings and that the logs contain a "Remote control server listening on" line.
2. **Still on the PC**, open `http://<your-local-ip>:9600` with the IP address you intend to use from the other device. If this fails while step 1 works, the address is wrong - see the notes on [finding your local IP address](#connecting-from-a-browser). Your own PC is never blocked by its firewall, so a "refused to connect" error here means the address does not belong to this PC.
3. **On the other device**, open the same URL. If steps 1 and 2 work but this one does not, something between the two devices blocks the connection. Almost always this is the firewall on the PC running vacs, see below.

Other things to check:

- Type `http://`, not `https://`. Some browsers silently upgrade to `https://`, which the remote control server does not speak. If in doubt, type the full URL including `http://`.
- Both devices must be on the same network. A tablet or phone on mobile data, or on a guest Wi-Fi, cannot reach your PC.
- Some routers offer "client isolation" or "AP isolation" that keeps Wi-Fi devices from talking to each other. Disable it, or connect the PC by cable.

#### Firewall on Windows

Windows Defender Firewall blocks incoming connections unless an app or port is allowed. vacs does not add a rule for you.

- Check which profile your network uses under **Settings > Network & internet > Wi-Fi** (or **Ethernet**), then click your network. If it says **Public network**, switch it to **Private network**. Public profiles block almost all incoming connections.
- To allow the port explicitly, open a terminal as administrator (right-click the Start button, **Terminal (Admin)**) and run:

  ```
  netsh advfirewall firewall add rule name="vacs remote control" dir=in action=allow protocol=TCP localport=9600
  ```

  Use the port you configured if you changed it from 9600.

- To do the same in the GUI: press <kbd>Win</kbd>+<kbd>R</kbd>, type `wf.msc`, then **Inbound Rules > New Rule > Port > TCP 9600 > Allow the connection** and tick at least **Private**.

To confirm it really is the firewall, you can temporarily turn it off under **Windows Security > Firewall & network protection**, retry from the other device, and turn it back on right away. If it works with the firewall off, add the rule above rather than leaving the firewall disabled.

#### Firewall on macOS and Linux

- **macOS:** the firewall is off by default. If you enabled it, go to **System Settings > Network > Firewall > Options** and allow incoming connections for vacs.
- **Linux:** allow the port in your firewall, for example `sudo ufw allow 9600/tcp` on Ubuntu or `sudo firewall-cmd --add-port=9600/tcp --permanent && sudo firewall-cmd --reload` on Fedora.

### The interface loads but nothing happens

- Check that the desktop application is fully started and logged in. The remote client mirrors the desktop state - if the desktop is on the login screen, the remote will be too.

### Actions show "Desktop only" errors

This is expected for certain operations that require direct access to the desktop environment. See [Limitations](#limitations) above.
