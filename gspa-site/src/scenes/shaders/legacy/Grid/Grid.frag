precision highp float;
uniform float uTime, uLineWidth, uCrossSize, uPointSize, uGridScale;
uniform float uBackgroundNoise, uFade, uBrightness, uDepth, uSpeed;
uniform vec2 uResolution, uTranslate;
uniform vec3 uLineColor, uBackgroundColor, uAccentColor, uPointColor;
uniform sampler2D tNoise, tMouseComputation;
varying vec2 vUv;
#define saturate(a) clamp(a, 0.0, 1.0)
#include <common>
#include <dithering_pars_fragment>
void main() {
  float depth = gl_FragCoord.z / gl_FragCoord.w / uDepth;
  vec2 uv = vUv + uTranslate;
  vec2 mUv = gl_FragCoord.xy / uResolution;
  float mouse = clamp(texture2D(tMouseComputation, mUv).r * smoothstep(.4, 0., depth), 0., 2.);
  uv.y += uTime * uSpeed;
  float t = uTime * .01;
  float noise = texture2D(tNoise, vec2(uv.x + t * 2., uv.y + sin(t * 10.) * .05) * .2).r * .5;
  noise += texture2D(tNoise, vec2(uv.x + t, uv.y - sin(t * 5.) * .01) * .5).r * .5;
  vec2 sUv = (uv - .5) * uGridScale + .5;
  float lineWidth = uLineWidth + max(0., mouse * .01);
  vec4 uvDDXY = vec4(dFdx(sUv), dFdy(sUv));
  vec2 uvDeriv = vec2(length(uvDDXY.xz), length(uvDDXY.yw));
  vec2 drawWidth = clamp(vec2(lineWidth), uvDeriv, vec2(.5));
  vec2 lineAA = uvDeriv * 1.5;
  vec2 gridUV = 1.0 - abs(fract(sUv) * 2.0 - 1.0);
  vec2 grid2 = smoothstep(drawWidth + lineAA, drawWidth - lineAA, gridUV);
  grid2 *= saturate(lineWidth / drawWidth);
  grid2 = mix(grid2, vec2(lineWidth), saturate(uvDeriv * 2. - 1.));
  float grid = mix(grid2.x, 1.0, grid2.y);
  vec2 crossDrawWidth = clamp(vec2(uCrossSize), uvDeriv, vec2(.5));
  vec2 intersection = smoothstep(crossDrawWidth + lineAA, crossDrawWidth - lineAA, gridUV);
  float shadow1 = smoothstep(.06, .02, length(vUv - vec2(.33, .695)));
  float shadow2 = smoothstep(.14, .04, length(vUv - vec2(.34, .83)));
  float shadow3 = .8 * smoothstep(.08, .02, length(vUv - vec2(.2, .83)));
  float shadow4 = .7 * smoothstep(.06, .01, length(vUv - vec2(.24, .74)));
  float shadow = clamp(1. - uBackgroundNoise * (shadow1 + shadow2 + shadow3 + shadow4), 0., 1.);
  vec3 color = mix(uBackgroundColor * shadow, (0.4 + 0.6 * shadow) * mix(uLineColor, uAccentColor, intersection.x * intersection.y), grid);
  float dotsNoise = max(0., smoothstep(.9, 0., texture2D(tNoise, uv * .7 + t).r) * 5. - 2.5);
  float distFromIntersection = length(gridUV);
  float dots = smoothstep(uPointSize + .1, uPointSize, distFromIntersection) + smoothstep(.5, uPointSize, distFromIntersection) * .1;
  dots = min(1., mix(dots - .01, dots + 5., (dotsNoise + mouse * .1) * dots));
  color = (color + dots * uPointColor * shadow) * uBrightness * (1. + .2 * mouse);
  float alpha = uFade * smoothstep(.5, 0., depth) * smoothstep(.5, .3, abs(vUv.x - .5));
  gl_FragColor = vec4(color, alpha);
  #include <dithering_fragment>
}
