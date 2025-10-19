import { Room, RoomEvent, Track } from "livekit-client";
import { env } from "~/lib/env";
import type {
  ConnectionState,
  LocalParticipantState,
  Participant,
} from "./types.ts";

export class VideoCallController {
  room: Room;
  mediaEls = new Map<string, HTMLMediaElement>();
  connectionState = $state<ConnectionState>({ connected: false });
  localParticipantState = $state<LocalParticipantState>({
    identity: "",
    name: "",
    isActive: false,
    isMicrophoneEnabled: false,
    isCameraEnabled: false,
  });

  constructor() {
    this.room = new Room();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Track events
    this.room.on(
      RoomEvent.TrackSubscribed,
      (track, _publication, _participant) => {
        console.log("Track subscribed:", track.kind, _participant.identity);
        if (
          track.kind === Track.Kind.Video ||
          track.kind === Track.Kind.Audio
        ) {
          const el = track.attach();
          this.mediaEls.set(`${_participant.identity}-${track.kind}`, el);
        }
      },
    );

    this.room.on(
      RoomEvent.TrackUnsubscribed,
      (track, _publication, _participant) => {
        console.log("Track unsubscribed:", track.kind, _participant.identity);
        const key = `${_participant.identity}-${track.kind}`;
        const el = this.mediaEls.get(key);
        if (el) {
          el.remove();
          this.mediaEls.delete(key);
        }
      },
    );

    // Local participant events
    this.room.on(
      RoomEvent.LocalTrackPublished,
      (_publication, _participant) => {
        console.log("Local track published");
        this.updateLocalParticipantState();
      },
    );

    this.room.on(
      RoomEvent.LocalTrackUnpublished,
      (_publication, _participant) => {
        console.log("Local track unpublished");
        this.updateLocalParticipantState();
      },
    );

    // Connection events
    this.room.on(RoomEvent.Connected, () => {
      console.log("Room connected");
      this.connectionState = {
        connected: true,
        roomName: this.room.name || "Unknown",
        participantCount: this.room.numParticipants,
      };
      this.updateLocalParticipantState();
    });

    this.room.on(RoomEvent.Disconnected, () => {
      console.log("Room disconnected");
      this.connectionState = { connected: false };
      this.updateLocalParticipantState();
    });

    // Participant events
    this.room.on(RoomEvent.ParticipantConnected, (_participant) => {
      console.log("Participant connected:", _participant.identity);
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (_participant) => {
      console.log("Participant disconnected:", _participant.identity);
    });

    // Track mute/unmute events
    this.room.on(RoomEvent.TrackMuted, (_publication, _participant) => {
      console.log("Track muted:", _publication.kind, _participant.identity);
      if (_participant === this.room.localParticipant) {
        this.updateLocalParticipantState();
      }
    });

    this.room.on(RoomEvent.TrackUnmuted, (_publication, _participant) => {
      console.log("Track unmuted:", _publication.kind, _participant.identity);
      if (_participant === this.room.localParticipant) {
        this.updateLocalParticipantState();
      }
    });
  }

  get allParticipants(): Participant[] {
    return [
      this.room.localParticipant,
      ...Array.from(this.room.remoteParticipants.values()),
    ];
  }

  get remoteParticipants() {
    return this.room.remoteParticipants;
  }

  updateLocalParticipantState() {
    const localParticipant = this.room.localParticipant;
    if (localParticipant) {
      this.localParticipantState.identity = localParticipant.identity || "";
      this.localParticipantState.name = localParticipant.name || "";
      this.localParticipantState.isActive = localParticipant.isActive;
      this.localParticipantState.isMicrophoneEnabled =
        localParticipant.isMicrophoneEnabled;
      this.localParticipantState.isCameraEnabled =
        localParticipant.isCameraEnabled;
    }
  }

  async joinRoom(token: string) {
    try {
      // 既に接続している場合は切断
      if (this.connectionState.connected) {
        await this.room.disconnect();
      }

      await this.room.connect(env.PUBLIC_LIVEKIT_WSURL, token, {
        autoSubscribe: true,
      });
      // 接続状態は RoomEvent.Connected で自動更新される
    } catch (error) {
      console.error("Failed to join room:", error);
      this.connectionState = { connected: false };
    }
  }

  async toggleMicrophone() {
    try {
      await this.room.localParticipant.setMicrophoneEnabled(
        !this.localParticipantState.isMicrophoneEnabled,
      );
      // State will be updated automatically via TrackMuted/TrackUnmuted events
    } catch (error) {
      console.error("Failed to toggle microphone:", error);
    }
  }

  async toggleCamera() {
    try {
      await this.room.localParticipant.setCameraEnabled(
        !this.localParticipantState.isCameraEnabled,
      );
      if (this.localParticipantState.isCameraEnabled) {
        setTimeout(() => {
          this.attachLocalVideoTrack();
        }, 1000);
      }
      // State will be updated automatically via TrackMuted/TrackUnmuted events
    } catch (error) {
      console.error("Failed to toggle camera:", error);
    }
  }

  async disconnect() {
    try {
      await this.room.disconnect();
      // 接続状態は RoomEvent.Disconnected で自動更新される
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  }

  attachLocalVideoTrack() {
    const localParticipant = this.room.localParticipant;
    if (localParticipant?.isCameraEnabled) {
      const videoTrack = localParticipant.videoTrackPublications
        .values()
        .next().value;
      if (videoTrack?.track) {
        const el = videoTrack.track.attach();
        this.mediaEls.set("local-video", el);
      }
    }
  }
}
