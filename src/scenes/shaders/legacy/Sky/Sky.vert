precision highp float;

uniform float uPage, uScrollProgress;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
	float whoWeAre = 1. - step(-0.5, uPage);

	vec2 wWAUv = fract(.5 * uv + vec2(0., .01 * uScrollProgress));

	vUv = mix(uv, wWAUv, whoWeAre);
	vPosition = position;
	 vec4 mvPosition = viewMatrix * modelMatrix * vec4(position, 1.);
  gl_Position = projectionMatrix * mvPosition;
  gl_Position.z = gl_Position.w;
}