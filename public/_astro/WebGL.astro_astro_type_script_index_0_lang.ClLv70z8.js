import{a as t,E as a}from"/webgl-color-loader.js";
import"./index.Brfk6Bdo.js";
import"./ScrollTrigger.6qCihK2t.js";
import"./router.B-sij-_X.js";
import"./visitedNews.BmN7K1ri.js";

// The mirrored page lives in a nested HTTrack folder, while the original
// bundle chooses the Three.js scene from `/fort-energy`. Temporarily expose
// that route during initialisation, then restore the Live Server URL.
const localUrl=location.pathname+location.search+location.hash;
history.replaceState(history.state,"","/fort-energy/");

const o=document.querySelector("#canvas-wrapper"),r=o.querySelector("canvas");
try{
	await t.init(o,r);
	t.state.emit(a.ATTACH);
	t.state.emit(a.RESIZE,t.tools?.viewport.infos);
}finally{
	history.replaceState(history.state,"",localUrl);
}
