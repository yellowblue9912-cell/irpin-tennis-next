"use client";

import { useId, useRef } from "react";

export default function RatingInactivityHelp() {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  return <>
    <button type="button" aria-label="Чому рейтинг знижується за неактивність?" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()} className="relative z-20 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-sm font-bold normal-case tracking-normal opacity-75 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2">?</button>
    <dialog ref={dialog} aria-labelledby={title} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }} className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl bg-white p-6 text-left text-sm font-normal normal-case leading-6 tracking-normal text-[#123f2d] shadow-2xl backdrop:bg-black/50">
      <h2 id={title} className="mb-3 text-xl font-black">Рейтинг і неактивність</h2>
      <p>Якщо довго не грати рейтингові матчі, рейтинг поступово знижується:</p>
      <ul className="my-4 space-y-2 rounded-xl bg-[#eef3e8] p-4">
        <li>До 59 днів без гри — без списань.</li>
        <li>На 60-й день — −0,20.</li>
        <li>На 90-й — загалом −0,30.</li>
        <li>На 120-й — загалом −0,40.</li>
        <li>На 150-й і далі — максимум −0,50 за одну перерву.</li>
      </ul>
      <p>Відлік іде від останнього підтвердженого рейтингового матчу. Матчі ліг і турнірів також враховуються.</p>
      <p className="mt-3">Новий рейтинговий матч запускає відлік заново. Уже списані бали автоматично не повертаються.</p>
      <p className="mt-3">Дружні, технічні та незіграні матчі не поновлюють відлік. Якщо рейтингових матчів ще не було, списань немає.</p>
      <p className="mt-3">У TennisGo про кожне списання надходить повідомлення із сумою, причиною та новим рейтингом.</p>
      <button type="button" onClick={() => dialog.current?.close()} className="mt-5 min-h-11 w-full rounded-xl bg-[#123f2d] px-4 py-3 font-bold text-white">Зрозуміло</button>
    </dialog>
  </>;
}
