import { create } from 'zustand'
import { defaultPerformanceTier, type PerformanceTier } from '../three'

type ExperienceState={activeSection:string;scrollProgress:number;sceneProgress:number;menuOpen:boolean;webglReady:boolean;performanceTier:PerformanceTier;setActiveSection:(value:string)=>void;setScrollProgress:(value:number)=>void;setSceneProgress:(value:number)=>void;setMenuOpen:(value:boolean)=>void;setWebglReady:(value:boolean)=>void;setPerformanceTier:(value:PerformanceTier)=>void}
export const useExperienceStore=create<ExperienceState>(set=>({activeSection:'home',scrollProgress:0,sceneProgress:0,menuOpen:false,webglReady:false,performanceTier:defaultPerformanceTier,setActiveSection:activeSection=>set({activeSection}),setScrollProgress:scrollProgress=>set({scrollProgress}),setSceneProgress:sceneProgress=>set({sceneProgress}),setMenuOpen:menuOpen=>set({menuOpen}),setWebglReady:webglReady=>set({webglReady}),setPerformanceTier:performanceTier=>set({performanceTier})}))
