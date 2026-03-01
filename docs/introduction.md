---
slug: /
sidebar_position: 1
title: Introduction
---

# vacs User Manual

**vacs** ([/vɐks/](https://ipa-reader.com/?text=v%C9%90ks&voice=Brian)), the **V**ATSIM **A**TC **C**ommunication **S**ystem, is a free, open-source voice communication system built specifically for VATSIM air traffic controllers. It provides a fast and easy way to communicate and coordinate with your neighbouring controllers - no extra TeamSpeak servers, no Discord, no extra accounts. Simply install the voice communication client, authenticate with your VATSIM account, and you're ready to go.

## Why vacs?

Whilst VATSIM provides a good radio communication system for controllers and pilots, there is no standardised way for controllers to communicate with each other. Ground-to-ground comms have traditionally relied on workarounds: shared TeamSpeak servers, Discord voice channels or VCS-like functionality built into radar clients.  
vacs aims to solve this deficit by providing a purpose-built tool that works out of the box, is easy to use and usable by all controllers regardless of their remaining setup.

- **Low latency, high quality** - voice is transmitted using the Opus codec over peer-to-peer WebRTC connections, meaning calls are crisp and clear with minimal delay, directly between you and the other controller without the need for a central server.
- **No extra credentials** - you log in with your existing VATSIM account via [VATSIM Connect](https://vatsim.dev/services/connect/). vacs never sees your password, and you don't need to create yet another account in a new system.
- **Works everywhere** - vacs runs on Windows, Linux and macOS, and integrates with popular radio clients such as [TrackAudio](https://github.com/pierr3/TrackAudio/) or [Audio for VATSIM](https://audio.vatsim.net/).
- **UI inspired by real-life** - our interface takes inspiration from real-world ground-to-ground air traffic control coordination panels, so if you've seen the real thing, you'll feel right at home.

## What vacs is _not_

vacs is a **coordination tool**, not a replacement for the existing VATSIM radio system. It is also not intended to completely replace your current communication setup, but rather to complement it by providing a dedicated channel for coordination with neighbouring units.

## Getting started

If you're new to vacs, head over to the [Installation](/getting-started/installation) guide to get up and running in no time.

If you have already installed vacs and want to learn how to use it or need a refresher, check the [Interface overview](/interface/overview) or jump straight to [Making a call](/using-vacs/making-a-call).

## Getting help

If something isn't working as expected or you have any questions, the best places to go are:

- The [Troubleshooting](/troubleshooting) section of this documentation, which covers common issues and their solutions.
- The [vacs Discord server](https://discord.gg/yu2nyCKU3R) for real-time help from the community and developers.
- The [GitHub issue tracker](https://github.com/vacs-project/vacs/issues) for reporting bugs or requesting features.
