## 8. Per-Configuration Key Event Reference

This section enumerates exactly what happens in every key event for every valid
configuration. Scenarios:

- **Outside a call** — no WebRTC peer connected.
- **Entering a call** — `on_peer_connected` fires; key(s) already held at that moment.
- **In a call (prio off)** — call mic attached, radio_prio = false.
- **In a call (prio on)** — call mic attached, radio_prio = true (explicit toggle).
- **Leaving a call** — `cleanup_call` fires; key(s) still held at that moment.
- **Radio Prio button** — `audio_set_radio_prio` / `toggle_radio_prio` keybind.

Abbreviations: **MIC** = call microphone mute state (Muted / Unmuted / not attached).
**R-TX** = radio transmission state (Active / Inactive / n/a). ↓ = key down, ↑ = key up.

---

### 8.1 VA | None | None — Voice Activation, no radio

**Keys:** none bound. `call_code = None`, `radio_code = None`. No key events are
processed; `call_pressed` and `radio_pressed` are never set.

#### Outside a call

No keys → nothing. Radio prio button calls `set_input_muted(prio)` via the
`(VoiceActivation, _)` arm in `set_radio_prio`, but MIC is not attached so there is no
audible effect. The `radio_prio` flag is stored.

#### Entering a call

`should_attach_input_muted` returns `false` (VA always unmuted on attach), regardless of
pre-set prio state. If prio was toggled on before the call, the MIC still attaches
**unmuted** — the prio muting is not re-applied at attach time. Implicit prio does not
fire (no radio key).

#### In a call

| State     | MIC            | Notes                              |
|-----------|----------------|------------------------------------|
| prio off  | **Unmuted** (VAD) | VAD controls audio send        |
| prio on   | **Muted**      | Hard-muted; VAD suspended          |

No key events occur (no keys bound). MIC state changes only via the prio button.

#### Leaving a call

MIC detached. `set_call_active(false)` unconditionally clears both `radio_prio` and
`implicit_radio_prio` and emits `audio:implicit-radio-prio, false`. Prio does **not**
persist across calls — the next call always starts with `radio_prio = false`.

#### Radio Prio button

`set_radio_prio` always uses the `(VoiceActivation, _)` arm regardless of `call_pressed`,
calling `set_input_muted(prio)` in all cases.

| Action     | In call: immediate MIC effect   | Outside call: MIC effect |
|------------|---------------------------------|--------------------------|
| Toggle ON  | **Muted immediately**           | None (not attached)      |
| Toggle OFF | **Unmuted immediately** (VAD)   | None (not attached)      |

---

### 8.2 VA | Yes | Radio (ORANGE) — Voice Activation + radio PTT key

**Keys:** R-PTT only. `call_code = None`, `radio_code = Some(r_ptt_code)`. `is_call_key
= false` always; `is_radio_key = true` for R-PTT events; `separate = true` always.
Behavior is identical for TrackAudio and AFV.

#### Outside a call

| Event   | MIC          | R-TX         |
|---------|--------------|--------------|
| R-PTT ↓ | not attached | **Active**   |
| R-PTT ↑ | not attached | **Inactive** |

#### Entering a call

`should_attach_input_muted` returns `false` (VA always unmuted on attach). If prio was
pre-set before the call, the MIC still attaches **unmuted** — prio is not re-applied at
attach time.

| R-PTT held? | MIC attaches | impl_prio fires? | R-TX |
|-------------|--------------|------------------|------|
| No          | **Unmuted**  | No               | Inactive |
| Yes         | **Unmuted**  | No               | Active (was already TX-ing) |

Implicit prio never fires for VA mode: `set_call_active` guards on
`call_mic_mode != VoiceActivation`. The `radio_prio` flag is unchanged by call entry.
Radio TX was already running if R-PTT was held; it continues uninterrupted.

#### In a call — prio off

R-PTT has no MIC effect — the rx loop VA arm always returns `None`. MIC follows VAD
throughout.

| Event   | MIC                         | R-TX         |
|---------|-----------------------------|--------------|
| R-PTT ↓ | **Unmuted** (VAD, unchanged)| **Active**   |
| R-PTT ↑ | **Unmuted** (VAD, unchanged)| **Inactive** |

#### In a call — prio on

`set_radio_prio(true)` mutes MIC immediately via `(VoiceActivation, _)` →
`set_input_muted(true)`. R-PTT still has no MIC effect; MIC stays muted.

| Event   | MIC                       | R-TX         |
|---------|---------------------------|--------------|
| R-PTT ↓ | Muted (unchanged)         | **Active**   |
| R-PTT ↑ | Muted (prio still on)     | **Inactive** |

#### Leaving a call

`set_call_active(false)` unconditionally clears `radio_prio` and `implicit_radio_prio`,
emitting `audio:implicit-radio-prio, false`. Prio does **not** persist across calls.

- **R-PTT not held:** MIC detached.
- **R-PTT held:** MIC detached. Radio TX **continues** (R-PTT still held, no call). R-PTT
  released later → R-TX Inactive.

#### Radio Prio button

`set_radio_prio` uses `(VoiceActivation, _)` → `set_input_muted(prio)` in all cases,
regardless of `call_pressed` or call state.

**Outside a call:** `set_input_muted(prio)` is called but MIC is not attached — no
audible effect. `radio_prio` flag is stored.

**In a call:**

| Action      | Immediate MIC effect            | On R-PTT ↓    | On R-PTT ↑        |
|-------------|---------------------------------|---------------|-------------------|
| Toggle ON   | **Muted immediately**           | R-TX Active   | Muted (prio on)   |
| Toggle OFF  | **Unmuted immediately** (VAD)   | R-TX Active   | Unmuted (VAD)     |

**Toggle OFF with R-PTT held:** `set_radio_prio(false)` also sets `implicit_radio_prio =
true` (because `radio_pressed = true`). MIC unmutes immediately (VA path). On next R-PTT
release: cleanup fires, clears `implicit_radio_prio`, triggers radio TX stop (TODO).

---

### 8.3 PTT | None | None — PushToTalk, no radio

**Keys:** PTT (call push-to-talk). `call_code = Some(ptt)`, `radio_code = None`.
`radio_pressed` is never set; `implicit_radio_prio` never fires. `effective_prio =
radio_prio_loaded` always (no implicit prio to mask).

#### Outside a call

| Event   | MIC          | R-TX |
|---------|--------------|------|
| PTT ↓   | not attached | n/a  |
| PTT ↑   | not attached | n/a  |

Key events have no effect outside a call.

#### Entering a call

`should_attach_input_muted = !call_pressed`. Prio state does not affect the attach value.

- **PTT not held:** MIC **attaches muted**.
- **PTT held:** MIC **attaches unmuted**.

#### In a call — prio off

| Event   | MIC         | R-TX |
|---------|-------------|------|
| PTT ↓   | **Unmuted** | n/a  |
| PTT ↑   | **Muted**   | n/a  |

#### In a call — prio on (mute-lock)

| Event   | MIC                      | R-TX |
|---------|--------------------------|------|
| PTT ↓   | **Muted** (lock active)  | n/a  |
| PTT ↑   | **Muted** (lock active)  | n/a  |

`effective_prio = true` → `(PushToTalk, true, _, true) => Some(true)` for all PTT events.

#### Leaving a call

`set_call_active(false)` unconditionally clears `radio_prio` and `implicit_radio_prio`.
Prio does **not** persist across calls.

- **PTT held:** MIC detached. PTT ↑ later: no effect (no call active).

#### Radio Prio button

`set_radio_prio` matches `_ => {}` for PTT mode — **no immediate MIC effect** in either
direction, regardless of whether the key is held. The `radio_prio` flag is updated;
the new state takes effect on the next PTT key event.

| Action     | Immediate MIC effect | Next PTT ↓   | Next PTT ↑ |
|------------|----------------------|--------------|------------|
| Toggle ON  | None                 | Muted (lock) | Muted      |
| Toggle OFF | None                 | Unmuted      | Muted      |

---

### 8.4 PTT | Different | Radio — PushToTalk + separate radio PTT key

**Keys:** PTT (call) and R-PTT (radio), two distinct physical keys (`radio_code ≠
call_code`). `is_call_key` and `is_radio_key` are mutually exclusive; `separate = true`
for all processed events. Applies to both TrackAudio and AFV.

**Key principle:** the two keys are fully independent. PTT controls the call mic; R-PTT
controls radio TX only. Explicit radio prio acts as a call-PTT mute-lock (identical to
PTT-None prio behavior): while on, PTT does not unmute the call mic. Prio has no effect
on radio TX. Implicit prio does **not** fire for PTT-Diff (`set_call_active` only fires
implicit prio for same-key configs).

#### Outside a call

| Event   | MIC          | R-TX         |
|---------|--------------|--------------|
| PTT ↓   | not attached | n/a          |
| PTT ↑   | not attached | n/a          |
| R-PTT ↓ | not attached | **Active**   |
| R-PTT ↑ | not attached | **Inactive** |

Keys are fully independent outside a call.

#### Entering a call

MIC attaches based solely on PTT state (`should_attach_input_muted = !call_pressed`).
R-PTT state and prio have no influence on the attach muted state. Implicit prio never
fires.

| PTT held? | R-PTT held? | MIC attaches | impl_prio fires? | R-TX |
|-----------|-------------|--------------|------------------|------|
| No        | No          | **Muted**    | No               | Inactive |
| Yes       | No          | **Unmuted**  | No               | Inactive |
| No        | Yes         | **Muted**    | No               | Active (was TX-ing) |
| Yes       | Yes         | **Unmuted**  | No               | Active (was TX-ing) |

#### In a call — prio off

| Event   | MIC           | R-TX         |
|---------|---------------|--------------|
| PTT ↓   | **Unmuted**   | unchanged    |
| PTT ↑   | **Muted**     | unchanged    |
| R-PTT ↓ | unchanged     | **Active**   |
| R-PTT ↑ | unchanged     | **Inactive** |

R-PTT has no MIC effect: the rx loop VA/PTT radio-key events fall through to `_ => None`.

#### In a call — prio on (explicit)

| Event   | MIC                        | R-TX         |
|---------|----------------------------|--------------|
| PTT ↓   | **Muted** (lock active)    | unchanged    |
| PTT ↑   | **Muted** (lock active)    | unchanged    |
| R-PTT ↓ | unchanged                  | **Active**   |
| R-PTT ↑ | unchanged                  | **Inactive** |

Prio is a mute-lock: `effective_prio = true` → `(PushToTalk, true, _, true) => Some(true)`
for PTT events. R-PTT is unaffected.

#### Leaving a call

`set_call_active(false)` clears both `radio_prio` and `implicit_radio_prio`.

- **PTT held:** MIC detached. PTT ↑ later: no effect.
- **R-PTT held:** MIC detached. Radio TX **continues** (R-PTT still held, no call active).
  R-PTT ↑ later → R-TX Inactive.
- **Both held:** as R-PTT case; radio TX continues.

#### Radio Prio button

Identical to PTT-None (§8.3): **no immediate MIC effect** on either toggle direction.
`set_radio_prio` matches `_ => {}` for PTT mode when `call_pressed = true`; if key is not
held, `call_pressed = false` — but PTT is a call key, not a radio key, so this path is
only reached between presses. In practice: toggle ON/OFF changes the `radio_prio` flag;
the new state takes effect on the next PTT key event. R-TX is unaffected by prio.

---

### 8.5 PTT | Same | Radio — PushToTalk + same key for call PTT and radio PTT

**Keys:** one physical key (key_code) that acts as radio PTT outside a call and as call
PTT inside a call, with the role resolved by prio.
Applies to both TrackAudio and AFV.

**Key principle:** outside a call the key always controls radio. Inside a call the prio
flag determines whether the key acts as call PTT (prio off) or radio PTT (prio on).

#### Outside a call

| Event  | MIC          | R-TX         |
|--------|--------------|--------------|
| Key ↓  | not attached | **Active**   |
| Key ↑  | not attached | **Inactive** |

#### Entering a call

| Key held? | prio flag | MIC attaches | impl_prio fires? | R-TX |
|-----------|-----------|--------------|------------------|------|
| No        | off       | **Muted**    | No               | Inactive |
| No        | on        | **Muted**    | No               | Inactive |
| Yes       | off       | **Muted**    | Yes (→ prio on)  | Active (continues) |
| Yes       | on        | **Muted**    | Yes              | Active (continues) |

When key is held at entry: impl_prio fires → radio_prio becomes true temporarily.
`should_attach_input_muted` sees radio_prio = true → attaches muted. Radio TX continues
uninterrupted across the call boundary.

#### In a call — prio off

The key acts as a pure call PTT. Radio is completely suppressed.

| Event  | MIC           | R-TX     | Notes                             |
|--------|---------------|----------|-----------------------------------|
| Key ↓  | **Unmuted**   | Inactive | Call PTT; radio suppressed        |
| Key ↑  | **Muted**     | Inactive |                                   |

#### In a call — prio on

The key acts as radio PTT. Call mic stays muted throughout.

| Event  | MIC           | R-TX         | Notes                              |
|--------|---------------|--------------|------------------------------------|
| Key ↓  | **Muted**     | **Active**   | Radio TX; call mic stays muted     |
| Key ↑  | **Muted**     | **Inactive** | TX stops; call mic stays muted     |

#### Toggling prio while key is at rest (between presses)

| Action     | Immediate MIC effect                         | On next key ↓ |
|------------|----------------------------------------------|----------------|
| Toggle ON  | No immediate change¹                         | Muted + R-TX Active |
| Toggle OFF | No immediate change¹                         | Unmuted (call PTT) |

¹ Toggling while the key is not pressed does not change the current call mic state in PTT
mode. The new prio state takes effect on the next key press.

#### Toggling prio while key is held

`set_radio_prio` matches `_ => {}` for PushToTalk mode — no immediate MIC or radio change.
The role switch takes effect on the next key event:

| Action     | On key ↑                          | On next key ↓              |
|------------|-----------------------------------|----------------------------|
| Toggle ON  | MIC **Muted**, R-TX **Inactive**¹ | MIC Muted, R-TX **Active** |
| Toggle OFF | MIC **Muted**, R-TX **Inactive**² | MIC **Unmuted** (call PTT) |

¹ `effective_prio = true` → PTT-Up arm fires `Some(true)` (muted). Radio TX condition is
true (`radio_prio_loaded = true`) so stop command fires — but radio was not active before
the toggle, so this is a no-op.

² `set_radio_prio(false)` sets `implicit_radio_prio = true` (key held, `radio_pressed =
true`). `effective_prio = false`. PTT-Up arm fires `Some(true)` (muted). Radio TX
condition: `radio_prio_loaded = false` → suppressed. Cleanup on key↑ sends radio TX stop
(TODO path: prio was already false).

#### Leaving a call

`set_call_active(false)` unconditionally clears `radio_prio` and `implicit_radio_prio`,
emitting `audio:implicit-radio-prio, false`. Prio does **not** persist across calls.

- **Key not held:** MIC detached. Both prio flags cleared.
- **Key held (prio off):** MIC detached. Key was acting as call PTT (radio suppressed).
  No radio TX command fires while key remains held (no new key events). Key ↑ later:
  radio TX stop fires (`!call_active → condition true`), but radio was never active — no-op.
- **Key held (prio on):** MIC detached. Radio TX was active. Both prio flags cleared.
  Radio TX **continues** (key still held; no call active → TX condition always true).
  Key ↑ later → R-TX Inactive.

#### Radio Prio button

`set_radio_prio` matches `_ => {}` for PushToTalk — no immediate MIC effect in any case.

| Action     | Outside a call  | In a call (key at rest)          | In a call (key held) — see above  |
|------------|-----------------|----------------------------------|-----------------------------------|
| Toggle ON  | Stores flag     | No immediate change              | No immediate change; key↑ mutes   |
| Toggle OFF | Stores flag     | No immediate change              | No immediate change; key↑ mutes   |

After Toggle ON (key at rest): next key ↓ → R-TX Active + MIC muted.
After Toggle OFF (key at rest): next key ↓ → R-TX Inactive + MIC unmuted (call PTT).

---

### 8.6 PTM | None | None — PushToMute, no radio

**Keys:** PTM (call push-to-mute). No radio code configured, so `radio_pressed` is never
set by the rx loop and `implicit_radio_prio` is never set for this config.

#### Outside a call

| Event   | MIC          | R-TX |
|---------|--------------|------|
| PTM ↓   | not attached | n/a  |
| PTM ↑   | not attached | n/a  |

#### Entering a call

- **PTM not held:** MIC **attaches unmuted** (`call_pressed = false` →
  `should_attach_input_muted` returns false).
- **PTM held:** MIC **attaches muted** (`call_pressed = true` → returns true). On first
  key↑ inside the call: MIC unmutes normally (no prio active).

#### In a call

| Event   | prio off      | prio on           | R-TX |
|---------|---------------|-------------------|------|
| PTM ↓   | **Muted**     | Muted (no change) | n/a  |
| PTM ↑   | **Unmuted**   | Muted (suppressed)| n/a  |

MIC is open by default. With no explicit prio, the key toggles mute freely. Explicit
radio prio acts as a **mute-lock**: the PTM key has no MIC effect — both ↓ and ↑ fall
to `_ => None` in the rx loop (`effective_prio = true` → arm `(PushToMute, _, _, false)`
does not match).

#### Leaving a call

- **PTM held:** MIC detached. PTM ↑ later: no effect.

#### Radio Prio button

**Toggle ON (key not held):** `set_radio_prio(true)` matches `(PushToMute,
call_pressed=false)` → `set_input_muted(true)` immediately. PTM key locked out.

**Toggle ON (key held):** no immediate MIC change (`call_pressed=true` → `_ => {}`).
PTM key locked out from this point: key↑ does not unmute; MIC stays muted after release.

**Toggle OFF (key not held):** `set_radio_prio(false)` matches `(PushToMute, false)` →
`set_input_muted(false)` immediately. PTM coupling resumes.

**Toggle OFF (key held):** no immediate MIC change. `radio_prio` is now false;
`implicit_radio_prio` is NOT set (because `radio_pressed = false` for PTM-None). MIC
**unmutes on key↑** (normal PTM release fires with `radio_prio = false`).

---

### 8.7 PTM | Same | Radio — PushToMute + same key for PTM and radio PTT

**Keys:** one physical key (`radio_code = call_code`). `is_call_key = is_radio_key = true`
for every processed event; `separate = false` always.
Applies to both TrackAudio and AFV.

**Key principle:** pressing the key always activates radio TX, unconditionally. The MIC
effects (mute on ↓, unmute on ↑) are active by default and suppressed only by *explicit*
radio prio. Implicit prio (fired at call entry when key is held) does NOT suppress PTM
unmuting — it is only for radio TX continuity tracking.

The distinction is implemented via `effective_prio = radio_prio && !implicit_radio_prio`.

#### Outside a call

| Event  | MIC          | R-TX         |
|--------|--------------|--------------|
| Key ↓  | not attached | **Active**   |
| Key ↑  | not attached | **Inactive** |

#### Entering a call

| Key held? | MIC attaches | impl_prio fires? | effective_prio | R-TX |
|-----------|--------------|------------------|----------------|------|
| No        | **Unmuted**  | No               | false          | Inactive |
| Yes       | **Muted**    | Yes              | false          | Active (continues) |

When key is held at entry: `call_pressed = true` → `should_attach_input_muted` returns
`true` → MIC attaches muted. `set_call_active` fires impl_prio: `radio_prio = true`,
`implicit_radio_prio = true`. Radio TX continues across the call boundary.

Because `implicit_radio_prio = true`, `effective_prio = false` for all subsequent events.
On first key↑ inside the call: MIC **unmutes** normally (PTM arm fires). The cleanup
path on that release clears both `implicit_radio_prio` and `radio_prio`, emitting
`audio:implicit-radio-prio, false`.

#### In a call — `effective_prio = false` (default)

| Event  | MIC         | R-TX         |
|--------|-------------|--------------|
| Key ↓  | **Muted**   | **Active**   |
| Key ↑  | **Unmuted** | **Inactive** |

PTM muting and radio TX are always coupled. This is the state when no explicit prio is
set, and also immediately after entering a call with the key held (see above).

#### In a call — `effective_prio = true` (explicit prio on)

| Event  | MIC                           | R-TX         |
|--------|-------------------------------|--------------|
| Key ↓  | Muted (already muted)         | **Active**   |
| Key ↑  | **Muted** (unmute suppressed) | **Inactive** |

Radio TX fires unconditionally. PTM unmuting is suppressed: key↑ falls to `_ => None`
in the rx loop.

#### Leaving a call

- **Key not held:** MIC detached. Nothing to track.
- **Key held:** MIC detached. `impl_prio` cleared (if set). Radio TX **continues** (key
  still held, no call active = pure radio PTT role). Key↑ later → R-TX Inactive.

#### Radio Prio button

**Toggle ON (key not held):** `set_radio_prio(true)` matches `(PushToMute,
call_pressed=false)` → `set_input_muted(true)` immediately. `implicit_radio_prio` is
NOT set (condition requires `!prio = false`). `effective_prio = true`. Key↓ → R-TX
Active only (MIC already muted). Key↑ → R-TX Inactive only (unmute suppressed).

**Toggle ON (key held):** `call_pressed = true` → `_ => {}` → no immediate MIC change.
`implicit_radio_prio` is NOT set. `effective_prio = true`. Key↑ → R-TX Inactive, MIC
stays muted (unmute suppressed).

**Toggle OFF (key not held):** `set_radio_prio(false)` matches `(PushToMute, false)` →
`set_input_muted(false)` immediately. `implicit_radio_prio` NOT set (`radio_pressed =
false`). PTM coupling resumes: key↓ = Muted + R-TX Active; key↑ = Unmuted + R-TX
Inactive.

**Toggle OFF (key held):** `call_pressed = true` → no immediate MIC change.
`radio_pressed = true` → `implicit_radio_prio = true`. `effective_prio = false (prio
just set to false)`. Key↑ → MIC **unmutes** (PTM arm fires) + R-TX Inactive. Cleanup
clears `implicit_radio_prio`.