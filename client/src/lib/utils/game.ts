import { k } from "../../main";
export const CHOICE_LABELS = ["A", "B", "C", "D"];

export function showQuestion({
  question,
  onAnswer,
  trackObj // to later destroy them on expirey
}: {
  question: { id: number; text: string; choices: string[] };
  onAnswer: (choiceIndex: number) => void;
  trackObj: (obj: ReturnType<typeof k.add>) => void;
}) {
  const overlay = k.add([k.rect(k.width(), k.height()), k.pos(0, 0),
    k.color(0, 0, 0), k.opacity(0.55), k.z(10), k.fixed()]);
  trackObj(overlay);

  const cardW = 500, cardH = 280;
  const cardX = k.width() / 2 - cardW / 2;
  const cardY = k.height() / 2 - cardH / 2;

  const card = k.add([k.rect(cardW, cardH, { radius: 12 }), k.pos(cardX, cardY),
    k.color(245, 245, 245), k.z(11), k.fixed()]);
  trackObj(card);

  const questionText = k.add([k.text(question.text, { size: 18, width: cardW - 40, font: "font" }),
    k.pos(cardX + 20, cardY + 20), k.color(30, 30, 30), k.z(12), k.fixed()]);
  trackObj(questionText);

  question.choices.forEach((choice, i) => {
    const btnY = cardY + 110 + i * 42;

    const btn = k.add([k.rect(cardW - 40, 34, { radius: 6 }), k.pos(cardX + 20, btnY),
      k.color(220, 220, 220), k.area(), k.z(12), k.fixed()]);
    trackObj(btn);

    const btnLabel = k.add([k.text(`${CHOICE_LABELS[i]}.  ${choice}`, { size: 14, font: "font" }),
      k.pos(cardX + 36, btnY + 8), k.color(40, 40, 40), k.z(13), k.fixed()]);
    trackObj(btnLabel);

    btn.onClick(() => onAnswer(i));
  });
}