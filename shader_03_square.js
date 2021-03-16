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

float rect(vec2 pt, vec2 size, vec2 center){
  //return 0 if not in box and 1 if it is
  //step(edge, x) 0.0 is returned if x < edge, and 1.0 is returned otherwise.
  vec2 halfsize = size * 0.1;
  vec2 p = pt - center;
  float horz = step(-halfsize.x, p.x) - step(halfsize.x, p.x);
  float vert = step(-halfsize.y, p.y) - step(halfsize.y, p.y);
  return horz * vert;
}

void main (void){
  float raduis = 0.5;
  vec2 center0 = vec2(cos(u_time)* raduis, sin(u_time)* raduis);

  // vec3 color = vec3(1.0, 1.0, 0.0) * rect(v_position.xy, vec2(1.0, 4.0), vec2(0.0, 0.2));
  float square1 =  rect(v_position.xy, vec2(1.0, 4.0), center0);
  vec3 color1 = vec3(1.0, 1.0, 0.0) * square1;

  vec2 center1 = vec2(0.2, -0.5);
  mat2 mat = getRotationMatrix(u_time);
  vec2 rotation_pt = mat * v_position.xy;
  // vec2 rotation_offset_pt = mat * ( v_position.xy - center1 ) + center1;
  
  float square2 =  rect(rotation_pt, vec2(1.0), vec2(0.0));
  vec3 color2 = vec3(0.0, 1.0, 1.0) * square2;

  
  gl_FragColor = vec4(color1 + color2, 1.0);
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
