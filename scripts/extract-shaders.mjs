import { readFile,writeFile,mkdir } from 'node:fs/promises'
const source=await readFile('public/_astro/GlobalApp.vK8XqYB9.js','utf8');const shaders=[];const pattern=/`([\s\S]*?(?:gl_Position|gl_FragColor)[\s\S]*?)`/g;let match,index=0
while((match=pattern.exec(source))){const code=match[1];if(code.includes('void main'))shaders.push({id:`legacy-shader-${String(index++).padStart(3,'0')}`,kind:code.includes('gl_Position')?'vertex':'fragment',source:code})}
await mkdir('docs/generated',{recursive:true});await writeFile('docs/generated/legacy-shaders.json',JSON.stringify(shaders,null,2));console.log(`Extracted ${shaders.length} shader sources`)
