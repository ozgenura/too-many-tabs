/**
 * Runs in <head>, before first paint.
 *
 * Theme and the late-night tint live in localStorage and were previously
 * applied from a React effect — which meant a light-mode visitor got a dark
 * flash on every single page load. Reading storage here removes the flash; the
 * hooks still own every change after hydration.
 *
 * Boring mode is not read here any more: it is no longer persisted, so a page
 * load never starts in it and there is nothing to pre-apply.
 *
 * Keys must stay in sync with use-theme.ts and use-late-night.ts. Kept as a
 * string so it can be inlined verbatim.
 */
export const themeBootstrapScript = `(function(){try{
var d=document.documentElement,s=window.localStorage;
var dark=s.getItem("tmt:theme")!=="light";
d.classList.toggle("dark",dark);
d.style.colorScheme=dark?"dark":"light";
var o=s.getItem("tmt:late-night-override"),night;
if(o==="on")night=true;else if(o==="off")night=false;
else{var h=new Date().getHours();night=h>=23||h<5||/[?&]forcenight=(1|true)\\b/.test(location.search);}
d.classList.toggle("late-night",night);
}catch(e){}})();`;
