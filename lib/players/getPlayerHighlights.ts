export type PlayerHighlight = {
  id: string;
  type: "video";
  src: string;
  title: string;
  description?: string;
};

const highlightsByPlayer: Record<string, PlayerHighlight[]> = {
  "olia-aleksieieva": [
    {
      id: "olia-aleksieieva-highlight-1",
      type: "video",
      src: "/highlights/olia-aleksieieva-1.mp4",
      title: "Відео за участі Олі Алексєєвої",
    },
  ],
  "vitalii-voitenko": [
    {
      id: "vitalii-voitenko-highlight-1",
      type: "video",
      src: "/highlights/vitalii-voitenko-1.mp4",
      title: "Відео за участі Віталія Войтенка",
    },
  ],
  "oleksandr-kovalchuk": [
    {
      id: "oleksandr-kovalchuk-highlight-1",
      type: "video",
      src: "/highlights/oleksandr-kovalchuk-1.mp4",
      title: "Відео за участі Олександра Ковальчука",
    },
  ],
  "sasha-rudnytskyi": [
    {
      id: "sasha-rudnytskyi-highlight-1",
      type: "video",
      src: "/highlights/sasha-rudnytskyi-1.mp4",
      title: "Відео за участі Олександра Рудницького",
    },
  ],
  "svitlana-muzyka": [
    {
      id: "svitlana-muzyka-highlight-1",
      type: "video",
      src: "/highlights/svitlana-muzyka-1.mp4",
      title: "Відео за участі Світлани Музики",
    },
  ],
  "nazar-makushenko": [
    {
      id: "nazar-makushenko-highlight-1",
      type: "video",
      src: "/highlights/nazar-makushenko-1.mp4",
      title: "Відео за участі Назара Макушенка",
    },
  ],
  "rostyslav-svidelskyi": [
    {
      id: "rostyslav-svidelskyi-highlight-1",
      type: "video",
      src: "/highlights/rostyslav-svidelskyi-1.mp4",
      title: "Відео за участі Ростислава Свідельського",
      description: "Ростислав грає у чорній футболці.",
    },
  ],
  "andrii-cherkasov": [
    {
      id: "andrii-cherkasov-highlight-1",
      type: "video",
      src: "/highlights/andrii-cherkasov-1.mp4",
      title: "Відео за участі Андрія Черкасова",
      description: "Андрій грає у білій майці.",
    },
  ],
  "ihor-lapatiiev": [
    {
      id: "ihor-lapatiiev-highlight-1",
      type: "video",
      src: "/highlights/ihor-lapatiiev-1.mp4",
      title: "Відео за участі Ігоря Лапатієва",
    },
  ],
  "andrii-levchenko": [
    {
      id: "andrii-levchenko-highlight-1",
      type: "video",
      src: "/highlights/andrii-levchenko-1.mp4",
      title: "Відео за участі Андрія Левченка",
    },
  ],
  "myroslav-lozko": [
    {
      id: "myroslav-lozko-highlight-1",
      type: "video",
      src: "/highlights/myroslav-lozko-1.mp4",
      title: "Відео за участі Мирослава Лозка",
      description: "Мирослав грає у білій футболці.",
    },
  ],
  "ruslan-danyleiko": [
    {
      id: "ruslan-danyleiko-highlight-1",
      type: "video",
      src: "/highlights/ruslan-danyleiko-1.mp4",
      title: "Відео за участі Руслана Данилейка",
      description: "Руслан ближче до камери, у чорних штанях.",
    },
  ],
  "mykyta-svoiehlazov": [
    {
      id: "mykyta-svoiehlazov-highlight-1",
      type: "video",
      src: "/highlights/mykyta-svoiehlazov-1.mp4",
      title: "Відео за участі Микити Своєглазова",
    },
  ],
  "pasha-rybalskyi": [
    {
      id: "pasha-rybalskyi-highlight-1",
      type: "video",
      src: "/highlights/pasha-rybalskyi-1.mp4",
      title: "Відео за участі Паші Рибальського",
      description: "Паша виконує подачу.",
    },
  ],
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
