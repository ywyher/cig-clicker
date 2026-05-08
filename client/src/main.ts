import kaplay from "kaplay";
import { createLobbyScene } from "./scenes/lobby";
import { RoomState } from "../../server/src/rooms/schema/room-state";
import { client } from "./lib/colyseus";
import { PlayerType } from "../../server/src/rooms/schema/player";
import { createGameScene } from "./scenes/game";
import { createDashboardScene } from "./scenes/dashboard";
import { Room } from "@colyseus/sdk";
import { createGameOverScene } from "./scenes/game-over";
import { QUESTION_INTERVAL_MS } from "../../server/src/constants/question";

export const k = kaplay({
  width: 430,
  height: 932,
  letterbox: true,
  background: [20, 20, 20],
  pixelDensity: Math.min(window.devicePixelRatio, 2),
  crisp: true,
});

k.loadFont("font", "/fonts/minecraftia-regular.ttf");
k.loadSprite("bg", "/sprites/background.png");

const BASE_WIDTH = 300;
const BASE_HEIGHT = 200;

function saveSession(room: Room<RoomState>) {
  localStorage.setItem("reconnectionToken", room.reconnectionToken);
}

function clearSession() {
  localStorage.removeItem("reconnectionToken");
}

// function requestFullscreen() {
//   const el = document.documentElement;
//   if (el.requestFullscreen) {
//     el.requestFullscreen().catch(() => {});
//   } else if ((el as any).webkitRequestFullscreen) {
//     (el as any).webkitRequestFullscreen();
//   }
// }

// requestFullscreen();
// document.addEventListener("touchstart", requestFullscreen, { once: true });
// document.addEventListener("click", requestFullscreen, { once: true });

createLobbyScene();
createGameScene();
createDashboardScene();
createGameOverScene();

k.scene("main", () => {
  k.add([
    k.sprite("bg"),
    k.pos(0, 0),
    k.scale(k.width() / BASE_WIDTH, k.height() / BASE_HEIGHT),
    k.fixed(),
    k.z(-100),
  ]);

  const reconnectionToken = localStorage.getItem("reconnectionToken");

  (async () => {
    if (window.location.pathname === "/admin") {
      if (reconnectionToken) {
        const status = k.add([
          k.text("Reconnecting..."),
          k.pos(k.center()),
          k.anchor("center"),
        ]);
        try {
          const room = await client.reconnect<RoomState>(reconnectionToken);
          saveSession(room);
          status.destroy();
          await new Promise<void>(resolve => room.onStateChange.once(() => resolve()));
          k.go(room.state.phase === "lobby" ? "lobby" : "dashboard", room, { isAdmin: true });
          return;
        } catch (e) {
          clearSession();
          status.destroy();
        }
      }

      const room = await client.joinOrCreate<RoomState>("main_room", {
        name: "admin",
        isAdmin: true,
      });
      saveSession(room);
      k.go("lobby", room, { isAdmin: true });
      return;
    }

    if (reconnectionToken) {
      const status = k.add([
        k.text("Reconnecting..."),
        k.pos(k.center()),
        k.anchor("center"),
      ]);
      try {
        const room = await client.reconnect<RoomState>(reconnectionToken);
        saveSession(room);
        status.destroy();
        await new Promise<void>(resolve => room.onStateChange.once(() => resolve()));
        k.go(
          room.state.phase,
          room,
          room.state.phase === "game"
            ? { firstQuestionAt: Date.now() + QUESTION_INTERVAL_MS }
            : undefined
        );
        return;
      } catch (e) {
        clearSession();
        status.destroy();
      }
    }

    showLoginUI();
  })();

  function showLoginUI() {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter your name...";
    input.maxLength = 20;
    input.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 20px;
      padding: 10px 16px;
      border: 2px solid white;
      border-radius: 8px;
      background: #111;
      color: white;
      text-align: center;
      outline: none;
      z-index: 9999;
      width: 220px;
    `;
    document.body.appendChild(input);
    input.focus();

    const error = k.add([
      k.text("", { 
        size: 24,
        styles: {
          error: {
            color: k.rgb('red')
          }
        }
      }),
      k.pos(k.center().x, k.center().y - 80),
      k.anchor("center"),
    ]);
    const btn = k.add([
      k.rect(160, 50, { radius: 8 }),
      k.color(255, 255, 255),
      k.pos(k.center().x, k.center().y + 80),
      k.anchor("center"),
      k.area(),
    ]);
    btn.add([
      k.text("Join", { size: 24 }),
      k.color(0, 0, 0),
      k.anchor("center"),
    ]);

    function cleanup() {
      document.body.removeChild(input);
      btn.destroy();
    }

    async function submit() {
      const username = input.value.trim();
      
      if (!username) {
        error.text = "[error]Username is required![/error]"
        return;
      }

      const status = k.add([
        k.text("Joining room..."),
        k.pos(k.center()),
        k.anchor("center"),
      ]);

      try {
        const room = await client.join<RoomState>("main_room", {
          name: username,
        } as PlayerType);
        saveSession(room);
        k.setFullscreen(true)
        cleanup();
        room.send("join");
        k.go("lobby", room);
      } catch (e) {
        const msg = e instanceof Error ? `[error]${e.message}[/error]` : "[error]Failed to connect.[/error]";
        status.destroy();
        error.text = msg;
        showLoginUI();
      }
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit();
    });
    btn.onClick(() => submit());
  }
});

k.scene("main_dev", async () => {
  const room = await client.joinOrCreate<RoomState>("main_room", {
    name: "player",
  });

  room.send("start");
  k.go("game", room, { firstQuestionAt: Date.now() + QUESTION_INTERVAL_MS });
});

k.go("main");
// k.go("main_dev")