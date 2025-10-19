# Voice Chat Architecture (Convex-Hosted)

Goals

- Low-latency, reliable voice in rooms with mute, speaking indicators, and reconnection.
- Scale from huddles to large rooms; enable recording and moderation later.

High-Level

- Control plane (Convex): auth, room state, presence, SFU/TURN token minting.
- Media/signaling (SFU): LiveKit recommended for scalable audio routing.
- Client: WebRTC with Opus 48 kHz, AEC/NS/AGC; simple voice UI.

Components

- Convex Voice Module
  - join/leave room; setMute/setDevice; heartbeat.
  - mint SFU (LiveKit) access tokens; issue TURN `iceServers` creds (TTL).
  - enforce org/channel permissions for join/mute/kick.
- SFU (LiveKit or mediasoup)
  - Handles WS signaling and RTP forwarding; recording and moderation hooks.
- TURN/STUN
  - `coturn` over TLS (`turns:`) with long‑term/HMAC creds.

Client Flow

1. Call Convex `joinVoiceRoom(roomId)`.
   - Returns: `{ roomState, iceServers, sfu: { url, token } }`.
2. Create SFU connection and publish mic.
3. Render participant list (Convex room state + SFU events).
4. Handle device change + ICE restart; VAD for speaking indicator.

Auth & Security

- Convex mints short‑lived SFU tokens: claims `sub`, `room`, `role`, `exp`.
- Rate‑limit Convex voice actions (QPS, payload size); audit logs.
- TLS everywhere; DTLS‑SRTP for media. Optional E2EE via Insertable Streams.

Room Model (Convex)

- `voiceRooms` (orgId, channelId, active, createdAt).
- `voiceParticipants` (roomId, userId, muted, device, joinedAt, lastSeen, speaking).
- TTL cleanup on `lastSeen` via periodic task.

Directory Plan

- `packages/convex/src/convex/voice/`
  - `rooms.ts` (create/get/join/leave)
  - `participants.ts` (setMute/setDevice/heartbeat)
  - `tokens.ts` (mint SFU + TURN creds)
  - `cleanup.ts` (TTL tasks)
- `packages/client/src/features/voice/`
  - `components/`
    - `JoinButton.svelte`, `VoicePanel.svelte`, `DevicePicker.svelte`
  - `livekit.ts` (connect/publish helpers)
- `servers/livekit/` (livekit definition)

Operations

- Deployment: reuse Convex deployment; run SFU per region; multi‑region TURN.
- Observability: metrics `rooms_active`, `participants_active`, `join_latency_ms`, `actions_rate`, `sfu_join_failures`, `turn_alloc_failures`.
- Logs: include `roomId`, `userId`, `callId`, `region`; client periodically posts `getStats()` summaries to Convex.

Milestones

- M1: Convex join/leave + token mint + LiveKit connect; participant list; local mute.
- M2: TURN enabled; device switch + ICE restart; speaking indicator.
- M3: Server‑side mute/kick; TTL cleanup; rate‑limits; basic metrics.
- M4: Recording/transcription path; regional routing; admin tools.

Open Items

- Target max participants per room; recording/E2EE requirements; regional rollout order.
