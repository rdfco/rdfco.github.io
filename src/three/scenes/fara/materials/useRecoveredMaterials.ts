/* eslint-disable react-hooks/immutability -- Three.js textures, materials, meshes, and uniforms are mutable runtime objects. */
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { useMemo } from 'react'
import { DataTexture, Material, Mesh, RedFormat, RepeatWrapping, ShaderMaterial, Texture, Vector2 } from 'three'
import { createShaderMaterial } from '../../../materials'
import energyBgVert from '../../../../scenes/shaders/legacy/EnergyBg/EnergyBg.vert?raw';import energyBgFrag from '../../../../scenes/shaders/legacy/EnergyBg/EnergyBg.frag?raw'
import energyConeVert from '../../../../scenes/shaders/legacy/EnergyCone/EnergyCone.vert?raw';import energyConeFrag from '../../../../scenes/shaders/legacy/EnergyCone/EnergyCone.frag?raw'
import glowVert from '../../../../scenes/shaders/legacy/Glow/Glow.vert?raw';import glowFrag from '../../../../scenes/shaders/legacy/Glow/Glow.frag?raw'
import powerLineVert from '../../../../scenes/shaders/legacy/PowerLine/PowerLine.vert?raw';import powerLineFrag from '../../../../scenes/shaders/legacy/PowerLine/PowerLine.frag?raw'
import hologramsVert from '../../../../scenes/shaders/legacy/Holograms/Holograms.vert?raw';import hologramsFrag from '../../../../scenes/shaders/legacy/Holograms/Holograms.frag?raw'
import gridVert from '../../../../scenes/shaders/legacy/Grid/Grid.vert?raw';import gridFrag from '../../../../scenes/shaders/legacy/Grid/Grid.frag?raw'
import lineVert from '../../../../scenes/shaders/legacy/Line/Line.vert?raw';import lineFrag from '../../../../scenes/shaders/legacy/Line/Line.frag?raw'
import { configuredColor } from '../background-colors'

const light=configuredColor('skyLight'),dark=configuredColor('skyDark')
const emptyMouseTexture = new DataTexture(new Uint8Array([0]), 1, 1, RedFormat)
emptyMouseTexture.needsUpdate = true
export function useRecoveredMaterials(roots:Mesh[]|never[]){const noise=useTexture('/assets/textures/noise.webp');noise.wrapS=noise.wrapT=RepeatWrapping;const {size,gl}=useThree();const materials=useMemo(()=>{const created:ShaderMaterial[]=[];for(const root of roots)root.traverse(object=>{const mesh=object as Mesh;if(!mesh.isMesh||Array.isArray(mesh.material))return;const previous=mesh.material as Material&{name:string;map?:Texture};const name=previous.name.replace(/[\d.]/g,'');const common={uTime:{value:0},uTransition:{value:0},uTransitionDirection:{value:0},uChapter:{value:0},uLightColor:{value:light},uDarkColor:{value:dark},uResolution:{value:new Vector2(size.width,size.height)},uDPR:{value:gl.getPixelRatio()},tNoise:{value:noise},tMouseComputation:{value:null}}
let next:ShaderMaterial|undefined
if(name==='EnergyBg')next=createShaderMaterial(energyBgVert,energyBgFrag,common,false)
if(name==='EnergyCone')next=createShaderMaterial(energyConeVert,energyConeFrag,{...common,uColor:{value:configuredColor('risingLines')},iSteps:{value:2},uSpeed:{value:.08},uHeadLength:{value:.1},uLineCount:{value:30},uOpacity:{value:.5}})
if(name==='Glow')next=createShaderMaterial(glowVert,glowFrag,common)
if(name==='PowerLine')next=createShaderMaterial(powerLineVert,powerLineFrag,common)
if(mesh.name.startsWith('Line'))next=createShaderMaterial(lineVert,lineFrag,{uTime:{value:0},uColor:{value:configuredColor('pathLines')},uFade:{value:1}},false)
if(name==='Holograms')next=createShaderMaterial(hologramsVert,hologramsFrag,{...common,tMap:{value:previous.map??null},tMouse:{value:emptyMouseTexture},uMobile:{value:0},uDpr:{value:gl.getPixelRatio()},uColor:{value:configuredColor('hologram')},uGlowColor:{value:configuredColor('hologramGlow')},uFade:{value:1},uOffset:{value:0}},false)
if(name==='Grid')next=createShaderMaterial(gridVert,gridFrag,{...common,tMouseComputation:{value:emptyMouseTexture},uGridScale:{value:150},uLineWidth:{value:.01},uCrossSize:{value:.2},uPointSize:{value:0},uSpeed:{value:0},uBackgroundNoise:{value:1},uBrightness:{value:1.6},uBackgroundColor:{value:configuredColor('gridBackground')},uPointColor:{value:configuredColor('gridPoints')},uAccentColor:{value:configuredColor('gridAccent')},uLineColor:{value:configuredColor('gridLines')},uDepth:{value:100},uFade:{value:1},uTranslate:{value:new Vector2()}},false)
if(next){next.name=previous.name;mesh.material=next;mesh.frustumCulled=false;created.push(next)}});return created},[roots,noise,size.width,size.height,gl]);useFrame(({clock,size:frameSize})=>{for(const material of materials){if(material.uniforms.uTime)material.uniforms.uTime.value=clock.elapsedTime;if(material.uniforms.uResolution)(material.uniforms.uResolution.value as Vector2).set(frameSize.width,frameSize.height)}});return materials}
