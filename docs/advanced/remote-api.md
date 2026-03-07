---
sidebar_position: 2
---

# Remote Control API

:::info
This page documents the technical details of the vacs remote control WebSocket API. If you're just looking to use vacs from a browser or different device, see [Remote Access](/using-vacs/remote-access) instead.
:::

vacs exposes a WebSocket-based remote control API for programmatic interaction by external clients. The built-in browser frontend communicates through the same API - there is no separate internal protocol.

This reference covers the wire format, available commands, subscribable events, and connection lifecycle. It is intended for developers building custom integrations, alternative frontends, or automation tooling against a running vacs instance.

## Connection

### Endpoint

```
ws://<host>:<port>/ws
```

The default port is **9600**. The remote server must be explicitly enabled in the vacs configuration - see [Remote Access - Enabling remote access](/using-vacs/remote-access#enabling-remote-access).

### Transport

- Standard WebSocket ([RFC 6455](https://datatracker.ietf.org/doc/html/rfc6455))
- All application messages are [**JSON text frames**](https://datatracker.ietf.org/doc/html/rfc6455#section-5.6) - binary frames are not used
- WebSocket protocol-level [Ping/Pong frames](https://datatracker.ietf.org/doc/html/rfc6455#section-5.5.2) are supported - the server responds to any WebSocket Ping frame with a matching Pong frame
- No sub-protocols are required

### Authentication

The WebSocket endpoint does not perform any authentication or authorization. Access control is the responsibility of the network environment.

:::warning Security
Do not expose the remote server on untrusted networks. The connection is unencrypted (no TLS).  
If you require additional security or must expose the server on a public network, place vacs behind a reverse proxy that provides TLS termination and authentication.
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

No `response` is sent. Unrecognized event names are silently ignored.

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
  "payload": [{ "cid": "1234567", "callsign": "LOVV_CTR" }]
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

:::tip WebSocket-level Ping/Pong
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
| `app_load_test_profile`                             | `path`: string?                           | `string` \| `null`                          | Load or reload a test profile. Over remote, `path` must be `null` (reload only). |
| `app_unload_test_profile`                           | -                                         | `null`                                      | Unload the active test profile.                                                  |
| `app_get_client_page_settings`                      | -                                         | [`ClientPageSettings`](#clientpagesettings) | Get client page settings.                                                        |
| `app_set_selected_client_page_config`               | `configName`: string?                     | `null`                                      | Set the active client page config.                                               |
| `app_load_extra_client_page_config` [^desktop-only] | -                                         | -                                           | Load extra client page config from a file.                                       |

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
| `auth_open_oauth_url` | -    | `null`  | Start the VATSIM OAuth flow. Opens the authorization URL on the desktop host. |
| `auth_check_session`  | -    | `null`  | Check the current session validity.                                           |
| `auth_logout`         | -    | `null`  | Log out the current user.                                                     |

### Keybinds

| Command                                                   | Args                                                  | Returns                             | Description                                            |
| --------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------- | ------------------------------------------------------ |
| `keybinds_get_transmit_config`                            | -                                                     | [`TransmitConfig`](#transmitconfig) | Get transmit configuration (mode, PTT keys, etc.).     |
| `keybinds_set_transmit_config`                            | `transmitConfig`: [`TransmitConfig`](#transmitconfig) | `null`                              | Update transmit configuration.                         |
| `keybinds_get_keybinds_config`                            | -                                                     | [`KeybindsConfig`](#keybindsconfig) | Get keybind configuration.                             |
| `keybinds_set_binding`                                    | `code`: string?, `keybind`: [`Keybind`](#keybind)     | `null`                              | Set a specific keybind.                                |
| `keybinds_get_radio_config`                               | -                                                     | [`RadioConfig`](#radioconfig)       | Get radio integration configuration.                   |
| `keybinds_set_radio_config`                               | `radioConfig`: [`RadioConfig`](#radioconfig)          | `null`                              | Update radio integration configuration.                |
| `keybinds_get_radio_state`                                | -                                                     | [`RadioState`](#radiostate-1)       | Get current radio state.                               |
| `keybinds_get_external_binding`                           | `keybind`: [`Keybind`](#keybind)                      | `string` \| `null`                  | Get the external (system-level) binding for a keybind. |
| `keybinds_open_system_shortcuts_settings` [^desktop-only] | -                                                     | -                                   | Open the OS shortcut settings.                         |
| `keybinds_reconnect_radio`                                | -                                                     | `null`                              | Reconnect the radio integration.                       |

### Remote

| Command                       | Args                          | Returns                                           | Description                                                   |
| ----------------------------- | ----------------------------- | ------------------------------------------------- | ------------------------------------------------------------- |
| `remote_broadcast_store_sync` | `store`: string, `state`: any | `null`                                            | Broadcast a state sync event to all connected remote clients. |
| `remote_get_session_state`    | -                             | [`SessionStateSnapshot`](#session-state-snapshot) | Get a full snapshot of the current session.                   |

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
| `audio:input-level`            | `number`  | Input audio level sample (0.0–1.0). Emitted at a regular interval while the input level meter is active. |
| `audio:radio-prio`             | `boolean` | Radio priority state changed.                                                                            |
| `audio:stop-input-level-meter` | `null`    | The input level meter was stopped.                                                                       |

### Authentication Events

| Event                  | Payload  | Description                                                     |
| ---------------------- | -------- | --------------------------------------------------------------- |
| `auth:authenticated`   | `string` | The user successfully authenticated. Payload is the VATSIM CID. |
| `auth:error`           | `null`   | An authentication error occurred.                               |
| `auth:unauthenticated` | `null`   | The user was logged out or the session expired.                 |

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
| `signaling:update-call-list`          | [`CallListUpdate`](#calllistupdate)               | The call list was updated.                                                           |

### WebRTC Events

| Event                      | Payload                   | Description                                                          |
| -------------------------- | ------------------------- | -------------------------------------------------------------------- |
| `webrtc:call-connected`    | `string`                  | A voice call was established (media flowing). Payload is the CallId. |
| `webrtc:call-disconnected` | `string`                  | A voice call was disconnected. Payload is the CallId.                |
| `webrtc:call-error`        | [`CallError`](#callerror) | A voice call encountered an error.                                   |

### Other Events

| Event             | Payload                           | Description                                                                                |
| ----------------- | --------------------------------- | ------------------------------------------------------------------------------------------ |
| `error`           | [`FrontendError`](#frontenderror) | A general application error.                                                               |
| `radio:state`     | [`RadioState`](#radiostate-1)     | Radio integration state changed.                                                           |
| `store:sync`      | `object`                          | A store state synchronization broadcast. Contains `{ "store": <string>, "state": <any> }`. |
| `update:progress` | `number`                          | Application update download progress (0–100).                                              |

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
| `urn:vacs:error:remote:timeout`          | Timeout          | The command did not complete within the time limit.       |
| `urn:vacs:error:remote:application`      | _(varies)_       | An application-level error originating from the backend.  |

### SessionStateSnapshot

Returned by [`remote_get_session_state`](#remote). Provides a complete snapshot of the current application state for bootstrapping a newly connected client.

```json
{
  "connectionState": "disconnected",
  "sessionInfo": null,
  "stations": [],
  "clients": [],
  "clientId": null,
  "callConfig": {
    "highlightIncomingCallTarget": true,
    "enablePriorityCalls": true,
    "enableCallStartSound": true,
    "enableCallEndSound": true
  },
  "clientPageSettings": {
    "selected": null,
    "configs": {}
  },
  "capabilities": {
    "alwaysOnTop": true,
    "keybindListener": true,
    "keybindEmitter": false,
    "platform": "LinuxWayland"
  },
  "incomingCalls": [],
  "outgoingCall": null
}
```

| Field                | Type                                        | Description                                   |
| -------------------- | ------------------------------------------- | --------------------------------------------- |
| `connectionState`    | [`ConnectionState`](#connectionstate)       | Signaling connection state.                   |
| `sessionInfo`        | [`SessionInfo`](#sessioninfo) &#124; `null` | Current signaling session metadata.           |
| `stations`           | [`StationInfo[]`](#stationinfo)             | Available stations in the current session.    |
| `clients`            | [`ClientInfo[]`](#clientinfo)               | Other clients visible in the current session. |
| `clientId`           | `string` &#124; `null`                      | The authenticated user's VATSIM CID.          |
| `callConfig`         | [`CallConfig`](#callconfig)                 | Active call configuration.                    |
| `clientPageSettings` | [`ClientPageSettings`](#clientpagesettings) | Active client page layout/settings.           |
| `capabilities`       | [`Capabilities`](#capabilities)             | Platform capabilities of the desktop host.    |
| `incomingCalls`      | [`CallInvite[]`](#callinvite)               | Pending incoming call invitations.            |
| `outgoingCall`       | [`CallInvite`](#callinvite) &#124; `null`   | The pending outgoing call, if any.            |

### Capabilities

Platform capability flags returned by `app_platform_capabilities` and included in the session state snapshot.

```json
{
  "alwaysOnTop": true,
  "keybindListener": true,
  "keybindEmitter": false,
  "platform": "LinuxWayland"
}
```

| Field             | Type                    | Description                                              |
| ----------------- | ----------------------- | -------------------------------------------------------- |
| `alwaysOnTop`     | `boolean`               | Whether the platform supports always-on-top window mode. |
| `keybindListener` | `boolean`               | Whether the platform supports global keybind listening.  |
| `keybindEmitter`  | `boolean`               | Whether the platform supports emitting key events.       |
| `platform`        | [`Platform`](#platform) | The host platform identifier.                            |

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
  "enableCallEndSound": true
}
```

| Field                         | Type      | Description                                               |
| ----------------------------- | --------- | --------------------------------------------------------- |
| `highlightIncomingCallTarget` | `boolean` | Highlight the caller in the client list on incoming call. |
| `enablePriorityCalls`         | `boolean` | Allow sending and receiving priority calls.               |
| `enableCallStartSound`        | `boolean` | Play a sound when a call connects.                        |
| `enableCallEndSound`          | `boolean` | Play a sound when a call ends.                            |

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
  "mode": "PushToTalk",
  "pushToTalk": "Space",
  "pushToMute": null,
  "radioPushToTalk": null
}
```

| Field             | Type                            | Description                      |
| ----------------- | ------------------------------- | -------------------------------- |
| `mode`            | [`TransmitMode`](#transmitmode) | Active transmit mode.            |
| `pushToTalk`      | `string` &#124; `null`          | Key code for push-to-talk.       |
| `pushToMute`      | `string` &#124; `null`          | Key code for push-to-mute.       |
| `radioPushToTalk` | `string` &#124; `null`          | Key code for radio push-to-talk. |

#### TransmitMode

```
"VoiceActivation" | "PushToTalk" | "PushToMute" | "RadioIntegration"
```

### KeybindsConfig

Returned by `keybinds_get_keybinds_config`.

```json
{
  "acceptCall": "KeyA",
  "endCall": "KeyE",
  "toggleRadioPrio": null
}
```

| Field             | Type                   | Description                              |
| ----------------- | ---------------------- | ---------------------------------------- |
| `acceptCall`      | `string` &#124; `null` | Key code for accepting an incoming call. |
| `endCall`         | `string` &#124; `null` | Key code for ending the active call.     |
| `toggleRadioPrio` | `string` &#124; `null` | Key code for toggling radio priority.    |

#### Keybind

Used as the `keybind` argument for `keybinds_set_binding` and `keybinds_get_external_binding`:

```
"PushToTalk" | "PushToMute" | "RadioIntegration" | "AcceptCall" | "EndCall" | "ToggleRadioPrio"
```

### RadioConfig

Returned by `keybinds_get_radio_config`. Accepted by `keybinds_set_radio_config`.

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

| Field            | Type                                    | Description                                                                                     |
| ---------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `integration`    | [`RadioIntegration`](#radiointegration) | Active radio integration backend.                                                               |
| `audioForVatsim` | `object` &#124; `null`                  | AudioForVATSIM-specific configuration. Contains `emit` (key code, `string` &#124; `null`).      |
| `trackAudio`     | `object` &#124; `null`                  | TrackAudio-specific configuration. Contains `endpoint` (WebSocket URL, `string` &#124; `null`). |

#### RadioIntegration

```
"AudioForVatsim" | "TrackAudio"
```

### RadioState {#radiostate-1}

Returned by `keybinds_get_radio_state` and emitted with the `radio:state` event.

```
"NotConfigured" | "Disconnected" | "Connected" | "VoiceConnected" | "RxIdle" | "RxActive" | "TxActive" | "Error"
```

| Value            | Description                                        |
| ---------------- | -------------------------------------------------- |
| `NotConfigured`  | No radio integration is configured.                |
| `Disconnected`   | Configured but not connected to the radio backend. |
| `Connected`      | Connected to the radio backend, no voice session.  |
| `VoiceConnected` | Voice session established.                         |
| `RxIdle`         | Receiving capable, no active reception.            |
| `RxActive`       | Actively receiving audio.                          |
| `TxActive`       | Actively transmitting audio.                       |
| `Error`          | The radio integration encountered an error.        |

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

### CallListUpdate

Emitted with the `signaling:update-call-list` event.

```json
{
  "callId": "01916f6a-7b3c-7d4e-8f1a-2b3c4d5e6f70",
  "clientId": "1234567"
}
```

| Field      | Type                   | Description                                   |
| ---------- | ---------------------- | --------------------------------------------- |
| `callId`   | `string`               | The affected call's identifier.               |
| `clientId` | `string` &#124; `null` | The client involved in the update, or `null`. |

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

### 3. Authenticate

Verify whether a valid session exists. If not, initiate the VATSIM OAuth flow:

```json
→ { "type": "invoke", "id": "3", "cmd": "auth_check_session", "args": {} }
← { "type": "response", "id": "3", "ok": true, "data": { ... } }
```

If the session is invalid or expired, initiate authentication:

```json
→ { "type": "invoke", "id": "4", "cmd": "auth_open_oauth_url", "args": {} }
← { "type": "response", "id": "4", "ok": true, "data": "https://auth.vatsim.net/..." }
```

The user completes the OAuth flow externally. Upon successful authentication, the server emits:

```json
← { "type": "event", "name": "auth:authenticated", "payload": { ... } }
```

### 4. Connect and call

```json
→ { "type": "invoke", "id": "5", "cmd": "signaling_connect", "args": { "positionId": "LOVV_CTR" } }
← { "type": "response", "id": "5", "ok": true, "data": null }

← { "type": "event", "name": "signaling:connected", "payload": { ... } }
← { "type": "event", "name": "signaling:station-list", "payload": [ ... ] }
← { "type": "event", "name": "signaling:client-list", "payload": [ ... ] }
```

Initiate a call to another client:

```json
→ { "type": "invoke", "id": "6", "cmd": "signaling_start_call", "args": { "target": "1234569", "source": "LOVV_N1", "prio": false } }
← { "type": "response", "id": "6", "ok": true, "data": null }
← { "type": "event", "name": "webrtc:call-connected", "payload": { ... } }
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
- **Field naming:** The wire protocol uses `snake_case` for message-level field names. The session state snapshot object uses `camelCase` as it's also consumed by the default Preact frontend.
- **Static assets:** The HTTP server that hosts the WebSocket endpoint also serves the vacs SPA at the root path (`/`). Unresolved paths fall back to `index.html` to support client-side routing.
