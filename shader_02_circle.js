const vshader = /* glsl */ `
varying vec3 v_position;

void main() {
  v_position = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;
const fshader = /* glsl */ `
varying vec3 v_position;
uniform vec3 u_myVal;


void main (void)
{
  // float inCircle = smoothstep(u_myVal.x,u_myVal.y, length(v_position.xy));
  float inCircle = 1.0- step(0.5, length(v_position.xy));

  vec3 color = vec3(1.0, 1.0, 0.0)* inCircle;
  
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
  uniforms.u_myVal.value.x = val / 100;
}

function myFunctionY(val) {
  console.log(val);
  uniforms.u_myVal.value.y = val / 100;
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
