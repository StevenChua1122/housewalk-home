/*
 * Housewalk Real Rooms v4 - detailed, reference-matched WebGL renderer.
 * The approved warm-tone living/dining interior is modeled as real depth-tested
 * geometry. The bedroom and bath remain deliberately lightweight.
 * Preserves
 * the original Canvas fallback, touch joystick, door controls and mini-map.
 * All furniture is real 3-D geometry with depth testing, not a picture plane.
 */
(function () {
 'use strict';
 const bridge=window.HousewalkBridge;
 if(!bridge || !bridge.player) return;
 const old=document.getElementById('view');
 const canvas=document.createElement('canvas');
 canvas.id='realView';canvas.setAttribute('aria-hidden','true');
 canvas.style.cssText='position:fixed;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:1;opacity:0;transition:opacity .35s';
 old.insertAdjacentElement('afterend',canvas);
 let gl;
 try {gl=canvas.getContext('webgl',{antialias:true,alpha:false,depth:true,powerPreference:'default',preserveDrawingBuffer:false}) || canvas.getContext('experimental-webgl',{antialias:true,alpha:false,depth:true});}
 catch(e){}
 if(!gl) {canvas.remove();return;}
 const VS=`precision highp float;
 attribute vec3 aPosition;
 attribute vec3 aNormal;
 attribute vec2 aUV;
 attribute vec3 aTint;
 attribute float aMaterial;
 uniform mediump vec3 uCamera;
 uniform float uYaw;
 uniform float uPitch;
 uniform vec2 uFocal;
 varying vec3 vNormal;
 varying vec2 vUV;
 varying vec3 vTint;
 varying float vMaterial;
 varying vec3 vWorld;
 void main(){
 vec3 diff=aPosition-uCamera;
 float sy=sin(uYaw),cy=cos(uYaw),sp=sin(uPitch),cp=cos(uPitch);
 float right=diff.x*cy+diff.z*sy;
 float forward=diff.x*sy-diff.z*cy;
 float vert=diff.y*cp-forward*sp;
 float depth=diff.y*sp+forward*cp;
 gl_Position=vec4(right*uFocal.x,vert*uFocal.y,depth*1.006-0.1806,depth);
 vNormal=aNormal;vUV=aUV;vTint=aTint;vMaterial=aMaterial;vWorld=aPosition;
 }`;
 const FS=`precision mediump float;
 uniform sampler2D uAtlas;
 uniform sampler2D uShadow;
 uniform sampler2D uRoomShadow;
 uniform sampler2D uKitchenShadow;
 uniform float uHasRoomShadows;
 uniform float uHasShadow;
 uniform float uNight;
 uniform mediump vec3 uCamera;
 varying vec3 vNormal;
 varying vec2 vUV;
 varying vec3 vTint;
 varying float vMaterial;
 varying vec3 vWorld;
 float pointLight(vec3 p, vec3 n, vec3 lamp, float strength){
  vec3 dir=lamp-p; float dist2=dot(dir,dir); dir*=inversesqrt(max(.0001,dist2));
  return strength*max(dot(n,dir),0.0)/(1.0+dist2*.30);
 }
 float footShadow(vec2 p,vec2 center,vec2 halfSize,float spread){
   vec2 d=max(abs(p-center)-halfSize,0.0);
   return 1.0-smoothstep(.04,spread,length(d));
 }
 float shadowTap(vec2 uv,float depth){vec2 rg=texture2D(uShadow,uv).rg;return step(depth-.003,rg.x+rg.y/255.0);}
 float visibility(vec3 p){
   vec2 uv=vec2((p.x-.4*p.y+1.0)/6.0,(p.z+1.9*p.y+1.0)/9.0);
   float d=(5.0-p.y)/6.0;
   float lit=shadowTap(uv+vec2(-.0012,-.0012),d)+shadowTap(uv+vec2(.0012,-.0012),d)+shadowTap(uv+vec2(-.0012,.0012),d)+shadowTap(uv+vec2(.0012,.0012),d);
   return mix(1.0,lit*.25,uHasShadow);
 }
 float roomVisibility(vec3 p,vec3 lamp,float focal,sampler2D map){
   float d=lamp.y-p.y;
   vec2 uv=(p.xz-lamp.xz)*focal/max(d,.01)*.5+.5;
   if(d<.06||uv.x<.002||uv.x>.998||uv.y<.002||uv.y>.998)return 1.0;
   float depth=d/8.0-.003;
   vec2 a=texture2D(map,uv+vec2(-.0015,.0015)).rg,b=texture2D(map,uv+vec2(.0015,-.0015)).rg;
   float light=.5*(step(depth,a.x+a.y/255.0)+step(depth,b.x+b.y/255.0));
   return mix(1.0,.22+.78*light,uHasRoomShadows);
 }
 void main(){
  float m=floor(vMaterial+.02);
  float tileX=mod(m,4.0),tileY=floor(m/4.0);
  vec2 uv=vec2(tileX,tileY)*.25+(vec2(.010)+fract(vUV)*.980)*.25;
  vec3 tex=texture2D(uAtlas,uv).rgb;
  vec3 n=normalize(vNormal);
  vec3 v=normalize(uCamera-vWorld);
  // Window light is bounded by the actual opening, with soft penumbrae.
  vec3 sun=normalize(vec3(.40,1.0,-1.90));
  float toWindow=max(0.0,(vWorld.z+.60)/1.90);
  vec2 hit=vec2(vWorld.x+.40*toWindow,vWorld.y+toWindow);
  float aperture=smoothstep(.67,.80,hit.x)*(1.0-smoothstep(2.67,2.80,hit.x))*smoothstep(.81,.94,hit.y)*(1.0-smoothstep(2.10,2.23,hit.y));
  float daylight=max(dot(n,sun),0.0)*aperture*visibility(vWorld);
  float key1=pointLight(vWorld,n,vec3(1.70,2.60,3.49),.88)*roomVisibility(vWorld,vec3(1.70,2.60,3.49),1.25,uRoomShadow);
  float key2=pointLight(vWorld,n,vec3(1.70,2.60,1.39),.88);
  float diningKey=pointLight(vWorld,n,vec3(1.0,2.40,5.24),1.20);
  float nicheKey=pointLight(vWorld,n,vec3(1.74,2.61,-.14),.65);
  float kitchenKey=pointLight(vWorld,n,vec3(3.18,2.68,5.70),1.26)*roomVisibility(vWorld,vec3(3.18,2.68,5.70),1.10,uKitchenShadow);
  float taskKey=pointLight(vWorld,n,vec3(3.14,1.76,6.72),.48);
  float kitchenFill=(1.0-uNight)*pointLight(vWorld,n,vec3(3.30,1.46,7.20),.60);
  vec3 base=pow(tex*vTint,vec3(2.2));
  float windowFill=exp(-max(vWorld.z,0.0)*.24)*(.4+.6*max(n.z,0.0));
  vec3 ambient=mix(vec3(.26,.27,.28),vec3(.07,.07,.08),uNight);
  vec3 bounce=vec3(.10,.075,.05)*(.6+.4*n.y);
  vec3 result=base*(ambient+bounce+vec3(1.00,.68,.40)*(key1+key2+diningKey+nicheKey+kitchenKey+taskKey)*1.05+
    (1.0-uNight)*(vec3(.22,.24,.24)*(windowFill+kitchenFill)+vec3(.30,.23,.15)*daylight));
  // Soft contact occlusion under actual modeled furniture; never draw fake hard shadows.
  if(m<.5 && vWorld.y<.045){
    float oc=0.0;
    oc+=.30*footShadow(vWorld.xz,vec2(.70,2.46),vec2(.49,1.07),.42);
    oc+=.21*footShadow(vWorld.xz,vec2(.96,4.65),vec2(.84,.41),.31);
    oc+=.24*footShadow(vWorld.xz,vec2(3.02,2.10),vec2(.23,1.00),.36);
    oc+=.14*footShadow(vWorld.xz,vec2(3.04,.84),vec2(.22,.31),.23);
    oc+=.27*footShadow(vWorld.xz,vec2(3.32,6.68),vec2(1.25,.31),.25);
    oc+=.22*footShadow(vWorld.xz,vec2(1.75,6.65),vec2(.36,.34),.22);
    oc+=.12*footShadow(vWorld.xz,vec2(2.98,3.43),vec2(.20,.31),.18);
    result*=1.0-clamp(oc,0.0,.48);
    // Soft branch/leaf breakup only inside the projected window light.
    float leaves=sin(hit.x*35.0+sin(hit.y*29.0))*sin(hit.y*41.0+sin(hit.x*17.0));
    result+=vec3(.045,.035,.020)*(1.0-uNight)*daylight*smoothstep(-.4,.7,leaves);

  }
  // Ambient occlusion at wall/floor junctions creates grounded geometry.
  if(m>0.5&&m<1.5){
    float edge=min(abs(vWorld.x),abs(vWorld.x-3.19));
    float corner=(.82+.18*smoothstep(.02,.45,vWorld.y))*(.88+.12*smoothstep(.02,.40,edge));
    result*=corner;
  }
  // Bright view through the glass receives sunlight instead of indoor darkening.
  if(m>11.5&&m<12.5){result=pow(tex,vec3(2.2))*mix(vec3(1.0,1.03,1.05),vec3(.06,.10,.17),uNight);}
  // Brushed stainless picks up broad room reflections; charcoal cabinet fronts stay matte.
  if(m>6.5&&m<7.5){
    float fresnel=pow(1.0-max(dot(n,v),0.0),4.0);
    float reflection=.5+.5*sin(reflect(-v,n).y*2.4+reflect(-v,n).x*.8);
    result+=vec3(.055,.065,.075)*reflection+vec3(.07)*fresnel;
    if(vWorld.x>3.09&&vWorld.x<3.60&&vWorld.z>6.46&&vWorld.z<6.86&&vWorld.y<.89)result*=.38;
    vec3 h=normalize(normalize(vec3(3.18,2.68,5.7)-vWorld)+v);
    result+=vec3(.35,.30,.23)*pow(max(dot(n,h),0.0),48.0);
  }
  // Low-specular, polished accents on the metal bracket and walnut table.
  if((m>1.5&&m<2.5)||(m>5.5&&m<8.5)||(m>9.5&&m<10.5)){
    vec3 h=normalize(sun+v);float spec=pow(max(dot(n,h),0.0),22.0);
    result+=vec3(.16,.12,.085)*spec*(1.0-uNight);
  }
  if(m>13.5&&m<14.5){result=mix(result,vec3(1.00,.79,.47),.78);}
  // Keep the lamps warm after dark. Local luminaires remain active in evening mode.
  // Soft highlight shoulder keeps white paint and stainless from clipping yellow.
  result=(result*(2.51*result+.03))/(result*(2.43*result+.59)+.14);
  result=pow(clamp(result,0.0,1.0),vec3(1.0/2.2));
  if(m>13.5&&m<14.5)result=vec3(1.0,.88,.68);
  gl_FragColor=vec4(clamp(result,0.0,1.0),1.0);
 }`;
 function shader(kind,source){const sh=gl.createShader(kind);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;}
 let prog;
 try {prog=gl.createProgram();gl.attachShader(prog,shader(gl.VERTEX_SHADER,VS));gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,FS));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));}
 catch(e){console.warn('Housewalk WebGL fallback:',e);canvas.remove();return;}
 gl.useProgram(prog);
 const attrs={p:gl.getAttribLocation(prog,'aPosition'),n:gl.getAttribLocation(prog,'aNormal'),uv:gl.getAttribLocation(prog,'aUV'),color:gl.getAttribLocation(prog,'aTint'),mat:gl.getAttribLocation(prog,'aMaterial')};
 const uni={cam:gl.getUniformLocation(prog,'uCamera'),yaw:gl.getUniformLocation(prog,'uYaw'),pitch:gl.getUniformLocation(prog,'uPitch'),focal:gl.getUniformLocation(prog,'uFocal'),night:gl.getUniformLocation(prog,'uNight'),atlas:gl.getUniformLocation(prog,'uAtlas')};
 const M={floor:0,plaster:1,black:2,cream:3,sofa:4,white:5,slate:6,steel:7,curtain:8,cabinet:9,leaf:3,walnut:10,ivory:11,sky:12,dark:13,bulb:14,wood:15};
 function randGen(seed){let x=seed>>>0;return ()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
 const rng=randGen(71326);
 function atlas(){const side=256,C=document.createElement('canvas');C.width=C.height=side*4;const c=C.getContext('2d',{alpha:false});
  const palette=['#cdb395','#e8e2d8','#27292a','#eae2d3','#777778','#f2f1ea','#777879','#bfc1c3','#a99888','#92908b','#674939','#ddd9cf','#b2c9cd','#515056','#f4cd90','#bd9d7e'];
  for(let i=0;i<16;i++){
   const ox=(i%4)*side,oy=Math.floor(i/4)*side;
   c.fillStyle=palette[i];c.fillRect(ox,oy,side,side);
   if(i===0||i===10||i===15){ // Realistic longitudinal wood grain; no checkerboard tiles.
    for(let k=0;k<360;k++){
     let x=ox+rng()*side,y=oy+rng()*side;
     c.strokeStyle=rng()>.52?'rgba(101,69,39,.045)':'rgba(255,247,215,.07)';
     c.lineWidth=.35+rng()*1.35;c.beginPath();c.moveTo(x,y);
     const bend=Math.sin((y-oy)/24+x*.018)*(.7+rng()*2.0);
     c.bezierCurveTo(x+bend,y+28,x-bend,y+58,x+(rng()-.5)*3,y+84+rng()*115);c.stroke();
    }
    for(let k=0;k<14;k++){let x=ox+30+rng()*(side-60),y=oy+25+rng()*(side-50);c.strokeStyle='rgba(96,65,45,.045)';c.lineWidth=.75;
      for(let r=4;r<13;r+=3){c.beginPath();c.ellipse(x,y,r*.62,r*2.1,.13,0,Math.PI*2);c.stroke();}}
   }else if(i===4||i===3||i===8||i===13){
    for(let k=0;k<14000;k++){let n=rng()>.5?255:18;c.fillStyle=`rgba(${n},${n},${n},${.012+rng()*.055})`;c.fillRect(ox+rng()*side,oy+rng()*side,1+rng()*1.5,1+rng()*1.1);}
    if(i===4||i===3){ // Crossed warp/weft threads, fine enough to read as upholstery.
     for(let k=0;k<side;k+=3){c.fillStyle='rgba(245,239,229,.065)';c.fillRect(ox+k,oy,1,side);c.fillStyle='rgba(20,18,17,.065)';c.fillRect(ox,oy+k,side,1);}
     for(let a=0;a<side;a+=6)for(let b=0;b<side;b+=6){c.fillStyle='rgba(247,243,235,.13)';c.fillRect(ox+a,oy+b,2,1);}
    }
   }else if(i===1||i===5||i===11){
    for(let k=0;k<14000;k++){let n=rng()>.5?255:28;c.fillStyle=`rgba(${n},${n},${n},${.007+rng()*.019})`;c.fillRect(ox+rng()*side,oy+rng()*side,1,1);}
   }else if(i===12){
    const g=c.createLinearGradient(ox,oy,ox,oy+side);g.addColorStop(0,'#9fbec8');g.addColorStop(.45,'#c3d5df');g.addColorStop(.75,'#b7ccd5');g.addColorStop(1,'#a5bdcb');c.fillStyle=g;c.fillRect(ox,oy,side,side);

   }else if(i===7){
     for(let k=0;k<side;k++){c.fillStyle=`rgba(255,255,255,${rng()*.045})`;c.fillRect(ox,oy+k,side,1);}
   }else if(i===9){
     for(let k=0;k<side;k+=2){c.fillStyle='rgba(246,244,236,.025)';c.fillRect(ox+k,oy,1,side);c.fillStyle='rgba(30,30,30,.020)';c.fillRect(ox,oy+k,side,1);}
   }else if(i===99){
     for(let k=0;k<1300;k++){let x=ox+rng()*side,y=oy+rng()*side;c.fillStyle='rgba(37,77,37,.14)';c.beginPath();c.ellipse(x,y,1+rng()*5,1+rng()*6,0,0,Math.PI*2);c.fill();}
   }
   // Avoid texture atlas bleeding along cell boundaries.
   c.strokeStyle='rgba(40,40,40,.02)';c.strokeRect(ox+.5,oy+.5,side-1,side-1);
  }
  return C;
 }
 const tex=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
 const atlasCanvas=atlas();
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlasCanvas);
 // Reference-matched oak grain. Encoded material-only crop has no identifiable room contents.
 // A compressed photo-derived material atlas is loaded as a normal local asset.
 // Keep the procedural atlas until the photo atlas finishes decoding (Safari-safe fallback).
 const photoAtlas=new Image();
 photoAtlas.onload=()=>{
   try{gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
     const c=atlasCanvas.getContext('2d');
     // Keep tileable oak and woven linen; the photo oak includes baked highlights.
     for(const i of [0,1,2,3,4,5,6,7,8,9,11,12,15]){const x=i%4*256,y=Math.floor(i/4)*256;
       const tile=document.createElement('canvas');tile.width=tile.height=256;tile.getContext('2d').drawImage(atlasCanvas,x,y,256,256,0,0,256,256);
       if(!photoAtlas.tiles)photoAtlas.tiles=[];photoAtlas.tiles.push({x,y,tile});}
     c.drawImage(photoAtlas,0,0,1024,1024);
     for(const {x,y,tile} of photoAtlas.tiles)c.drawImage(tile,x,y);
     gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlasCanvas);
     gl.generateMipmap(gl.TEXTURE_2D);window.__HW4_MATERIALS=true;
   }catch(err){console.warn('Housewalk materials fallback',err);}
 };
 photoAtlas.onerror=()=>console.warn('Housewalk: using generated textures');
 photoAtlas.src='./materials.jpg?v=4.0';gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.generateMipmap(gl.TEXTURE_2D);gl.uniform1i(uni.atlas,0);
 // Geometry stays entirely on the GPU once generated.
 const verts=[];let id=0;
 function color(hex){if(Array.isArray(hex))return hex;if(!hex)return [1,1,1];const v=hex.replace('#','');return [parseInt(v.slice(0,2),16)/255,parseInt(v.slice(2,4),16)/255,parseInt(v.slice(4,6),16)/255];}
 function vertex(p,n,uv,material,tint){verts.push(p[0],p[1],p[2],n[0],n[1],n[2],uv[0],uv[1],tint[0],tint[1],tint[2],material);}
 function quad(a,b,c,d,normal,mat,tint='#ffffff',repeatU=1,repeatV=1){const col=color(tint);
  vertex(a,normal,[0,0],mat,col);vertex(b,normal,[repeatU,0],mat,col);vertex(c,normal,[repeatU,repeatV],mat,col);
  vertex(a,normal,[0,0],mat,col);vertex(c,normal,[repeatU,repeatV],mat,col);vertex(d,normal,[0,repeatV],mat,col);
 }
 function box(x,y,z,w,h,d,m,t='#ffffff'){
  const a=x-w/2,b=x+w/2,c=y-h/2,e=y+h/2,f=z-d/2,g=z+d/2;
  quad([a,e,f],[b,e,f],[b,e,g],[a,e,g],[0,1,0],m,t,w,d);
  quad([a,c,g],[b,c,g],[b,c,f],[a,c,f],[0,-1,0],m,t,w,d);
  quad([a,c,f],[a,e,f],[a,e,g],[a,c,g],[-1,0,0],m,t,d,h);
  quad([b,c,g],[b,e,g],[b,e,f],[b,c,f],[1,0,0],m,t,d,h);
  quad([b,c,f],[b,e,f],[a,e,f],[a,c,f],[0,0,-1],m,t,w,h);
  quad([a,c,g],[a,e,g],[b,e,g],[b,c,g],[0,0,1],m,t,w,h);
 }
 function roundBox(x,y,z,w,h,d,r,mat,t='#ffffff',lean=0){
   r=Math.min(r,w*.46,h*.46,d*.46);
   const half=[w/2,h/2,d/2],col=color(t);
   function samples(h){const a=[];for(let i=0;i<=3;i++)a.push(-h+r*i/3);a.push(0);for(let i=0;i<=3;i++)a.push(h-r+r*i/3);return a;}
   for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){
     const [uAxis,vAxis]=[0,1,2].filter(k=>k!==axis),us=samples(half[uAxis]),vs=samples(half[vAxis]);
     function get(u,v){const p=[0,0,0];p[axis]=half[axis]*sign;p[uAxis]=u;p[vAxis]=v;
       const cl=p.map((q,k)=>Math.max(-half[k]+r,Math.min(half[k]-r,q))),dv=p.map((q,k)=>q-cl[k]),len=Math.hypot(...dv)||1;
       const pos=cl.map((q,k)=>q+dv[k]/len*r),n=dv.map(q=>q/len);
       // A slight recline gives cushions a natural upholstered profile.
       pos[0]+=lean*pos[1];n[1]-=lean*n[0];
       return {p:pos.map((q,k)=>q+[x,y,z][k]),n,uv:[u*3,v*3]};}
     for(let i=0;i<us.length-1;i++)for(let j=0;j<vs.length-1;j++){
       const a=get(us[i],vs[j]),b=get(us[i+1],vs[j]),c=get(us[i+1],vs[j+1]),d0=get(us[i],vs[j+1]);
       for(const k of [a,b,c,a,c,d0])vertex(k.p,k.n,k.uv,mat,col);
     }
   }
 }
 function cyl(x,y,z,r0,r1,h,mat,t='#ffffff',seg=16){const a=y-h/2,b=y+h/2,c=color(t);
   for(let k=0;k<seg;k++){let t0=k*2*Math.PI/seg,t1=(k+1)*2*Math.PI/seg;let n0=[Math.cos(t0),0,Math.sin(t0)],n1=[Math.cos(t1),0,Math.sin(t1)];
    const p=[x+r0*n0[0],a,z+r0*n0[2]],q=[x+r0*n1[0],a,z+r0*n1[2]],r=[x+r1*n1[0],b,z+r1*n1[2]],s=[x+r1*n0[0],b,z+r1*n0[2]];
    for(const [pt,n,uv] of [[p,n0,[k/seg,0]],[q,n1,[(k+1)/seg,0]],[r,n1,[(k+1)/seg,1]],[p,n0,[k/seg,0]],[r,n1,[(k+1)/seg,1]],[s,n0,[k/seg,1]]])vertex(pt,n,uv,mat,c);
    for(const [cent,normal,pts] of [[[x,b,z],[0,1,0],[s,r]],[[x,a,z],[0,-1,0],[p,q]]])for(const pt of [cent,...pts])vertex(pt,normal,[(pt[0]-x)/.4+.5,(pt[2]-z)/.4+.5],mat,c);
   }
 }
 function bar(a,b,r,mat,t='#ffffff',sides=9){ // cylinder aligned to arbitrary vector
  const v=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],vl=Math.hypot(...v)||1,dir=v.map(n=>n/vl);
  let up=Math.abs(dir[1])>.86?[1,0,0]:[0,1,0];const cross=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
  const normalize=v=>{let d=Math.hypot(...v)||1;return v.map(x=>x/d)};const basis=normalize(cross(dir,up)),side=normalize(cross(basis,dir)),col=color(t);
  for(let k=0;k<sides;k++){let t0=k*2*Math.PI/sides,t1=(k+1)*2*Math.PI/sides;const radial=t=>basis.map((v,j)=>v*Math.cos(t)*r+side[j]*Math.sin(t)*r);
    const ra=radial(t0),rb=radial(t1),p0=a.map((v,j)=>v+ra[j]),p1=a.map((v,j)=>v+rb[j]),q0=b.map((v,j)=>v+ra[j]),q1=b.map((v,j)=>v+rb[j]);
    for(const [pt,n,uv] of [[p0,normalize(ra),[k/sides,0]],[q0,normalize(ra),[k/sides,vl]],[q1,normalize(rb),[(k+1)/sides,vl]],[p0,normalize(ra),[k/sides,0]],[q1,normalize(rb),[(k+1)/sides,vl]],[p1,normalize(rb),[(k+1)/sides,0]]])vertex(pt,n,uv,mat,col);
  }
 }
 function paneX(x,z0,z1,y0,y1,mat=M.plaster,t='#ffffff',depth=.12){box(x,(y0+y1)/2,(z0+z1)/2,depth,y1-y0,z1-z0,mat,t)}
 function paneZ(z,x0,x1,y0,y1,mat=M.plaster,t='#ffffff',depth=.12){box((x0+x1)/2,(y0+y1)/2,z,x1-x0,y1-y0,depth,mat,t)}

 // Architectural trims, curtain drape and upholstered finishing details.
 function rail(a,b,r=.007,mat=M.cream,t='#ffffff'){bar(a,b,r,mat,t,7);}
 function fabricSeam(x,y,z0,z1,t='#8d7f71'){rail([x,y,z0],[x,y,z1],.0065,M.sofa,t);}
 function curtain(x0,x1,z,y0,y1,tint='#c1a996',shade=.68){
   const X=60,Y=19,C=color(tint),cols=X,rows=Y;
   function p(i,j){const f=i/X,g=j/Y;const x=x0+(x1-x0)*f;
     const phase=f*12*Math.PI;
     const fold=(Math.sin(phase)*.055+Math.sin(phase*2+.3)*.010)*(.87+.13*g);
     return [x,y0+(y1-y0)*g,z+fold];}
   for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){
     const a=p(i,j),b=p(i+1,j),c=p(i+1,j+1),d=p(i,j+1);
     const phase=(i+.5)/X*12*Math.PI;
     const slope=(.055*Math.cos(phase)+.020*Math.cos(phase*2+.3))*12*Math.PI/(x1-x0);
     const normal=[-slope,0,1],occlusion=.78+.22*(.5+.5*Math.sin(phase));
     const cloth=C.map(v=>v*occlusion);
     const uv=(u,v)=>[u*2.0,v*1.8];
     for(const [pt,tt] of [[a,uv(i/X,j/Y)],[b,uv((i+1)/X,j/Y)],[c,uv((i+1)/X,(j+1)/Y)],[a,uv(i/X,j/Y)],[c,uv((i+1)/X,(j+1)/Y)],[d,uv(i/X,(j+1)/Y)]])vertex(pt,normal,tt,M.curtain,cloth);
   }
   for(let i=0;i<X;i++){const a=p(i,.02*Y),b=p(i+1,.02*Y);bar(a,b,.002,M.curtain,tint,5);}
 }
 function cushionPiping(x0,x1,y,z0,z1,t='#bba996'){
   for(let zz of [z0,z1])rail([x0,y,zz],[x1,y,zz],.008,M.ivory,t);
   for(let xx of [x0,x1])rail([xx,y,z0],[xx,y,z1],.008,M.ivory,t);
 }
 function pad(x,y,z,w,h,d,material=M.sofa,t='#ffffff'){
    roundBox(x,y,z,w,h,d,Math.min(.105,h*.44,d*.15),material,t);
 }
 function windowFrame(z,x0,x1,y0,y1){
   const c='#697d87';
   for(const xx of [x0,x1])box(xx,(y0+y1)/2,z,.045,y1-y0+.055,.09,M.steel,c);
   for(const yy of [y0,y1])box((x0+x1)/2,yy,z,x1-x0,.042,.096,M.steel,c);
 }

 function drawFloor(){
   const oak='#faf5eb',plaster='#fbf3e8';
   // Lengthwise wooden floor planks; no beige ceramic tiles.
   box(3.15,-.046,3.525,6.3,.085,7.05,M.wood,'#e5d1b6');
   box(1.74,-.046,-.305,2.43,.085,1.02,M.wood,'#e5d1b6');
   function plankZone(x0,x1,z0,z1){
    for(let x=x0;x<x1-.03;x+=.19){const row=Math.floor((x-x0)/.19),startZ=z0-((row%3)*.41);
      for(let z=startZ;z<z1;z+=1.58){const a=Math.max(z0,z),b=Math.min(z1,z+1.58);if(b-a<.03)continue;
        const warm=.965+rng()*.07;box(x+.094,.008,(a+b)/2,.185,.014,b-a-.004,M.floor,[warm,warm*.994,warm*.984]);
      }
    }
   }
   plankZone(0,6.30,0,7.05);plankZone(.54,2.94,-.79,0);
   // Entire ceiling remains continuous: NO horizontal beam above the deep window nook.
   box(3.15,2.804,3.15,6.30,.075,7.71,M.plaster,'#fff8ef');
   paneX(0,0,7.05,0,2.77,M.plaster,plaster);
   paneX(6.30,0,7.05,0,2.77,M.plaster,plaster);
   paneZ(7.05,0,.50,0,2.77,M.plaster,plaster);
   paneZ(7.05,1.39,2.77,0,2.77,M.plaster,plaster);
   paneZ(7.05,3.79,6.30,0,2.77,M.plaster,plaster);
   paneZ(7.05,2.77,3.79,0,1.05,M.plaster,plaster);
   paneZ(7.05,2.77,3.79,1.72,2.77,M.plaster,plaster);
   // LEFT living/dining wall without opening (user confirmed).
   paneZ(0,0,.54,0,2.77,M.plaster,plaster);
   paneZ(0,2.94,3.66,0,2.77,M.plaster,plaster);
   paneZ(0,5.80,6.30,0,2.77,M.plaster,plaster);
   // Bedroom exterior window is intentionally basic for now.
   paneZ(0,3.66,5.80,0,.86,M.plaster,plaster);
   paneZ(0,3.66,5.80,2.20,2.77,M.plaster,plaster);
   for(const xx of [3.66,4.73,5.80])box(xx,1.53,-.018,.050,1.42,.08,M.steel,'#657682');
   // Deep recessed alcove: back wall 0.63m behind the room boundary.
   paneX(.54,-.65,.29,0,2.77,M.plaster,plaster);
   paneX(2.94,-.65,.29,0,2.77,M.plaster,plaster);
   paneZ(-.65,.54,2.94,0,.81,M.plaster,plaster);
   paneZ(-.65,.54,2.94,2.22,2.77,M.plaster,plaster);
   // Close the unframed strips beside the glazing; no change to inherited opening dimensions.
   paneZ(-.65,.54,.70,.81,2.22,M.plaster,plaster);
   paneZ(-.65,2.78,2.94,.81,2.22,M.plaster,plaster);
   // The two adjoining blue-grey framed windows occupy 30%-80% of wall height.
   exterior();
   windowFrame(-.60,.70,2.78,.82,2.22);
   for(const [x0,x1] of [[.70,1.74],[1.74,2.78]]){

     box((x0+x1)/2,1.07,-.565,x1-x0,.054,.097,M.steel,'#71828a');
     box((x0+x1)/2,.835,-.56,x1-x0,.027,.105,M.steel,'#657481');
     // Glazing mullion and bottom-panel frame; no floor-to-ceiling sliding doors.

   }
   box(1.74,1.52,-.537,.045,1.39,.12,M.steel,'#667985');
   // Fine hardware handles and realistic window sill.
   for(const xx of [1.65,1.82]){rail([xx,1.38,-.49],[xx,1.53,-.49],.009,M.steel,'#d3c6b4');}
   box(1.74,.79,-.55,2.22,.052,.19,M.white,'#e9e7df');
   // White returns and skirting emphasize the alcove depth.
   for(const [x,z0,z1] of [[.073,0,7.00],[6.22,0,7.00],[.55,-.63,.30],[2.93,-.63,.30],[3.17,.23,3.73],[4.72,4.57,5.39],[4.72,6.33,7]]){
     box(x,.061,(z0+z1)/2,.024,.121,z1-z0,M.white,'#f8f3e9');
   }
   box(1.75,.060,-.59,2.2,.118,.032,M.white,'#ede7dc');
   // The other rooms keep their original lightweight floor plan.
   paneX(3.25,0,3.78,0,2.77);
   paneX(3.25,4.43,4.55,0,2.77);
   paneX(4.79,4.55,5.43,0,2.77);paneX(4.79,6.29,7.05,0,2.77);
   paneX(4.79,5.43,6.29,2.18,2.77);
   paneZ(4.55,3.25,6.30,0,2.77);
   for(const z of [5.43,6.29])box(4.73,1.10,z,.10,2.20,.055,M.white,'#fcf9f2');
   box(4.73,2.20,5.86,.10,.065,.91,M.white,'#fcf9f2');
   // Adjacent bedroom door and pantry opening retain the existing navigation.
   for(const z of [3.78,4.43])box(3.17,1.10,z,.085,2.20,.05,M.white);
   box(3.17,2.20,4.105,.085,.065,.70,M.white);
   box(.46,1.05,6.77,.050,2.13,.69,M.walnut,'#f1e1d0');
   cyl(.43,.96,6.44,.035,.035,.05,M.steel,'#e0d8cb');
 }
 function living(){
   // Real wall jog behind the sofa at the AC side; flush with left wall elsewhere.
   box(.60,1.385,.75,1.20,2.77,.30,M.plaster,'#f7f2e9');
   const acStart=verts.length;
   // Split-unit air conditioner: beveled enclosure, vent, slit louvers and status LED.
   roundBox(.64,2.34,.93,.83,.32,.24,.034,M.white,'#fafaf9');
   box(.64,2.19,1.062,.77,.030,.015,M.black,'#343b3f');
   for(let i=0;i<3;i++)box(.64,2.182+i*.009,1.075,.72,.003,.018,M.steel,'#939a9b');
   for(let i=0;i<15;i++){box(.25+i*.053,2.183,1.074,.010,.025,.020,M.steel,'#b2b5b3');}
   box(.63,2.315,1.058,.65,.012,.014,M.ivory,'#e9e8e4');
   cyl(.96,2.34,1.056,.009,.009,.01,M.leaf,'#8cc684',10);
   // The enclosure back must sit ON the mounting face (z=.90), not 9 cm inside it.
   for(let i=acStart;i<verts.length;i+=12)verts[i+2]+=.09;
   const sofaStart=verts.length;
   // The approved three-seat sofa is flush against the left wall. NO chaise, rug, coffee table.
   const x=.69,z=2.43;
   for(const zz of [1.46,3.42])for(const xx of [.20,1.12]){
     roundBox(xx,.100,zz,.095,.20,.09,.018,M.walnut,'#7b5743');
   }
   roundBox(.72,.335,z,1.09,.34,2.16,.11,M.sofa,'#d2cec8');
   // Rounded backrest touching plaster.
   roundBox(.19,.72,z,.30,.73,2.20,.085,M.sofa,'#dad5cd');
   for(let i=0;i<3;i++){
      const zz=1.75+i*.68;
      pad(.75,.53,zz,1.03,.22,.65,M.sofa,'#e2dfd9');
      roundBox(.36,.84,zz,.34,.65,.64,.095,M.sofa,'#e2dfd9',-.15);
      cushionPiping(.32,1.20,.598,zz-.295,zz+.295,'#b6aa9e');
      for(const edge of [-1,1])rail([.535,.64,zz+edge*.27],[.46,1.10,zz+edge*.27],.004,M.sofa,'#c1b2a1');
      rail([.33,.505,zz-.26],[1.20,.505,zz-.26],.006,M.ivory,'#cfc0b0');
   }
   for(const zz of [1.27,3.59])roundBox(.78,.63,zz,1.12,.55,.21,.065,M.sofa,'#d7d2cc');
   function pillow(cx,cy,cz,mat,tint,angle){
     const start=verts.length;
     roundBox(cx,cy,cz,.22,.49,.46,.10,mat,tint,-.18);
     // Tailored piping sits just inside the softly rounded front edge.
     const path=[];
     for(let i=0;i<=48;i++){const a=i*Math.PI/24;const yy=.215*Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),.45),zz=.20*Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),.45);path.push([cx+.104-.18*yy,cy+yy,cz+zz]);}
     for(let i=0;i<48;i++)bar(path[i],path[i+1],.0025,mat,tint,5);
     for(let i=start;i<verts.length;i+=12){const x=verts[i]-cx,z=verts[i+2]-cz,nx=verts[i+3],nz=verts[i+5];verts[i]=cx+x*Math.cos(angle)+z*Math.sin(angle);verts[i+2]=cz-x*Math.sin(angle)+z*Math.cos(angle);verts[i+3]=nx*Math.cos(angle)+nz*Math.sin(angle);verts[i+5]=-nx*Math.sin(angle)+nz*Math.cos(angle);}
   }
   pillow(.59,.89,1.87,M.cream,'#eee3d4',-.42);
   pillow(.66,.86,2.53,M.cream,'#b56526',-.35);
   pillow(.62,.89,3.18,M.cream,'#f5ecdb',-.48);
   // Provisional relative-scale correction from the mockup, not a surveyed furniture size.
   // Preserve the three-seat meshes and seams; change only depth and height.
   for(let i=sofaStart;i<verts.length;i+=12){
     const lower=verts[i+1]<=.64;
     verts[i]=.04+(verts[i]-.04)*.74;verts[i+1]=lower?verts[i+1]*.75:verts[i+1]-.16;
     verts[i+3]/=.74;if(lower)verts[i+4]/=.75;
   }
   // Grey-topped white storage cabinet, correctly opposite the sofa.
   box(3.005,.275,2.10,.425,.54,2.00,M.white,'#fffefb');
   box(2.78,.285,2.10,.018,.48,1.95,M.ivory,'#f5efe3');
   roundBox(3.0,.565,2.10,.475,.050,2.04,.017,M.slate,'#f2ece5');
   box(3.0,.043,2.10,.44,.075,1.94,M.dark,'#6c6e70');
   for(let zz of [1.60,2.10,2.60])box(2.765,.285,zz,.013,.43,.009,M.white,'#dbd7d1');
   trolley();
   // Wall TV MOUNT ONLY — no television, no electronics, no decorations.
   for(let yy of [1.42,1.82])box(3.171,yy,2.50,.062,.061,.97,M.black,'#cac3b3');
   for(const zz of [2.05,2.95]){
      box(3.127,1.64,zz,.065,.65,.067,M.black,'#b4ada3');
      for(let yy of [1.46,1.58,1.71,1.84]){
         box(3.085,yy,zz,.018,.027,.026,M.dark,'#161718');
      }
   }
   // Empty white metal 5-tier shelf just BEFORE the recessed window.
   const X=2.96,Z=.82;
   for(const xx of [2.725,3.195])for(const zz of [.55,1.09]){
      roundBox(xx,1.00,zz,.028,1.98,.029,.007,M.white,'#fffaf1');
   }
   for(const yy of [.16,.60,1.04,1.48,1.92]){
     roundBox(X,yy,Z,.51,.033,.56,.008,M.white,'#fffdf8');
   }
   // Linen curtains in front of, but not blocking, the deep recessed window.
   curtain(.59,1.84,.29,.035,2.63,'#c3aa92');
   curtain(2.46,2.88,.29,.035,2.63,'#c3aa92');
   rail([.58,2.67,.30],[2.89,2.67,.30],.015,M.steel,'#d8c6b2');
   // Living: lamp -> 3-blade fan -> lamp; niche has its OWN centrally placed lamp.
   for(const [cx,zz] of [[1.70,3.49],[1.70,1.39],[1.74,-.14]]){
      cyl(cx,2.710,zz,.108,.108,.14,M.black,'#6d5b4c',24);
      cyl(cx,2.621,zz,.089,.088,.023,M.bulb,'#ffe0af',24);
      rail([cx-.10,2.63,zz],[cx+.10,2.63,zz],.008,M.wood,'#d6bd96');
   }
   cyl(1.70,2.686,2.42,.076,.076,.13,M.black,'#b8aa9b',20);
   cyl(1.70,2.545,2.42,.125,.15,.11,M.black,'#a3a099',24);
   for(let k=0;k<3;k++){
     const angle=k*Math.PI*2/3+.20,outline=[[.10,-.045],[.32,-.075],[.62,-.035],[.66,.045],[.57,.095],[.22,.065]];
     const points=outline.map(([r,t])=>[1.70+Math.cos(angle)*r-Math.sin(angle)*t,2.50-r*.025,2.42+Math.sin(angle)*r+Math.cos(angle)*t]);
     for(let i=1;i<points.length-1;i++)for(const [pt,n] of [[points[0],[0,-1,0]],[points[i],[0,-1,0]],[points[i+1],[0,-1,0]]])vertex(pt,n,[0,0],M.black,color('#a39d92'));
     for(let i=0;i<points.length;i++)bar(points[i],points[(i+1)%points.length],.006,M.black,'#a39d92',6);
   }

 }
 function dining(){
   // Exact layout: rectangular dark timber table beside left wall, chairs 2+2 on LONG sides.
   const x=.96,z=4.65;
   roundBox(x,.755,z,1.76,.065,.86,.018,M.black,'#a6a4a0');
   box(x,.680,z,1.61,.085,.70,M.black,'#9c9690');
   for(const xx of [.16,1.76])for(const zz of [4.30,5.0])roundBox(xx,.36,zz,.055,.72,.055,.009,M.black,'#b0a89e');
   function chair(cx,cz,side){
     const backZ=cz+side*.205,frontZ=cz-side*.19;
     for(const xx of [cx-.19,cx+.19]){
       roundBox(xx,.47,backZ,.043,.94,.045,.009,M.black,'#b0aaa1');
       bar([xx,.035,frontZ],[xx,.43,frontZ-side*.025],.022,M.black,'#b0aaa1',10);
       bar([xx,.22,frontZ],[xx,.22,backZ],.012,M.black,'#b0aaa1',8);
     }
     box(cx,.405,cz,.46,.055,.45,M.black,'#aaa297');
     roundBox(cx,.468,cz,.45,.10,.43,.043,M.cream,'#f3e9d7');
     for(const yy of [.66,.79,.91])roundBox(cx,yy,backZ,.38,.055,.045,.012,M.black,'#b4aca1');
   }
   for(const xx of [.49,1.34]){chair(xx,4.02,-1);chair(xx,5.28,1);}
   // Reference-matched three-head L track. Two heads on near-camera longitudinal
   // segment, third on return. They point TOWARD the dining tabletop.
   const y=2.720;
   box(.99,y,5.24,1.86,.034,.040,M.black,'#beb8b0');
   box(1.90,y,5.56,.040,.034,.68,M.black,'#beb8b0');
   function spotlight(sx,sz,tx,tz){
      const mount=[sx,2.63,sz],direction=[tx-sx,-1.8,tz-sz],len=Math.hypot(...direction),dir=direction.map(v=>v/len);
      const end=mount.map((v,i)=>v+dir[i]*.24);
      bar([sx,y,sz],mount,.018,M.black,'#c1b8ad',12);
      bar(mount,mount.map((v,i)=>v+dir[i]*.072),.061,M.wood,'#d5b27e',20);
      bar(mount.map((v,i)=>v+dir[i]*.070),end,.080,M.black,'#beb9b1',24);
      // Closed luminous disk normal to the aimed head, rather than a hollow tube.
      const u=[1,0,0],v=[0,-dir[2],dir[1]],vl=Math.hypot(...v),col=color('#ffe5b9');
      const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
      const vv=v.map(n=>n/vl),uu=cross(vv,dir);
      for(let i=0;i<24;i++){const points=[end];for(const k of [i,i+1])points.push(end.map((q,j)=>q+.069*(uu[j]*Math.cos(k*Math.PI/12)+vv[j]*Math.sin(k*Math.PI/12))));for(const pt of points)vertex(pt,dir,[.5,.5],M.bulb,col);}
   }
   spotlight(.53,5.24,.65,4.45);spotlight(1.40,5.24,1.16,4.45);spotlight(1.90,5.72,1.0,4.51);

 }
 function ringZ(x,y,z,outer,inner,depth,mat,t='#ffffff',segments=48){
   const col=color(t);
   for(let i=0;i<segments;i++){
     const a=i*Math.PI*2/segments,b=(i+1)*Math.PI*2/segments;
     const pt=(r,a,zz)=>[x+r*Math.cos(a),y+r*Math.sin(a),zz];
     for(const zz of [z-depth/2,z+depth/2]){
       const points=[pt(outer,a,zz),pt(outer,b,zz),pt(inner,b,zz),pt(inner,a,zz)];
       quad(...points,[0,0,zz<z?-1:1],mat,t);
     }
     for(const [r,sign] of [[outer,1],[inner,-1]]){
       const n0=[Math.cos(a)*sign,Math.sin(a)*sign,0],n1=[Math.cos(b)*sign,Math.sin(b)*sign,0];
       const points=[pt(r,a,z-depth/2),pt(r,b,z-depth/2),pt(r,b,z+depth/2),pt(r,a,z+depth/2)];
       for(const [j,n] of [[0,n0],[1,n1],[2,n1],[0,n0],[2,n1],[3,n0]])vertex(points[j],n,[j%2,0],mat,col);
     }
   }
 }
 function trolley(){
   const x=2.98,z=3.43;
   // Narrow 3-tier mesh trolley, tubular handle hoops and four black castors.
   for(const xx of [x-.18,x+.18])for(const zz of [z-.27,z+.27]){
     bar([xx,.075,zz],[xx,.81,zz],.011,M.white,'#fcfaf3',10);
     ringZ(xx,.055,zz,.044,.014,.035,M.black,'#45484a',16);
     bar([xx,.08,zz],[xx,.13,zz],.009,M.steel);
   }
   for(const yy of [.17,.42,.67]){
     for(const xx of [x-.19,x+.19])box(xx,yy+.043,z,.013,.085,.58,M.white);
     for(const zz of [z-.29,z+.29])box(x,yy+.043,zz,.39,.085,.013,M.white);
     // Open wire grid: thin rods leave visible holes rather than an opaque tray.
     for(let xx=x-.17;xx<=x+.18;xx+=.035)bar([xx,yy,z-.27],[xx,yy,z+.27],.0018,M.white,'#f8f6f0',4);
     for(let zz=z-.27;zz<=z+.28;zz+=.035)bar([x-.18,yy,zz],[x+.18,yy,zz],.0018,M.white,'#f8f6f0',4);
   }
   for(const zz of [z-.27,z+.27]){
     bar([x-.18,.81,zz],[x-.18,.86,zz],.011,M.white);
     bar([x+.18,.81,zz],[x+.18,.86,zz],.011,M.white);
     bar([x-.18,.86,zz],[x+.18,.86,zz],.011,M.white);
   }
 }
 function exterior(){
   // Real neighboring facade, recesses and balcony rails: parallax from every viewpoint.
   box(1.85,2.4,-5.8,7.4,8.0,.45,M.plaster,'#9eafb8');
   for(const x of [-.4,1.8,4.0])for(const y of [-.4,1.95,4.3]){
     box(x,y,-5.54,1.38,1.65,.09,M.black,'#59656c');
     box(x,y,-5.47,1.23,1.50,.04,M.sky,'#9baebd');
     box(x,y-.82,-5.05,1.75,.12,1.0,M.plaster,'#c7c8c3');
     for(let xx=x-.8;xx<x+.81;xx+=.16)bar([xx,y-.80,-4.61],[xx,y-.23,-4.61],.009,M.steel,'#8c9598',6);
     bar([x-.83,y-.23,-4.61],[x+.83,y-.23,-4.61],.018,M.steel,'#a5afb5');
     box(x,y,-5.40,.028,1.5,.05,M.steel,'#6e7c88');
   }
   // Kitchen lightwell is also actual depth, with blue-grey frosted glazing behind its frame.
   box(3.30,1.5,9.5,4,5,.25,M.plaster,'#b5c2c6');
   for(const x of [2.5,3.8]){box(x,1.75,9.33,.78,1.32,.06,M.sky,'#a3c0cb');box(x,1.75,9.28,.025,1.32,.06,M.steel);}
 }
 function kitchen(){
   // South-wall run, mirrored to face the living room: bathroom / washer / sink / hob / fridge.
   // All components stay inside the original 4.79 x 1.95 m pantry footprint.
   const front=6.35,back=6.98;
   box(3.015,.12,6.69,1.65,.16,.53,M.black,'#777470');
   box(3.015,.38,6.69,1.65,.48,.58,M.cabinet,'#dedbd5');
   for(const x of [2.47,3.02,3.57]){
     roundBox(x,.49,front,.535,.68,.027,.007,M.cabinet,'#d1d0ca');
     box(x,.836,front-.010,.57,.012,.028,M.black,'#8d8982');
   }
   // Counter is constructed around a real open basin rather than covering its cavity.
   const y=.885;
   roundBox(2.635,y,6.65,.89,.045,.68,.008,M.black,'#8b8c8b');
   roundBox(3.73,y,6.65,.26,.045,.68,.008,M.black,'#8b8c8b');
   box(3.34,y,6.39,.56,.045,.16,M.black,'#8b8c8b');
   box(3.34,y,6.93,.56,.045,.12,M.black,'#8b8c8b');
   // Recessed stainless basin: bottom, sloped walls, rolled rim, drain.
   box(3.34,.72,6.66,.43,.025,.30,M.steel,'#6b757a');
   for(const x of [3.10,3.58])box(x,.79,6.66,.025,.18,.37,M.steel,'#b8bfc0');
   for(const z of [6.47,6.85])box(3.34,.79,z,.50,.18,.025,M.steel,'#b8bfc0');
   for(const x of [3.08,3.60])box(x,.912,6.66,.035,.014,.43,M.steel,'#b5bec1');
   for(const z of [6.45,6.87])box(3.34,.912,z,.55,.014,.025,M.steel,'#b5bec1');
   cyl(3.34,.741,6.66,.036,.036,.006,M.black,'#666966',20);
   // Gooseneck faucet follows a sampled arc in the y/z plane.
   bar([3.37,.91,6.90],[3.37,1.15,6.90],.018,M.steel,'#d2d5d0',16);
   for(let i=0;i<18;i++){const a=i*Math.PI/18,b=(i+1)*Math.PI/18;bar([3.37,1.15+.13*Math.sin(a),6.77+.13*Math.cos(a)],[3.37,1.15+.13*Math.sin(b),6.77+.13*Math.cos(b)],.018,M.steel,'#d2d5d0',12);}
   bar([3.37,1.15,6.64],[3.37,1.10,6.64],.019,M.steel);
   bar([3.44,.94,6.89],[3.48,1.03,6.89],.010,M.steel);
   // Small off-white backsplash tiles and recessed grout, interrupted by the window.
   for(let x=2.20;x<4.12;x+=.105)for(let yy=.94;yy<1.80;yy+=.105){
     if(x>2.73&&x<3.82&&yy>1.02&&yy<1.75)continue;
     box(x+.05,yy+.05,6.977,.101,.101,.017,M.ivory,'#f0ece2');
   }
   windowFrame(6.99,2.77,3.79,1.05,1.72);
   // Frame interior edges are matte black, with a small sliding handle.
   for(const x of [2.77,3.79])box(x,1.385,6.94,.042,.71,.09,M.black,'#9a9997');
   for(const yy of [1.05,1.72])box(3.28,yy,6.94,1.06,.042,.09,M.black,'#9a9997');
   box(3.28,1.385,6.93,.025,.63,.045,M.black,'#9a9997');
   box(3.23,1.32,6.90,.015,.11,.025,M.steel,'#acb1ae');
   // White upper doors with fine shadow reveals and a warm under-cabinet strip.
   box(3.17,2.16,6.83,1.95,.78,.32,M.white,'#f7f6f0');
   for(const x of [2.43,2.92,3.41,3.90])roundBox(x,2.16,6.653,.478,.775,.025,.005,M.white,'#faf8f1');
   box(3.17,1.757,6.67,1.88,.010,.020,M.bulb,'#fff2d0');
   const hoodStart=verts.length;
   // Low-profile cooker hood, grease-filter grille and controls.
   roundBox(2.55,1.74,6.67,.67,.075,.49,.012,M.steel,'#bdc0bc');
   box(2.55,1.695,6.68,.52,.015,.32,M.black,'#777a78');
   for(let x=2.34;x<2.79;x+=.025)box(x,1.684,6.69,.009,.006,.25,M.steel,'#a9aaa6');
   for(const x of [2.40,2.45,2.50])box(x,1.736,6.412,.012,.012,.007,M.black);
   for(let i=hoodStart;i<verts.length;i+=12)verts[i+1]+=.10;
   // Two-burner gas hob, concentric burner rings and separate cast pan supports.
   roundBox(2.55,.924,6.66,.65,.018,.46,.008,M.steel,'#a4aaab');
   for(const x of [2.36,2.73]){
     cyl(x,.945,6.66,.080,.080,.025,M.black,'#91918a',28);
     cyl(x,.963,6.66,.050,.052,.012,M.steel,'#777c7c',24);
     cyl(x,.977,6.66,.043,.043,.015,M.black,'#91918a',24);
     for(const z of [6.51,6.81])bar([x-.13,.984,z],[x+.13,.984,z],.008,M.black,'#a6a09a');
     for(const xx of [x-.11,x+.11])bar([xx,.984,6.51],[xx,.984,6.81],.008,M.black,'#a6a09a');
   }
   for(const x of [2.45,2.61])cyl(x,.953,6.46,.022,.019,.023,M.black,'#9c9e9e',16);
   // Tall charcoal refrigerator, recessed grips, gasket seams and overhead cupboard.
   box(1.75,1.08,6.66,.76,2.14,.68,M.black,'#858987');
   for(const [yy,h] of [[.69,1.28],[1.75,.76]]){
     roundBox(1.75,yy,6.297,.72,h,.045,.022,M.steel,'#666d70');
     box(1.75,yy-h/2+.027,6.269,.65,.018,.018,M.black,'#555a5b');
   }
   box(1.75,2.39,6.70,.80,.47,.58,M.cabinet,'#c2bfb8');
   box(1.75,2.39,6.385,.76,.43,.025,M.cabinet,'#ccc9c2');
   // White washer at the bathroom end: real drum recess, rubber gasket and convex glass.
   roundBox(4.15,.445,6.66,.61,.86,.62,.022,M.white,'#f5f4ee');
   box(4.15,.75,6.333,.56,.16,.022,M.white,'#eeeee8');
   box(4.02,.77,6.315,.19,.065,.016,M.ivory,'#dbdcd6');
   ringZ(4.15,.40,6.322,.232,.185,.046,M.white,'#deded9');
   ringZ(4.15,.40,6.291,.187,.154,.025,M.black,'#8b8f8e');
   ringZ(4.15,.40,6.289,.154,.001,.014,M.black,'#4b555d');
   ringZ(4.15,.40,6.277,.170,.157,.012,M.steel,'#a0a7a8');
   ringZ(4.29,.77,6.304,.030,.001,.020,M.steel,'#b3b7b6',24);
   box(4.16,.77,6.311,.080,.030,.015,M.black,'#596363');
   // Subtle warm ceiling disk.
   cyl(3.18,2.735,5.70,.115,.115,.025,M.white,'#fffdf6',32);
   cyl(3.18,2.714,5.70,.087,.087,.012,M.bulb,'#fff2cf',32);
   for(const x of [4.51,4.60])box(x,1.45,6.974,.065,.10,.015,M.white,'#f9f5ec');
 }
 function bedroomBath(){
   // Understated placeholders until bedroom/bath video references are supplied.
   roundBox(4.98,.49,2.53,1.47,.42,2.04,.06,M.cream,'#e8dfd2');
   roundBox(4.98,.73,2.53,1.45,.15,2.00,.045,M.white,'#f7f4ec');
   for(let xx of [4.58,5.33])roundBox(xx,.85,1.86,.55,.12,.40,.04,M.cream,'#eeede8');
   box(5.92,1.07,3.58,.49,2.14,.72,M.wood,'#b6aa98');
   for(let x=4.87;x<6.20;x+=.30)for(let z=4.64;z<6.99;z+=.30)box(x+.14,.024,z+.14,.291,.012,.291,M.slate,'#a5a6a2');
   paneZ(4.62,4.87,6.23,.08,2.70,M.slate,'#656b6b',.015);
   paneX(6.225,4.63,6.98,.08,2.70,M.slate,'#656b6b',.015);
   // Simple bathroom fixtures face its new pantry doorway without intersecting the open leaf.
   box(6.02,.77,5.45,.48,.15,.58,M.white,'#f8f8f6');
   box(6.07,.83,5.45,.31,.035,.39,M.slate,'#d0d5d2');
   bar([6.14,.84,5.45],[6.14,.99,5.45],.014,M.steel);
   const mirrorStart=verts.length;
   ringZ(6.21,1.50,5.45,.25,.001,.014,M.steel,'#b6c0bf');
   for(let i=mirrorStart;i<verts.length;i+=12){const xx=verts[i]-6.21,zz=verts[i+2]-5.45,nx=verts[i+3],nz=verts[i+5];verts[i]=6.21+zz;verts[i+2]=5.45-xx;verts[i+3]=nz;verts[i+5]=-nx;}
   roundBox(5.75,.23,6.45,.45,.42,.63,.08,M.white,'#f4f5f3');
   cyl(5.75,.48,6.45,.22,.22,.08,M.white,'#fbfaf9');
   roundBox(5.75,.76,6.68,.44,.48,.17,.035,M.white);

 }
 drawFloor();const furnitureStart=verts.length/12;living();dining();const furnitureEnd=verts.length/12;kitchen();bedroomBath();
 // The physical bedroom and bathroom door geometry is dynamic by tag, so state toggles work.
 const baseCount=verts.length/12;
 // Build separate door buffers once for each of 4 combinations.
 const staticVertices=new Float32Array(verts),staticBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,staticBuffer);gl.bufferData(gl.ARRAY_BUFFER,staticVertices,gl.STATIC_DRAW);
 const doorBuffers=[];
 function oneDoor(kind,opened){verts.length=0;
  if(kind===0){
    if(opened){box(3.64,1.08,3.79,.72,2.14,.08,M.white,'#f2ede4');bar([3.90,1.0,3.73],[3.90,1.0,3.66],.015,M.steel);}
    else {box(3.25,1.08,4.10,.08,2.14,.64,M.white,'#f2ede4');box(3.201,1.13,4.10,.015,1.80,.48,M.ivory,'#fbf7ef');bar([3.19,1.0,4.31],[3.12,1.0,4.31],.015,M.steel);bar([3.12,1.0,4.31],[3.12,1.0,4.20],.014,M.steel);}
  }else{
    if(opened){box(5.20,1.08,5.46,.78,2.14,.075,M.white,'#f2ede4');bar([5.48,1.0,5.40],[5.48,1.0,5.33],.015,M.steel);}
    else {box(4.79,1.08,5.86,.075,2.14,.79,M.white,'#f2ede4');bar([4.73,1.0,6.13],[4.65,1.0,6.13],.015,M.steel);}
  }
  const arr=new Float32Array(verts),b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,arr,gl.STATIC_DRAW);doorBuffers.push({buffer:b,count:arr.length/12});
 }
 oneDoor(0,false);oneDoor(0,true);oneDoor(1,false);oneDoor(1,true);
 function bindBuffer(buffer){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);const stride=48;
  const map=[[attrs.p,3,0],[attrs.n,3,12],[attrs.uv,2,24],[attrs.color,3,32],[attrs.mat,1,44]];
  for(const [loc,n,offset] of map){if(loc<0)continue;gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,n,gl.FLOAT,false,stride,offset);}
 }
 // Bake static furniture shadows once. No depth-texture extension or per-frame shadow pass.
 let shadowTexture=null;
 try {
   const shadowProgram=gl.createProgram();
   gl.attachShader(shadowProgram,shader(gl.VERTEX_SHADER,`attribute vec3 aPosition;varying float vDepth;void main(){vec3 p=aPosition;vDepth=(5.0-p.y)/6.0;gl_Position=vec4((p.x-.4*p.y+1.0)/3.0-1.0,(p.z+1.9*p.y+1.0)/4.5-1.0,vDepth*2.0-1.0,1.0);}`));
   gl.attachShader(shadowProgram,shader(gl.FRAGMENT_SHADER,`precision mediump float;varying float vDepth;void main(){float d=vDepth*255.0;gl_FragColor=vec4(floor(d)/255.0,fract(d),0.0,1.0);}`));
   gl.linkProgram(shadowProgram);if(!gl.getProgramParameter(shadowProgram,gl.LINK_STATUS))throw Error('shadow link');
   const size=1024,fb=gl.createFramebuffer(),depth=gl.createRenderbuffer();
   shadowTexture=gl.createTexture();gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,shadowTexture);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,size,size,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
   for(const key of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,key,gl.NEAREST);
   for(const key of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,key,gl.CLAMP_TO_EDGE);
   gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,shadowTexture,0);
   gl.bindRenderbuffer(gl.RENDERBUFFER,depth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,size,size);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depth);
   if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('shadow framebuffer');
   gl.useProgram(shadowProgram);gl.bindBuffer(gl.ARRAY_BUFFER,staticBuffer);
   const loc=gl.getAttribLocation(shadowProgram,'aPosition');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,48,0);
   gl.viewport(0,0,size,size);gl.enable(gl.DEPTH_TEST);gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   gl.drawArrays(gl.TRIANGLES,furnitureStart,furnitureEnd-furnitureStart);
   gl.deleteFramebuffer(fb);gl.deleteRenderbuffer(depth);gl.deleteProgram(shadowProgram);
 }catch(e){console.warn('Housewalk: contact-shadow fallback',e);shadowTexture=null;}
 // Two static ceiling-light bakes ground furniture and shade the backsplash beneath uppers.
 function bakeRoomShadow(lamp,focal,unit){
   const program=gl.createProgram();
   gl.attachShader(program,shader(gl.VERTEX_SHADER,`attribute vec3 aPosition;uniform vec3 uLamp;uniform float uProjection;varying float vDepth;void main(){float d=uLamp.y-aPosition.y;vDepth=d/8.0;gl_Position=vec4((aPosition.x-uLamp.x)*uProjection,(aPosition.z-uLamp.z)*uProjection,d*1.01005-.1005,d);}`));
   gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision mediump float;varying float vDepth;void main(){float d=clamp(vDepth,0.0,.999)*255.0;gl_FragColor=vec4(floor(d)/255.0,fract(d),0,1);}`));
   gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('room shadow link');
   const size=512,fb=gl.createFramebuffer(),depth=gl.createRenderbuffer(),texture=gl.createTexture();
   gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,size,size,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
   for(const key of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,key,gl.NEAREST);
   for(const key of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,key,gl.CLAMP_TO_EDGE);
   gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);
   gl.bindRenderbuffer(gl.RENDERBUFFER,depth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,size,size);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depth);
   if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('room shadow framebuffer');
   gl.useProgram(program);gl.uniform3fv(gl.getUniformLocation(program,'uLamp'),lamp);gl.uniform1f(gl.getUniformLocation(program,'uProjection'),focal);
   gl.bindBuffer(gl.ARRAY_BUFFER,staticBuffer);const loc=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,48,0);
   gl.viewport(0,0,size,size);gl.enable(gl.DEPTH_TEST);gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   gl.drawArrays(gl.TRIANGLES,0,baseCount);
   gl.deleteFramebuffer(fb);gl.deleteRenderbuffer(depth);gl.deleteProgram(program);return texture;
 }
 let roomShadows=false;
 try{bakeRoomShadow([1.70,2.60,3.49],1.25,2);bakeRoomShadow([3.18,2.68,5.70],1.10,3);roomShadows=true;}
 catch(e){console.warn('Housewalk: ceiling shadow fallback',e);}
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.useProgram(prog);
 gl.uniform1i(gl.getUniformLocation(prog,'uRoomShadow'),2);gl.uniform1i(gl.getUniformLocation(prog,'uKitchenShadow'),3);gl.uniform1f(gl.getUniformLocation(prog,'uHasRoomShadows'),roomShadows?1:0);
 gl.uniform1i(gl.getUniformLocation(prog,'uShadow'),1);gl.uniform1f(gl.getUniformLocation(prog,'uHasShadow'),shadowTexture?1:0);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
 const glLost=e=>{e.preventDefault();window.__HW3D_READY=false;old.style.opacity='1';canvas.style.opacity='0';document.documentElement.dataset.renderer='canvas-fallback';};
 canvas.addEventListener('webglcontextlost',glLost);
 canvas.addEventListener('webglcontextrestored',()=>{canvas.remove();const script=document.createElement('script');script.src='./webgl.js?v=4.3-review';document.body.appendChild(script);});
 let width=0,height=0,lastTime=0,firstPaint=false;
 function render(now){
   // Do not run heavy WebGL loops on hidden tabs.
   if(gl.isContextLost())return;
   if(document.hidden){requestAnimationFrame(render);return;}
   try {
   const dpr=Math.min(window.devicePixelRatio||1,1.55),w=Math.round(window.innerWidth*dpr),h=Math.round(window.innerHeight*dpr);
   if(w!==width||h!==height){width=w;height=h;canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
   const night=bridge.getNight()?1:0;
   gl.clearColor(night?.13:.73,night?.16:.79,night?.21:.77,1);
   gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   const p=bridge.player;
   const camera=bridge.camera||{};
   const verticalFov=camera.verticalFov||(window.innerWidth<window.innerHeight?70:58);
   const fv=1/Math.tan(verticalFov*Math.PI/360);
   gl.uniform3f(uni.cam,p.x,camera.eyeHeight||1.59,p.z);gl.uniform1f(uni.yaw,p.yaw);gl.uniform1f(uni.pitch,p.pitch);gl.uniform2f(uni.focal,fv/(w/h),fv);gl.uniform1f(uni.night,night);
   bindBuffer(staticBuffer);gl.drawArrays(gl.TRIANGLES,0,staticVertices.length/12);
   bindBuffer(doorBuffers[bridge.doors[0].open?1:0].buffer);gl.drawArrays(gl.TRIANGLES,0,doorBuffers[bridge.doors[0].open?1:0].count);
   bindBuffer(doorBuffers[bridge.doors[1].open?3:2].buffer);gl.drawArrays(gl.TRIANGLES,0,doorBuffers[bridge.doors[1].open?3:2].count);
   if(!firstPaint){firstPaint=true;window.__HW3D_READY=true;old.style.opacity='0';canvas.style.opacity='1';document.documentElement.dataset.renderer='webgl-v4';}
   requestAnimationFrame(render);
   } catch(e){
     console.warn('Housewalk 3D fallback after draw error',e);
     window.__HW3D_READY=false;old.style.opacity='1';canvas.style.opacity='0';
     document.documentElement.dataset.renderer='canvas-fallback';
   }
 }
 window.HW3DColliders=[
  {x0:3.18,x1:3.32,z0:0.16,z1:3.78}, // living / bedroom partition
  {x0:3.18,x1:3.32,z0:4.43,z1:4.55},
  {x0:4.72,x1:4.86,z0:4.55,z1:5.43}, // pantry / bathroom partition
  {x0:4.72,x1:4.86,z0:6.29,z1:7.05}, // bathroom door sides
  {x0:3.25,x1:6.30,z0:4.48,z1:4.62},
  {x0:.04,x1:1.01,z0:1.16,z1:3.70}, // detailed 3-seat sofa
  {x0:.07,x1:1.85,z0:4.19,z1:5.11}, // dining table
  {x0:.25,x1:1.58,z0:3.79,z1:4.26}, // window-side chairs
  {x0:.25,x1:1.58,z0:5.04,z1:5.52}, // entrance-side chairs
  {x0:2.73,x1:3.24,z0:1.07,z1:3.14},
  {x0:2.77,x1:3.20,z0:3.12,z1:3.75}, // TV cabinet
  {x0:2.66,x1:3.22,z0:.51,z1:1.17}, // empty 5-tier rack
  {x0:0,x1:1.20,z0:.60,z1:.90}, // AC wall bump-out
  {x0:1.35,x1:2.15,z0:6.26,z1:7.0}, // fridge
  {x0:2.18,x1:3.86,z0:6.31,z1:7.0}, // kitchen counter
  {x0:3.84,x1:4.47,z0:6.31,z1:7.0}, // washing machine
  {x0:4.23,x1:5.73,z0:1.48,z1:3.58}, // bed
  {x0:5.66,x1:6.18,z0:3.20,z1:3.96}, // wardrobe
  {x0:5.78,x1:6.26,z0:5.16,z1:5.74}, // bath basin
  {x0:5.50,x1:6.00,z0:6.10,z1:6.80}, // toilet
 ];
 requestAnimationFrame(render);
 window.HW4Stats={vertices:baseCount,triangles:baseCount/3,shadowMap:!!shadowTexture,ceilingShadows:roomShadows};
 console.info('Housewalk V4: '+baseCount/3+' triangles');
})();