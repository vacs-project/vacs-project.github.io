---
sidebar_position: 1
---

# Configuration

:::info
Almost everything in vacs is set on the [Settings](../settings/overview.md) page, and you never need to touch a file for normal use. This page is for the few things that can only be changed by editing vacs's configuration files: [client page configs](#client-page-configs), a handful of [advanced settings](#settings-without-a-ui), and [connecting to a different server](#using-a-different-server).
:::

## Configuration files

vacs stores its configuration as [TOML](https://toml.io/en/) files in its configuration folder. The quickest way to open it is the **Open Config** button in the [Miscellaneous settings](../settings/misc.md#open-config). Otherwise, it is located at:

| Platform | Folder |
| --- | --- |
| Windows | `%APPDATA%\app.vacs.vacs-client\` |
| macOS | `~/Library/Application Support/app.vacs.vacs-client/` |
| Linux | `~/.config/app.vacs.vacs-client/` (or `$XDG_CONFIG_HOME/app.vacs.vacs-client/` if set) |

vacs reads up to four files from this folder, in this order. A value in a later file overrides the same value in an earlier one, and every file is optional:

| File | Contains | Written by vacs |
| --- | --- | --- |
| `config.toml` | Server addresses and connection settings (`[backend]`, `[ice]`) | No |
| `audio.toml` | Audio devices, volumes and ring sounds (`[audio]`) | Yes, whenever you change an audio setting |
| `client_page.toml` | Your [client page configs](#client-page-configs) (`[client_page]`) | No |
| `client.toml` | Everything else: hotkeys, transmit mode, call settings, ignore list, window position (`[client]`) | Yes, whenever you change one of these settings |

:::warning[Edit with vacs closed]
vacs rewrites `audio.toml` and `client.toml` in full whenever you change a setting in the app, using the values it loaded at startup. Close vacs before editing either of them, or your changes may be overwritten. Changes to any of the files take effect the next time vacs starts.

Put each setting in the file listed for its section. A `[client]` setting placed in `config.toml`, for example, stops working once vacs writes `client.toml`, because `client.toml` is read later and overrides it.
:::

Any text editor works. An editor with TOML support, such as [Visual Studio Code](https://code.visualstudio.com/) with the [Even Better TOML](https://marketplace.visualstudio.com/items?itemName=tamasfe.even-better-toml) extension, will point out syntax errors before vacs refuses to start because of one.

### Editor validation and completion

vacs publishes a [JSON Schema](https://json-schema.org/) of all its settings, generated from the code, at:

```
https://raw.githubusercontent.com/vacs-project/vacs/main/vacs-client/config.schema.json
```

With the schema, a supporting editor completes setting names, describes each setting, and marks misspelled names and wrong values. In Even Better TOML, add this line at the top of a file:

```toml
#:schema https://raw.githubusercontent.com/vacs-project/vacs/main/vacs-client/config.schema.json
```

The schema follows the latest development version, so it may list a setting before it is released.

---

## Client page configs

The [Clients](../interface/phone/clients.md) page lists every controller currently connected to vacs. If your position has no profile in your vACC's dataset, or you simply want a tidier list, a **client page config** decides which controllers are shown, in which order, and how they are grouped. You can define several and switch between them on the [Mission Page](../interface/mission.md#profiles--client-page-configuration) without restarting vacs.

:::note
Client page configs only change what **you** see. A controller you have filtered out can still call you, and their callsign is shown on the incoming call as usual, but you cannot call them back from the Clients page until your filter shows them again.
:::

Configs live in `client_page.toml`, one table per config:

```toml
[client_page.configs.Default]
include = []
exclude = []
priority = ["*_FMP", "*_CTR", "*_APP", "*_TWR", "*_GND"]
frequencies = "ShowAll"
grouping = "FirAndIcao"

[client_page.configs.CentersOnly]
include = ["*_CTR"]
priority = ["LOVV_*", "EDMM_*"]
frequencies = "HideAll"

[client_page.configs.Austria]
include = ["LO*"]
exclude = ["LON*"]
grouping = "Icao"
```

The name after `client_page.configs.` is what the Mission Page shows. Use letters, digits, `_` and `-`. Every setting is optional; the defaults are shown in the `Default` config above.

### Loading a config file from your vACC

Your vACC may ship client page configs as a separate file, for example inside its sector file package. Instead of copying them into your own `client_page.toml`, click **Select client page config** on the [Mission Page](../interface/mission.md) and pick the file. vacs remembers it and reads it again on every start, after your own files, so a config with the same name in that file wins over yours.

### `include`

A list of [callsign patterns](#callsign-patterns). If it is empty, every controller is shown (minus `exclude`). If it is not, only controllers matching at least one pattern are shown.

```toml
include = ["LO*", "EDDM_*", "EDMM_*"]  # Austria plus Munich
```

### `exclude`

A list of callsign patterns to hide. `exclude` always wins over `include`, so you can include a whole FIR and still hide its ground positions:

```toml
include = ["LO*"]
exclude = ["*_GND", "*_DEL"]
```

### `priority`

An ordered list of callsign patterns that decides the display order. A controller lands in the bucket of the **first** pattern it matches, and earlier buckets come first. Controllers matching no pattern come last. Within a bucket, controllers are sorted by position type (the part after the last `_`, such as `APP` or `CTR`), then by name.

The default puts flow management first, then center, approach, tower and ground:

```toml
priority = ["*_FMP", "*_CTR", "*_APP", "*_TWR", "*_GND"]
```

Set `priority = []` to drop the default ordering entirely. Leaving the setting out keeps the default.

### `frequencies`

Whether the direct access keys show the controller's frequency: `"ShowAll"` (default) or `"HideAll"`.

### `grouping`

How the keys are grouped, based on the callsign:

| Value | Groups by | Example with `LOVV_CTR`, `LOWW_APP`, `LOWW_TWR`, `EDMM_CTR` |
| --- | --- | --- |
| `"None"` | Nothing, one flat list | `LOVV_CTR`, `LOWW_APP`, `LOWW_TWR`, `EDMM_CTR` |
| `"Fir"` | The first two letters | **LO**: `LOVV_CTR`, `LOWW_APP`, `LOWW_TWR` / **ED**: `EDMM_CTR` |
| `"Icao"` | The first four letters | **LOVV**: `LOVV_CTR` / **LOWW**: `LOWW_APP`, `LOWW_TWR` / **EDMM**: `EDMM_CTR` |
| `"FirAndIcao"` (default) | The first two letters, then the first four within them | **LO** > **LOVV**, **LOWW** / **ED** > **EDMM** |

### Callsign patterns

`include`, `exclude` and `priority` use simple wildcard patterns that are matched against the whole callsign, ignoring case:

- `*` matches any number of characters, including none.
- `?` matches exactly one character.

| Pattern | Matches | Does not match |
| --- | --- | --- |
| `LOWW_*` | `LOWW_APP`, `LOWW_TWR`, `LOWW_1_TWR` | `LOWWAPP`, `LOWI_APP` |
| `*_APP` | `LOWW_APP`, `EDDM_APP`, `LOVV_S_APP` | `LOWW_TWR` |
| `LO*` | `LOWW_APP`, `LOVV_CTR` | `EDDM_APP` |
| `LOWW_?_TWR` | `LOWW_1_TWR`, `LOWW_2_TWR` | `LOWW_TWR`, `LOWW_12_TWR` |
| `LOWW_APP` | only `LOWW_APP` | `LOWW_1_APP` |

To match text in the middle of a callsign, put a wildcard on both sides, for example `*WW*`.

### Putting it together

```toml
[client_page.configs.Example]
include = ["LO*", "EDMM_*", "EDDM_*"]
exclude = ["*_GND", "*_DEL"]
priority = ["LOVV*", "*_CTR", "LO*_APP", "*_APP", "*_TWR"]
```

| Callsign | Shown? | Why | Position |
| --- | --- | --- | --- |
| `LOVV_CTR` | Yes | Included by `LO*`, first priority match `LOVV*` | 1 |
| `EDMM_ALB_CTR` | Yes | Included by `EDMM_*`, first priority match `*_CTR` | 2 |
| `LOWW_APP` | Yes | Included by `LO*`, first priority match `LO*_APP` | 3 |
| `EDDM_TWR` | Yes | Included by `EDDM_*`, first priority match `*_TWR` | 4 |
| `LON_S_FMP` | Yes | Included by `LO*`, no priority match | 5 |
| `LOWW_GND` | No | Excluded by `*_GND` | - |
| `EDDF_APP` | No | Matches no `include` pattern | - |

---

## Settings without a UI

These settings are rarely needed and can only be changed in the files. Close vacs before editing.

| Setting | File and section | Default | Effect |
| --- | --- | --- | --- |
| `auto_hangup_seconds` | `client.toml`, `[client]` | `60` | Seconds after which an unanswered outgoing call is ended. `0` keeps it ringing until you end it. |
| `signaling_auto_reconnect` | `client.toml`, `[client]` | `true` | Whether vacs tries to reconnect on its own after losing the connection to the server. |
| `max_clips` | `client.toml`, `[client.playback]` | `15` | How many radio transmissions [radio playback](../interface/playback.md) keeps. |
| `max_clip_duration_s` | `client.toml`, `[client.playback]` | `90` | Longest single recording in seconds. A longer transmission continues in a new recording. |
| `hangover_ms` | `client.toml`, `[client.playback]` | `250` | Silence in milliseconds after a transmission ends before its recording is closed. |
| `serve_frontend` | `client.toml`, `[client.remote]` | `true` | Whether [remote control](../using-vacs/remote-control.md) serves the browser interface. With `false`, only the [API](./remote-api.md) is available. |
| `ring_sound_loop_pause_seconds` | `audio.toml`, `[audio]` | `3` | Pause between repetitions of a looping [custom ring sound](../settings/call.md). |

For example, to keep twice as many radio recordings:

```toml
[client.playback]
max_clips = 30
```

---

## Using a different server

:::warning
You only need this if you run your own vacs server or were asked to test against one. Controllers connected to a different server cannot call anyone on the official one, and vice versa.
:::

The server vacs connects to is set in `config.toml`. Both addresses must point to the same server:

```toml
[backend]
base_url = "https://vacs.example.org"
ws_url = "wss://vacs.example.org/ws"
```

By default, vacs fetches the STUN and TURN servers it uses to set up calls from the server it is connected to. To use your own instead, list them in `config.toml`. vacs then stops fetching them from the server:

```toml
[[ice.ice_servers]]
urls = ["stun:stun.example.org:3478"]

[[ice.ice_servers]]
urls = ["turn:turn.example.org:3478"]
username = "user"
credential = "secret"
```

---

## Migrating from vacs 1.x

The "Stations" configuration of vacs 1.x became the client page configuration in vacs 2.0.0. If you still have a `stations.toml`, convert it like this:

| vacs 1.x | vacs 2.0 and later |
| --- | --- |
| File `stations.toml` | File `client_page.toml` |
| `[stations.profiles.<name>]` | `[client_page.configs.<name>]` |
| `selected_stations_profile` in `client.toml` | `selected_client_page_config` |
| `extra_stations_config` in `client.toml` | `extra_client_page_config` |
| `ignored` under `[stations]` | `ignored` under `[client]` in `client.toml` |
| `aliases` | Removed, delete them |
| `frequencies = "HideAliased"` | Removed, use `"ShowAll"` or `"HideAll"` |
| Default `grouping = "None"` | Default `grouping = "FirAndIcao"`; set `"None"` to keep the old layout |
