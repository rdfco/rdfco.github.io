import { useFrame, useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import { CatmullRomCurve3, Color, Material, Mesh, Object3D, Vector3 } from 'three'
import { useRecoveredMaterials } from '../../../scenes/materials/useRecoveredMaterials'
import { preloadRegisteredGLTF, useRegisteredGLTF } from '../../loaders'
import { faraModelIds } from '../../models'
import { BackgroundColorKey, configuredColor } from './background-colors'

function pointsFromMesh(root:Object3D,name:string){const mesh=root.getObjectByName(name) as Mesh|undefined;const attribute=mesh?.geometry?.attributes.position;if(!mesh||!attribute)return[];mesh.updateWorldMatrix(true,false);const points:Vector3[]=[];for(let index=0;index<attribute.count;index++){points.push(mesh.localToWorld(new Vector3().fromBufferAttribute(attribute,index)))}return points}
function namedPoints(root:Object3D,prefix:string){return root.children.filter(node=>node.name.startsWith(prefix)).sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true})).map(node=>node.getWorldPosition(new Vector3()))}
function tintMountains(root:Object3D){root.traverse(object=>{const mesh=object as Mesh;if(!mesh.isMesh)return;const label=`${mesh.name} ${(mesh.material as Material)?.name??''}`.toLowerCase();let key:BackgroundColorKey|undefined;if(label.includes('mountain'))key='mountain';else if(label.includes('star'))key='stars';else if(label.includes('aurora')||label.includes('cloud'))key='aurora';else if(label.includes('sun')||label.includes('backglow'))key='mountainBackGlow';else if(label.includes('transition'))key='transition';if(!key)return;const tint=configuredColor(key);const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];const cloned=materials.map(material=>{const copy=material.clone() as Material&{color?:Color};if(copy.color)copy.color.multiply(tint);return copy});mesh.material=Array.isArray(mesh.material)?cloned:cloned[0]})}

export function FaraWorld(){
  const hero=useRegisteredGLTF(faraModelIds.hero)
  const chapter=useRegisteredGLTF(faraModelIds.energyChapter)
  const mountains=useRegisteredGLTF(faraModelIds.mountains)
  const {camera}=useThree()
  const objects=useMemo(()=>{const result={hero:hero.scene.clone(true),chapter:chapter.scene.clone(true),mountains:mountains.scene.clone(true)};tintMountains(result.mountains);return result},[hero.scene,chapter.scene,mountains.scene])
  useRecoveredMaterials([objects.hero as unknown as Mesh,objects.chapter as unknown as Mesh])
  const curves=useMemo(()=>{
    objects.mountains.updateWorldMatrix(true,true);objects.chapter.updateWorldMatrix(true,true)
    const mountainCamera=pointsFromMesh(objects.mountains,'CameraPath');const mountainTarget=pointsFromMesh(objects.mountains,'TargetPath')
    const chapterCamera=namedPoints(objects.chapter,'Camera.');const chapterTarget=namedPoints(objects.chapter,'LookAt.')
    return {mountainCamera:mountainCamera.length>1?new CatmullRomCurve3(mountainCamera,false,'centripetal'):null,mountainTarget:mountainTarget.length>1?new CatmullRomCurve3(mountainTarget,false,'centripetal'):null,chapterCamera:chapterCamera.length>1?new CatmullRomCurve3(chapterCamera,false,'centripetal'):null,chapterTarget:chapterTarget.length>1?new CatmullRomCurve3(chapterTarget,false,'centripetal'):null}
  },[objects])
  // R3F frame callbacks intentionally mutate Three.js scene objects.
  // eslint-disable-next-line react-hooks/immutability
  useFrame(()=>{const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);const progress=Math.min(1,Math.max(0,scrollY/max));const chapterProgress=Math.min(1,Math.max(0,(progress-.1)/.78));objects.hero.visible=progress<.13;objects.chapter.visible=progress>=.085&&progress<.9;const inChapter=chapterProgress>0;const cameraCurve=inChapter?curves.chapterCamera:curves.mountainCamera;const targetCurve=inChapter?curves.chapterTarget:curves.mountainTarget;const t=inChapter?chapterProgress:Math.min(1,progress/.1);if(cameraCurve)camera.position.copy(cameraCurve.getPointAt(t));if(targetCurve)camera.lookAt(targetCurve.getPointAt(t));camera.updateProjectionMatrix()})
  return <group><primitive object={objects.mountains}/><primitive object={objects.hero}/><primitive object={objects.chapter}/></group>
}
preloadRegisteredGLTF(faraModelIds.hero);preloadRegisteredGLTF(faraModelIds.mountains)
