// Centralized input state. Keyboard writes here; the HUD touch layer writes here too.
export class Input {
  constructor() {
    this.held = { left: false, right: false, up: false, down: false, fire: false, jump: false, sprint: false };
    this._pressed = {};
    this._onKey = this._onKey.bind(this);
    window.addEventListener('keydown', this._onKey);
    window.addEventListener('keyup', this._onKey);
  }
  _onKey(e) {
    const down = e.type === 'keydown';
    const k = e.code;
    let mapped = null;
    let action = null;
    switch (k) {
      case 'ArrowLeft': case 'KeyA': mapped = 'left'; break;
      case 'ArrowRight': case 'KeyD': mapped = 'right'; break;
      case 'ArrowUp': case 'KeyW': mapped = 'up'; break;
      case 'ArrowDown': case 'KeyS': mapped = 'down'; break;
      case 'Space': mapped = 'jump'; break;
      case 'ShiftLeft': case 'ShiftRight': mapped = 'sprint'; break;
      case 'KeyJ': action = 'fire'; mapped = 'fire'; break;
      case 'KeyG': action = 'grenade'; break;
      case 'KeyM': action = 'missile'; break;
      case 'KeyV': action = 'dodge'; break;
      case 'KeyF': action = 'melee'; break;
      case 'KeyE': action = 'ability'; break;
      case 'KeyR': action = 'reload'; break;
      case 'KeyQ': action = 'switch'; break;
      default: return;
    }
    if (mapped) this.held[mapped] = down;
    if (action && down) this._pressed[action] = true;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k)) e.preventDefault();
  }
  // Touch / HUD layer calls these.
  setHeld(key, v) { this.held[key] = v; }
  press(action) { this._pressed[action] = true; }
  // Game loop consumes one-shot actions.
  consume(action) {
    if (this._pressed[action]) { this._pressed[action] = false; return true; }
    return false;
  }
  dispose() {
    window.removeEventListener('keydown', this._onKey);
    window.removeEventListener('keyup', this._onKey);
  }
}