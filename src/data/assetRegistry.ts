import type { AssetDefinition } from '../types/content'
export const assetRegistry = {
  heroModel:{path:'/assets/models/fort-energy/fort-energy.glb',kind:'model',preload:true,ownership:'approved'},
  energyChapter:{path:'/assets/models/fort-energy/energy-chapter.glb',kind:'model',preload:false,ownership:'approved'},
  mountains:{path:'/assets/models/mountains.glb',kind:'model',preload:true,ownership:'approved'},
  environment:{path:'/assets/textures/envmap-min.exr',kind:'environment',preload:true,ownership:'approved'},
} satisfies Record<string,AssetDefinition>
