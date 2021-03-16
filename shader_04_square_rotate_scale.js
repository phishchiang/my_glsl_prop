const vshader = /* glsl */ `
varying vec3 v_position;
varying vec2 v_uv;

void main() {	
  v_position = position;
  v_uv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;
const fshader = /* glsl */ `
varying vec3 v_position;
varying vec2 v_uv;
uniform vec2 u_mouse;
uniform vec3 u_myVal;
uniform float u_time;

// if θ = 0 ; θ = 90; θ = 180 ; θ = 270
// 1  0     0  1    -1  0     0  1
// 0  1    -1  0     0 -1    -1  0
mat2 getRotationMatrix(float theta){
  float s = sin(theta);
  float c = cos(theta);
  return mat2(c, -s, s, c);
  // 
  // cosθ -sinθ
  // sinθ  cosθ
  // 
}

// if scale = 1; scale = 2;
// 1  0     2  0
// 0  1     0  2
mat2 getScaleMatrix(float scale){
  return mat2(scale, 0, 0, scale);
}

float rect(vec2 pt, vec2 anchor, vec2 size, vec2 center){
  //return 0 if not in box and 1 if it is
  //step(edge, x) 0.0 is returned if x < edge, and 1.0 is returned otherwise.
  vec2 halfsize = size * 0.5;
  vec2 p = pt - center;
  float horz = step(-halfsize.x - anchor.x, p.x) - step(halfsize.x - anchor.x, p.x);
  float vert = step(-halfsize.y - anchor.y, p.y) - step(halfsize.y - anchor.y, p.y);
  return horz * vert;
}

void main (void){

  vec2 center = vec2(0.5, 0.0);
  mat2 matr = getRotationMatrix(u_time);
  mat2 mats = getScaleMatrix((sin(u_time)+1.0)/3.0 + 0.5);
  vec2 pt = (mats * matr * (v_position.xy - center)) + center;
  float inRect = rect(pt, vec2(0.15, -0.15), vec2(0.3), center);
  vec3 color = vec3(1.0, 1.0, 0.0) * inRect;
  
  gl_FragColor = vec4(color, 1.0);
}
`;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();

const geometry = new THREE.PlaneGeometry(2, 2);
// geometry.translate(0.0,0.5,0.0);
const uniforms = {
  u_color_a: { value: new THREE.Color(0xff0000) },
  u_color_b: { value: new THREE.Color(0x00ffff) },
  u_myVal: { value: { x: 0.0, y: 0.0, z: 0.0 } },
  u_time: { value: 0.0 },
  u_mouse: { value: { x: 0.0, y: 0.0 } },
  u_resolution: { value: { x: 0, y: 0 } },
};

const material = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: vshader,
  fragmentShader: fshader,
});

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

camera.position.z = 1;

function myFunctionX(val) {
  console.log(val);
  uniforms.u_myVal.value.x = val;
}

function myFunctionY(val) {
  console.log(val);
  uniforms.u_myVal.value.y = val;
}

onWindowResize();
if ('ontouchstart' in window) {
  document.addEventListener('touchmove', move);
} else {
  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener('mousemove', move);
}

function move(evt) {
  uniforms.u_mouse.value.x = evt.touches ? evt.touches[0].clientX : evt.clientX;
  uniforms.u_mouse.value.y = evt.touches ? evt.touches[0].clientY : evt.clientY;
}

animate();

function onWindowResize(event) {
  const aspectRatio = window.innerWidth / window.innerHeight;
  let width, height;
  if (aspectRatio >= 1) {
    width = 1;
    height = (window.innerHeight / window.innerWidth) * width;
  } else {
    width = aspectRatio;
    height = 1;
  }
  camera.left = -width;
  camera.right = width;
  camera.top = height;
  camera.bottom = -height;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.x = window.innerWidth;
  uniforms.u_resolution.value.y = window.innerHeight;
}

function animate() {
  requestAnimationFrame(animate);
  uniforms.u_time.value += clock.getDelta();
  renderer.render(scene, camera);
}
