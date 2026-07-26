export type PlayerHighlight = {
  id: string;
  type: "video";
  src: string;
  title: string;
  description?: string;
};

const highlightsByPlayer: Record<string, PlayerHighlight[]> = {
  "vadym-buchkaryk": [
    {
      id: "vadym-buchkaryk-highlight-1",
      type: "video",
      src: "/highlights/vadym-buchkaryk-1.mp4",
      title: "Вадим Бучкарик",
      description: "Вадим — у жовтій футболці.",
    },
  ],
};

export function getPlayerHighlights(slug: string): PlayerHighlight[] {
  return highlightsByPlayer[slug] ?? [];
}
