import * as THREE from 'three';

// Owns renderer, scene, camera and the fixed-timestep-ish RAF loop.
export class Engine {
  constructor(container) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.style.cssText = 'display:block;position:absolute;top:0;left:0;width:100%;height:100%;';
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x8fb6e0);
    this.scene.fog = new THREE.Fog(0x8fb6e0, 50, 170);

    this.camera = new THREE.PerspectiveCamera(62, 1, 0.1, 320);
    this.camera.position.set(0, 6, -9);

    this.clock = new THREE.Clock();
    this.running = true;
    this.onUpdate = null;

    this._resize = this._resize.bind(this);
    this._resize();
    window.addEventListener('resize', this._resize);

    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }
  _resize() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
  resize() { this._resize(); }
  _loop() {
    if (!this.running) return;
    requestAnimationFrame(this._loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (this.onUpdate) this.onUpdate(dt);
    this.renderer.render(this.scene, this.camera);
  }
  dispose() {
    this.running = false;
    window.removeEventListener('resize', this._resize);
    this.renderer.dispose();
    const el = this.renderer.domElement;
    if (el.parentNode) el.parentNode.removeChild(el);
  }
}