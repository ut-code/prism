import type { LocalParticipant, RemoteParticipant } from "livekit-client";

export interface LocalParticipantState {
  identity: string;
  name: string;
  isActive: boolean;
  isMicrophoneEnabled: boolean;
  isCameraEnabled: boolean;
}

export type ConnectionState =
  | {
      connected: false;
    }
  | {
      connected: true;
      roomName: string;
      participantCount: number;
    };

export type Participant = LocalParticipant | RemoteParticipant;
