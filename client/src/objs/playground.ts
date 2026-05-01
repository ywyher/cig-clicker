import type { GameObj } from "kaplay";
import { k } from "../main";

export default () => [
    k.pos(),
    k.z(0),
    {
        add(this: GameObj) {
            const field = this.add([
                k.anchor("center"),
                k.pos(k.center()),
                k.rect(k.width() - 20, k.height() - 20, { radius: 100 }),
                k.outline(10, k.WHITE),
                k.opacity(0.4),
            ]);

            field.onDraw(() => {
                k.drawMasked(() => {
                    // Background center circle
                    k.drawCircle({
                        radius: 114,
                        color: k.Color.fromHex("c9ddff"),
                    });

                    // Middle line
                    k.drawRect({
                        anchor: "center",
                        height: field.height - 5,
                        width: 20,
                        color: k.Color.fromHex("adb2f0"),
                        outline: {
                            width: 4,
                            color: k.Color.fromHex("c9ddff"),
                        },
                    });

                    // Foreground center circle
                    k.drawCircle({
                        radius: 100,
                        color: k.Color.fromHex("bbd4ff"),
                        outline: {
                            width: 20,
                            color: k.Color.fromHex("adb2f0"),
                        },
                    });

                    // Small middle circle
                    k.drawCircle({
                        radius: 16,
                        color: k.Color.fromHex("834dc4"),
                        outline: {
                            width: 4,
                            color: k.Color.fromHex("d6e5ff"),
                        },
                    });

                    // Reflections
                    [
                        [-450, 20],
                        [-400, 60],
                        [0, 60],
                        [50, 20],
                    ].forEach(([x, w]) =>
                        k.drawLine({
                            p1: k.vec2(x + 400, -field.height),
                            p2: k.vec2(x, field.height),
                            width: w,
                            opacity: 0.2,
                        })
                    );
                }, () => {
                    // Field mask
                    k.drawRect({
                        anchor: "center",
                        width: field.width - 10,
                        height: field.height - 10,
                        radius: +(field?.radius ?? 100) - 10,
                    });
                });
            });
        },
    },
];