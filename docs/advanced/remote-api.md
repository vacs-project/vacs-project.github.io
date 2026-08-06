---
sidebar_position: 2
---

# Remote Control API

:::info
This page documents the technical details of the vacs remote control WebSocket API. If you're just looking to use vacs from a browser or different device, see [Remote Control](/using-vacs/remote-control) instead.
:::

vacs exposes a WebSocket-based remote control API for programmatic interaction by external clients. The built-in browser frontend communicates through the same API - there is no separate internal protocol.

This reference covers the wire format, available commands, subscribable events, and connection lifecycle. It is intended for developers building custom integrations, alternative frontends, or automation tooling against a running vacs instance.

:::note
While this API can be consumed by any external client, it is heavily geared towards the Tauri/Preact desktop frontend and mirrors the internal interactions used there. Some commands, events, and payload structures may reflect frontend-specific concerns that are not immediately relevant to third-party integrations.

As of now, there are no guarantees of backward compatibility for this API. If you are building a third-party integration, please reach out to the developers to discuss your use case and ensure it can be supported in future releases.
:::

## Connection

### Endpoint

```
ws://<host>:<port>/ws
```

The default port is **9600**. The remote control server must be explicitly enabled in the vacs configuration - see [Remote Control - Enabling remote control](/using-vacs/remote-control#enabling-remote-control).

### Transport

- Standard WebSocket ([RFC 6455](https://datatracker.ietf.org/doc/html/rfc6455))
- All application messages are [**JSON text frames**](https://datatracker.ietf.org/doc/html/rfc6455#section-5.6) - binary frames are not used
- WebSocket protocol-level [Ping/Pong frames](https://datatracker.ietf.org/doc/html/rfc6455#section-5.5.2) are supported - the server responds to any WebSocket Ping frame with a matching Pong frame
- No sub-protocols are required

### Authentication

The WebSocket endpoint does not perform any authentication or authorization. Access control is the responsibility of the network environment.

:::warning[Security]
Do not expose the remote server on untrusted networks. The connection is unencrypted (no TLS).  
If you require additional security or must expose the server on a public network, forward the port through a reverse proxy that provides TLS termination and authentication.
:::

---

## Message Format

Every message is a JSON object with a `type` field that identifies the message kind.

**Client → Server:**

| Type          | Purpose                               |
| ------------- | ------------------------------------- |
| `invoke`      | Execute a command on the desktop host |
| `subscribe`   | Register for a named event stream     |
| `unsubscribe` | Deregister from a named event stream  |
| `ping`        | Connection keepalive (expects `pong`) |

**Server → Client:**

| Type       | Purpose                                         |
| ---------- | ----------------------------------------------- |
| `response` | Result of a preceding `invoke`                  |
| `event`    | Forwarded event matching an active subscription |
| `pong`     | Keepalive acknowledgement                       |

:::info[Field naming convention]
The wire protocol uses **`snake_case`** for command names (`audio_get_volumes`, `signaling_start_call`, etc.). However, command return values and event payloads use **`camelCase`** for their fields (e.g. `callId`, `positionId`, `clientPageSettings`). This is intentional - the payload schema matches the format used by the default Preact frontend.
:::

---

## Client Messages

### invoke

Dispatches a command to the desktop application. The server responds with a `response` message carrying the same `id`.

```json
{
  "type": "invoke",
  "id": "1",
  "cmd": "audio_get_volumes",
  "args": {}
}
```

| Field  | Type   | Required | Description                                                                                                                                                            |
| ------ | ------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`   | string | yes      | Client-assigned opaque identifier, echoed in the corresponding `response`. Used to correlate requests and responses when multiple commands are in flight concurrently. |
| `cmd`  | string | yes      | Command name in `snake_case`. See [Commands](#commands).                                                                                                               |
| `args` | object | yes      | JSON object containing command arguments. Must be `{}` for commands that accept no arguments.                                                                          |

**Timeout:** Commands that do not resolve within **10 seconds** produce an error response with `"type": "urn:vacs:error:remote:timeout"`.

**Unknown commands:** An unrecognized `cmd` value fails to parse and produces an error response with `"type": "urn:vacs:error:remote:invalid-message"`, correlated by the `id` field so the pending request is always settled.

### subscribe

Registers a subscription for the specified event. Once subscribed, the server forwards all matching `event` messages to this connection.

```json
{
  "type": "subscribe",
  "event": "signaling:client-list"
}
```

| Field   | Type   | Required | Description                                        |
| ------- | ------ | -------- | -------------------------------------------------- |
| `event` | string | yes      | Event name to subscribe to. See [Events](#events). |

No `response` is sent. Unrecognized event names are dropped without any reply - the subscription simply never fires.

### unsubscribe

Removes an active event subscription.

```json
{
  "type": "unsubscribe",
  "event": "signaling:client-list"
}
```

### ping

Keepalive heartbeat. The server responds with a [`pong`](#pong) message.

```json
{
  "type": "ping"
}
```

---

## Server Messages

### response

Returned for every `invoke` message. Exactly one `response` is produced per `invoke`.

**Success:**

```json
{
  "type": "response",
  "id": "1",
  "ok": true,
  "data": { "input": 80, "output": 100 }
}
```

**Error:**

```json
{
  "type": "response",
  "id": "1",
  "ok": false,
  "error": {
    "type": "urn:vacs:error:remote:desktop-only",
    "title": "Desktop only",
    "detail": "This operation is only available on the desktop application",
    "isNonCritical": true
  }
}
```

| Field   | Type                                          | Description                                                                                                                                  |
| ------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`    | string                                        | Echoed from the originating `invoke` message.                                                                                                |
| `ok`    | boolean                                       | `true` if the command completed successfully, `false` otherwise.                                                                             |
| `data`  | any or absent                                 | Present when `ok` is `true`. Contains the command's return value. `null` for commands with no return value. Absent when `ok` is `false`.     |
| `error` | [`ProblemDetails`](#problemdetails) or absent | Present when `ok` is `false`. [RFC 7807](https://datatracker.ietf.org/doc/html/rfc7807)-compatible error object. Absent when `ok` is `true`. |

#### ProblemDetails

Error responses use [RFC 7807 Problem Details](https://datatracker.ietf.org/doc/html/rfc7807). The `type` URI uniquely identifies the error category.

| Field           | Type                                | Description                                                              |
| --------------- | ----------------------------------- | ------------------------------------------------------------------------ |
| `type`          | [`ProblemType`](#problemtype) (URI) | URI identifying the problem type.                                        |
| `title`         | `string`                            | Short human-readable summary.                                            |
| `detail`        | `string`                            | Longer human-readable explanation.                                       |
| `isNonCritical` | `boolean`                           | `true` for expected/recoverable errors, `false` for unexpected failures. |
| `timeoutMs`     | `number` &#124; absent              | Auto-dismiss timeout in milliseconds. Absent when not applicable.        |

### event

Emitted when the desktop application produces an event matching an active subscription.

```json
{
  "type": "event",
  "name": "signaling:client-list",
  "payload": [{ "id": "1234567", "displayName": "LOVV_CTR", "frequency": "133.800", "positionId": "LOVV_CTR" }]
}
```

| Field     | Type   | Description                                               |
| --------- | ------ | --------------------------------------------------------- |
| `name`    | string | Event identifier matching the subscribed event name.      |
| `payload` | any    | Event-specific payload. Schema depends on the event type. |

### pong

Keepalive acknowledgement in response to a `ping`. Contains no additional fields.

```json
{
  "type": "pong"
}
```

:::tip[WebSocket-level Ping/Pong]
In addition to the application-level `ping`/`pong` messages above, the server also responds to **WebSocket protocol-level Ping frames** ([RFC 6455 §5.5.2](https://datatracker.ietf.org/doc/html/rfc6455#section-5.5.2)) with a matching Pong frame. Most WebSocket client libraries handle this transparently. Either mechanism can be used for keepalive.
:::

---

## Commands

Commands are grouped by domain. All command names use `snake_case`.

Commands that accept arguments expect them as a JSON object in the `args` field of the `invoke` message. Commands that take no arguments require `args: {}`.

:::note
Some commands are marked as **desktop only**[^desktop-only] and are unavailable over the remote API.
:::

[^desktop-only]: **Desktop only** - these commands are unavailable over the remote API. Unconditionally rejected with a [`ProblemDetails`](#problemdetails) error response with `"type": "urn:vacs:error:remote:desktop-only"`.

### Application

| Command                                             | Args                                      | Returns                                     | Description                                                                      |
| --------------------------------------------------- | ----------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------- |
| `app_frontend_ready`                                | -                                         | `null`                                      | Signal that the frontend has loaded. No-op over remote.                          |
| `app_open_folder` [^desktop-only]                   | -                                         | -                                           | Open a native folder dialog.                                                     |
| `app_check_for_update`                              | -                                         | [`UpdateInfo`](#updateinfo)                 | Check for application updates.                                                   |
| `app_quit` [^desktop-only]                          | -                                         | -                                           | Quit the application.                                                            |
| `app_update` [^desktop-only]                        | -                                         | -                                           | Apply a pending update.                                                          |
| `app_platform_capabilities`                         | -                                         | [`Capabilities`](#capabilities)             | Get platform capability flags.                                                   |
| `app_set_always_on_top` [^desktop-only]             | -                                         | -                                           | Set always-on-top window state.                                                  |
| `app_set_fullscreen` [^desktop-only]                | -                                         | -                                           | Toggle fullscreen mode.                                                          |
| `app_reset_window_size` [^desktop-only]             | -                                         | -                                           | Reset window to default size.                                                    |
| `app_get_call_config`                               | -                                         | [`CallConfig`](#callconfig)                 | Get the current call configuration.                                              |
| `app_set_call_config`                               | `callConfig`: [`CallConfig`](#callconfig) | `null`                                      | Update call configuration.                                                       |
| `app_load_test_profile`                             | `path`: string?                           | `string` \| `null`                          | Load or reload a test profile. Over remote, `path` must be provided - `null` opens a file dialog (desktop only). |
| `app_unload_test_profile`                           | -                                         | `null`                                      | Unload the active test profile.                                                  |
| `app_get_client_page_settings`                      | -                                         | [`ClientPageSettings`](#clientpagesettings) | Get client page settings.                                                        |
| `app_set_selected_client_page_config`               | `configName`: string?                     | `null`                                      | Set the active client page config.                                               |
| `app_load_extra_client_page_config` [^desktop-only] | -                                         | -                                           | Load extra client page config from a file.                                       |
| `app_get_version`                                   | -                                         | `string`                                    | Get the running application version.                                             |
| `app_get_clock_mode`                                | -                                         | [`ClockMode`](#clockmode)                   | Get the clock display mode.                                                      |
| `app_set_clock_mode`                                | `clockMode`: [`ClockMode`](#clockmode)    | `null`                                      | Set the clock display mode.                                                      |
| `app_get_cpl_mode`                                  | -                                         | [`CplMode`](#cplmode)                       | Get the coupling mode.                                                           |
| `app_set_cpl_mode`                                  | `cplMode`: [`CplMode`](#cplmode)          | `null`                                      | Set the coupling mode.                                                           |

### Audio

| Command                         | Args                                                            | Returns                         | Description                                                                        |
| ------------------------------- | --------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| `audio_get_hosts`               | -                                                               | [`AudioHosts`](#audiohosts)     | List available audio backends.                                                     |
| `audio_set_host`                | `hostName`: string                                              | `null`                          | Switch audio backend.                                                              |
| `audio_get_devices`             | `deviceType`: [`DeviceType`](#devicetype)                       | [`AudioDevices`](#audiodevices) | List audio devices for the given type.                                             |
| `audio_set_device`              | `deviceType`: [`DeviceType`](#devicetype), `deviceName`: string | [`AudioDevices`](#audiodevices) | Set the active audio device. Returns updated device list.                          |
| `audio_get_volumes`             | -                                                               | [`AudioVolumes`](#audiovolumes) | Get current volume levels.                                                         |
| `audio_set_volume`              | `volumeType`: [`VolumeType`](#volumetype), `volume`: number     | `null`                          | Set a volume level.                                                                |
| `audio_play_ui_click`           | -                                                               | `null`                          | Play the UI click sound.                                                           |
| `audio_start_input_level_meter` | -                                                               | `null`                          | Start input level monitoring. Subscribe to `audio:input-level` to receive updates. |
| `audio_stop_input_level_meter`  | -                                                               | `null`                          | Stop input level monitoring.                                                       |
| `audio_set_radio_prio`          | `prio`: boolean                                                 | `null`                          | Set the radio priority flag.                                                       |

### Authentication

| Command               | Args | Returns | Description                                                                   |
| --------------------- | ---- | ------- | ----------------------------------------------------------------------------- |
| `auth_open_oauth_url` [^desktop-only] | -    | -       | Start the VATSIM OAuth flow. Opens the authorization URL on the desktop host. |
| `auth_check_session`  | -    | `null`  | Check the current session validity.                                           |
| `auth_logout`         | -    | `null`  | Log out the current user.                                                     |

### Keybinds

| Command                                                   | Args                                                             | Returns                                           | Description                                                                       |
| --------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------- |
| `keybinds_get_transmit_config`                            | -                                                                | [`TransmitConfig`](#transmitconfig)               | Get transmit configuration (mic mode, PTT bindings).                              |
| `keybinds_set_transmit_config`                            | `transmitConfig`: [`TransmitConfig`](#transmitconfig)            | `null`                                            | Update transmit configuration.                                                    |
| `keybinds_get_keybinds_config`                            | -                                                                | [`KeybindsConfig`](#keybindsconfig)               | Get keybind configuration.                                                        |
| `keybinds_set_binding`                                    | `input`: [`InputBinding`](#inputbinding)?, `keybind`: [`Keybind`](#keybind) | `null`                                  | Bind an input to an action. Pass `input: null` to clear the binding.              |
| `keybinds_get_external_binding`                           | `keybind`: [`Keybind`](#keybind)                                 | `string` \| `null`                                | Get the external (system-level) binding for a keybind. Only ever a `string` on Linux with Wayland, where keyboard shortcuts are system-managed; `null` everywhere else. |
| `keybinds_open_system_shortcuts_settings` [^desktop-only] | -                                                                | -                                                 | Open the OS shortcut settings.                                                    |
| `keybinds_is_portal_shortcut_bound`                       | `keybind`: [`Keybind`](#keybind)                                 | `boolean`                                         | Whether a system shortcut is currently bound for the keybind via the Linux global shortcuts portal. `false` outside a Wayland session; fails on non-Linux platforms. |
| `keybinds_capture_joystick_button`                        | `captureId`: string                                              | [`JoystickButton`](#joystickbutton) \| `null`     | Wait for the next joystick button press and return it. Returns `null` on timeout or cancellation. |
| `keybinds_cancel_joystick_capture`                        | `captureId`: string                                              | `null`                                            | Cancel a pending capture. A no-op if a newer capture superseded it.               |
| `keybinds_list_joystick_devices`                          | -                                                                | [`JoystickDeviceEntry[]`](#joystickdeviceentry)   | List connected joystick devices, plus ignored ones that are currently unplugged.  |
| `keybinds_set_ignored_joysticks`                          | `devices`: [`JoystickDevice[]`](#joystickdevice)                 | `null`                                            | Replace the set of devices excluded from capture. Persisted by device GUID.       |

:::warning
The joystick commands require the `joystick` [capability](#capabilities). On a host without it they fail with an application error rather than returning an empty result.

`keybinds_capture_joystick_button` waits up to **15 seconds** for a button press, which is longer than the **10 second** `invoke` timeout. If no button is pressed within 10 seconds, the capture is still running on the host when the timeout response arrives - cancel it explicitly with `keybinds_cancel_joystick_capture` using the same `captureId`.
:::

### Playback

Recording and replay of radio traffic. Requires the `playback` [capability](#capabilities); commands that reach the recorder return empty results when no recorder is running.

| Command                | Args                                                                                                                                        | Returns                       | Description                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------ |
| `playback_get_enabled` | -                                                                                                                                           | `boolean`                     | Whether playback recording is enabled.                                               |
| `playback_set_enabled` | `enabled`: boolean                                                                                                                          | `null`                        | Enable or disable playback recording. Persisted to the client config.                |
| `playback_list`        | -                                                                                                                                           | [`ClipMeta[]`](#clipmeta)     | List the recorded clips.                                                             |
| `playback_delete`      | `id`: number                                                                                                                                | `boolean`                     | Delete a clip. Returns whether a clip was removed.                                   |
| `playback_clear`       | -                                                                                                                                           | `null`                        | Delete all clips.                                                                    |
| `playback_start`       | `id`: number, `deviceType`: [`PlaybackDeviceType`](#playbackdevicetype), `initialProgress`: number?, `startPaused`: boolean?                 | `null`                        | Start playing a clip. `initialProgress` is a fraction from 0.0 to 1.0.               |
| `playback_pause`       | -                                                                                                                                           | `null`                        | Pause the playing clip.                                                              |
| `playback_continue`    | -                                                                                                                                           | `null`                        | Resume the paused clip.                                                              |
| `playback_stop`        | -                                                                                                                                           | `null`                        | Stop playback and release the audio source.                                          |
| `playback_seek`        | `millis`: number                                                                                                                            | `null`                        | Seek within the playing clip. Negative values rewind.                                |
| `playback_export`      | `id`: number                                                                                                                                | `string`                      | Copy a clip to the saved directory, exempting it from eviction. Returns the destination path and opens the folder on the desktop host. |

### Radio

Radio integration control. These commands were previously part of the `keybinds` domain (`keybinds_get_radio_config`, `keybinds_set_radio_config`, `keybinds_get_radio_state`, `keybinds_reconnect_radio`) and have moved to the `radio` prefix.

| Command                   | Args                                                                                  | Returns                             | Description                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------- |
| `radio_get_config`        | -                                                                                     | [`RadioConfig`](#radioconfig)       | Get radio integration configuration.                                            |
| `radio_set_config`        | `radioConfig`: [`RadioConfig`](#radioconfig)                                          | `null`                              | Update radio integration configuration. Restarts the integration and recorder.  |
| `radio_get_state`         | -                                                                                     | [`RadioState`](#radiostate)         | Get current radio state.                                                        |
| `radio_reconnect`         | -                                                                                     | `null`                              | Reconnect the radio integration.                                                |
| `radio_get_stations`      | -                                                                                     | [`RadioStation[]`](#radiostation)   | List the frequencies currently tuned in the radio backend.                      |
| `radio_add_station`       | `callsign`: string                                                                    | [`RadioStation`](#radiostation)     | Add a station by callsign.                                                      |
| `radio_set_station_state` | `frequency`: number, `update`: [`StationStateUpdate`](#stationstateupdate)            | [`RadioStation`](#radiostation)     | Apply a partial state update to a tuned station.                                |
| `radio_fast_couple`       | -                                                                                     | `null`                              | Trigger a fast cross-couple across the tuned stations.                          |

:::note
All `radio_*` commands except `radio_get_config` and `radio_get_state` require an active radio integration. Without one, they fail with an application error.
:::

### Remote

| Command                       | Args                                              | Returns                                                 | Description                                                                          |
| ----------------------------- | ------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `remote_broadcast_store_sync` | `store`: string, `state`: any, `sourceId`: string | `null`                                                  | Broadcast a state sync event to all connected remote clients. See [`store:sync`](#store-sync-events). |
| `remote_request_store_sync`   | -                                                 | `null`                                                  | Ask every connected instance to re-broadcast its synced state.                       |
| `remote_get_session_state`    | -                                                 | [`SessionStateSnapshot`](#session-state-snapshot)       | Get a full snapshot of the current session.                                          |
| `remote_get_config`           | -                                                 | [`RemoteConfigWithStatus`](#remoteconfigwithstatus)     | Get the remote server configuration and its current status.                          |
| `remote_is_enabled`           | -                                                 | `boolean`                                               | Whether the remote server is enabled in the configuration.                           |

### Signaling

| Command                           | Args                                                | Returns    | Description                                                             |
| --------------------------------- | --------------------------------------------------- | ---------- | ----------------------------------------------------------------------- |
| `signaling_connect`               | `positionId`: string                                | `null`     | Connect to the signaling server.                                        |
| `signaling_disconnect`            | -                                                   | `null`     | Disconnect from the signaling server.                                   |
| `signaling_terminate`             | -                                                   | `null`     | Terminate the signaling session.                                        |
| `signaling_start_call`            | `target`: string, `source`: string, `prio`: boolean | `string`   | Start a call. Returns the call ID (UUID).                               |
| `signaling_accept_call`           | `callId`: string                                    | `null`     | Accept an incoming call.                                                |
| `signaling_end_call`              | `callId`: string                                    | `null`     | End an active or pending call.                                          |
| `signaling_get_ignored_clients`   | -                                                   | `string[]` | Get the ignore list. Returns an array of CIDs.                          |
| `signaling_add_ignored_client`    | `clientId`: string                                  | `boolean`  | Add a CID to the ignore list. Returns whether the CID was newly added.  |
| `signaling_remove_ignored_client` | `clientId`: string                                  | `boolean`  | Remove a CID from the ignore list. Returns whether the CID was present. |

---

## Session State Snapshot

The `remote_get_session_state` command returns a complete snapshot of the current application state. This is the recommended mechanism for initializing a newly connected client. See [`SessionStateSnapshot`](#sessionstatesnapshot) in the Type Reference for the full schema and a JSON example.

---

## Events

Subscribe to events to receive real-time updates. Event names use a `domain:name` format with kebab-case.

### Audio Events

| Event                          | Payload   | Description                                                                                              |
| ------------------------------ | --------- | -------------------------------------------------------------------------------------------------------- |
| `audio:implicit-radio-prio`    | `boolean` | Radio priority was implicitly changed (e.g. by an incoming priority call).                               |
| `audio:input-level`            | `number`  | Input audio level sample (0.0 to 1.0). Emitted at a regular interval while the input level meter is active. |
| `audio:radio-prio`             | `boolean` | Radio priority state changed.                                                                            |
| `audio:stop-input-level-meter` | `null`    | The input level meter was stopped.                                                                       |

### Authentication Events

| Event                  | Payload  | Description                                                     |
| ---------------------- | -------- | --------------------------------------------------------------- |
| `auth:authenticated`   | `string` | The user successfully authenticated. Payload is the VATSIM CID. |
| `auth:error`           | `null`   | An authentication error occurred.                               |
| `auth:unauthenticated` | `null`   | The user was logged out or the session expired.                 |

### Playback Events

| Event                      | Payload  | Description                                                                                                     |
| -------------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `playback:clips-modified`  | `null`   | The clip list changed (a recording finished, or clips were deleted). Re-fetch with `playback_list`.              |
| `playback:progress`        | `number` | Playback position of the current clip as a fraction from 0.0 to 1.0. Emitted continuously while a clip plays.    |

### Radio Events

| Event                    | Payload                             | Description                                                              |
| ------------------------ | ----------------------------------- | ------------------------------------------------------------------------ |
| `radio:state`            | [`RadioState`](#radiostate)         | Radio integration state changed.                                         |
| `radio:station-added`    | [`RadioStation`](#radiostation)     | A frequency was tuned in the radio backend.                              |
| `radio:station-updated`  | [`RadioStation`](#radiostation)     | A tuned station's state changed (RX/TX/cross-couple/mute).               |
| `radio:station-removed`  | `number`                            | A frequency was untuned. Payload is the frequency in Hz.                 |
| `radio:stations-synced`  | [`RadioStation[]`](#radiostation)   | The full station list was replaced (replaces previous list).             |

### Signaling Events

| Event                                 | Payload                                           | Description                                                                          |
| ------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `signaling:accept-incoming-call`      | `string`                                          | An incoming call was accepted. Payload is the CallId.                                |
| `signaling:add-incoming-to-call-list` | [`IncomingCallListEntry`](#incomingcalllistentry) | A new incoming call was added to the pending list.                                   |
| `signaling:ambiguous-position`        | `string[]`                                        | The selected position matched multiple entries. Payload is an array of position IDs. |
| `signaling:call-end`                  | `string`                                          | A call ended. Payload is the CallId.                                                 |
| `signaling:call-invite`               | [`CallInvite`](#callinvite)                       | A new call invitation was received.                                                  |
| `signaling:call-reject`               | `string`                                          | A call was rejected by the remote party. Payload is the CallId.                      |
| `signaling:client-connected`          | [`ClientInfo`](#clientinfo)                       | A client connected to the signaling server.                                          |
| `signaling:client-disconnected`       | `string`                                          | A client disconnected from the signaling server. Payload is the CID.                 |
| `signaling:client-list`               | [`ClientInfo[]`](#clientinfo)                     | The full client list was updated (replaces previous list).                           |
| `signaling:client-not-found`          | `string`                                          | A client lookup failed. Payload is the CID.                                          |
| `signaling:client-page-config`        | [`ClientPageSettings`](#clientpagesettings)       | The client page configuration was updated.                                           |
| `signaling:connected`                 | [`SessionInfo`](#sessioninfo)                     | Successfully connected to the signaling server.                                      |
| `signaling:disconnected`              | `null`                                            | Disconnected from the signaling server.                                              |
| `signaling:force-call-end`            | `string`                                          | A call was forcefully terminated (e.g. by the server). Payload is the CallId.        |
| `signaling:outgoing-call-accepted`    | [`CallAccept`](#callaccept)                       | An outgoing call was accepted by the remote party.                                   |
| `signaling:reconnecting`              | `null`                                            | The signaling connection is being re-established.                                    |
| `signaling:station-changes`           | [`StationChange[]`](#stationchange)               | One or more stations changed.                                                        |
| `signaling:station-list`              | [`StationInfo[]`](#stationinfo)                   | The full station list was updated (replaces previous list).                          |
| `signaling:test-profile`              | `object`                                          | A test profile was loaded or unloaded.                                               |

### WebRTC Events

| Event                      | Payload                   | Description                                                          |
| -------------------------- | ------------------------- | -------------------------------------------------------------------- |
| `webrtc:call-connected`    | `string`                  | A voice call was established (media flowing). Payload is the CallId. |
| `webrtc:call-disconnected` | `string`                  | A voice call was disconnected. Payload is the CallId.                |
| `webrtc:call-error`        | [`CallError`](#callerror) | A voice call encountered an error.                                   |

### Store Sync Events

The desktop frontend and every connected remote client mirror selected pieces of UI state to each other. These two events carry that mechanism; a third-party integration can ignore them, or use them to stay in step with the desktop UI.

| Event               | Payload                             | Description                                                    |
| ------------------- | ----------------------------------- | -------------------------------------------------------------- |
| `store:sync`        | [`StoreSyncPayload`](#storesyncpayload) | A store slice was updated by one of the connected instances. |
| `store:sync:request` | `null`                             | Every instance should re-broadcast its current synced state.   |

### Other Events

| Event             | Payload                                 | Description                                    |
| ----------------- | --------------------------------------- | ---------------------------------------------- |
| `error`           | [`FrontendError`](#frontenderror)       | A general application error.                   |
| `remote:status`   | [`RemoteStatus`](#remotestatus)         | The remote server's listen state or connected client count changed. |
| `update:progress` | `number`                                | Application update download progress (0 to 100). |

---

## Type Reference

This section documents all complex types used in command return values and event payloads. Field names are serialized in `camelCase` unless noted otherwise.

### Identifiers

Several identifier types appear throughout the API. All are serialized as plain JSON strings.

| Type         | Format         | Description                                                                                                                                          |
| ------------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ClientId`   | numeric string | VATSIM CID (e.g. `"1234567"`).                                                                                                                       |
| `PositionId` | string         | Position callsign (e.g. `"LOVV_CTR"`).                                                                                                               |
| `StationId`  | string         | Station identifier (e.g. `"LOVV_CTR"`).                                                                                                              |
| `CallId`     | UUID string    | Unique call identifier ([UUIDv7](https://datatracker.ietf.org/doc/html/rfc9562#name-uuid-version-7), e.g. `"019cc8de-50f0-7624-a89c-61ba0b5cb784"`). |

### ProblemType

Well-known problem type URIs used in [`ProblemDetails`](#problemdetails) error responses.

| URI                                      | Title            | Description                                               |
| ---------------------------------------- | ---------------- | --------------------------------------------------------- |
| `urn:vacs:error:remote:desktop-only`     | Desktop only     | The command is only available on the desktop application. |
| `urn:vacs:error:remote:invalid-argument` | Invalid argument | One or more command arguments were invalid or missing.    |
| `urn:vacs:error:remote:invalid-message`  | Invalid message  | The message could not be parsed, or named an unknown command. |
| `urn:vacs:error:remote:timeout`          | Timeout          | The command did not complete within the time limit.       |
| `urn:vacs:error:remote:application`      | _(varies)_       | An application-level error originating from the backend.  |

### SessionStateSnapshot

Returned by [`remote_get_session_state`](#remote). Provides a complete snapshot of the current application state for bootstrapping a newly connected client.

```json
{
  "connectionState": "disconnected",
  "sessionInfo": null,
  "defaultCallSources": [],
  "stations": [],
  "clients": [],
  "clientId": null,
  "callConfig": {
    "highlightIncomingCallTarget": true,
    "enablePriorityCalls": true,
    "enableCallStartSound": true,
    "enableCallEndSound": true,
    "useDefaultCallSources": true
  },
  "clientPageSettings": {
    "selected": null,
    "configs": {}
  },
  "capabilities": {
    "alwaysOnTop": true,
    "keybindListener": true,
    "keybindEmitter": false,
    "joystick": true,
    "playback": true,
    "platform": "LinuxWayland"
  },
  "incomingCalls": [],
  "outgoingCall": null
}
```

| Field                | Type                                        | Description                                                  |
| -------------------- | ------------------------------------------- | ------------------------------------------------------------ |
| `connectionState`    | [`ConnectionState`](#connectionstate)       | Signaling connection state.                                  |
| `sessionInfo`        | [`SessionInfo`](#sessioninfo) &#124; `null` | Current signaling session metadata.                          |
| `defaultCallSources` | `string[]`                                  | Station IDs configured as default call sources for the position. |
| `stations`           | [`StationInfo[]`](#stationinfo)             | Available stations in the current session.                   |
| `clients`            | [`ClientInfo[]`](#clientinfo)               | Other clients visible in the current session.                |
| `clientId`           | `string` &#124; `null`                      | The authenticated user's VATSIM CID.                         |
| `callConfig`         | [`CallConfig`](#callconfig)                 | Active call configuration.                                   |
| `clientPageSettings` | [`ClientPageSettings`](#clientpagesettings) | Active client page layout/settings.                          |
| `capabilities`       | [`Capabilities`](#capabilities)             | Platform capabilities of the desktop host.                   |
| `incomingCalls`      | [`CallInvite[]`](#callinvite)               | Pending incoming call invitations.                           |
| `outgoingCall`       | [`CallInvite`](#callinvite) &#124; `null`   | The pending outgoing call, if any.                           |

### Capabilities

Platform capability flags returned by `app_platform_capabilities` and included in the session state snapshot.

```json
{
  "alwaysOnTop": true,
  "keybindListener": true,
  "keybindEmitter": false,
  "joystick": true,
  "playback": true,
  "platform": "LinuxWayland"
}
```

| Field             | Type                    | Description                                                                        |
| ----------------- | ----------------------- | ---------------------------------------------------------------------------------- |
| `alwaysOnTop`     | `boolean`               | Whether the platform supports always-on-top window mode.                           |
| `keybindListener` | `boolean`               | Whether the platform supports global keybind listening.                            |
| `keybindEmitter`  | `boolean`               | Whether the platform supports emitting key events.                                 |
| `joystick`        | `boolean`               | Whether joystick and gamepad button bindings are supported.                        |
| `playback`        | `boolean`               | Whether recording and replay of radio traffic is supported.                        |
| `platform`        | [`Platform`](#platform) | The host platform identifier.                                                      |

#### Platform

```
"Unknown" | "Windows" | "MacOs" | "LinuxX11" | "LinuxWayland" | "LinuxUnknown"
```

### UpdateInfo

Returned by `app_check_for_update`.

```json
{
  "currentVersion": "2.0.0",
  "newVersion": "2.1.0",
  "required": false
}
```

| Field            | Type                   | Description                                                   |
| ---------------- | ---------------------- | ------------------------------------------------------------- |
| `currentVersion` | `string`               | Currently installed application version.                      |
| `newVersion`     | `string` &#124; absent | Available update version. Absent when no update is available. |
| `required`       | `boolean`              | Whether the update is mandatory.                              |

### CallConfig

Returned by `app_get_call_config`. Accepted by `app_set_call_config`.

```json
{
  "highlightIncomingCallTarget": true,
  "enablePriorityCalls": true,
  "enableCallStartSound": true,
  "enableCallEndSound": true,
  "useDefaultCallSources": true
}
```

| Field                         | Type      | Description                                                                       |
| ----------------------------- | --------- | --------------------------------------------------------------------------------- |
| `highlightIncomingCallTarget` | `boolean` | Highlight the caller in the client list on incoming call.                         |
| `enablePriorityCalls`         | `boolean` | Allow sending and receiving priority calls.                                       |
| `enableCallStartSound`        | `boolean` | Play a sound when a call connects.                                                |
| `enableCallEndSound`          | `boolean` | Play a sound when a call ends.                                                    |
| `useDefaultCallSources`       | `boolean` | Place calls from the position's default source station instead of asking each time. |

### ClientPageSettings

Returned by `app_get_client_page_settings` and the `signaling:client-page-config` event.

```json
{
  "selected": "default",
  "configs": {
    "default": {
      "include": [],
      "exclude": [],
      "priority": [],
      "frequencies": "ShowAll",
      "grouping": "FirAndIcao"
    }
  }
}
```

| Field      | Type                   | Description                                                          |
| ---------- | ---------------------- | -------------------------------------------------------------------- |
| `selected` | `string` &#124; `null` | Name of the active client page configuration.                        |
| `configs`  | `object`               | Map of configuration name → [`ClientPageConfig`](#clientpageconfig). |

#### ClientPageConfig

| Field         | Type                                            | Description                                            |
| ------------- | ----------------------------------------------- | ------------------------------------------------------ |
| `include`     | `string[]`                                      | Position ID patterns to include in the client list.    |
| `exclude`     | `string[]`                                      | Position ID patterns to exclude from the client list.  |
| `priority`    | `string[]`                                      | Position ID patterns to prioritise in the client list. |
| `frequencies` | [`FrequencyDisplayMode`](#frequencydisplaymode) | How to display frequencies.                            |
| `grouping`    | [`ClientGroupMode`](#clientgroupmode)           | How to group clients.                                  |

#### FrequencyDisplayMode

```
"HideAll" | "ShowAll"
```

#### ClientGroupMode

```
"None" | "Fir" | "Icao" | "FirAndIcao"
```

### AudioHosts

Returned by `audio_get_hosts`.

```json
{
  "selected": "ALSA",
  "all": ["ALSA", "JACK"]
}
```

| Field      | Type       | Description                               |
| ---------- | ---------- | ----------------------------------------- |
| `selected` | `string`   | Currently active audio backend.           |
| `all`      | `string[]` | All available audio backends on the host. |

### AudioDevices

Returned by `audio_get_devices` and `audio_set_device`.

```json
{
  "preferred": "Headset (USB Audio)",
  "picked": "Headset (USB Audio)",
  "default": "Built-in Audio",
  "all": ["Built-in Audio", "Headset (USB Audio)"]
}
```

| Field       | Type       | Description                                                          |
| ----------- | ---------- | -------------------------------------------------------------------- |
| `preferred` | `string`   | User-preferred device name (from config).                            |
| `picked`    | `string`   | Actually selected device (may differ from preferred if unavailable). |
| `default`   | `string`   | System default device.                                               |
| `all`       | `string[]` | All available devices of the requested type.                         |

### AudioVolumes

Returned by `audio_get_volumes`.

```json
{
  "input": 80,
  "output": 100,
  "click": 50,
  "chime": 70
}
```

| Field    | Type     | Description                |
| -------- | -------- | -------------------------- |
| `input`  | `number` | Microphone input volume.   |
| `output` | `number` | Audio output volume.       |
| `click`  | `number` | UI click sound volume.     |
| `chime`  | `number` | Notification chime volume. |

#### VolumeType

Used as the `volumeType` argument for `audio_set_volume`:

```
"input" | "output" | "click" | "chime"
```

#### DeviceType

Used as the `deviceType` argument for `audio_get_devices` and `audio_set_device`:

```
"Input" | "Output"
```

### TransmitConfig

Returned by `keybinds_get_transmit_config`. Accepted by `keybinds_set_transmit_config`.

```json
{
  "callMicMode": "PushToTalk",
  "pushToTalk": "Space",
  "pushToMute": null,
  "radioPushToTalk": {"device": "03000000...", "button": 4, "name": "Saitek Pro Flight Yoke"}
}
```

| Field             | Type                                        | Description                                       |
| ----------------- | ------------------------------------------- | ------------------------------------------------- |
| `callMicMode`     | [`CallMicMode`](#callmicmode)               | How the microphone is keyed during a call.        |
| `pushToTalk`      | [`InputBinding`](#inputbinding) &#124; `null` | Binding for push-to-talk.                       |
| `pushToMute`      | [`InputBinding`](#inputbinding) &#124; `null` | Binding for push-to-mute.                       |
| `radioPushToTalk` | [`InputBinding`](#inputbinding) &#124; `null` | Binding for radio push-to-talk.                 |

#### CallMicMode

```
"VoiceActivation" | "PushToTalk" | "PushToMute"
```

### InputBinding

A physical input bound to an action. Either a **keyboard key code string** (a [`KeyboardEvent.code`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code) value, for example `"KeyA"` or `"Space"`) or a [`JoystickButton`](#joystickbutton) object.

```json
"KeyA"
```

```json
{"device": "03000000adde0000efbe000000000000", "button": 4, "name": "Saitek Pro Flight Yoke"}
```

Distinguish the two by JSON type: a string is a keyboard key, an object is a joystick button.

#### JoystickButton

| Field    | Type                   | Description                                                                                       |
| -------- | ---------------------- | ------------------------------------------------------------------------------------------------- |
| `device` | `string`               | SDL joystick GUID as a hex string. Stable across reconnects and USB ports.                        |
| `button` | `number`               | Raw button index in SDL joystick button numbering.                                                |
| `name`   | `string` &#124; absent | Last-seen device name. Display only, and ignored when comparing bindings.                         |

:::note
Two physically identical devices share a GUID, so a binding made on one matches the other. Distinct products (yoke, throttle, pedals) always have distinct GUIDs.
:::

#### JoystickDevice

Accepted by `keybinds_set_ignored_joysticks`.

| Field    | Type                   | Description                                                     |
| -------- | ---------------------- | --------------------------------------------------------------- |
| `device` | `string`               | SDL joystick GUID as a hex string.                              |
| `name`   | `string` &#124; absent | Last-seen device name, kept for display while unplugged.        |

#### JoystickDeviceEntry

Returned by `keybinds_list_joystick_devices`. A [`JoystickDevice`](#joystickdevice) with its presence and ignore state.

```json
{
  "device": "03000000adde0000efbe000000000000",
  "name": "Saitek Pro Flight Yoke",
  "connected": true,
  "ignored": false
}
```

| Field       | Type      | Description                                                                                   |
| ----------- | --------- | --------------------------------------------------------------------------------------------- |
| `connected` | `boolean` | Whether the device is currently plugged in.                                                   |
| `ignored`   | `boolean` | Whether presses from this device are excluded from capture. Existing bindings keep working.   |

### KeybindsConfig

Returned by `keybinds_get_keybinds_config`.

```json
{
  "acceptCall": "KeyA",
  "endCall": "KeyE",
  "toggleRadioPrio": null
}
```

| Field             | Type                                          | Description                             |
| ----------------- | --------------------------------------------- | --------------------------------------- |
| `acceptCall`      | [`InputBinding`](#inputbinding) &#124; `null` | Binding for accepting an incoming call. |
| `endCall`         | [`InputBinding`](#inputbinding) &#124; `null` | Binding for ending the active call.     |
| `toggleRadioPrio` | [`InputBinding`](#inputbinding) &#124; `null` | Binding for toggling radio priority.    |

#### Keybind

The action a binding applies to. Used as the `keybind` argument for `keybinds_set_binding`, `keybinds_get_external_binding` and `keybinds_is_portal_shortcut_bound`:

```
"PushToTalk" | "PushToMute" | "RadioPushToTalk" | "AcceptCall" | "EndCall" | "ToggleRadioPrio"
```

### RadioConfig

Returned by `radio_get_config`. Accepted by `radio_set_config`.

```json
{
  "integration": "AudioForVatsim",
  "audioForVatsim": {
    "emit": "F1"
  },
  "trackAudio": {
    "endpoint": "ws://localhost:49080"
  }
}
```

| Field            | Type                                                    | Description                                                                                     |
| ---------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `integration`    | [`RadioIntegration`](#radiointegration) &#124; `null`   | Active radio integration backend. `null` disables the integration.                              |
| `audioForVatsim` | `object` &#124; `null`                                  | AudioForVATSIM-specific configuration. Contains `emit` (key code, `string` &#124; `null`).      |
| `trackAudio`     | `object` &#124; `null`                                  | TrackAudio-specific configuration. Contains `endpoint` (WebSocket URL, `string` &#124; `null`). |

#### RadioIntegration

```
"AudioForVatsim" | "TrackAudio"
```

### RadioState

Returned by `radio_get_state` and emitted with the `radio:state` event. Serialized as an object with the variant in `state` and, for `RxActive`, the receiving frequencies in `data`.

```json
{"state": "VoiceConnected"}
```

```json
{"state": "RxActive", "data": [133800000, 121500000]}
```

| Field   | Type                   | Description                                                                        |
| ------- | ---------------------- | ---------------------------------------------------------------------------------- |
| `state` | `string`               | The state variant, see the table below.                                            |
| `data`  | `number[]` &#124; absent | Frequencies in Hz currently being received. Present only for `RxActive`.         |

| Value            | Description                                                            |
| ---------------- | ---------------------------------------------------------------------- |
| `NotConfigured`  | No radio integration is configured.                                    |
| `Disconnected`   | Configured but not connected to the radio backend.                     |
| `Connected`      | Connected to the radio backend, which has no VATSIM voice session.     |
| `VoiceConnected` | The backend is connected to the VATSIM voice server.                   |
| `RxIdle`         | Monitoring at least one frequency, nothing being received.             |
| `RxActive`       | Actively receiving a transmission.                                     |
| `TxActive`       | Actively transmitting. Takes priority over simultaneous reception.     |
| `Error`          | The radio integration encountered a fatal error.                       |

### RadioStation

A frequency tuned in the radio backend. Returned by `radio_get_stations`, `radio_add_station` and `radio_set_station_state`, and emitted with the `radio:station-*` events.

```json
{
  "callsign": "LOVV_CTR",
  "frequency": 133800000,
  "rx": true,
  "tx": true,
  "xc": false,
  "xca": false,
  "headset": true,
  "output_muted": false,
  "is_available": true
}
```

| Field          | Type                   | Description                                                                        |
| -------------- | ---------------------- | ---------------------------------------------------------------------------------- |
| `callsign`     | `string` &#124; absent | Station callsign, when the backend reports one.                                    |
| `frequency`    | `number`               | Frequency in Hz.                                                                   |
| `rx`           | `boolean`              | Receive enabled.                                                                   |
| `tx`           | `boolean`              | Transmit enabled.                                                                  |
| `xc`           | `boolean`              | Cross-coupling computed by the backend. Read-only.                                 |
| `xca`          | `boolean`              | Cross-couple across. The user-settable cross-coupling mode.                        |
| `headset`      | `boolean`              | Routed to the headset rather than the speaker.                                     |
| `output_muted` | `boolean`              | Output muted for this station.                                                     |
| `is_available` | `boolean`              | Whether the station is currently available in the backend.                         |

:::note
`RadioStation` and [`StationStateUpdate`](#stationstateupdate) use `snake_case` for `output_muted` and `is_available`, unlike the rest of the API. These fields come straight from the radio backend's own schema.
:::

#### StationStateUpdate

Accepted as the `update` argument of `radio_set_station_state`. Only the fields present are changed. `xc` is intentionally absent - it is computed by the backend and cannot be set.

| Field          | Type      | Description                                    |
| -------------- | --------- | ---------------------------------------------- |
| `rx`           | `boolean` | Enable or disable receive.                     |
| `tx`           | `boolean` | Enable or disable transmit.                    |
| `xca`          | `boolean` | Enable or disable cross-couple across.         |
| `headset`      | `boolean` | Route to the headset instead of the speaker.   |
| `output_muted` | `boolean` | Mute or unmute this station's output.          |

### ClipMeta

A recorded clip, returned by `playback_list`.

```json
{
  "id": 17,
  "path": "/home/user/.local/share/network.vacs.client/playback/17.wav",
  "callsigns": ["LOVV_CTR"],
  "frequency": 133800000,
  "startedAt": {"secs_since_epoch": 1753699200, "nanos_since_epoch": 0},
  "endedAt": {"secs_since_epoch": 1753699214, "nanos_since_epoch": 500000000},
  "durationMs": 14500
}
```

| Field        | Type                   | Description                                                                       |
| ------------ | ---------------------- | --------------------------------------------------------------------------------- |
| `id`         | `number`               | Clip identifier, used by the other `playback_*` commands.                         |
| `path`       | `string`               | Absolute path of the WAV file on the desktop host.                                |
| `callsigns`  | `string[]`             | Callsigns heard in the clip.                                                      |
| `frequency`  | `number` &#124; `null` | Frequency in Hz, when the clip came from a single frequency tap.                  |
| `startedAt`  | `object`               | Recording start, as `{"secs_since_epoch": <number>, "nanos_since_epoch": <number>}`. |
| `endedAt`    | `object`               | Recording end, same shape as `startedAt`.                                         |
| `durationMs` | `number`               | Clip length in milliseconds.                                                      |

#### PlaybackDeviceType

Used as the `deviceType` argument for `playback_start`:

```
"Output" | "Speaker"
```

### ClockMode

Returned by `app_get_clock_mode`. Accepted by `app_set_clock_mode`.

```
"Realtime" | "Relaxed" | "Day"
```

### CplMode

Returned by `app_get_cpl_mode`. Accepted by `app_set_cpl_mode`.

```
"Original" | "Fast"
```

### RemoteConfigWithStatus

Returned by `remote_get_config`.

```json
{
  "config": {
    "enabled": true,
    "listenAddr": "0.0.0.0:9600",
    "serveFrontend": true
  },
  "status": {
    "listening": true,
    "connectedClients": 1
  }
}
```

| Field    | Type                            | Description                                        |
| -------- | ------------------------------- | -------------------------------------------------- |
| `config` | `object`                        | The configured remote server settings.             |
| `status` | [`RemoteStatus`](#remotestatus) | The remote server's current runtime status.        |

#### RemoteStatus

Also emitted with the `remote:status` event.

| Field              | Type      | Description                                       |
| ------------------ | --------- | ------------------------------------------------- |
| `listening`        | `boolean` | Whether the remote server is accepting connections. |
| `connectedClients` | `number`  | Number of currently connected remote clients.     |

### StoreSyncPayload

Emitted with the `store:sync` event, and the argument shape of `remote_broadcast_store_sync`.

```json
{
  "store": "settings",
  "state": {"clockMode": "Realtime", "cplMode": "Original"},
  "sourceId": "6f1c9a1e-6f3a-4a26-a5c7-1f0b8f9a2c31"
}
```

| Field      | Type     | Description                                                                                      |
| ---------- | -------- | ------------------------------------------------------------------------------------------------ |
| `store`    | `string` | Which store slice changed: `stations`, `call`, `callList`, `settings`, `radio` or `playback`.     |
| `state`    | `any`    | The slice's new value. Shape depends on `store`.                                                 |
| `sourceId` | `string` | Opaque instance ID of the broadcaster. Ignore events carrying your own ID to avoid echo loops.   |

:::warning
The `state` shapes mirror the desktop frontend's internal stores and change without notice, even between patch releases. Treat them as opaque unless you are building a full replacement frontend.
:::

### ConnectionState

Used in the session state snapshot to indicate signaling connection state.

```
"disconnected" | "connecting" | "connected" | "test"
```

### ClientInfo

Represents a connected client visible in the session.

```json
{
  "id": "1234567",
  "displayName": "LOVV_CTR",
  "frequency": "133.800",
  "positionId": "LOVV_CTR"
}
```

| Field         | Type                   | Description                                            |
| ------------- | ---------------------- | ------------------------------------------------------ |
| `id`          | `string`               | VATSIM CID.                                            |
| `displayName` | `string`               | Display name (typically the callsign).                 |
| `frequency`   | `string`               | Active frequency.                                      |
| `positionId`  | `string` &#124; absent | Position ID, if available. Absent when not applicable. |

### SessionInfo

Emitted with the `signaling:connected` event and included in the session state snapshot.

```json
{
  "client": {
    "id": "1234567",
    "displayName": "LOVV_CTR",
    "frequency": "133.800",
    "positionId": "LOVV_CTR"
  },
  "profile": {
    "type": "Unchanged"
  }
}
```

| Field     | Type                        | Description                                                                                                                               |
| --------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `client`  | [`ClientInfo`](#clientinfo) | The authenticated user's client entry.                                                                                                    |
| `profile` | `object`                    | Profile state. `{ "type": "Unchanged" }` when the profile was not modified, or `{ "type": "Changed", "activeProfile": ... }` when it was. |

### StationInfo

Represents a station in the current session.

```json
{
  "id": "LOVV_CTR",
  "own": true
}
```

| Field | Type      | Description                                                        |
| ----- | --------- | ------------------------------------------------------------------ |
| `id`  | `string`  | Station identifier.                                                |
| `own` | `boolean` | Whether this station belongs to the authenticated user's position. |

### StationChange

Contained in the `signaling:station-changes` event payload. Each entry is an externally-tagged enum with one of three variants:

**Online:**

```json
{ "Online": { "stationId": "LOVV_CTR", "positionId": "LOVV_CTR" } }
```

**Handoff:**

```json
{ "Handoff": { "stationId": "LOVV_CTR", "fromPositionId": "LOVV_N1", "toPositionId": "LOVV_N2" } }
```

**Offline:**

```json
{ "Offline": { "stationId": "LOVV_CTR" } }
```

### CallInvite

Represents an incoming or outgoing call invitation.

```json
{
  "callId": "01916f6a-7b3c-7d4e-8f1a-2b3c4d5e6f70",
  "source": {
    "clientId": "7654321",
    "positionId": "LOWW_APP",
    "stationId": "LOWW_APP"
  },
  "target": { "Client": "1234567" },
  "prio": false
}
```

| Field    | Type                        | Description                         |
| -------- | --------------------------- | ----------------------------------- |
| `callId` | `string`                    | Unique call identifier (UUID).      |
| `source` | [`CallSource`](#callsource) | The originator of the call.         |
| `target` | [`CallTarget`](#calltarget) | The intended recipient of the call. |
| `prio`   | `boolean`                   | Whether this is a priority call.    |

### CallSource

```json
{
  "clientId": "7654321",
  "positionId": "LOWW_APP",
  "stationId": "LOWW_APP"
}
```

| Field        | Type                   | Description                                     |
| ------------ | ---------------------- | ----------------------------------------------- |
| `clientId`   | `string`               | VATSIM CID of the caller.                       |
| `positionId` | `string` &#124; absent | Position ID of the caller. Absent when unknown. |
| `stationId`  | `string` &#124; absent | Station ID of the caller. Absent when unknown.  |

### CallTarget

An externally-tagged enum identifying the call recipient. Exactly one variant is present:

```json
{ "Client": "1234567" }
```

```json
{ "Position": "LOWW_APP" }
```

```json
{ "Station": "LOWW_APP" }
```

### CallAccept

Emitted with the `signaling:outgoing-call-accepted` event.

```json
{
  "callId": "01916f6a-7b3c-7d4e-8f1a-2b3c4d5e6f70",
  "acceptingClientId": "1234567"
}
```

| Field               | Type     | Description                                      |
| ------------------- | -------- | ------------------------------------------------ |
| `callId`            | `string` | The accepted call's identifier.                  |
| `acceptingClientId` | `string` | VATSIM CID of the client that accepted the call. |

### CallError

Emitted with the `webrtc:call-error` event.

```json
{
  "callId": "01916f6a-7b3c-7d4e-8f1a-2b3c4d5e6f70",
  "reason": "Local connection failure"
}
```

| Field    | Type     | Description                          |
| -------- | -------- | ------------------------------------ |
| `callId` | `string` | The call that experienced the error. |
| `reason` | `string` | Human-readable error description.    |

### FrontendError

Emitted with the `error` event.

```json
{
  "title": "Connection failed",
  "detail": "Unable to reach the signaling server",
  "isNonCritical": true
}
```

| Field           | Type                   | Description                                                              |
| --------------- | ---------------------- | ------------------------------------------------------------------------ |
| `title`         | `string`               | Error category identifier.                                               |
| `detail`        | `string`               | Human-readable error description.                                        |
| `isNonCritical` | `boolean`              | `true` for expected/recoverable errors, `false` for unexpected failures. |
| `timeoutMs`     | `number` &#124; absent | Auto-dismiss timeout in milliseconds. Absent when not applicable.        |

### IncomingCallListEntry

Emitted with the `signaling:add-incoming-to-call-list` event.

```json
{
  "callId": "01916f6a-7b3c-7d4e-8f1a-2b3c4d5e6f70",
  "source": {
    "clientId": "7654321",
    "positionId": "LOWW_APP"
  }
}
```

| Field    | Type                        | Description                     |
| -------- | --------------------------- | ------------------------------- |
| `callId` | `string`                    | The incoming call's identifier. |
| `source` | [`CallSource`](#callsource) | The originator of the call.     |

---

## Example: Client Session Lifecycle

The following sequence illustrates a typical client lifecycle, from connection establishment through to placing a call.

### 1. Subscribe to events

Immediately after the WebSocket connection is established, register subscriptions for the required event streams:

```json
→ { "type": "subscribe", "event": "auth:authenticated" }
→ { "type": "subscribe", "event": "auth:unauthenticated" }
→ { "type": "subscribe", "event": "signaling:connected" }
→ { "type": "subscribe", "event": "signaling:disconnected" }
→ { "type": "subscribe", "event": "signaling:client-list" }
→ { "type": "subscribe", "event": "signaling:station-list" }
→ { "type": "subscribe", "event": "signaling:call-invite" }
→ { "type": "subscribe", "event": "signaling:call-end" }
→ { "type": "subscribe", "event": "webrtc:call-connected" }
→ { "type": "subscribe", "event": "webrtc:call-disconnected" }
→ { "type": "subscribe", "event": "store:sync" }
→ { "type": "subscribe", "event": "error" }
```

### 2. Bootstrap state

Signal client readiness and retrieve the current application state:

```json
→ { "type": "invoke", "id": "1", "cmd": "app_frontend_ready", "args": {} }
← { "type": "response", "id": "1", "ok": true, "data": null }

→ { "type": "invoke", "id": "2", "cmd": "remote_get_session_state", "args": {} }
← {
    "type": "response",
    "id": "2",
    "ok": true,
    "data": {
      "connectionState": "disconnected",
      "sessionInfo": null,
      "defaultCallSources": [],
      "stations": [],
      "clients": [],
      "clientId": null,
      "callConfig": { ... },
      "clientPageSettings": { ... },
      "capabilities": { ... },
      "incomingCalls": [],
      "outgoingCall": null
    }
  }
```

See [`SessionStateSnapshot`](#sessionstatesnapshot) for the full schema.

### 3. Authenticate

Check whether a valid session already exists:

```json
→ { "type": "invoke", "id": "3", "cmd": "auth_check_session", "args": {} }
← { "type": "response", "id": "3", "ok": true, "data": { ... } }
```

If no `auth:authenticated` event follows, the user must authenticate on the desktop host first (`auth_open_oauth_url` is desktop-only). Once the OAuth flow completes on the desktop, the server emits:

```json
← { "type": "event", "name": "auth:authenticated", "payload": "1234567" }
```

### 4. Connect and call

```json
→ { "type": "invoke", "id": "4", "cmd": "signaling_connect", "args": { "positionId": "LOVV_CTR" } }
← { "type": "response", "id": "4", "ok": true, "data": null }

← { "type": "event", "name": "signaling:connected", "payload": { ... } }
← { "type": "event", "name": "signaling:station-list", "payload": [ ... ] }
← { "type": "event", "name": "signaling:client-list", "payload": [ ... ] }
```

Initiate a call to another client:

```json
→ { "type": "invoke", "id": "5", "cmd": "signaling_start_call", "args": { "target": "1234569", "source": "LOVV_N1", "prio": false } }
← { "type": "response", "id": "5", "ok": true, "data": "019cc8de-50f0-7624-a89c-61ba0b5cb784" }
← { "type": "event", "name": "webrtc:call-connected", "payload": "019cc8de-50f0-7624-a89c-61ba0b5cb784" }
```

### 5. Keepalive

Maintain the connection with periodic keepalive pings. Either application-level or WebSocket protocol-level pings may be used:

```json
→ { "type": "ping" }
← { "type": "pong" }
```

Alternatively, send a WebSocket Ping frame - the server replies with a Pong frame carrying the same payload. Most WebSocket libraries send these automatically.

---

## Implementation Notes

- **Message ordering:** The server imposes no ordering constraints on `subscribe` and `invoke` messages. Clients may interleave them freely.
- **Concurrency:** Multiple `invoke` requests may be in flight simultaneously. Clients must use distinct `id` values to correlate responses.
- **Event buffering:** The server maintains an internal per-connection event buffer of 256 messages. If a client cannot consume events at the rate they are produced, older events are dropped and a warning is logged server-side.
- **Desktop-only commands:** Commands marked as desktop-only are unconditionally rejected over the remote API. Clients should inspect `remote_get_session_state` → `capabilities` to determine platform support before invoking platform-dependent commands.
- **Field naming:** Command names use `snake_case` (`audio_get_volumes`, `signaling_start_call`), while command return values and event payloads use `camelCase` (`callId`, `positionId`). This is intentional - the payload schema matches the format used by the default Preact frontend.
- **Static assets:** The HTTP server that hosts the WebSocket endpoint also serves the vacs SPA at the root path (`/`). Unresolved paths fall back to `index.html` to support client-side routing.
