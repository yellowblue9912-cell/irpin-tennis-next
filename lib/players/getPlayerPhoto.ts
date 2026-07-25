const bundledPlayerPhotos: Record<string, string> = {
  "vadym-buchkaryk": "/players/vadym-buchkaryk.webp",
  "nazar-makushenko": "/players/nazar-makushenko.webp",
  "viacheslav-rudyi": "/players/viacheslav-rudyi.webp",
  "serhii-mateich": "/players/serhii-mateich.webp",
  "viacheslav-hunin": "/players/viacheslav-hunin.webp",
  "mykyta-svoiehlazov": "/players/mykyta-svoiehlazov.webp",
  "ivan-viunkovskyi": "/players/ivan-viunkovskyi.webp",
  "oleksandr-ivanenko": "/players/oleksandr-ivanenko.webp",
  "ihor-lapatiiev": "/players/ihor-lapatiiev.webp",
  "ihor-lapatiev": "/players/ihor-lapatiiev.webp",
  "ruslan-danyleiko": "/players/ruslan-danyleiko.webp",
  "mykhailo-odarchenko": "/players/mykhailo-odarchenko.webp",
  "svitlana-muzyka": "/players/svitlana-muzyka.webp",
  "oleksandr-romaniuk": "/players/oleksandr-romaniuk.webp",
  "yurii-yefymuk": "/players/yurii-yefymuk.webp",
  "dmytro-khmel": "/players/dmytro-khmel.webp",
  "andrii-levchenko": "/players/andrii-levchenko.webp",
  "rostyslav-svidelskyi": "/players/rostyslav-svidelskyi.webp",
  "konstantyn-mishyn": "/players/konstantyn-mishyn.webp",
  "mariia-ruzhynska": "/players/mariia-ruzhynska.webp",
  "andrii-cherkasov": "/players/andrii-cherkasov.webp",
  "myroslav-lozko": "/players/myroslav-lozko.webp",
  "andrii-avramenko": "/players/andrii-avramenko.webp",
  "oleksandr-usov": "/players/oleksandr-usov.webp",
  "oleksandr-kovalchuk": "/players/oleksandr-kovalchuk.webp",
  "vova-khasinevych": "/players/vova-khasinevych.webp",
  "konstantyn-brynza": "/players/konstantyn-brynza.webp",
  "oleksandr-kavylyn": "/players/oleksandr-kavylyn.webp",
  "oleksandr-kavylin": "/players/oleksandr-kavylyn.webp",
  "dima-shuvalov": "/players/dima-shuvalov.webp",
  "aryna-solodenko": "/players/aryna-solodenko.webp",
  "tatiana-liubeshkina": "/players/tatiana-liubeshkina.webp",
  "olia-kulishenko": "/players/olia-kulishenko.webp",
  "liudmyla-brodetska": "/players/liudmyla-brodetska.webp",
  "sasha-rudnytskyi": "/players/sasha-rudnytskyi.webp",
  "roman-avramenko": "/players/roman-avramenko.webp",
  "oleksandr-nesterov": "/players/oleksandr-nesterov.webp",
  "vitalii-voitenko": "/players/vitalii-voitenko.webp",
  "olia-aleksieieva": "/players/olia-aleksieieva.webp",
  "yurii-klymenko": "/players/yurii-klymenko.webp",
  "vitalii-zavadskyi": "/players/vitalii-zavadskyi.webp",
  "vlad-tsvitsinskyi": "/players/vlad-tsvitsinskyi.webp",
};

export function getPlayerPhoto(
  slug: string,
  uploadedPhoto: string | null,
) {
  return uploadedPhoto || bundledPlayerPhotos[slug] || null;
}

const correctedPlayerNames: Record<string, string> = {
  "dmytro-khmel": "Дмитро Хміль",
  "oleksandr-usov": "Діма Усов",
};

export function getPlayerName(slug: string, storedName: string) {
  return correctedPlayerNames[slug] || storedName;
}
