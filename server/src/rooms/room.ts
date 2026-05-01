import { Room as ColyRoom, Client, CloseCode, AuthContext } from "colyseus";
import { Player, PlayerType } from "./schema/player";
import { RoomState } from "./schema/room-state";

export class Room extends ColyRoom {
  maxClients = 4;
  state = new RoomState();

  messages = {
    start: (client: Client) => {
      if (client.sessionId !== this.state.adminId) return; // ignore non-admin
      this.state.phase = "game"
      this.lock()
      this.broadcast("game_start");
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

  onLeave (client: Client, code: CloseCode) {
    if (client.sessionId === this.state.adminId) {
      this.disconnect();
      return;
    }

    this.state.players.delete(client.sessionId);
    this.broadcast("player_left", client.sessionId);
  }

  onDispose() {
    /**
     * Called when the room is disposed.
     */
    console.log("room", this.roomId, "disposing...");
  }

}
