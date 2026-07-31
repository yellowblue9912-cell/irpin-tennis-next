"use client";

import { useMemo, useState } from "react";

type SetScore = [string, string];

function numberOf(value: string, fallback = 0) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundToThree(value: number) {
  return Math.round(value * 1000) / 1000;
}

function signed(value: number) {
  if (value === 0) return "0.000";
  return `${value > 0 ? "+" : "−"}${Math.abs(value).toFixed(3)}`;
}

export default function RatingCalculator() {
  const [playerRating, setPlayerRating] = useState("3.75");
  const [opponentRating, setOpponentRating] = useState("4.00");
  const [sets, setSets] = useState<SetScore[]>([
    ["6", "4"],
    ["6", "3"],
    ["", ""],
  ]);

  const result = useMemo(() => {
    const rating1 = Math.min(7, Math.max(1, numberOf(playerRating, 3)));
    const rating2 = Math.min(7, Math.max(1, numberOf(opponentRating, 3)));
    let sets1 = 0;
    let sets2 = 0;
    let games1 = 0;
    let games2 = 0;

    for (const [left, right] of sets) {
      if (left === "" && right === "") continue;
      const score1 = Math.max(0, numberOf(left));
      const score2 = Math.max(0, numberOf(right));
      games1 += score1;
      games2 += score2;
      if (score1 > score2) sets1 += 1;
      if (score2 > score1) sets2 += 1;
    }

    const validWinner = sets1 !== sets2;
    const playerWon = sets1 > sets2;
    const expected = 1 / (1 + 10 ** (rating2 - rating1));
    const multiplier =
      1 + Math.min(0.5, Math.abs(games1 - games2) / Math.max(1, games1 + games2));
    const change1 = validWinner
      ? roundToThree(0.05 * ((playerWon ? 1 : 0) - expected) * multiplier)
      : 0;

    return {
      rating1,
      rating2,
      expected,
      multiplier,
      change1,
      change2: -change1,
      playerWon,
      validWinner,
      games1,
      games2,
    };
  }, [opponentRating, playerRating, sets]);

  function updateSet(index: number, player: 0 | 1, value: string) {
    if (value !== "" && !/^\d{0,2}$/.test(value)) return;
    setSets((current) =>
      current.map((set, setIndex) => {
        if (setIndex !== index) return set;
        const next: SetScore = [...set];
        next[player] = value;
        return next;
      }),
    );
  }

  return (
    <div className="overflow-hidden rounded-[30px] bg-[#123f2d] text-white shadow-xl">
      <div className="grid lg:grid-cols-[1fr_0.85fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d7f34c]">
            Калькулятор
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Спрогнозуйте внесок матчу
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
            Введіть рейтинги перед матчем і рахунок. Третій сет можна залишити
            порожнім.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <RatingInput
              label="Ваш рейтинг"
              value={playerRating}
              onChange={setPlayerRating}
            />
            <RatingInput
              label="Рейтинг суперника"
              value={opponentRating}
              onChange={setOpponentRating}
            />
          </div>

          <div className="mt-7">
            <div className="grid grid-cols-[1fr_repeat(3,64px)] items-end gap-2 sm:grid-cols-[1fr_repeat(3,80px)] sm:gap-3">
              <p className="pb-3 text-xs font-black uppercase tracking-wide text-white/50">
                Рахунок
              </p>
              {[1, 2, 3].map((set) => (
                <p
                  key={set}
                  className="pb-2 text-center text-[10px] font-black uppercase text-white/45"
                >
                  Сет {set}
                </p>
              ))}

              <p className="font-bold">Ви</p>
              {sets.map((set, index) => (
                <ScoreInput
                  key={`player-${index}`}
                  value={set[0]}
                  onChange={(value) => updateSet(index, 0, value)}
                  label={`Ваш рахунок у сеті ${index + 1}`}
                />
              ))}

              <p className="font-bold">Суперник</p>
              {sets.map((set, index) => (
                <ScoreInput
                  key={`opponent-${index}`}
                  value={set[1]}
                  onChange={(value) => updateSet(index, 1, value)}
                  label={`Рахунок суперника у сеті ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#d7f34c] p-6 text-[#123f2d] sm:p-8 lg:p-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ad4529]">
            Прогноз
          </p>
          {result.validWinner ? (
            <>
              <p className="mt-4 text-lg font-black">
                {result.playerWon ? "Ваша перемога" : "Перемога суперника"} · {result.games1}:{result.games2}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <ResultCard
                  label="Ваша зміна"
                  change={result.change1}
                  rating={result.rating1}
                />
                <ResultCard
                  label="Зміна суперника"
                  change={result.change2}
                  rating={result.rating2}
                />
              </div>
              <dl className="mt-6 space-y-3 border-t border-[#123f2d]/15 pt-5 text-sm">
                <ResultRow
                  label="Ваш шанс за рейтингом"
                  value={`${(result.expected * 100).toFixed(1)}%`}
                />
                <ResultRow
                  label="Коефіцієнт рахунку"
                  value={`×${result.multiplier.toFixed(3)}`}
                />
              </dl>
            </>
          ) : (
            <div className="mt-6 rounded-2xl bg-white/55 p-5">
              <p className="font-black">Не вдалося визначити переможця</p>
              <p className="mt-2 text-sm leading-6 text-[#123f2d]/70">
                Перевірте рахунок: кількість виграних сетів не може бути
                однаковою.
              </p>
            </div>
          )}

          <p className="mt-6 text-xs leading-5 text-[#123f2d]/65">
            Це прогноз внеску одного матчу. Якщо у гравця вже є 30 результатів,
            загальний рейтинг також зміниться через виключення найстарішого
            матчу. Остаточне значення система обчислює після збереження матчу.
          </p>
        </div>
      </div>
    </div>
  );
}

function RatingInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-wide text-white/55">
        {label}
      </span>
      <input
        type="number"
        min="1"
        max="7"
        step="0.01"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-xl font-black text-white outline-none transition focus:border-[#d7f34c]"
      />
    </label>
  );
}

function ScoreInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <input
      inputMode="numeric"
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-12 min-w-0 rounded-xl border border-white/15 bg-white/10 text-center text-lg font-black text-white outline-none transition focus:border-[#d7f34c]"
    />
  );
}

function ResultCard({
  label,
  change,
  rating,
}: {
  label: string;
  change: number;
  rating: number;
}) {
  const nextRating = Math.min(7, Math.max(1, rating + change));
  return (
    <div className="rounded-2xl bg-white/70 p-4">
      <p className="text-[10px] font-black uppercase tracking-wide text-[#123f2d]/55">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-black ${change >= 0 ? "text-[#13734b]" : "text-[#ad4529]"}`}>
        {signed(change)}
      </p>
      <p className="mt-1 text-xs font-bold text-[#123f2d]/60">
        {rating.toFixed(2)} → {nextRating.toFixed(3)}
      </p>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-[#123f2d]/65">{label}</dt>
      <dd className="font-black">{value}</dd>
    </div>
  );
}
