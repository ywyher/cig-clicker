import type { GameObj, Vec2 } from "kaplay";
import { RoomState } from "../../../server/src/rooms/schema/room-state";
import { Player } from "../../../server/src/rooms/schema/player";
import { Room } from "@colyseus/sdk";
import { k } from "../main";

// Needs room state and player instance for server communication and player data
export default (room: Room<RoomState>, player: Player) => ([
    k.anchor("center"),
    k.body({ isStatic: true }), // won't be affected/moved when hit
    k.scale(0), // we will scale-in player on spawn
    "player",
    {
        // Define a bunch of useful properties
        sessionId: player.sessionId,
        moveLerp: 12, // for position interpolation
        overshootLerp: 30, // for fast movement interpolation
        controllable: true, // e.g. disable when resetting player on goal
            add(this: GameObj) {
        // Scale player in with nice transition once added
        k.tween(this.scale, k.vec2(1), 0.25, v => this.scale = v, k.easings.easeOutBack);

        // Raytracing :)
        this.add([
            k.anchor("center"),
            k.opacity(0.2),
        ]);

        const moveOffset = {
            x: this.width / 2,
            y: this.height / 2,
            overshoot: 10,
        };

        this.moveMinMax = {
            x: Object.values(player.team == "left" ? {
                min: moveOffset.x,
                max: k.width() / 2 - moveOffset.x + moveOffset.overshoot,
            } : {
                min: k.width() / 2 + moveOffset.x - moveOffset.overshoot,
                max: k.width() - moveOffset.x,
            }),
            y: Object.values({
                min: moveOffset.y,
                max: k.height() - moveOffset.y,
            })
        };

        if (player.sessionId == room.sessionId) onLocalPlayerCreated(room, this);
    },
  },
]);