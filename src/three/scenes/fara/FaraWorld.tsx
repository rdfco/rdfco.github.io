import { useMemo } from 'react'
import { Color, Material, Mesh, Object3D } from 'three'
import { useRecoveredMaterials } from '../../../scenes/materials/useRecoveredMaterials'
import { preloadRegisteredGLTF, useRegisteredGLTF } from '../../loaders'
import { faraModelIds } from '../../models'
import { BackgroundColorKey, configuredColor } from './background-colors'
import { FaraCameraRig } from './FaraCameraRig'

function tintMountains(root:Object3D){root.traverse(object=>{const mesh=object as Mesh;if(!mesh.isMesh)return;const label=`${mesh.name} ${(mesh.material as Material)?.name??''}`.toLowerCase();let key:BackgroundColorKey|undefined;if(label.includes('mountain'))key='mountain';else if(label.includes('star'))key='stars';else if(label.includes('aurora')||label.includes('cloud'))key='aurora';else if(label.includes('sun')||label.includes('backglow'))key='mountainBackGlow';else if(label.includes('transition'))key='transition';if(!key)return;const tint=configuredColor(key);const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];const cloned=materials.map(material=>{const copy=material.clone() as Material&{color?:Color};if(copy.color)copy.color.multiply(tint);return copy});mesh.material=Array.isArray(mesh.material)?cloned:cloned[0]})}

export function FaraWorld(){
  const hero=useRegisteredGLTF(faraModelIds.hero)
  const chapter=useRegisteredGLTF(faraModelIds.energyChapter)
  const mountains=useRegisteredGLTF(faraModelIds.mountains)
  const objects=useMemo(()=>{const result={hero:hero.scene.clone(true),chapter:chapter.scene.clone(true),mountains:mountains.scene.clone(true)};tintMountains(result.mountains);return result},[hero.scene,chapter.scene,mountains.scene])
  useRecoveredMaterials([objects.hero as unknown as Mesh,objects.chapter as unknown as Mesh])
  return <group><FaraCameraRig {...objects}/><primitive object={objects.mountains}/><primitive object={objects.hero}/><primitive object={objects.chapter}/></group>
}
preloadRegisteredGLTF(faraModelIds.hero);preloadRegisteredGLTF(faraModelIds.mountains)
