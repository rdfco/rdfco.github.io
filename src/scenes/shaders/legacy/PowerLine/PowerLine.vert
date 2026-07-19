precision highp float;

varying vec2 vUv;
varying float vSeed;

void main() {
	vUv = uv;
	vec3 transformed = position;

	vec4 mvPosition =  vec4(transformed, 1.0);

	mvPosition = instanceMatrix * mvPosition;

	vSeed = instanceMatrix[1][0] + instanceMatrix[0][0];
	gl_Position = projectionMatrix * modelViewMatrix * mvPosition;

	}