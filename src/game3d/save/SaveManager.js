// Offline-first save with lazy sync to the GameSave entity (Base44).
import { base44 } from '@/api/base44Client';

const KEY = 'iyadel_save_v1';

export const SaveManager = {
  load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s) return s;
    } catch {}
    return { highScore: 0, xp: 0, level: 1, kills: 0, upgrades: {} };
  },
  _persist(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  },
  saveRun(score, victory) {
    const s = this.load();
    if (score > s.highScore) s.highScore = score;
    if (victory) s.level = (s.level || 1) + 1;
    s.kills = (s.kills || 0);
    this._persist(s);
    this._sync(s);
    return s.highScore;
  },
  addXp(amount) {
    const s = this.load();
    s.xp = (s.xp || 0) + amount;
    this._persist(s);
    return s.xp;
  },
  async _sync(s) {
    try {
      const recs = await base44.entities.GameSave.list();
      if (recs && recs.length) {
        await base44.entities.GameSave.update(recs[0].id, {
          high_score: s.highScore,
          last_score: s.highScore,
        });
      } else {
        await base44.entities.GameSave.create({
          high_score: s.highScore,
          last_score: s.highScore,
        });
      }
    } catch {}
  },
};