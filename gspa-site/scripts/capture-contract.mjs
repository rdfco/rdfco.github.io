import { mkdir, writeFile } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'
import { preview } from 'vite'

const output = process.env.CONTRACT_DIR || 'work/contracts/current'
const server = await preview({ preview: { host: '127.0.0.1', port: 4176, strictPort: true } })
await mkdir(output, { recursive: true })
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox', '--disable-gpu-sandbox'] })
const report = {}

for (const viewport of [{name:'desktop',width:1440,height:900},{name:'tablet',width:768,height:1024},{name:'mobile',width:390,height:844}]) {
  const page = await browser.newPage()
  await page.setViewport({ width:viewport.width, height:viewport.height, deviceScaleFactor:1 })
  const errors=[]; page.on('pageerror',error=>errors.push(error.message)); page.on('requestfailed',request=>errors.push(`${request.failure()?.errorText}: ${request.url()}`))
  await page.goto('http://127.0.0.1:4176/',{waitUntil:'networkidle0',timeout:60000})
  const frame=page.frames().find(candidate=>candidate.url().includes('/legacy/fort-energy/index.html'))
  if(!frame) throw new Error('Legacy visual frame was not found')
  await frame.waitForSelector('html[data-fara-ready="true"]',{timeout:10000})
  const metrics=await frame.evaluate(()=>({title:document.title,text:document.body.innerText,height:document.documentElement.scrollHeight,width:document.documentElement.scrollWidth,viewport:{width:innerWidth,height:innerHeight},counts:{sections:document.querySelectorAll('main section').length,cards:document.querySelectorAll('.fara-card').length,cases:document.querySelectorAll('.fara-case-item').length}}))
  const points=[['hero',0],['quarter',.25],['middle',.5],['three-quarter',.75],['footer',1]]
  for(const [name,progress] of points){await frame.evaluate(value=>scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*value),progress);await new Promise(resolve=>setTimeout(resolve,700));await page.screenshot({path:`${output}/${viewport.name}-${name}.png`})}
  const menu=await frame.$('.menu-cta');if(menu){await menu.click();await new Promise(resolve=>setTimeout(resolve,900));await page.screenshot({path:`${output}/${viewport.name}-menu.png`});await menu.click()}
  report[viewport.name]={...metrics,errors}
  await page.close()
}
await writeFile(`${output}/contract.json`,JSON.stringify(report,null,2))
await browser.close();await server.close()
console.log(`Captured frame-aware visual contract in ${output}`)
