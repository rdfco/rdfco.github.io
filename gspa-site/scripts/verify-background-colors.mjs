import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox','--disable-gpu-sandbox']})
const page = await browser.newPage();await page.setViewport({width:1440,height:900,deviceScaleFactor:1})
const errors=[];page.on('console',message=>{if(message.type()==='error'||message.type()==='warning')errors.push(message.text())});page.on('pageerror',error=>errors.push(error.message))
await page.goto(process.env.SITE_URL||'http://localhost:4174/',{waitUntil:'networkidle2',timeout:60000});await new Promise(resolve=>setTimeout(resolve,8000))
const frame=page.frames().find(item=>item.url().includes('/legacy/fort-energy/index.html'))
if(!frame)throw new Error('Legacy WebGL frame was not loaded')
const canvas=await frame.$('#canvas-wrapper canvas');if(!canvas)throw new Error('WebGL canvas was not created')
const result={config:await page.evaluate(()=>window.FARA_BACKGROUND_COLORS),debug:await frame.evaluate(()=>{const app=window.__FARA_APP_EXPORTS?.a;const mountain=app?.webgl?.mainScene?.mountains?.mountain;return{applied:window.__FARA_MOUNTAIN_COLOR_APPLIED,marker:mountain?.material?.fragmentShader?.includes('FARA_MOUNTAIN_TINT'),visible:mountain?.visible,parentVisible:mountain?.parent?.visible,position:mountain?.position?.toArray?.(),uniformColor:mountain?.material?.uniforms?.uColor?.value?.getHexString?.()}}),canvas:await canvas.boundingBox(),errors}
for(const [index,progress] of [0,.2,.4,.6,.8,1].entries()){
  await frame.evaluate(value=>scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*value),progress)
  await new Promise(resolve=>setTimeout(resolve,1800))
  await page.screenshot({path:`background-color-check-${index}.png`})
}
console.log(JSON.stringify(result,null,2));await browser.close()
