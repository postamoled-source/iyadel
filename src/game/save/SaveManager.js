// SaveManager — offline-first local saves synced to the GameSave entity.
// Local (localStorage) is the source of truth during play; the server record
// is updated on each run and pulled on boot to keep the best score in sync.
import { base44 } from '@/api/base44Client';

const KEY = 'iyadel_save_v1';

const readLocal = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
};

const writeLocal = (data) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
};

export const SaveManager = {
  load() {
    const d = readLocal();
    return {
      highScore: d.highScore || 0,
      lastScore: d.lastScore || 0,
      runs: d.runs || 0,
      lastPlayed: d.lastPlayed || null,
      kills: d.kills || 0,
      gems: d.gems || 0,
      unlocked: d.unlocked || [],
    };
  },

  saveRun(score, won) {
    const d = this.load();
    const newHigh = Math.max(d.highScore, score);
    writeLocal({
      ...d,
      highScore: newHigh,
      lastScore: score,
      runs: d.runs + 1,
      lastPlayed: Date.now(),
      lastWon: !!won,
    });
    this.sync(newHigh, score);
    return newHigh;
  },

  addKill() {
    const d = this.load();
    const kills = (d.kills || 0) + 1;
    writeLocal({ ...d, kills });
    return kills;
  },

  addGem() {
    const d = this.load();
    const gems = (d.gems || 0) + 1;
    writeLocal({ ...d, gems });
    return gems;
  },

  unlock(id) {
    const d = this.load();
    const unlocked = d.unlocked || [];
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      writeLocal({ ...d, unlocked });
    }
  },

  async sync(high, last) {
    try {
      const existing = await base44.entities.GameSave.filter({}, '-updated_date', 1);
      if (existing.length) {
        await base44.entities.GameSave.update(existing[0].id, {
          high_score: high,
          last_score: last,
        });
      } else {
        await base44.entities.GameSave.create({ high_score: high, last_score: last });
      }
    } catch {
      // Offline or not signed in — local copy remains valid.
    }
  },

  async pullRemote() {
    try {
      const list = await base44.entities.GameSave.filter({}, '-updated_date', 1);
      if (list.length) {
        const remoteHigh = list[0].high_score || 0;
        const d = this.load();
        if (remoteHigh > d.highScore) {
          writeLocal({ ...d, highScore: remoteHigh });
          return remoteHigh;
        }
      }
    } catch {}
    return null;
  },
};