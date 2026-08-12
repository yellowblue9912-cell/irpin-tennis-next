"use client";

import { deleteMatch, updateMatchScore } from "./actions";

type Props = { id: string; type: "league" | "rating" | "tournament"; player1: string; player2: string; scores: Array<[number | null, number | null]> };

export function MatchActions({ id, type, player1, player2, scores }: Props) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      <details className="group sm:relative">
        <summary className="cursor-pointer list-none rounded-xl border border-[#123f2d]/20 bg-[#f7f3ea] px-4 py-2.5 text-sm font-black text-[#123f2d] transition hover:bg-[#123f2d] hover:text-white">Редагувати рахунок</summary>
        <form action={updateMatchScore} className="mt-3 rounded-2xl border border-[#123f2d]/10 bg-[#f7f3ea] p-4 sm:absolute sm:right-0 sm:z-10 sm:w-[430px] sm:shadow-xl">
          <input type="hidden" name="match_id" value={id} /><input type="hidden" name="match_type" value={type} />
          <div className="grid grid-cols-[minmax(100px,1fr)_repeat(3,56px)] items-center gap-2 text-center text-xs font-black text-[#123f2d]/55">
            <span /><span>Сет 1</span><span>Сет 2</span><span>Сет 3</span>
            <span className="truncate text-left text-sm text-[#123f2d]">{player1}</span>
            {scores.map(([left], index) => <ScoreInput key={`p1-${index}`} name={`player1_set${index + 1}`} value={left} required={index < 2} />)}
            <span className="truncate text-left text-sm text-[#123f2d]">{player2}</span>
            {scores.map(([, right], index) => <ScoreInput key={`p2-${index}`} name={`player2_set${index + 1}`} value={right} required={index < 2} />)}
          </div>
          <div className="mt-4 flex justify-end"><button type="submit" className="rounded-xl bg-[#123f2d] px-5 py-2.5 text-sm font-black text-white" style={{ color: "#fff" }}>Зберегти рахунок</button></div>
        </form>
      </details>
      <form action={deleteMatch} onSubmit={(event) => { if (!window.confirm(`Видалити матч ${player1} — ${player2}? Рейтинг буде перераховано.`)) event.preventDefault(); }}>
        <input type="hidden" name="match_id" value={id} /><input type="hidden" name="match_type" value={type} />
        <button type="submit" className="rounded-xl border border-red-700/20 bg-red-50 px-4 py-2.5 text-sm font-black text-red-700 transition hover:bg-red-700 hover:text-white">Видалити</button>
      </form>
    </div>
  );
}

function ScoreInput({ name, value, required }: { name: string; value: number | null; required: boolean }) {
  return <input aria-label={name} name={name} type="number" min="0" max="99" required={required} defaultValue={value ?? ""} className="w-14 rounded-lg border border-[#123f2d]/15 bg-white px-2 py-2 text-center font-black text-[#123f2d]" />;
}
