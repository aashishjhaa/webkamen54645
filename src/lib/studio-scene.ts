import * as THREE from 'three';
import outline from './mark-points.json';

export type SceneView = 'hero' | 'detail';

/** All three-dimensional and flat marks share the trace of the supplied artwork. */
export function createStudio(canvas: HTMLCanvasElement, view: SceneView, poster = false) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power', preserveDrawingBuffer: poster });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-5, 5, 3, -3, .1, 60);
  const close = view === 'detail';
  camera.position.set(1.4, 4.6, 14);
  camera.lookAt(0, 1.76, 0);
  const root = new THREE.Group();
  scene.add(root);
  root.rotation.set(-.04, -.28, -.022);
  root.position.y = .075;
  const disposables: { dispose: () => void }[] = [];

  // A procedural photographic light tent: two large diffusion panels and a rim strip.
  const ew = 256, eh = 128, pixels = new Float32Array(ew * eh * 4);
  for (let y = 0; y < eh; y++) for (let x = 0; x < ew; x++) {
    const u = x / ew, v = y / eh, at = (x + y * ew) * 4;
    const box = (cx: number, cy: number, sx: number, sy: number) => Math.exp(-Math.pow((u-cx)/sx, 8)-Math.pow((v-cy)/sy, 8));
    const panel = box(.72, .67, .14, .19) * 2.9;
    const strip = box(.23, .58, .035, .23) * 3.6;
    const top = Math.max(0, v - .47) * .58;
    pixels[at] = .026 + top + panel + strip * .88;
    pixels[at+1] = .034 + top + panel * .94 + strip * .95;
    pixels[at+2] = .044 + top + panel * .8 + strip;
    pixels[at+3] = 1;
  }
  const environment = new THREE.DataTexture(pixels, ew, eh, THREE.RGBAFormat, THREE.FloatType);
  environment.mapping = THREE.EquirectangularReflectionMapping;
  environment.needsUpdate = true;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(environment);
  scene.environment = env.texture;
  scene.environmentIntensity = .76;
  pmrem.dispose(); environment.dispose(); disposables.push(env);

  // Low-amplitude, deterministic grain makes the finish satin rather than plastic.
  let seed = 19;
  const grain = new Uint8Array(128 * 128 * 4);
  for (let i = 0; i < grain.length; i += 4) {
    seed = (seed * 16807) % 2147483647;
    const value = 192 + Math.floor(seed / 2147483647 * 62);
    grain[i] = grain[i+1] = grain[i+2] = value; grain[i+3] = 255;
  }
  const texture = new THREE.DataTexture(grain, 128, 128);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter; texture.minFilter = THREE.LinearMipMapLinearFilter;
  texture.generateMipmaps = true; texture.needsUpdate = true;
  // A low-contrast satin grain and broad, brushed tonal variation remain readable
  // in the macro study. This material is generated locally, not a remote texture.
  const sw=512, sh=256, finishPixels=new Uint8Array(sw*sh*4);
  for(let y=0;y<sh;y++) for(let x=0;x<sw;x++) {
    seed=(seed*16807)%2147483647;
    const u=x/(sw-1), v=y/(sh-1), n=seed/2147483647-.5;
    const silk=.835+.115*v-.023*u+.054*Math.exp(-Math.pow((u+v*.17-.44)/.19,2))+n*.029;
    const a=(x+y*sw)*4;
    finishPixels[a]=Math.round(255*silk);finishPixels[a+1]=Math.round(254*silk);finishPixels[a+2]=Math.round(251*silk);finishPixels[a+3]=255;
  }
  const satin=new THREE.DataTexture(finishPixels,sw,sh);satin.colorSpace=THREE.SRGBColorSpace;
  satin.magFilter=THREE.LinearFilter;satin.minFilter=THREE.LinearMipMapLinearFilter;satin.generateMipmaps=true;satin.needsUpdate=true;
  texture.repeat.set(5,3);disposables.push(satin);
  const face = new THREE.MeshStandardMaterial({ color: 0xf2eadb, map:satin, roughness: .34, metalness: .38, bumpMap: texture, bumpScale: .004 });
  const edge = new THREE.MeshStandardMaterial({ color: 0xb6a68c, roughness: .3, metalness: .52, bumpMap: texture, bumpScale: .0025 });
  disposables.push(face, edge, texture);
  for (const points of outline.outlines) {
    const shape = new THREE.Shape();
    points.forEach(([x,y], i) => { const px = (x - 251) * .014, py = (273 - y) * .014; if (i === 0) shape.moveTo(px,py); else shape.lineTo(px,py); });
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: .43, bevelEnabled: true, bevelSegments: 4, bevelSize: .026, bevelThickness: .03, curveSegments: 5, steps: 1 });
    geometry.translate(0, 0, -.22);
    const positions=geometry.attributes.position, normals=geometry.attributes.normal, uvs=geometry.attributes.uv;
    for(let i=0;i<positions.count;i++) if(normals.getZ(i)>.96) {
      const u=(positions.getX(i)+3.514)/7.028, v=positions.getY(i)/3.822;
      uvs.setXY(i,u,v);
      // Subtly crowned satin faces catch the moving softbox without changing the outline.
      const normal=new THREE.Vector3((u-.5)*.085,(v-.5)*.055,1).normalize();
      normals.setXYZ(i,normal.x,normal.y,normal.z);
    }
    const mesh = new THREE.Mesh(geometry, [face, edge]);
    mesh.castShadow = true; mesh.receiveShadow = true; root.add(mesh); disposables.push(geometry);
  }
  scene.add(new THREE.HemisphereLight(0xf1f0ed, 0x475461, .36));
  const key = new THREE.DirectionalLight(0xffefd8, .95);
  key.position.set(-5, 8, 5); key.castShadow = true;
  key.shadow.mapSize.set(512,512);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: .1, far: 28 });
  key.shadow.bias = -.00015; key.shadow.normalBias = .02; key.shadow.radius = 9; key.shadow.blurSamples = 12;
  scene.add(key);
  // Near-field softboxes create a gentle falloff across the faces, rather than flat fills.
  const softbox = new THREE.PointLight(0xffeed7, 86, 30, 2);
  softbox.position.set(-3.8, 5.6, 3.7); scene.add(softbox);
  const bounce = new THREE.PointLight(0xdde8ee, 18, 20, 2);
  bounce.position.set(4.8, 1.3, 3.3); scene.add(bounce);
  const fill = new THREE.DirectionalLight(0xc2d6e9, .42); fill.position.set(5,2,3); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xfff0d7, 2.2); rim.position.set(0,5,-3); scene.add(rim);
  const sweep = new THREE.PointLight(0xffefcf, 0, 18, 2); scene.add(sweep);
  const shadowMaterial = new THREE.ShadowMaterial({ opacity: .24, depthWrite: false });
  const groundGeometry = new THREE.PlaneGeometry(200,200);
  const floor = new THREE.Mesh(groundGeometry,shadowMaterial);
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.035; floor.receiveShadow = true; scene.add(floor);
  disposables.push(shadowMaterial, groundGeometry);
  // Soft contact shadows anchor the actual feet of the two pieces to the studio floor.
  const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = 256; shadowCanvas.height = 128;
  const ctx = shadowCanvas.getContext('2d')!;
  ctx.scale(2,1); const gradient = ctx.createRadialGradient(64,64,0,64,64,64);
  gradient.addColorStop(0,'rgba(0,0,0,.72)'); gradient.addColorStop(.35,'rgba(0,0,0,.52)'); gradient.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = gradient; ctx.fillRect(0,0,128,128);
  const ambientShadow = new THREE.CanvasTexture(shadowCanvas);
  const ambientMat = new THREE.MeshBasicMaterial({ map: ambientShadow, transparent: true, depthWrite: false });
  const sg = new THREE.PlaneGeometry(1,1); disposables.push(ambientShadow, ambientMat, sg);
  for (const [x,w,d] of [[0,8.7,2.7],[-2.05,1.6,1.2],[.05,1.45,1.1],[2.9,1.7,1.3]]) {
    const shadow = new THREE.Mesh(sg,ambientMat); shadow.rotation.x = -Math.PI/2; shadow.scale.set(w,d,1); shadow.position.set(x,.003,-.18+x*.27); scene.add(shadow);
  }
  // The shipped posters are 1500x900 (hero) and 1600x620 (detail). At any container
  // shape the live camera frames exactly what the poster shows ("contain" for the hero,
  // "cover" for the detail crop), so swapping poster -> WebGL never shifts the artwork.
  function resize(width: number, height: number, dpr = 1) {
    const aspect = width / Math.max(1, height);
    const designAspect = close ? 1600 / 620 : 1500 / 900;
    const designWidth = close ? 2.95 : 8.75;
    const designHeight = designWidth / designAspect;
    const widthLimited = close ? aspect >= designAspect : aspect < designAspect;
    const worldWidth = widthLimited ? designWidth : designHeight * aspect;
    const worldHeight = widthLimited ? designWidth / aspect : designHeight;
    camera.left = -worldWidth / 2; camera.right = worldWidth / 2; camera.top = worldHeight / 2; camera.bottom = -worldHeight / 2;
    if (close) { camera.position.set(5.1, 3.7, 9.4); camera.lookAt(1.72, 1.97, .46); }
    camera.updateProjectionMatrix();
    // Supersample the live canvas (>=1.25x) so edges stay smooth even when a GPU
    // or browser provides no MSAA. The scene is two meshes drawn only on interaction.
    renderer.setPixelRatio(Math.min(Math.max(dpr, poster ? dpr : 1.25), 1.75));
    renderer.setSize(width, height, false);
  }
  function render(turn = 0, px = 0, py = 0) {
    root.rotation.y = -.28 + turn + px * .038;
    root.rotation.x = -.04 + py * .022;
    sweep.intensity = Math.abs(turn) * 110;
    sweep.position.set(-3+turn*39, 4.6, 3.2);
    renderer.render(scene,camera);
  }
  return { resize, render, dispose() { disposables.forEach(d=>d.dispose()); key.shadow.dispose(); scene.clear(); renderer.dispose(); renderer.forceContextLoss(); } };
}
