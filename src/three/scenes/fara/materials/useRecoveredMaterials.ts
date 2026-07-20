/* eslint-disable react-hooks/immutability -- Three.js textures, materials, meshes, and uniforms are mutable runtime objects. */
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { useMemo } from 'react'
import { DataTexture, Material, Mesh, RedFormat, RepeatWrapping, ShaderMaterial, Texture, Vector2 } from 'three'
import { createShaderMaterial } from '../../../materials'
import { configuredColor } from '../background-colors'
import { faraShaders } from './shader-library'

const light=configuredColor('skyLight'),dark=configuredColor('skyDark')
const emptyMouseTexture = new DataTexture(new Uint8Array([0]), 1, 1, RedFormat)
emptyMouseTexture.needsUpdate = true
export function useRecoveredMaterials(roots:Mesh[]|never[]){const noise=useTexture('/assets/textures/noise.webp');noise.wrapS=noise.wrapT=RepeatWrapping;const {size,gl}=useThree();const materials=useMemo(()=>{const created:ShaderMaterial[]=[];for(const root of roots)root.traverse(object=>{const mesh=object as Mesh;if(!mesh.isMesh||Array.isArray(mesh.material))return;const previous=mesh.material as Material&{name:string;map?:Texture};const name=previous.name.replace(/[\d.]/g,'');const common={uTime:{value:0},uTransition:{value:0},uTransitionDirection:{value:0},uChapter:{value:0},uLightColor:{value:light},uDarkColor:{value:dark},uResolution:{value:new Vector2(size.width,size.height)},uDPR:{value:gl.getPixelRatio()},tNoise:{value:noise},tMouseComputation:{value:null}}
let next:ShaderMaterial|undefined
if(name==='EnergyBg')next=createShaderMaterial(faraShaders.EnergyBg.vertex,faraShaders.EnergyBg.fragment,common,false)
if(name==='EnergyCone')next=createShaderMaterial(faraShaders.EnergyCone.vertex,faraShaders.EnergyCone.fragment,{...common,uColor:{value:configuredColor('risingLines')},iSteps:{value:2},uSpeed:{value:.08},uHeadLength:{value:.1},uLineCount:{value:30},uOpacity:{value:.5}})
if(name==='Glow')next=createShaderMaterial(faraShaders.Glow.vertex,faraShaders.Glow.fragment,common)
if(name==='PowerLine')next=createShaderMaterial(faraShaders.PowerLine.vertex,faraShaders.PowerLine.fragment,common)
if(mesh.name.startsWith('Line'))next=createShaderMaterial(faraShaders.Line.vertex,faraShaders.Line.fragment,{uTime:{value:0},uColor:{value:configuredColor('pathLines')},uFade:{value:1}},false)
if(name==='Holograms')next=createShaderMaterial(faraShaders.Holograms.vertex,faraShaders.Holograms.fragment,{...common,tMap:{value:previous.map??null},tMouse:{value:emptyMouseTexture},uMobile:{value:0},uDpr:{value:gl.getPixelRatio()},uColor:{value:configuredColor('hologram')},uGlowColor:{value:configuredColor('hologramGlow')},uFade:{value:1},uOffset:{value:0}},false)
if(name==='Grid')next=createShaderMaterial(faraShaders.Grid.vertex,faraShaders.Grid.fragment,{...common,tMouseComputation:{value:emptyMouseTexture},uGridScale:{value:150},uLineWidth:{value:.01},uCrossSize:{value:.2},uPointSize:{value:0},uSpeed:{value:0},uBackgroundNoise:{value:1},uBrightness:{value:1.6},uBackgroundColor:{value:configuredColor('gridBackground')},uPointColor:{value:configuredColor('gridPoints')},uAccentColor:{value:configuredColor('gridAccent')},uLineColor:{value:configuredColor('gridLines')},uDepth:{value:100},uFade:{value:1},uTranslate:{value:new Vector2()}},false)
if(next){next.name=previous.name;mesh.material=next;mesh.frustumCulled=false;created.push(next)}});return created},[roots,noise,size.width,size.height,gl]);useFrame(({clock,size:frameSize})=>{for(const material of materials){if(material.uniforms.uTime)material.uniforms.uTime.value=clock.elapsedTime;if(material.uniforms.uResolution)(material.uniforms.uResolution.value as Vector2).set(frameSize.width,frameSize.height)}});return materials}
