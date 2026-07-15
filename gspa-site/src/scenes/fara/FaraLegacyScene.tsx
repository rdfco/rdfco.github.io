import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import { CatmullRomCurve3, Mesh, Object3D, Vector3 } from 'three'
import { assetRegistry } from '../../data/assetRegistry'
import { useRecoveredMaterials } from '../materials/useRecoveredMaterials'

function pointsFromMesh(root:Object3D,name:string){const mesh=root.getObjectByName(name) as Mesh|undefined;const attribute=mesh?.geometry?.attributes.position;if(!mesh||!attribute)return[];mesh.updateWorldMatrix(true,false);const points:Vector3[]=[];for(let index=0;index<attribute.count;index++){points.push(mesh.localToWorld(new Vector3().fromBufferAttribute(attribute,index)))}return points}
function namedPoints(root:Object3D,prefix:string){return root.children.filter(node=>node.name.startsWith(prefix)).sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true})).map(node=>node.getWorldPosition(new Vector3()))}

export function FaraLegacyScene(){
  const hero=useGLTF(assetRegistry.heroModel.path)
  const chapter=useGLTF(assetRegistry.energyChapter.path)
  const mountains=useGLTF(assetRegistry.mountains.path)
  const {camera}=useThree()
  const objects=useMemo(()=>({hero:hero.scene.clone(true),chapter:chapter.scene.clone(true),mountains:mountains.scene.clone(true)}),[hero.scene,chapter.scene,mountains.scene])
  useRecoveredMaterials([objects.hero as unknown as Mesh,objects.chapter as unknown as Mesh])
  const curves=useMemo(()=>{
    objects.mountains.updateWorldMatrix(true,true);objects.chapter.updateWorldMatrix(true,true)
    const mountainCamera=pointsFromMesh(objects.mountains,'CameraPath');const mountainTarget=pointsFromMesh(objects.mountains,'TargetPath')
    const chapterCamera=namedPoints(objects.chapter,'Camera.');const chapterTarget=namedPoints(objects.chapter,'LookAt.')
    return {mountainCamera:mountainCamera.length>1?new CatmullRomCurve3(mountainCamera,false,'centripetal'):null,mountainTarget:mountainTarget.length>1?new CatmullRomCurve3(mountainTarget,false,'centripetal'):null,chapterCamera:chapterCamera.length>1?new CatmullRomCurve3(chapterCamera,false,'centripetal'):null,chapterTarget:chapterTarget.length>1?new CatmullRomCurve3(chapterTarget,false,'centripetal'):null}
  },[objects])
  useFrame(()=>{const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);const progress=Math.min(1,Math.max(0,scrollY/max));const chapterProgress=Math.max(0,(progress-.35)/.65);const cameraCurve=chapterProgress>0?curves.chapterCamera:curves.mountainCamera;const targetCurve=chapterProgress>0?curves.chapterTarget:curves.mountainTarget;const t=chapterProgress>0?chapterProgress:Math.min(1,progress/.35);if(cameraCurve)camera.position.copy(cameraCurve.getPointAt(t));if(targetCurve)camera.lookAt(targetCurve.getPointAt(t));camera.updateProjectionMatrix()})
  return <group><primitive object={objects.mountains}/><primitive object={objects.hero}/><primitive object={objects.chapter}/></group>
}
useGLTF.preload(assetRegistry.heroModel.path);useGLTF.preload(assetRegistry.mountains.path)
