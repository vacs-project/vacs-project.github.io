---
sidebar_position: 4
---

# Conference calls

Sometimes a coordination needs more than two controllers on the line. **vacs** lets you add further sectors to a call that is already running, so everyone hears everyone else. This article explains how to build such a conference, who is allowed to change it, and what you see while it runs.

Usually a conference grows out of an existing call: call the first sector, wait for it to answer, and then add the others. If your FIR has set up a [conference key](#conference-keys) for the sectors you need, one press calls all of them at once.

---

## Adding a sector to a running call

The **CONF** button in the top button row is the switch for this. It stays greyed out until a call is established and its audio is connected, and it is greyed out for you if somebody else is running the conference.

To add a sector:

1. Press **CONF**. It turns dark blue and starts blinking, which means the next key you press adds a sector to the call instead of starting a new one.
2. Press the **Direct Access Key** of the sector you want to add. It starts ringing there just like a normal call.

Instead of a Direct Access Key you can also use any other way of placing a call: a key on a client page, a CID entered on the **Dial Pad**, or the **Call** button in the **Telephone Directory** or the **Call List**. While **CONF** is not blinking, none of these do anything during a call, so you cannot add a sector by accident.

If you press [**PRIO**](./making-a-call.md#prio-calls) before adding a sector, its invitation rings as a priority call, exactly like a normal call would.

<img
  src="/img/using-vacs/conference-call.png"
  alt="A three-way conference call, with the CONF button lit and both other sectors in the call"
  className="screenshot"
  style={{ width: "80%" }}
/>

In the screenshot above:

1. the **CONF** button, lit because the call is a conference
2. the sector that was added through it, now in the call and shown in green like any other party

Repeat the two steps for every further sector. Do not press the key of a sector that is already in the call: that key now controls the participant behind it, and pressing it removes them or takes you out of the call. See [Removing a participant and leaving](#removing-a-participant-and-leaving). Dialing a CID on the dial pad or picking a position in the Telephone Directory that is already in the call does nothing at all.

As soon as you have invited a sector, **CONF** stops blinking and stays lit, and the call display reads **CONF**, even while the new sector is still ringing. Pressing **CONF** again re-opens the blinking mode so you can add the next sector.

Changed your mind while **CONF** blinks? Press it once more. That leaves the blinking mode without inviting anyone.

If every added sector rejects or does not answer, so that only the two of you are left, **CONF** goes dark again and the call display shows the other controller's name.

---

## Who may change the conference: the leader

Whoever adds the third party is the **conference leader**. That is the controller who pressed **CONF** and grew the call, not necessarily the one who placed the original call.

- Only the leader can add sectors or remove participants. For everyone else the **CONF** button stays greyed out.
- Leadership never moves to somebody else. It stays with the same controller for the life of the conference.
- If the **leader** hangs up or loses their connection, **the conference ends for everyone**.
- If anybody else hangs up, only they leave. The remaining controllers keep talking.
- If the conference shrinks back to **two** controllers, because participants left or were removed, it is an ordinary call again and has no leader. The call display shows the other controller's name instead of **CONF**, the **CONF** button goes dark, and either of you can press it to grow the call again. Whoever does becomes the new leader.

:::tip
Because the conference lives and dies with its leader, it is worth growing it from the position with the most reliable connection.
:::

---

## How a conference is labeled

A conference is not named after a single controller, so vacs labels it **CONF** wherever a call name would normally appear:

- on the **call display**, the bottom slot of the call queue on the right, as soon as a third sector is invited
- in the **Call List** on the Telephone page, where the Number column lists the CIDs of everyone involved
- on the **answer key** of an incoming call that is already a conference

<img
  src="/img/using-vacs/conference-call-list.png"
  alt="The Telephone page during a conference, with CONF on the call display and in the call list"
  className="screenshot"
  style={{ width: "80%" }}
/>

In the screenshot above:

1. the call display, labeled **CONF**
2. the same call in the Call List, again labeled **CONF**

---

## Removing a participant and leaving

As the **leader**, with three or more controllers in the call, press the key of the participant you want to remove. They are dropped and the rest of the conference carries on.

Everything else about pressing a key that is part of your current call works as it always has:

- If only **two** controllers have joined, pressing the other party's key ends the call, exactly like a normal call. This is also true while a third sector is still ringing, so cancel that invitation first if you want to keep the call.
- To take back an invitation **you** sent that is still ringing, press that sector's key.
- If you are **not** the leader, pressing another participant's key makes you leave the conference. You cannot remove anyone else.
- Pressing a key that shows somebody else's pending invitation does nothing.

The **END** button always applies to you: it takes you out of the call, and ends it for everyone if you are the leader.

---

## Conference keys

A **conference key** is a single key that stands for several sectors, for example all approach sectors around an airport. It sits on a Direct Access Page or on the GEO page like any other key, and it carries the label your FIR gave it. Which conference keys exist, and which sectors each one calls, is set up by your FIR.

<img
  src="/img/using-vacs/conference-key.png"
  alt="A call started with a conference key, with one of its sectors in the call and the other still ringing"
  className="screenshot"
  style={{ width: "80%" }}
/>

In the screenshot above, the conference key **S1 LOWG CONF** was just pressed:

1. the conference key, lit because both of its sectors are ringing or in the call
2. the sector that answered, now in the call
3. the sector that is still ringing, shown in green with a gray border
4. the call display, labeled **CONF**

A conference key lights up only when **every** one of its sectors is ringing or in the call, whether or not the call was started with the key. While at least one of them is still ringing, it is shown in green with a gray border, like the key of a sector you are calling. Once all of them have answered, it turns fully green. A call with just some of its sectors does not light it. Whether a sector rings, answers, rejects or cannot be reached is shown on its own key, on the pages that contain that key and on the call display, as for any other call.

When none of its sectors is online, apart from sectors you cover yourself, the key is shown flat and cannot be pressed, just like the key of a sector that is offline.

### Calling with a conference key

When you are not in a call, press the conference key. vacs calls every sector of the key that is online, all at once:

- Sectors you cover yourself are left out.
- Sectors that are offline are not called.
- If one controller covers several of the sectors, they are rung only once.
- If the sectors do not all fit into a conference, nobody is called. See [Conference size](#conference-size).

Each controller who answers joins the call. As soon as two of them have answered, the call is a conference with you as its leader, and everything in [Who may change the conference](#who-may-change-the-conference-the-leader) applies.

If you press [**PRIO**](./making-a-call.md#prio-calls) before the conference key, every sector of the key rings as a priority call.

Calls coming **in** are never shown on a conference key. When a sector of the key calls you, its own key flashes, as described in [Receiving a call](./receiving-a-call.md#incoming-call-indication).

### Using a conference key during a call

During a call, a conference key adds its sectors to the call, exactly as if you added them one by one with **CONF**:

1. Press **CONF**. It starts blinking.
2. Press the conference key. Every sector of the key that is online and not yet in the call or ringing is invited. When several sectors are invited at once, those whose controller is already in the call are left out without an error. If only one sector is left and its controller is already in the call, vacs marks that sector's own key and the top status bar reads **REMOTE TARGET PARTICIPATING**, as when you [add a single sector](#when-a-sector-cannot-be-added).

This only works when you may grow the call: you are the conference leader, or only two controllers are in the call.

While **CONF** is not blinking, pressing a conference key during a call does nothing. The key never ends, leaves or cancels a call, not even one you started with it. Use **END** for that, or the sectors' own keys to remove participants or take back an invitation.

### Older vacs versions

vacs v3.0.x does not know conference keys yet. It still shows the key with its label, but you cannot use it to call anyone. If a conference key does not call anyone for you, [update vacs](../getting-started/updating.md).

---

## When a sector cannot be added

Not every invitation succeeds. If the sector rejects the call, does not answer, or the call cannot be extended to it, its key is marked and the call carries on without it. For an error, the reason also appears at the right-hand end of the top status bar.

<img
  src="/img/using-vacs/conference-refused-target.png"
  alt="A conference call with one added sector marked in red and the reason shown in the top status bar"
  className="screenshot"
  style={{ width: "80%" }}
/>

In the screenshot above:

1. the sector that could not be added, blinking red
2. the reason for it, in the top status bar

Press the marked key to clear the marking. It stays until you do, so a refusal cannot go unnoticed while you are talking.

:::note[Sectors covered by the same controller]
Sectors are routed to whoever currently covers them, and one controller often covers several. If you add a sector that is already covered by somebody in the call, vacs marks the key and the top status bar reads **REMOTE TARGET PARTICIPATING**, as in the screenshot above. Nobody is called twice. A [conference key](#conference-keys) that lists several sectors of one controller rings that controller once, without an error.
:::

### Conference size

A conference currently holds up to **eight** controllers, you included. Sectors that are still ringing count as well: with seven controllers talking and one more sector ringing, the conference is full. The limit is set by the vacs server rather than by your client and may change.

If you try to go past it, vacs tells you so before the invitation is even sent, with a message naming the limit. A [conference key](#conference-keys) whose sectors do not all fit calls none of them. If the server refuses the invitation itself, the sector's key is marked and the top status bar reads **REMOTE MAX CONF SIZE**.

---

## Sounds

While a call is running, a controller joining or leaving is announced with its own short sound instead of the usual call start and call end sounds. Both can be turned off separately in the [Call Settings](../settings/call.md).

When you join a conference that is already running, you hear the call start sound once. You do not hear a joined sound for each controller who was already in it.

---

## When one connection in the conference fails

In a conference every controller is connected directly to every other one. A single one of those connections can fail while the rest are fine, for example when one participant's network changes mid-call.

vacs handles this on its own:

1. It retries the affected connection over one of our relay servers, which repairs most cases without anyone noticing.
2. While it retries, the affected participant is shown as disconnected. The status indicator in the top left corner stays orange even though the rest of the call is healthy, and the call display carries the disconnected icon.
3. If both sides still cannot reach each other, the controller who joined the call **later** is removed from it. For them the key of the controller they could not reach turns red, and the top status bar reads **REMOTE NO CONNECTION TO PARTICIPANT**. Everybody else keeps talking.

If the removed controller was the conference leader, the conference ends for everyone, as it always does when the leader leaves.

You do not have to do anything while this runs. If a participant disappears from the call this way, place a new call to them once their connection is back.

---

## Receiving an invitation into a conference

Nothing about answering changes: press the flashing answer key. See [Receiving a call](./receiving-a-call.md#being-invited-into-a-conference) for what an incoming conference invitation looks like.

As with any call, you are only ever in one call at a time. Incoming calls keep ringing while you are in the conference, and clicking one takes you out of the conference and accepts the new call in one step. If you are the conference leader, leaving ends the conference for everyone. To stay in the conference until you leave it with **END**, turn off [End active call on accept](../settings/call.md#end-active-call-on-accept).
