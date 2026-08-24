import{a as t,E as a}from"/webgl-color-loader.js";
import"./index.Brfk6Bdo.js";
import"./ScrollTrigger.6qCihK2t.js";
import"./router.B-sij-_X.js";
import"./visitedNews.BmN7K1ri.js";

// The page is served from a nested folder, while the WebGL bundle picks its
// Three.js scene from the `/energy` route. Expose that route for the duration
// of initialisation, then restore the real URL.
const localUrl=location.pathname+location.search+location.hash;
history.replaceState(history.state,"","/energy/");

const o=document.querySelector("#canvas-wrapper"),r=o.querySelector("canvas");
try{
	await t.init(o,r);
	t.state.emit(a.ATTACH);
	t.state.emit(a.RESIZE,t.tools?.viewport.infos);
	await new Promise(e=>requestAnimationFrame(()=>requestAnimationFrame(e)));
	window.__FARA_WEBGL_READY=true;
	window.dispatchEvent(new Event("fara:webgl-ready"));
}finally{
	history.replaceState(history.state,"",localUrl);
}
