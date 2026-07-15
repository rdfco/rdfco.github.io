import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { useMemo } from 'react'
import { AdditiveBlending, Color, DataTexture, DoubleSide, Material, Mesh, RedFormat, RepeatWrapping, ShaderMaterial, Texture, Vector2 } from 'three'
import energyBgVert from '../shaders/legacy/EnergyBg/EnergyBg.vert?raw';import energyBgFrag from '../shaders/legacy/EnergyBg/EnergyBg.frag?raw'
import energyConeVert from '../shaders/legacy/EnergyCone/EnergyCone.vert?raw';import energyConeFrag from '../shaders/legacy/EnergyCone/EnergyCone.frag?raw'
import glowVert from '../shaders/legacy/Glow/Glow.vert?raw';import glowFrag from '../shaders/legacy/Glow/Glow.frag?raw'
import powerLineVert from '../shaders/legacy/PowerLine/PowerLine.vert?raw';import powerLineFrag from '../shaders/legacy/PowerLine/PowerLine.frag?raw'
import hologramsVert from '../shaders/legacy/Holograms/Holograms.vert?raw';import hologramsFrag from '../shaders/legacy/Holograms/Holograms.frag?raw'
import gridVert from '../shaders/legacy/Grid/Grid.vert?raw';import gridFrag from '../shaders/legacy/Grid/Grid.frag?raw'

const light=new Color('#3e9bb7'),dark=new Color('#081219')
const emptyMouseTexture = new DataTexture(new Uint8Array([0]), 1, 1, RedFormat)
emptyMouseTexture.needsUpdate = true
function shader(vertexShader:string,fragmentShader:string,uniforms:Record<string,{value:unknown}>,additive=true){return new ShaderMaterial({vertexShader,fragmentShader,uniforms,transparent:true,depthTest:false,depthWrite:false,side:DoubleSide,blending:additive?AdditiveBlending:undefined})}
export function useRecoveredMaterials(roots:Mesh[]|never[]){const noise=useTexture('/assets/textures/noise.webp');noise.wrapS=noise.wrapT=RepeatWrapping;const {size,gl}=useThree();const materials=useMemo(()=>{const created:ShaderMaterial[]=[];for(const root of roots)root.traverse(object=>{const mesh=object as Mesh;if(!mesh.isMesh||Array.isArray(mesh.material))return;const previous=mesh.material as Material&{name:string;map?:Texture};const name=previous.name.replace(/[\d.]/g,'');const common={uTime:{value:0},uTransition:{value:0},uTransitionDirection:{value:0},uChapter:{value:0},uLightColor:{value:light},uDarkColor:{value:dark},uResolution:{value:new Vector2(size.width,size.height)},uDPR:{value:gl.getPixelRatio()},tNoise:{value:noise},tMouseComputation:{value:null}}
let next:ShaderMaterial|undefined
if(name==='EnergyBg')next=shader(energyBgVert,energyBgFrag,common,false)
if(name==='EnergyCone')next=shader(energyConeVert,energyConeFrag,{...common,uColor:{value:new Color(10605311)},iSteps:{value:2},uSpeed:{value:.08},uHeadLength:{value:.1},uLineCount:{value:30},uOpacity:{value:.5}})
if(name==='Glow')next=shader(glowVert,glowFrag,common)
if(name==='PowerLine')next=shader(powerLineVert,powerLineFrag,common)
if(name==='Holograms')next=shader(hologramsVert,hologramsFrag,{...common,tMap:{value:previous.map??null},tMouse:{value:emptyMouseTexture},uMobile:{value:0},uDpr:{value:gl.getPixelRatio()},uColor:{value:new Color('#8fc1e5')},uGlowColor:{value:new Color('#6bfeff')},uFade:{value:1},uOffset:{value:0}},false)
if(name==='Grid')next=shader(gridVert,gridFrag,{...common,tMouseComputation:{value:emptyMouseTexture},uGridScale:{value:150},uLineWidth:{value:.01},uCrossSize:{value:.2},uPointSize:{value:0},uSpeed:{value:0},uBackgroundNoise:{value:1},uBrightness:{value:1.6},uBackgroundColor:{value:new Color('#1a697f')},uPointColor:{value:new Color('#519abc')},uAccentColor:{value:new Color('#7a9fb6')},uLineColor:{value:new Color('#4e8399')},uDepth:{value:100},uFade:{value:1},uTranslate:{value:new Vector2()}},false)
if(next){next.name=previous.name;mesh.material=next;mesh.frustumCulled=false;created.push(next)}});return created},[roots,noise,size.width,size.height,gl]);useFrame(({clock,size:frameSize})=>{for(const material of materials){if(material.uniforms.uTime)material.uniforms.uTime.value=clock.elapsedTime;if(material.uniforms.uResolution)(material.uniforms.uResolution.value as Vector2).set(frameSize.width,frameSize.height)}});return materials}
