// HTML HUD overlay: top status bar, boss bar, objective, mobile controls, screens.
export class HUD {
  constructor(container, input, callbacks) {
    this.input = input;
    this.callbacks = callbacks || {};
    this.root = document.createElement('div');
    this.root.style.cssText =
      'position:absolute;inset:0;pointer-events:none;font-family:Segoe UI,system-ui,sans-serif;color:#fff;z-index:10;user-select:none;-webkit-user-select:none;overflow:hidden;';
    container.appendChild(this.root);
    this._buildTop();
    this._buildControls();
    this._buildScreens();
  }
  _mk(cls, style) {
    const el = document.createElement('div');
    if (cls) el.className = cls;
    el.style.cssText = style;
    return el;
  }
  _buildTop() {
    this.top = this._mk('', 'position:absolute;top:0;left:0;right:0;padding:10px 14px;display:flex;flex-direction:column;gap:6px;');
    this.root.appendChild(this.top);

    const row = this._mk('', 'display:flex;align-items:center;gap:10px;font-size:12px;font-weight:bold;letter-spacing:.5px;text-shadow:0 1px 3px #000;');
    this.scoreTxt = this._mk('', 'background:rgba(0,0,0,.45);padding:4px 10px;border-radius:8px;');
    this.scoreTxt.textContent = 'SCORE 0';
    this.comboTxt = this._mk('', 'background:rgba(108,77,255,.55);padding:4px 10px;border-radius:8px;');
    this.comboTxt.textContent = 'COMBO x0';
    this.objectiveTxt = this._mk('', 'background:rgba(0,0,0,.45);padding:4px 10px;border-radius:8px;margin-left:auto;');
    this.objectiveTxt.textContent = 'OBJ: Survive';
    row.appendChild(this.scoreTxt);
    row.appendChild(this.comboTxt);
    row.appendChild(this.objectiveTxt);
    this.top.appendChild(row);

    const bars = this._mk('', 'display:flex;gap:8px;align-items:center;');
    this.hpWrap = this._mk('', 'flex:1;max-width:240px;height:14px;background:rgba(0,0,0,.5);border-radius:7px;overflow:hidden;border:1px solid rgba(255,255,255,.25);');
    this.hpBar = this._mk('', 'width:100%;height:100%;background:linear-gradient(90deg,#3ad98a,#52d9a8);transition:width .15s;');
    this.hpWrap.appendChild(this.hpBar);
    this.armorWrap = this._mk('', 'flex:1;max-width:140px;height:10px;background:rgba(0,0,0,.5);border-radius:6px;overflow:hidden;border:1px solid rgba(255,255,255,.2);');
    this.armorBar = this._mk('', 'width:0%;height:100%;background:linear-gradient(90deg,#5aa8ff,#8ad0ff);transition:width .15s;');
    this.armorWrap.appendChild(this.armorBar);
    bars.appendChild(this.hpWrap);
    bars.appendChild(this.armorWrap);
    this.top.appendChild(bars);

    this.weaponRow = this._mk('', 'display:flex;gap:10px;align-items:center;font-size:12px;font-weight:bold;text-shadow:0 1px 3px #000;');
    this.weaponTxt = this._mk('', 'background:rgba(0,0,0,.45);padding:4px 10px;border-radius:8px;');
    this.weaponTxt.textContent = 'PULSE  ∞/∞';
    this.abilityTxt = this._mk('', 'background:rgba(245,195,81,.4);padding:4px 10px;border-radius:8px;');
    this.abilityTxt.textContent = 'ABILITY READY';
    this.weaponRow.appendChild(this.weaponTxt);
    this.weaponRow.appendChild(this.abilityTxt);
    this.top.appendChild(this.weaponRow);

    this.bossWrap = this._mk('', 'position:absolute;top:8px;left:50%;transform:translateX(-50%);width:78%;max-width:420px;display:none;flex-direction:column;align-items:center;gap:4px;');
    this.bossName = this._mk('', 'font-size:14px;font-weight:bold;letter-spacing:1px;color:#ff8a9a;text-shadow:0 1px 4px #000;');
    this.bossName.textContent = 'IRON TITAN';
    this.bossBarBg = this._mk('', 'width:100%;height:12px;background:rgba(0,0,0,.55);border-radius:6px;overflow:hidden;border:1px solid rgba(255,90,110,.6);');
    this.bossBar = this._mk('', 'width:100%;height:100%;background:linear-gradient(90deg,#ff5c6c,#ff8a3c);transition:width .15s;');
    this.bossBarBg.appendChild(this.bossBar);
    this.bossWrap.appendChild(this.bossName);
    this.bossWrap.appendChild(this.bossBarBg);
    this.root.appendChild(this.bossWrap);
  }
  _btn(label, style, onDown, onUp) {
    const b = this._mk('', style + 'pointer-events:auto;touch-action:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#fff;border:2px solid rgba(255,255,255,.9);');
    b.textContent = label;
    const down = (e) => { e.preventDefault(); b.dataset.active = '1'; onDown && onDown(); };
    const up = () => { if (b.dataset.active) { b.dataset.active = ''; onUp && onUp(); } };
    b.addEventListener('pointerdown', down);
    b.addEventListener('pointerup', up);
    b.addEventListener('pointercancel', up);
    b.addEventListener('pointerleave', up);
    return b;
  }
  _buildControls() {
    this.ctrl = this._mk('', 'position:absolute;inset:0;');
    this.root.appendChild(this.ctrl);

    // D-Pad lives inside its own wrapper so we can reposition the whole cluster
    // (normal: bottom-left; forced-landscape: bottom-center -> screen-left).
    this.dpadWrap = this._mk('', 'position:absolute;width:150px;height:200px;');
    const ds = 46;
    const mk = (label, x, y, key) => {
      const b = this._btn(label, `left:${x}px;top:${y}px;width:${ds}px;height:${ds}px;border-radius:12px;background:rgba(108,77,255,.55);font-size:18px;`,
        () => this.input.setHeld(key, true),
        () => this.input.setHeld(key, false));
      this.dpadWrap.appendChild(b);
    };
    mk('▲', 52, 52, 'up');
    mk('◄', 0, 104, 'left');
    mk('►', 104, 104, 'right');
    mk('▼', 52, 156, 'down');
    this.runBtn = this._btn('RUN', `left:53px;top:0;width:44px;height:44px;border-radius:50%;background:rgba(245,195,81,.35);font-size:12px;`,
      () => { this.input.setHeld('sprint', !this.input.held.sprint); this.runBtn.style.background = this.input.held.sprint ? 'rgba(245,195,81,.85)' : 'rgba(245,195,81,.35)'; });
    this.dpadWrap.appendChild(this.runBtn);

    // Action cluster in its own wrapper (normal: bottom-right; forced-landscape: top-center -> screen-right).
    this.actionWrap = this._mk('', 'position:absolute;width:180px;height:190px;');
    const r = (label, x, y, size, color, action, hold) => {
      const b = this._btn(label, `left:${x}px;top:${y}px;width:${size}px;height:${size}px;border-radius:${size / 2}px;background:${color};font-size:${size < 56 ? 10 : 12}px;`,
        () => { if (hold) this.input.setHeld(action, true); else this.input.press(action); },
        () => { if (hold) this.input.setHeld(action, false); });
      this.actionWrap.appendChild(b);
    };
    r('FIRE', 110, 120, 64, 'rgba(245,120,60,.7)', 'fire', true);
    r('JUMP', 48, 128, 52, 'rgba(58,168,82,.65)', 'jump', true);
    r('GREN', 118, 64, 46, 'rgba(108,77,255,.65)', 'grenade', false);
    r('MISS', 62, 68, 46, 'rgba(200,70,90,.65)', 'missile', false);
    r('DODGE', 114, 14, 40, 'rgba(90,168,255,.6)', 'dodge', false);
    r('ABILITY', 62, 18, 40, 'rgba(245,195,81,.6)', 'ability', false);

    this.ctrl.appendChild(this.dpadWrap);
    this.ctrl.appendChild(this.actionWrap);
    this.setRotated(false);
  }
  // Reposition the control clusters for the current orientation. When the stage
  // is CSS-rotated 90° to fake landscape, stage-bottom maps to screen-left and
  // stage-top maps to screen-right — so the D-pad goes bottom-center and the
  // action cluster top-center, keeping thumbs on opposite sides of the screen.
  setRotated(rotated) {
    this.rotated = rotated;
    const place = (el, style) => {
      el.style.left = style.left; el.style.top = style.top;
      el.style.right = style.right; el.style.bottom = style.bottom;
      el.style.transform = style.transform;
    };
    if (rotated) {
      place(this.dpadWrap, { left: '50%', top: 'auto', right: 'auto', bottom: '20px', transform: 'translateX(-50%)' });
      place(this.actionWrap, { left: '50%', top: '20px', right: 'auto', bottom: 'auto', transform: 'translateX(-50%)' });
    } else {
      place(this.dpadWrap, { left: '14px', top: 'auto', right: 'auto', bottom: '16px', transform: 'none' });
      place(this.actionWrap, { left: 'auto', top: 'auto', right: '14px', bottom: '14px', transform: 'none' });
    }
  }
  _buildScreens() {
    this.startScreen = this._mk('', 'position:absolute;inset:0;pointer-events:auto;background:linear-gradient(160deg,rgba(10,12,24,.92),rgba(30,16,48,.92));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;text-align:center;padding:24px;');
    this.startScreen.innerHTML = `
      <div style="font-size:46px;font-weight:900;letter-spacing:4px;background:linear-gradient(90deg,#7b5cff,#ff8a3c);-webkit-background-clip:text;background-clip:text;color:transparent;">IYADEL</div>
      <div style="font-size:14px;color:#cbd0e0;max-width:300px;">3D Action Shooter — Vertical Slice. Move with D-Pad, FIRE / JUMP / GREN / MISS on the right.</div>
      <button id="iyStart" style="pointer-events:auto;background:linear-gradient(90deg,#6c4dff,#8a5cff);color:#fff;border:none;padding:14px 40px;border-radius:30px;font-size:18px;font-weight:bold;letter-spacing:1px;cursor:pointer;">TAP TO START</button>
      <div id="iyBest" style="font-size:13px;color:#9aa0b5;"></div>`;
    this.root.appendChild(this.startScreen);
    this.startScreen.querySelector('#iyStart').addEventListener('click', () => this.callbacks.onStart && this.callbacks.onStart());
  }
  showStart(best) {
    this.startScreen.style.display = 'flex';
    this.startScreen.querySelector('#iyBest').textContent = best ? `BEST SCORE  ${best}` : '';
    this.overScreen && (this.overScreen.style.display = 'none');
    this.winScreen && (this.winScreen.style.display = 'none');
  }
  hideStart() { this.startScreen.style.display = 'none'; }
  _endScreen(title, color, btn, cb) {
    const s = this._mk('', 'position:absolute;inset:0;pointer-events:auto;background:rgba(8,10,18,.9);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;');
    s.innerHTML = `<div style="font-size:34px;font-weight:900;letter-spacing:2px;color:${color};">${title}</div>
      <div id="esScore" style="font-size:16px;color:#cbd0e0;"></div>
      <button style="pointer-events:auto;background:linear-gradient(90deg,#6c4dff,#8a5cff);color:#fff;border:none;padding:12px 34px;border-radius:26px;font-size:16px;font-weight:bold;cursor:pointer;">${btn}</button>`;
    s.querySelector('button').addEventListener('click', () => cb && cb());
    this.root.appendChild(s);
    return s;
  }
  showGameOver(score, best) {
    this.overScreen = this._endScreen('GAME OVER', '#ff5c6c', 'RESTART', () => this.callbacks.onRestart && this.callbacks.onRestart());
    this.overScreen.querySelector('#esScore').innerHTML = `SCORE  ${score}<br>BEST  ${best}`;
  }
  showVictory(score, best) {
    this.winScreen = this._endScreen('VICTORY', '#52d9a8', 'NEXT WAVE', () => this.callbacks.onRestart && this.callbacks.onRestart());
    this.winScreen.querySelector('#esScore').innerHTML = `SCORE  ${score}<br>BEST  ${best}`;
  }
  hideEnd() {
    this.overScreen && (this.overScreen.style.display = 'none');
    this.winScreen && (this.winScreen.style.display = 'none');
  }
  update(s) {
    this.scoreTxt.textContent = 'SCORE ' + Math.floor(s.score);
    this.comboTxt.textContent = 'COMBO x' + s.combo;
    this.objectiveTxt.textContent = 'OBJ: ' + (s.objective || 'Survive');
    const hpR = Math.max(0, s.hp / s.maxHp);
    this.hpBar.style.width = (hpR * 100) + '%';
    this.hpBar.style.background = hpR > 0.5 ? 'linear-gradient(90deg,#3ad98a,#52d9a8)' : hpR > 0.25 ? 'linear-gradient(90deg,#f5c451,#ffd47a)' : 'linear-gradient(90deg,#ff5c6c,#ff8a3c)';
    this.armorBar.style.width = (Math.max(0, (s.armor || 0) / 100) * 100) + '%';
    this.weaponTxt.textContent = `${s.weapon}  ${s.ammo === Infinity ? '∞' : s.ammo}/${s.maxAmmo === Infinity ? '∞' : s.maxAmmo}`;
    this.abilityTxt.textContent = s.abilityReady ? 'ABILITY READY' : `ABILITY ${Math.ceil(s.abilityCd || 0)}s`;
    this.abilityTxt.style.opacity = s.abilityReady ? '1' : '0.5';
    if (s.boss) {
      this.bossWrap.style.display = 'flex';
      this.bossBar.style.width = (Math.max(0, s.boss.hp / s.boss.max) * 100) + '%';
      this.bossName.textContent = `IRON TITAN — PHASE ${s.boss.phase}`;
    } else {
      this.bossWrap.style.display = 'none';
    }
  }
  dispose() {
    if (this.root.parentNode) this.root.parentNode.removeChild(this.root);
  }
}