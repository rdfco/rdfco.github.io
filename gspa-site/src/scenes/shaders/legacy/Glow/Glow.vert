precision highp float;

varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {
	vUv = uv;
	vec4 mvPosition =  vec4(position, 1.0);
	mvPosition = modelMatrix * mvPosition;
	vWorldPosition = mvPosition.xyz;
	gl_Position = projectionMatrix * viewMatrix * mvPosition;

	}