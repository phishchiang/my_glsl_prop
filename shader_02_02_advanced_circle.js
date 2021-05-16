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
uniform vec3 u_myVal;

float basic_circle(vec2 pt, vec2 center, float radius){
  vec2 p = pt - center;
  return 1.0 - step(radius, length(p));
}

float soften_circle(vec2 pt, vec2 center, float radius, bool soften){
  vec2 p = pt - center;
  float edge = (soften) ? radius * 0.5 : 0.0;
  return 1.0 - smoothstep(radius-edge, radius+edge, length(p));
}

float advanced_circle(vec2 pt, vec2 center, float radius, float line_width, bool soften){
  vec2 p = pt - center;
  float len = length(p);
  float half_line_width = line_width / 2.0;
  float edge = (soften) ? radius * 0.05 : 0.0;
  return smoothstep(radius-half_line_width-edge, radius-half_line_width, len) - smoothstep(radius+half_line_width, radius+half_line_width+edge, len);
}

float line(float a, float b, float line_width, float edge_thickness){
  float half_line_width = line_width * 0.5;
  return smoothstep(a-half_line_width-edge_thickness, a-half_line_width, b) - smoothstep(a+half_line_width, a+half_line_width+edge_thickness, b);
}



void main (void)
{
  // vec2 uv = gl_FragCoord.xy; // this is the pixel location in screen view coordinates
  vec2 uv = v_uv; // Use UV value to try


  // float newCircle = basic_circle( v_position.xy, vec2(0.0), 0.5 );
  float newCircle = advanced_circle( v_position.xy, vec2(0.0), 0.5, 0.1, true );
  
  // float inCircle = smoothstep(u_myVal.x,u_myVal.y, length(v_position.xy));
  // float newLine = line( v_position.x, v_position.y , 0.002, 0.001 );
  // float newLine = line( v_position.y, mix(-0.5, 0.5, (sin(v_position.x * 3.1415) +1.0)/2.0), 0.05, 0.01 ); // use v_position
  float newLine = line( v_uv.y, mix( 0.2, 0.8, (sin(v_position.x * 3.1415) +1.0)/2.0), 0.05, 0.01 ); // use v_uv
  

  vec3 color = vec3(1.0, 1.0, 0.0)* newLine ;
  
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
