export type Achievement = {
  id: string;
  tournament: string;
  place: 1 | 2 | 3;
  date: string;
};

export type Player = {
  slug: string;
  name: string;
  rating: number;
  photo?: string;
  ratingChange?: number;
  achievements?: Achievement[];
};

export const players: Player[] = [
  {
    slug: "myroslav-lozko",
    name: "Мирослав Лозко",
    rating: 4.75,
  },
  {
    slug: "vlad-tsvitsinskyi",
    name: "Влад Цвіцінський",
    rating: 4.5,
  },
  {
    slug: "yurii-klymenko",
    name: "Юрій Клименко",
    rating: 4.25,
  },
  {
    slug: "oleksandr-ivanenko",
    name: "Олександр Іваненко",
    rating: 4.0,
  },
  {
    slug: "yurii-yefymuk",
    name: "Юрій Єфимук",
    rating: 4.0,
  },
  {
    slug: "vitalii-voitenko",
    name: "Віталій Войтенко",
    rating: 4.0,
  },
  {
    slug: "oleksandr-kovalchuk",
    name: "Олександр Ковальчук",
    rating: 4.0,
  },
  {
    slug: "oleksandr-nesterov",
    name: "Олександр Нестеров",
    rating: 4.0,
  },
  {
    slug: "ruslan-danyleiko",
    name: "Руслан Данилейко",
    rating: 4.0,
  },
  {
    slug: "dmytro-khmel",
    name: "Дмитро Хмель",
    rating: 4.0,
  },
  {
    slug: "vitalii-zavadskyi",
    name: "Віталій Завадський",
    rating: 3.75,
  },
  {
    slug: "sasha-rudnytskyi",
    name: "Саша Рудницький",
    rating: 3.75,
  },
  {
    slug: "sasha-havrysh",
    name: "Саша Гавриш",
    rating: 3.75,
  },
  {
    slug: "vadym-buchkaryk",
    name: "Вадим Бучкарик",
    rating: 3.75,
  },
  {
    slug: "mykhailo-odarchenko",
    name: "Михайло Одарченко",
    rating: 3.75,
  },
  {
    slug: "pasha-rybalskyi",
    name: "Паша Рибальський",
    rating: 3.75,
  },
  {
    slug: "olia-aleksieieva",
    name: "Оля Алексєєва",
    rating: 3.75,
  },
  {
    slug: "roman-avramenko",
    name: "Роман Авраменко",
    rating: 3.75,
  },
  {
    slug: "hleb-behenov",
    name: "Глеб Бегеньов",
    rating: 3.5,
  },
  {
    slug: "mykyta-svoiehlazov",
    name: "Микита Своєглазов",
    rating: 3.5,
  },
  {
    slug: "anton-rohov",
    name: "Антон Рогов",
    rating: 3.5,
  },
  {
    slug: "viacheslav-hunin",
    name: "В’ячеслав Гунін",
    rating: 3.5,
  },
  {
    slug: "nazar-makushenko",
    name: "Назар Макушенко",
    rating: 3.25,
  },
  {
    slug: "oleksandr-kavylin",
    name: "Олександр Кавилін",
    rating: 3.25,
  },
  {
    slug: "ihor-dereviaho",
    name: "Ігор Дерев’яго",
    rating: 3.25,
  },
  {
    slug: "andrii-cherkasov",
    name: "Андрій Черкасов",
    rating: 3.25,
  },
  {
    slug: "serhii-mateich",
    name: "Сергій Матеїч",
    rating: 3.25,
  },
  {
    slug: "andrii-levchenko",
    name: "Андрій Левченко",
    rating: 3.25,
  },
  {
    slug: "ihor-lapatiev",
    name: "Ігор Лапатієв",
    rating: 3.25,
  },
  {
    slug: "rostyslav-svidelskyi",
    name: "Ростислав Свідельський",
    rating: 3.25,
  },
  {
    slug: "oleksandr-romaniuk",
    name: "Олександр Романюк",
    rating: 3.25,
  },
  {
    slug: "viacheslav-rudyi",
    name: "В’ячеслав Рудий",
    rating: 3.25,
  },
  {
    slug: "vova-khasinevych",
    name: "Вова Хасіневич",
    rating: 3.0,
  },
  {
    slug: "dima-shuvalov",
    name: "Діма Шувалов",
    rating: 3.0,
  },
  {
    slug: "ivan-viunkovskyi",
    name: "Іван В’юнковський",
    rating: 3.0,
  },
  {
    slug: "tatiana-liubeshkina",
    name: "Татьяна Любешкіна",
    rating: 3.0,
  },
  {
    slug: "andrii-avramenko",
    name: "Андрій Авраменко",
    rating: 3.0,
  },
  {
    slug: "aryna-solodenko",
    name: "Арина Солоденко",
    rating: 3.0,
  },
  {
    slug: "konstantyn-mishyn",
    name: "Константин Мішин",
    rating: 3.0,
  },
  {
    slug: "konstantyn-brynza",
    name: "Константин Бринза",
    rating: 3.0,
  },
  {
    slug: "evelina-herasymchuk",
    name: "Евеліна Герасимчук",
    rating: 3.0,
  },
  {
    slug: "mariia-ruzhynska",
    name: "Марія Ружинська",
    rating: 3.0,
  },
  {
    slug: "svitlana-muzyka",
    name: "Світлана Музика",
    rating: 3.0,
  },
];

export function getPlayerBySlug(slug: string): Player | undefined {
  return players.find((player) => player.slug === slug);
}