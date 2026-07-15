precision highp float;

uniform sampler2D tNoise;
uniform vec3 uDarkColor, uLightColor;
uniform float uTime, uTransition;

varying vec3 vWorldPosition;
varying vec2 vUv;

#include <common>

void main() {

	float center = smoothstep(180., 0., length(vWorldPosition.xy + 10. * rand(gl_FragCoord.xy)));

	vec3 color = uLightColor * center * 30.;

	float alpha = .5 * center;

	alpha *= smoothstep(.15, 0., uTransition);
	
	gl_FragColor = vec4(color, alpha);
}