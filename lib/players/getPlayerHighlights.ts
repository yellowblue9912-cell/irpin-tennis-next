export type PlayerHighlight = {
  id: string;
  type: "video";
  src: string;
  title: string;
  description?: string;
};

const highlightsByPlayer: Record<string, PlayerHighlight[]> = {
  "vlad-tsvitsinskyi": [
    {
      id: "vlad-tsvitsinskyi-highlight-1",
      type: "video",
      src: "/highlights/vlad-tsvitsinskyi-1.mp4",
      title: "Відео за участі Влада Цвіцінського",
      description: "Влад грає у червоній футболці.",
    },
  ],
  "vadym-buchkaryk": [
    {
      id: "vadym-buchkaryk-highlight-1",
      type: "video",
      src: "/highlights/vadym-buchkaryk-1.mp4",
      title: "Відео за участі Вадима Бучкарика",
      description: "Вадим грає у жовтій футболці.",
    },
  ],
};

export function getPlayerHighlights(slug: string): PlayerHighlight[] {
  return highlightsByPlayer[slug] ?? [];
}
