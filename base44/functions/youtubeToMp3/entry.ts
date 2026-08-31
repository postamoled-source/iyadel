import { secrets } from "base44:runtime";

const API_HOST = "youtube-to-mp315.p.rapidapi.com";

function extractVideoId(url) {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/i,
    /youtu\.be\/([^?]+)/i,
    /youtube\.com\/embed\/([^?]+)/i,
    /youtube\.com\/shorts\/([^?]+)/i,
    /youtube\.com\/v\/([^?]+)/i,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = (body.url || "").trim();
    if (!url) return Response.json({ error: "Missing url" }, { status: 400 });

    const vid = extractVideoId(url);
    if (!vid) return Response.json({ error: "Invalid YouTube URL" }, { status: 400 });

    const watch = encodeURIComponent("https://www.youtube.com/watch?v=" + vid);
    const key = secrets.get("RAPIDAPI_KEY");
    if (!key) return Response.json({ error: "RAPIDAPI_KEY not set" }, { status: 500 });

    const headers = {
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": API_HOST,
      "Content-Type": "application/json",
    };

    // 1) Start the conversion job
    const start = await fetch("https://" + API_HOST + "/download?url=" + watch, {
      method: "POST",
      headers,
      body: JSON.stringify({ format: "mp3", quality: 128 }),
    });
    if (!start.ok) {
      const t = await start.text();
      return Response.json(
        { error: "Conversion request failed (" + start.status + ")", detail: t.slice(0, 200) },
        { status: 502 }
      );
    }
    const job = await start.json();
    if (!job || !job.id) {
      return Response.json({ error: "No job id returned from provider" }, { status: 502 });
    }

    // 2) Poll until terminal (max ~30s)
    let result = job;
    const MAX_POLLS = 10;
    for (let i = 0; i < MAX_POLLS; i++) {
      await sleep(3000);
      let s;
      try {
        s = await fetch("https://" + API_HOST + "/status/" + job.id, {
          headers: { "X-RapidAPI-Key": key, "X-RapidAPI-Host": API_HOST },
        });
      } catch {
        continue;
      }
      if (!s.ok) continue;
      result = await s.json();
      if (result.status !== "CONVERTING") break;
    }

    return Response.json({
      id: result.id,
      status: result.status,
      downloadUrl: result.downloadUrl,
      title: result.title,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}