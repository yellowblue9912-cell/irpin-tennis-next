import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxSize = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data, error: userError } = await supabase.auth.getUser();

  if (userError || !data.user) {
    return NextResponse.json(
      { error: "Сесія завершилася. Увійдіть повторно." },
      { status: 401 },
    );
  }

  const body = await request.formData();
  const photo = body.get("photo");

  if (!(photo instanceof File)) {
    return NextResponse.json({ error: "Файл не вибрано." }, { status: 400 });
  }

  if (!allowedTypes.has(photo.type) || photo.size > maxSize) {
    return NextResponse.json(
      { error: "Дозволені JPG, PNG або WebP розміром до 5 МБ." },
      { status: 400 },
    );
  }

  const extension =
    photo.type === "image/png"
      ? "png"
      : photo.type === "image/webp"
        ? "webp"
        : "jpg";
  const path = `${data.user.id}/avatar-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("player-avatars")
    .upload(path, photo, { contentType: photo.type, upsert: false });

  if (uploadError) {
    return NextResponse.json(
      { error: uploadError.message },
      { status: 400 },
    );
  }

  const { data: publicUrl } = supabase.storage
    .from("player-avatars")
    .getPublicUrl(path);

  return NextResponse.json({ photoUrl: publicUrl.publicUrl });
}
