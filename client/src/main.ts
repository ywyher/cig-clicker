import kaplay from "kaplay";
import { createLobbyScene } from "./scenes/lobby";
import { RoomState } from "../../server/src/rooms/schema/room-state";
import { client } from "./lib/colyseus";
import { PlayerType } from "../../server/src/rooms/schema/player";
import { createGameScene } from "./scenes/game";
import { createDashboardScene } from "./scenes/dashboard";
import { Room } from "@colyseus/sdk";
import { createGameOverScene } from "./scenes/game-over";
import { GAP_MS } from "../../server/src/constants/question";

export const k = kaplay({
  pixelDensity: Math.min(window.devicePixelRatio, 2),
  background: "black"
});
k.loadFont("font", "/fonts/minecraftia-regular.ttf");

function saveSession(room: Room<RoomState>) {
  localStorage.setItem("reconnectionToken", room.reconnectionToken);
}

function clearSession() {
  localStorage.removeItem("reconnectionToken");
}

createLobbyScene();
createGameScene();
createDashboardScene();
createGameOverScene();

// k.scene("main", () => {
//   const reconnectionToken = localStorage.getItem("reconnectionToken");

//   (async () => {
//     if (window.location.pathname === "/admin") {
//       if (reconnectionToken) {
//         const status = k.add([
//           k.text("Reconnecting..."),
//           k.pos(k.center()),
//           k.anchor("center"),
//         ]);
//         try {
//           const room = await client.reconnect<RoomState>(reconnectionToken);
//           saveSession(room);
//           status.destroy();
//           await new Promise<void>(resolve => room.onStateChange.once(() => resolve()));
//           k.go(room.state.phase === "lobby" ? "lobby" : "dashboard", room, { isAdmin: true });
//           return;
//         } catch (e) {
//           clearSession();
//           status.destroy();
//         }
//       }

//       const room = await client.joinOrCreate<RoomState>("main_room", {
//         name: "admin",
//         isAdmin: true,
//       });
//       saveSession(room);
//       k.go("lobby", room, { isAdmin: true });
//       return;
//     }

//     if (reconnectionToken) {
//       const status = k.add([
//         k.text("Reconnecting..."),
//         k.pos(k.center()),
//         k.anchor("center"),
//       ]);
//       try {
//         const room = await client.reconnect<RoomState>(reconnectionToken);
//         saveSession(room);
//         status.destroy();
//         await new Promise<void>(resolve => room.onStateChange.once(() => resolve()));
//         k.go(room.state.phase, room);
//         return;
//       } catch (e) {
//         clearSession();
//         status.destroy();
//       }
//     }

//     showLoginUI();
//   })();

//   function showLoginUI() {
//     let input = k.add([
//       k.text(""),
//       k.textInput(),
//       k.pos(k.center()),
//       k.anchor("center"),
//       "usernameInput",
//     ]);

//     let hint = k.add([
//       k.text("Enter your name and press Enter", { size: 24 }),
//       k.pos(k.center().x, k.center().y + 40),
//       k.anchor("center"),
//     ]);

//     k.onKeyPress("enter", async () => {
//       const username = input.text.trim() || "Player";

//       hint.destroy();
//       input.destroy();

//       const status = k.add([
//         k.text("Joining room..."),
//         k.pos(k.center()),
//         k.anchor("center"),
//       ]);

//       try {
//         const room = await client.join<RoomState>("main_room", {
//           name: username,
//         } as PlayerType);
//         saveSession(room);
//         room.send("join");
//         k.go("lobby", room);
//       } catch (e) {
//         const msg = e instanceof Error ? e.message : "Failed to connect.";
//         status.destroy();

//         k.add([
//           k.text(msg),
//           k.pos(k.center().x, k.center().y - 100),
//           k.anchor("center"),
//         ]);

//         showLoginUI();  // re-show on error instead of mutating let vars
//       }
//     });
//   }
// });

k.scene("main_dev", async () => {
  const room = await client.joinOrCreate<RoomState>("main_room", {
    name: "player"
  });

  console.log("ghiiaiodasd")
  room.send("start")
  k.go("game", room, { firstQuestionAt: Date.now() + GAP_MS })
})

// k.go("main")
k.go("main_dev")