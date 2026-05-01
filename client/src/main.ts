import kaplay from "kaplay";
import { createLobbyScene } from "./scenes/lobby";
import { RoomState } from "../../server/src/rooms/schema/room-state";
import { client } from "./lib/colysues";
import { PlayerType } from "../../server/src/rooms/schema/player";
import { createGameScene } from "./scenes/game";
import { createDashboardScene } from "./scenes/dashboard";
import { Room } from "@colyseus/sdk";

export const k = kaplay({
  pixelDensity: Math.min(window.devicePixelRatio, 2),
  background: "black"
});

function saveSession(room: Room<RoomState>) {
  localStorage.setItem("reconnectionToken", room.reconnectionToken);
}

function clearSession() {
  localStorage.removeItem("reconnectionToken");
}

createLobbyScene();
createGameScene();
createDashboardScene();

k.scene("main", async () => {
  const reconnectionToken = localStorage.getItem("reconnectionToken");

  if (window.location.pathname === "/admin") {
    if (reconnectionToken) {
      let status = k.add([
        k.text("Reconnecting..."),
        k.pos(k.center()),
        k.anchor("center"),
      ]);
      try {
        const room = await client.reconnect<RoomState>(reconnectionToken);
        saveSession(room);
        status.destroy();
        k.go("lobby", room, { isAdmin: true });
        return;
      } catch (e) {
        clearSession();
        status.destroy();
        // fall through to fresh join
      }
    }

    const room = await client.joinOrCreate<RoomState>("main_room", { 
      name: "admin",
      isAdmin: true
    });
    saveSession(room);
    k.go("lobby", room, { isAdmin: true })
    return;
  }

  if (reconnectionToken) {
    let status = k.add([
      k.text("Reconnecting..."),
      k.pos(k.center()),
      k.anchor("center"),
    ]);
    try {
      const room = await client.reconnect<RoomState>(reconnectionToken);
      saveSession(room);
      status.destroy();
      k.go("lobby", room);
      return;
    } catch (e) {
      // Reconnection failed (timed out) - clear storage and fall through to login
      clearSession();
      status.destroy();
    }
  }

  let input = k.add([
    k.text(""),
    k.textInput(),
    k.pos(k.center()),
    k.anchor("center"),
    "usernameInput"
  ]);

  let hint = k.add([
    k.text("Enter your name and press Enter", { size: 16 }),
    k.pos(k.center().x, k.center().y + 40),
    k.anchor("center"),
  ]);

  k.onKeyPress("enter", async () => {
    const username = input.text.trim() || "Player";
  
    hint.destroy();
    input.destroy();
  
    let status = k.add([
      k.text("Joining room..."),
      k.pos(k.center()),
      k.anchor("center"),
    ]);
    
    try {
      const room = await client.join<RoomState>("main_room", {
        name: username,
      } as PlayerType);
      saveSession(room);
      k.go("lobby", room);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to connect.";
      status.destroy()

      status = k.add([
        k.text(msg),
        k.pos(k.center().x, k.center().y - 100),
        k.anchor("center"),
      ]);

      input = k.add([
        k.text(""),
        k.textInput(),
        k.pos(k.center()),
        k.anchor("center"),
        "usernameInput"
      ]);

      hint = k.add([
        k.text("Enter your name and press Enter", { size: 16 }),
        k.pos(k.center().x, k.center().y + 40),
        k.anchor("center"),
      ]);
    }
  });
})

k.go("main")