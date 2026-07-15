uniform float uOffset;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 transformed = position;
  transformed.x += uOffset;
  transformed.z += .5 * uOffset;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(transformed, 1.);
}