import { secrets } from "base44:runtime";

const API_HOST = "youtube-mp310.p.rapidapi.com";

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

export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = (body.url || "").trim();
    if (!url) return Response.json({ error: "Missing url" }, { status: 400 });

    const vid = extractVideoId(url);
    if (!vid) return Response.json({ error: "Invalid YouTube URL" }, { status: 400 });

    const watch = "https://www.youtube.com/watch?v=" + vid;
    const key = secrets.get("RAPIDAPI_KEY");
    if (!key) return Response.json({ error: "RAPIDAPI_KEY not set" }, { status: 500 });

    // youtube-mp310 returns a ready downloadUrl in a single request (no polling)
    const r = await fetch(
      "https://" + API_HOST + "/download/mp3?url=" + encodeURIComponent(watch),
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": key,
          "X-RapidAPI-Host": API_HOST,
        },
      }
    );

    const text = await r.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return Response.json(
        { error: "Provider returned a non-JSON response (" + r.status + ")", detail: text.slice(0, 200) },
        { status: 502 }
      );
    }

    if (!r.ok) {
      return Response.json(
        { error: "Conversion request failed (" + r.status + ")", detail: data },
        { status: 502 }
      );
    }

    const downloadUrl = data.downloadUrl || (data.result && data.result.downloadUrl);
    if (!downloadUrl) {
      return Response.json(
        { error: "No downloadUrl returned by provider", detail: data },
        { status: 502 }
      );
    }

    return Response.json({
      status: "AVAILABLE",
      downloadUrl,
      title: data.title || (data.result && data.result.title) || null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}