import kaplay from "kaplay";
import { createLobbyScene } from "./scenes/lobby";
import { RoomState } from "../../server/src/rooms/schema/room-state";
import { client } from "./lib/colysues";
import { PlayerType } from "../../server/src/rooms/schema/player";
import { createGameScene } from "./scenes/game";
import { createDashboardScene } from "./scenes/dashboard";

export const k = kaplay({
  pixelDensity: Math.min(window.devicePixelRatio, 2),
  background: "black"
});

k.loadSprite("bean", "sprites/bean.png");

createLobbyScene();
createGameScene();
createDashboardScene();

k.scene("main", async () => {

  if (window.location.pathname === "/admin") {
    const room = await client.joinOrCreate<RoomState>("main_room", { 
      name: "admin",
      isAdmin: true
    });
    k.go("lobby", room, { isAdmin: true })
    return;
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
      const room = await client.joinOrCreate<RoomState>("main_room", {
        name: username,
      } as PlayerType);
      k.go("lobby", room);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to connect.";
      status.destroy()

      status = k.add([
        k.text(msg),
        k.pos(k.center().x, k.center().y - 100),
        k.anchor("center"),
      ]);

      // re-add input and hint
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