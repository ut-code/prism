import { Room, type RoomOptions } from "livekit-client";
import { env } from "$lib/env.ts";

// Room configuration to ensure server-side routing
const roomOptions: RoomOptions = {
  adaptiveStream: true,
  dynacast: true,
};

export const room = new Room(roomOptions);

// Generate a unique room name
function generateRoomName(): string {
  return `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Connect to room and enable camera/microphone
export async function initializeRoom(roomName?: string) {
  try {
    const finalRoomName = roomName || generateRoomName();

    console.log("Connecting to LiveKit server:", env.PUBLIC_LIVEKIT_WSURL);
    console.log("Room name:", finalRoomName);

    await room.connect(env.PUBLIC_LIVEKIT_WSURL, env.PUBLIC_LIVEKIT_TOKEN, {
      // Ensure server-side processing
      autoSubscribe: true,
    });

    console.log("Connected to room:", room.name);
    console.log("Room participants:", room.numParticipants);

    // Don't enable camera and microphone by default
    // Users can enable them manually using the UI controls
    console.log("Connected to room - camera and microphone are off by default");

    return room;
  } catch (error) {
    console.error("Failed to connect to room:", error);
    throw error;
  }
}
