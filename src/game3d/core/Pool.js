// Generic object pool — reused for bullets, enemies, VFX to avoid GC churn.
export class Pool {
  constructor(factory, reset, initial = 6) {
    this.factory = factory;
    this.reset = reset || (() => {});
    this.free = [];
    this.active = new Set();
    for (let i = 0; i < initial; i++) this.free.push(factory());
  }
  acquire() {
    const obj = this.free.pop() || this.factory();
    this.active.add(obj);
    return obj;
  }
  release(obj) {
    if (this.active.delete(obj)) {
      this.reset(obj);
      this.free.push(obj);
    }
  }
  forEach(fn) { this.active.forEach(fn); }
  size() { return this.active.size; }
  clear() { this.active.forEach((o) => this.free.push(o)); this.active.clear(); }
}