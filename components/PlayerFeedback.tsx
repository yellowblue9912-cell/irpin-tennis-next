"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { getPlayerPhoto } from "../lib/players/getPlayerPhoto";

type Comment = {
  id: string;
  author_player_id: string;
  body: string;
  is_anonymous: boolean;
  created_at: string;
  authorName: string;
  authorSlug: string;
  authorPhoto: string | null;
};

export default function PlayerFeedback({
  targetPlayerId,
}: {
  targetPlayerId: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorPlayerId, setAuthorPlayerId] = useState<string | null>(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [myVote, setMyVote] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [editingAnonymous, setEditingAnonymous] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    let linkedPlayerId: string | null = null;

    if (userData.user) {
      const { data: linkedPlayer } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", userData.user.id)
        .maybeSingle();
      linkedPlayerId = linkedPlayer?.id ?? null;
    }
    setAuthorPlayerId(linkedPlayerId);

    const [{ data: commentRows }, { data: reactionRows }] = await Promise.all([
      supabase
        .from("player_comments")
        .select("id, author_player_id, body, is_anonymous, created_at")
        .eq("target_player_id", targetPlayerId)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("player_reactions")
        .select("author_player_id, vote")
        .eq("target_player_id", targetPlayerId),
    ]);

    const authorIds = Array.from(
      new Set((commentRows ?? []).map((row) => row.author_player_id)),
    );
    const { data: authors } = authorIds.length
      ? await supabase
          .from("players")
          .select("id, name, slug, photo_url")
          .in("id", authorIds)
      : { data: [] };
    const authorMap = new Map((authors ?? []).map((author) => [author.id, author]));

    setComments(
      (commentRows ?? []).map((row) => {
        const author = authorMap.get(row.author_player_id);
        return {
          ...row,
          authorName: row.is_anonymous ? "Анонімний гравець" : author?.name ?? "Гравець",
          authorSlug: row.is_anonymous ? "" : author?.slug ?? "",
          authorPhoto: !row.is_anonymous && author
            ? getPlayerPhoto(author.slug, author.photo_url)
            : null,
        };
      }),
    );
    setLikes((reactionRows ?? []).filter((row) => row.vote === 1).length);
    setDislikes((reactionRows ?? []).filter((row) => row.vote === -1).length);
    setMyVote(
      (reactionRows ?? []).find((row) => row.author_player_id === linkedPlayerId)
        ?.vote ?? null,
    );
  }, [targetPlayerId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function react(vote: 1 | -1) {
    if (!authorPlayerId) {
      setMessage("Голосувати можуть лише зареєстровані гравці з підтвердженою карткою.");
      return;
    }
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.from("player_reactions").upsert(
      {
        target_player_id: targetPlayerId,
        author_player_id: authorPlayerId,
        vote,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "target_player_id,author_player_id" },
    );
    setMessage(error ? `Не вдалося зберегти голос: ${error.message}` : "");
    await load();
    setPending(false);
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authorPlayerId) {
      setMessage("Коментувати можуть лише зареєстровані гравці з підтвердженою карткою.");
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    const body = String(data.get("comment") ?? "").trim();
    const isAnonymous = data.get("is_anonymous") === "on";
    if (!body) return;

    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.from("player_comments").insert({
      target_player_id: targetPlayerId,
      author_player_id: authorPlayerId,
      body,
      is_anonymous: isAnonymous,
    });
    setMessage(error ? `Не вдалося додати коментар: ${error.message}` : "");
    if (!error) form.reset();
    await load();
    setPending(false);
  }

  async function saveEdit(commentId: string) {
    const body = editingBody.trim();
    if (!body) return;
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("player_comments")
      .update({ body, is_anonymous: editingAnonymous })
      .eq("id", commentId)
      .eq("author_player_id", authorPlayerId);
    setMessage(error ? `Не вдалося змінити коментар: ${error.message}` : "");
    if (!error) {
      setEditingId(null);
      setEditingBody("");
      setEditingAnonymous(false);
    }
    await load();
    setPending(false);
  }

  async function deleteComment(commentId: string) {
    if (!window.confirm("Видалити цей коментар?")) return;
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("player_comments")
      .delete()
      .eq("id", commentId)
      .eq("author_player_id", authorPlayerId);
    setMessage(error ? `Не вдалося видалити коментар: ${error.message}` : "");
    await load();
    setPending(false);
  }

  return (
    <section className="mt-6 rounded-2xl border border-[#123f2d]/10 bg-white p-4 shadow-sm sm:mt-8 sm:rounded-[28px] sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ad4529]">
            Спільнота
          </p>
          <h2 className="mt-1 text-2xl font-black uppercase text-[#123f2d]">
            Відгуки про гравця
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => react(1)}
            className={`rounded-xl border px-4 py-3 font-black transition ${
              myVote === 1
                ? "border-[#123f2d] bg-[#c6f13d] text-[#123f2d]"
                : "border-[#123f2d]/15 bg-[#f6f0e5] text-[#123f2d]"
            }`}
          >
            👍 {likes}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => react(-1)}
            className={`rounded-xl border px-4 py-3 font-black transition ${
              myVote === -1
                ? "border-[#ad4529] bg-[#ffd9ce] text-[#8f351f]"
                : "border-[#123f2d]/15 bg-[#f6f0e5] text-[#123f2d]"
            }`}
          >
            👎 {dislikes}
          </button>
        </div>
      </div>

      {authorPlayerId ? (
        <form onSubmit={submitComment} className="mt-6">
          <textarea
            name="comment"
            required
            maxLength={500}
            rows={3}
            placeholder="Залиште коментар про гравця…"
            className="w-full resize-y rounded-xl border-2 border-[#123f2d]/25 bg-[#f6f0e5] px-4 py-3 text-[#123f2d] outline-none focus:border-[#123f2d] focus:bg-white"
          />
          <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl bg-[#f6f0e5] p-3 text-sm font-bold text-[#123f2d]">
            <input
              type="checkbox"
              name="is_anonymous"
              className="h-5 w-5 accent-[#123f2d]"
            />
            Залишити коментар анонімно
          </label>
          <button
            type="submit"
            disabled={pending}
            className="mt-3 rounded-xl bg-[#123f2d] px-5 py-3 font-black text-white disabled:opacity-60"
          >
            Додати коментар
          </button>
        </form>
      ) : (
        <p className="mt-6 rounded-xl bg-[#f6f0e5] p-4 text-sm leading-6 text-[#123f2d]/65">
          Коментарі та реакції можуть залишати лише зареєстровані гравці,
          чиї акаунти прив’язані до картки на сайті.{" "}
          <Link href="/login" className="font-black text-[#ad4529] underline">
            Увійти або зареєструватися
          </Link>
        </p>
      )}

      {message && (
        <p role="status" className="mt-4 rounded-xl bg-[#fff3cd] p-3 text-sm font-bold text-[#6d5410]">
          {message}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {comments.map((comment) => (
          <article key={comment.id} className="flex gap-3 rounded-xl border border-[#123f2d]/10 bg-[#faf7f0] p-4">
            {comment.authorPhoto ? (
              <img
                src={comment.authorPhoto}
                alt=""
                className="h-11 w-11 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#c6f13d] font-black">
                {comment.authorName.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0">
              {comment.authorSlug ? (
                <Link href={`/players/${comment.authorSlug}`} className="font-black text-[#123f2d] hover:text-[#ad4529]">
                  {comment.authorName}
                </Link>
              ) : (
                <p className="font-black">{comment.authorName}</p>
              )}
              {editingId === comment.id ? (
                <div className="mt-2">
                  <textarea
                    value={editingBody}
                    onChange={(event) => setEditingBody(event.target.value)}
                    maxLength={500}
                    rows={3}
                    className="w-full rounded-xl border-2 border-[#123f2d]/25 bg-white p-3 outline-none focus:border-[#123f2d]"
                  />
                  <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs font-bold text-[#123f2d]">
                    <input
                      type="checkbox"
                      checked={editingAnonymous}
                      onChange={(event) => setEditingAnonymous(event.target.checked)}
                      className="h-4 w-4 accent-[#123f2d]"
                    />
                    Показувати як анонімний коментар
                  </label>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(comment.id)}
                      className="rounded-lg bg-[#123f2d] px-3 py-2 text-xs font-black text-white"
                    >
                      Зберегти
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-[#123f2d]/15 px-3 py-2 text-xs font-black"
                    >
                      Скасувати
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 whitespace-pre-wrap break-words leading-6 text-[#123f2d]/70">
                  {comment.body}
                </p>
              )}
              <time className="mt-2 block text-xs text-[#123f2d]/40">
                {new Intl.DateTimeFormat("uk-UA", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }).format(new Date(comment.created_at))}
              </time>
              {comment.author_player_id === authorPlayerId && editingId !== comment.id && (
                <div className="mt-2 flex gap-3 text-xs font-black">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditingBody(comment.body);
                      setEditingAnonymous(comment.is_anonymous);
                    }}
                    className="text-[#123f2d]/65 hover:text-[#123f2d]"
                  >
                    Редагувати
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteComment(comment.id)}
                    className="text-[#ad4529] hover:text-[#8f351f]"
                  >
                    Видалити
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
        {comments.length === 0 && (
          <p className="rounded-xl bg-[#f6f0e5] p-5 text-center text-sm text-[#123f2d]/50">
            Коментарів ще немає. Будьте першим.
          </p>
        )}
      </div>
    </section>
  );
}
