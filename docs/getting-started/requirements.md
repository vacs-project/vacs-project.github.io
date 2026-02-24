---
sidebar_position: 1
---

# Requirements

Before installing vacs, make sure your system meets the requirements for your platform. vacs is lightweight and doesn't need any special hardware - if you can run a radar client, you can almost certainly run vacs.

## VATSIM Account

Since vacs authenticates through [VATSIM Connect](https://vatsim.dev/services/connect/), you need to have an active VATSIM account - in good standing - to use our software. No separate registration is required.

## Operating system

### Windows

- Windows 10 or newer (64-bit)
- No additional software required - the installer will take care of everything for you

### Linux

- Ubuntu 22.04+, Fedora 40+, or a similar modern distribution is recommended (64-bit)
- Required system libraries are automatically installed by your package manager when you install vacs via the provided .deb or .rpm packages
- An ALSA-compatible audio backend is required. This is usually automatically satisfied if you're running PulseAudio or Pipewire, which most modern Linux desktops use by default. The suggested audio packages are also included as dependencies for our packages

:::note Wayland users
If you're running a Wayland-based desktop (common on recent GNOME and KDE setups), there are some known issues and limitations. See the [Wayland](/known-issues-limitations/wayland) section of the [Known Issues & Limitations](/known-issues-limitations) page for details.  
X11 support is currently limited.
:::

### macOS

- macOS 10.13 (High Sierra) or newer
- Both Intel and Apple Silicon Macs are supported
- On first launch, macOS will ask you to grant microphone access, input monitoring, and accessibility permissions. All three are required for vacs to fully function

:::warning macOS security notice
Current vacs releases are not code-signed with an Apple certificate, so macOS will flag the app as "corrupted" when you try to open it for the first time. See [Installation](/getting-started/installation#macos) for instructions on how to bypass this warning and open the app successfully.
:::

## Audio devices

vacs works with most microphones and headsets, but a few points are worth noting:

- **Input**: Almost any microphone should work. For best quality, use a device that supports 48 kHz sampling rate. Since vacs transmits voice in mono, stereo microphones will work fine, but spatial information won't carry over
- **Output**: Once again, almost any headphones, headset or speakers should work. 48 kHz stereo output is ideal, but vacs will resample to whatever your device supports, if necessary. Note that audio quality may be reduced if your output device only supports a low sampling rate
- **Echo cancellation**: vacs currently does not have built-in echo cancellation, so using a headset/headphones is highly recommended to prevent your microphone from picking up the other controller's voice during calls
