import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { loadDash } from "./dashLoader";

function kindOf(src) {
  if (/\.m3u8(\?|$)/i.test(src)) return "hls";
  if (/\.mpd(\?|$)/i.test(src)) return "dash";
  return "native";
}

function sortLevels(infoList) {
  return (infoList || [])
    .map((lvl, index) => ({ label: `${lvl.height}p`, value: index }))
    .sort((a, b) => parseInt(b.label, 10) - parseInt(a.label, 10));
}

export default function useProPlayer({ src, autoPlay = false }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const dashRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [levels, setLevels] = useState([]);
  const [level, setLevel] = useState("auto");
  const [speed, setSpeedState] = useState(1);
  const [videoAspect, setVideoAspect] = useState(16 / 9);
  const [phase, setPhase] = useState("idle"); // idle | loading | ready | error | unsupported

  const teardown = useCallback(() => {
    if (hlsRef.current) {
      try { hlsRef.current.destroy(); } catch (e) { /* already gone */ }
      hlsRef.current = null;
    }
    if (dashRef.current) {
      try { dashRef.current.reset(); } catch (e) { /* already gone */ }
      dashRef.current = null;
    }
    setLevels([]);
    setLevel("auto");
  }, []);

  // Attach the source: native file, HLS playlist or DASH manifest.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    teardown();
    setPhase("loading");
    setCurrent(0);
    setBuffered(0);

    let cancelled = false;
    const kind = kindOf(src);

    if (kind === "hls") {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          maxBufferLength: 30,
          manifestLoadingMaxRetry: 3,
          fragLoadingMaxRetry: 6,
        });
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          setLevels(sortLevels(data.levels));
          if (autoPlay) video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (!data.fatal) return;
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
          else setPhase("error");
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else {
        setPhase("unsupported");
      }
    } else if (kind === "dash") {
      loadDash()
        .then((dashjs) => {
          if (cancelled) return;
          const player = dashjs.MediaPlayer().create();
          dashRef.current = player;
          player.initialize(video, src, autoPlay);
          player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
            setLevels(sortLevels(player.getBitrateInfoListFor("video")));
          });
          player.on(dashjs.MediaPlayer.events.ERROR, () => setPhase("error"));
        })
        .catch(() => setPhase("error"));
    } else {
      video.src = src;
      if (autoPlay) video.play().catch(() => {});
    }

    return () => {
      cancelled = true;
      teardown();
    };
  }, [src, autoPlay, teardown]);

  // Media events drive every piece of player state.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setCurrent(video.currentTime);
    const onMeta = () => {
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
      if (video.videoWidth && video.videoHeight) setVideoAspect(video.videoWidth / video.videoHeight);
      setPhase("ready");
    };
    const onProgress = () => {
      if (!video.duration || !video.buffered.length) return;
      setBuffered((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
    };
    const onWaiting = () => setPhase((p) => (p === "error" ? p : "loading"));
    const onReady = () => setPhase((p) => (p === "error" ? p : "ready"));
    const onVolume = () => {
      setMuted(video.muted);
      setVolumeState(video.volume);
    };
    const onError = () => {
      if (video.currentSrc) setPhase("error");
    };
    const onRate = () => setSpeedState(video.playbackRate);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("progress", onProgress);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onReady);
    video.addEventListener("canplay", onReady);
    video.addEventListener("volumechange", onVolume);
    video.addEventListener("ratechange", onRate);
    video.addEventListener("error", onError);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("progress", onProgress);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onReady);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("volumechange", onVolume);
      video.removeEventListener("ratechange", onRate);
      video.removeEventListener("error", onError);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, []);

  const restart = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    if (video.paused) video.play().catch(() => {});
  }, []);

  const skip = useCallback((delta) => {
    const video = videoRef.current;
    if (!video) return;
    const next = video.currentTime + delta;
    video.currentTime = Number.isFinite(video.duration) ? Math.min(Math.max(next, 0), video.duration) : Math.max(next, 0);
  }, []);

  const seek = useCallback((fraction) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    video.currentTime = Math.min(Math.max(fraction, 0), 1) * video.duration;
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) video.volume = 0.5;
  }, []);

  const setVolume = useCallback((value) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = Math.min(Math.max(value, 0), 1);
    video.muted = video.volume === 0;
  }, []);

  const setSpeed = useCallback((value) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = value;
  }, []);

  const selectLevel = useCallback((value) => {
    setLevel(value);
    if (hlsRef.current) hlsRef.current.currentLevel = value === "auto" ? -1 : Number(value);
    const dashPlayer = dashRef.current;
    if (dashPlayer && dashPlayer.updateSettings) {
      if (value === "auto") {
        dashPlayer.updateSettings({ streaming: { abr: { autoSwitchBitrate: { video: true } } } });
      } else {
        dashPlayer.updateSettings({ streaming: { abr: { autoSwitchBitrate: { video: false } } } });
        dashPlayer.setQualityFor("video", Number(value));
      }
    }
  }, []);

  const togglePip = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !document.pictureInPictureEnabled) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch (e) { /* PiP unavailable for this stream */ }
  }, []);

  const pipSupported = typeof document !== "undefined" && !!document.pictureInPictureEnabled;

  return {
    videoRef,
    playing, muted, volume, current, duration, buffered, videoAspect,
    levels, level, selectLevel, speed, setSpeed, phase,
    togglePlay, restart, skip, seek, toggleMute, setVolume, togglePip, pipSupported,
  };
}