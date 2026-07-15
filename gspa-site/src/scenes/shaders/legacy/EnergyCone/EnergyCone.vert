precision highp float;

varying vec3 vPosition, vWorldPosition, vViewPosition;
varying vec2 vUv;

void main() {
	vUv = uv;

	vPosition = position;
	vec4 mvPosition = modelMatrix * vec4(position, 1.0);
	vWorldPosition = mvPosition.xyz;
	mvPosition =  viewMatrix * mvPosition;
	vViewPosition  = mvPosition.xyz;

	gl_Position = projectionMatrix * mvPosition;
}