import { Room as ColyRoom, Client, CloseCode, AuthContext } from "colyseus";
import { Player, PlayerType } from "./schema/player";
import { RoomState } from "./schema/room-state";

export class Room extends ColyRoom {
  maxClients = 4;
  state = new RoomState();
  private reconnections = new Map<string, ReturnType<typeof this.allowReconnection>>();
  
  messages = {
    start: (client: Client) => {
      if (client.sessionId !== this.state.adminId) return; // ignore non-admin
      this.state.phase = "game"
      this.lock()
      this.broadcast("game_start");
    },
    terminate: (client: Client) => {
      if (client.sessionId !== this.state.adminId) return; // ignore non-admin
      this.disconnect()
      this.broadcast("terminate_room");
    },
    click: (client: Client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      player.score++;
    },
    game_over: (_: Client, { winnerId }: { winnerId: string }) => {
      this.broadcast("game_over", {
        winnerId: winnerId
      });
    }
  }

  onJoin(client: Client, options: PlayerType & { isAdmin?: boolean }) {
    console.log(options, "joined!");
    if (options?.isAdmin) {
      this.state.adminId = client.sessionId;
      return;
    }

    const player = new Player();
    player.name = options.name
    
    this.state.players.set(client.sessionId, player);
  }
  
  async onAuth(client: Client, options: PlayerType & { isAdmin?: boolean }) {
    if (options?.isAdmin) return true;

    if (this.state.phase === "game") throw new Error("Game already started")

    const nameTaken = [...this.state.players.values()].some(
      p => p.name.toLowerCase() === options.name.toLowerCase()
    );
    
    if (nameTaken) throw new Error("Username already taken, Try another one.");
    
    return true;
  }

  async onLeave (client: Client) {
    if (client.sessionId === this.state.adminId) {
      try {
        const reconnection = this.allowReconnection(client, 10);
        this.reconnections.set(client.sessionId, reconnection);
        await reconnection;
        this.reconnections.delete(client.sessionId);
      } catch (e) {
        // Admin timed out - kill the room
        this.reconnections.delete(client.sessionId);
        this.disconnect();
      }
      return;
    }

    // Mark player as disconnected
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    player.connected = false;

    try {
      const reconnection = this.allowReconnection(client, 10);
      this.reconnections.set(client.sessionId, reconnection);
      await reconnection; // resolves if client reconnects, rejects if timeout
      player.connected = true; 
      this.reconnections.delete(client.sessionId); // Client reconnected 
    } catch (e) {
      // Timed out -> remove for real
      this.reconnections.delete(client.sessionId);
      this.state.players.delete(client.sessionId);
      this.broadcast("player_left", client.sessionId);
    }
  }

  onDispose() {
    /**
     * Called when the room is disposed.
     */
    console.log("room", this.roomId, "disposing...");
  }

}
