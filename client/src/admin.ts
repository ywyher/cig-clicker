import { RoomState } from "../../server/src/rooms/schema/room-state";
import { client } from "./lib/colyseus";
import { k } from "./main";

async function main() {
  const adminKey = new URLSearchParams(window.location.search).get("key");
  if (!adminKey) {
    document.body.innerText = "Missing key.";
    return;
  }

  await client.joinOrCreate<RoomState>("main_room", { adminKey });
  k.go("lobby")
  // const btn = document.createElement("button");
  // btn.textContent = "Start game";
  // btn.onclick = () => room.send("start");
  // document.body.appendChild(btn);

  // // Show live player count
  // const count = document.createElement("p");
  // document.body.appendChild(count);
  // room.onStateChange(() => {
  //   count.textContent = `Players: ${room.state.players.size}`;
  // });
}

main();