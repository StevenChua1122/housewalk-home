import * as THREE from './vendor/three.module.min.js';
// Specular probes are rendered from the connected 3D scene, never photographs.
// Each day/night state is generated once, one room per animation frame. Mirrors
// use layer 2 and are excluded from cube cameras to prevent recursive renders.
export function localReflections(renderer,scene,refined,bathMaterials){
 const useBaked=true; // Actual-scene authoring bakes; live fallback if unavailable.
 const mobile=matchMedia('(pointer:coarse)').matches,size=mobile?32:64;
 const points={living:[1.55,1.2,2.5],kitchen:[3.72,1.2,6.22],bathroom:[5.55,1.35,5.72]};
 const cache=new Map();let pending=[],requested=null,active=null,started=0,bakeFailed=false;
 const stats={size,states:0,captures:0,totalCaptureMs:0,ready:false,source:'Connected runtime geometry; specular lighting only'};
 function apply(state){const maps=cache.get(state);if(!maps)return;for(const [room,target]of maps)refined.setEnvironment(room,target.texture);for(const m of bathMaterials){m.userData.housewalkBaseEnvironment??=m.envMapIntensity;m.envMap=maps.get('bathroom').texture;m.envMapIntensity=m.userData.housewalkBaseEnvironment*.38;m.needsUpdate=true;}active=state;stats.ready=true;}
 function request(n){const state=n?'night':'day';if(state===requested)return;requested=state;if(useBaked&&!bakeFailed&&!cache.has(state))return;if(cache.has(state)){pending=[];apply(state);return;}stats.ready=false;for(const room of Object.keys(points))refined.setEnvironment(room,null);for(const m of bathMaterials){m.envMap=null;if(m.userData.housewalkBaseEnvironment!==undefined)m.envMapIntensity=m.userData.housewalkBaseEnvironment;m.needsUpdate=true;}pending=Object.keys(points);cache.set(state,new Map());started=performance.now();}
 function step(){if(!pending.length)return;const room=pending.shift(),target=new THREE.WebGLCubeRenderTarget(size,{type:THREE.HalfFloatType,generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});const camera=new THREE.CubeCamera(.06,14,target);camera.position.set(...points[room]);camera.updateMatrixWorld();const generator=new THREE.PMREMGenerator(renderer);
  // All probes in a state see the same original environment, avoiding feedback.
  camera.update(renderer,scene);const filtered=generator.fromCubemap(target.texture);generator.dispose();target.dispose();cache.get(requested).set(room,filtered);stats.captures++;
  if(!pending.length){stats.states=cache.size;stats.totalCaptureMs+=performance.now()-started;apply(requested);}
 }
 if(useBaked)loadBaked().catch(error=>{console.warn('Housewalk local reflections: live fallback',error);bakeFailed=true;const n=requested==='night';requested=null;request(n);});
 async function loadBaked(){const info=await (await fetch('./assets/reflections/probes.json?v=mockup-round4-20261116')).json();
  for(const state of ['day','night']){const maps=new Map();await Promise.all(info.maps.filter(m=>m.state===state).map(async m=>{const blob=await (await fetch('./assets/reflections/'+m.file+'?v=mockup-round4-20261116')).blob(),bitmap=await createImageBitmap(blob,{colorSpaceConversion:'none',premultiplyAlpha:'none'});const c=document.createElement('canvas');c.width=m.width;c.height=m.height*4;const cx=c.getContext('2d',{willReadFrequently:true});cx.drawImage(bitmap,0,0);const rgba=cx.getImageData(0,0,m.width,m.height*4).data,values=new Uint16Array(m.width*m.height*4);for(let i=0,n=m.width*m.height;i<n;i++){const exponent=rgba[(3*n+i)*4],scale=exponent?Math.pow(2,exponent-128)/255:0;for(let k=0;k<3;k++)values[i*4+k]=THREE.DataUtils.toHalfFloat(rgba[(k*n+i)*4]*scale);values[i*4+3]=THREE.DataUtils.toHalfFloat(1);}bitmap.close();const texture=new THREE.DataTexture(values,m.width,m.height,THREE.RGBAFormat,THREE.HalfFloatType);texture.mapping=THREE.CubeUVReflectionMapping;texture.minFilter=texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;texture.needsUpdate=true;maps.set(m.room,{texture,dispose(){texture.dispose()}});}));cache.set(state,maps);if(requested===state)apply(state);}
  stats.size=64;stats.states=cache.size;stats.source='Authoring bake of the same connected geometry; cached day/night specular probes';stats.totalCaptureMs=0;
 }
 return {request,step,stats,dump(){const maps=[];for(const [state,rooms]of cache)for(const [room,target]of rooms){const data=new Uint16Array(target.width*target.height*4);renderer.readRenderTargetPixels(target,0,0,target.width,target.height,data);maps.push({state,room,width:target.width,height:target.height,data});}return maps;},dispose(){for(const maps of cache.values())for(const t of maps.values())t.dispose();cache.clear();}};
}
