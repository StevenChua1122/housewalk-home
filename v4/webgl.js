/*
 * Housewalk Real Rooms v4 - detailed, reference-matched WebGL renderer.
 * The approved warm-tone living/dining interior is modeled as real depth-tested
 * geometry. The bedroom, bath and pantry remain deliberately lightweight.
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
 uniform vec3 uCamera;
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
 uniform float uNight;
 uniform vec3 uCamera;
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
 void main(){
  float m=floor(vMaterial+.02);
  float tileX=mod(m,4.0),tileY=floor(m/4.0);
  vec2 uv=vec2(tileX,tileY)*.25+(vec2(.010)+fract(vUV)*.980)*.25;
  vec3 tex=texture2D(uAtlas,uv).rgb;
  vec3 n=normalize(vNormal);
  vec3 v=normalize(uCamera-vWorld);
  // Warm sunlight shines from the recessed northwest window toward the room.
  vec3 sun=normalize(vec3(.44,.72,.64));
  float daylight=max(dot(n,sun),0.0);
  float diffuse=.61+daylight*.42;
  float key1=pointLight(vWorld,n,vec3(1.65,2.62,3.36),.62);
  float key2=pointLight(vWorld,n,vec3(1.65,2.62,1.41),.60);
  float diningKey=pointLight(vWorld,n,vec3(1.06,2.40,4.80),.52);
  float nicheKey=pointLight(vWorld,n,vec3(1.67,2.61,-.08),.37);
  vec3 base=tex*vTint;
  vec3 result=base*(vec3(.96,.94,.91)*diffuse +
    (1.0-uNight)*vec3(.24,.14,.075)*(.36+daylight*.76) +
    vec3(.41,.23,.10)*(key1+key2+diningKey+nicheKey));
  // Soft contact occlusion under actual modeled furniture; never draw fake hard shadows.
  if(m<.5 && vWorld.y<.045){
    float oc=0.0;
    oc+=.30*footShadow(vWorld.xz,vec2(.70,2.46),vec2(.49,1.07),.42);
    oc+=.21*footShadow(vWorld.xz,vec2(.94,4.52),vec2(.46,.67),.31);
    oc+=.24*footShadow(vWorld.xz,vec2(3.02,2.51),vec2(.23,1.00),.36);
    oc+=.14*footShadow(vWorld.xz,vec2(3.04,.84),vec2(.22,.31),.23);
    result*=1.0-clamp(oc,0.0,.48);
    // Soft irregular sun flecks through the two-paned window; strongest near alcove.
    float windowFade=1.0-smoothstep(1.1,4.8,vWorld.z);
    float dapple=sin(vWorld.x*8.1+vWorld.z*2.2)*sin(vWorld.z*6.1-vWorld.x*3.4);
    result+=vec3(.14,.092,.038)*(1.0-uNight)*windowFade*smoothstep(.12,.9,dapple);
  }
  // Ambient occlusion at wall/floor junctions creates grounded geometry.
  if(m>0.5&&m<1.5){
    float corner=.94 + .06*smoothstep(.04,.48,vWorld.y);
    result*=corner;
  }
  // Bright view through the glass receives sunlight instead of indoor darkening.
  if(m>11.5&&m<12.5){result=tex*mix(vec3(1.05,1.05,.92),vec3(.30,.40,.53),uNight);}
  // Low-specular, polished accents on the metal bracket and walnut table.
  if((m>1.5&&m<2.5)||(m>5.5&&m<8.5)||(m>9.5&&m<10.5)){
    vec3 h=normalize(sun+v);float spec=pow(max(dot(n,h),0.0),22.0);
    result+=vec3(.16,.12,.085)*spec*(1.0-uNight);
  }
  if(m>13.5&&m<14.5){result=mix(result,vec3(1.00,.79,.47),.78);}
  result=mix(result,result*vec3(.52,.60,.78),uNight);
  result=pow(max(result,vec3(.002)),vec3(.92));
  gl_FragColor=vec4(clamp(result,0.0,1.0),1.0);
 }`;
 function shader(kind,source){const sh=gl.createShader(kind);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;}
 let prog;
 try {prog=gl.createProgram();gl.attachShader(prog,shader(gl.VERTEX_SHADER,VS));gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,FS));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));}
 catch(e){console.warn('Housewalk WebGL fallback:',e);canvas.remove();return;}
 gl.useProgram(prog);
 const attrs={p:gl.getAttribLocation(prog,'aPosition'),n:gl.getAttribLocation(prog,'aNormal'),uv:gl.getAttribLocation(prog,'aUV'),color:gl.getAttribLocation(prog,'aTint'),mat:gl.getAttribLocation(prog,'aMaterial')};
 const uni={cam:gl.getUniformLocation(prog,'uCamera'),yaw:gl.getUniformLocation(prog,'uYaw'),pitch:gl.getUniformLocation(prog,'uPitch'),focal:gl.getUniformLocation(prog,'uFocal'),night:gl.getUniformLocation(prog,'uNight'),atlas:gl.getUniformLocation(prog,'uAtlas')};
 const M={floor:0,plaster:1,black:2,cream:3,sofa:4,white:5,slate:6,steel:7,curtain:8,leaf:9,walnut:10,ivory:11,sky:12,dark:13,bulb:14,wood:15};
 function randGen(seed){let x=seed>>>0;return ()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
 const rng=randGen(71326);
 function atlas(){const side=256,C=document.createElement('canvas');C.width=C.height=side*4;const c=C.getContext('2d',{alpha:false});
  const palette=['#d8b899','#e7dfd1','#27292a','#eae2d3','#777778','#f2f1ea','#777879','#bfc1c3','#a99888','#789466','#674939','#ddd9cf','#b2c9cd','#515056','#f4cd90','#bd9d7e'];
  for(let i=0;i<16;i++){
   const ox=(i%4)*side,oy=Math.floor(i/4)*side;
   c.fillStyle=palette[i];c.fillRect(ox,oy,side,side);
   if(i===0||i===10||i===15){ // Realistic longitudinal wood grain; no checkerboard tiles.
    for(let k=0;k<360;k++){
     let x=ox+rng()*side,y=oy+rng()*side;
     c.strokeStyle=rng()>.52?'rgba(101,69,39,.10)':'rgba(255,247,215,.17)';
     c.lineWidth=.35+rng()*1.35;c.beginPath();c.moveTo(x,y);
     const bend=Math.sin((y-oy)/24+x*.018)*(.7+rng()*2.0);
     c.bezierCurveTo(x+bend,y+28,x-bend,y+58,x+(rng()-.5)*3,y+84+rng()*115);c.stroke();
    }
    for(let k=0;k<14;k++){let x=ox+30+rng()*(side-60),y=oy+25+rng()*(side-50);c.strokeStyle='rgba(96,65,45,.085)';c.lineWidth=.75;
      for(let r=4;r<13;r+=3){c.beginPath();c.ellipse(x,y,r*.62,r*2.1,.13,0,Math.PI*2);c.stroke();}}
   }else if(i===4||i===3||i===8||i===13){
    for(let k=0;k<14000;k++){let n=rng()>.5?255:18;c.fillStyle=`rgba(${n},${n},${n},${.012+rng()*.055})`;c.fillRect(ox+rng()*side,oy+rng()*side,1+rng()*1.5,1+rng()*1.1);}
    if(i===4){c.strokeStyle='rgba(239,236,232,.08)';c.lineWidth=.35;for(let k=4;k<side;k+=5){c.beginPath();c.moveTo(ox,oy+k);c.lineTo(ox+side,oy+k);c.stroke();}}
   }else if(i===1||i===5||i===11){
    for(let k=0;k<14000;k++){let n=rng()>.5?255:28;c.fillStyle=`rgba(${n},${n},${n},${.007+rng()*.019})`;c.fillRect(ox+rng()*side,oy+rng()*side,1,1);}
   }else if(i===12){
    const g=c.createLinearGradient(ox,oy,ox,oy+side);g.addColorStop(0,'#9fbec8');g.addColorStop(.45,'#c3d3c8');g.addColorStop(.75,'#a8ac94');g.addColorStop(1,'#81926e');c.fillStyle=g;c.fillRect(ox,oy,side,side);
    for(let k=0;k<150;k++){let px=ox+rng()*side,py=oy+side*.45+rng()*side*.48;c.beginPath();c.fillStyle=`rgba(${73+Math.floor(rng()*70)},${94+Math.floor(rng()*73)},${43+Math.floor(rng()*47)},${.09+rng()*.31})`;c.ellipse(px,py,6+rng()*24,4+rng()*17,0,0,Math.PI*2);c.fill();}
   }else if(i===9){
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
   try{gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
     gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,photoAtlas);
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
 function roundBox(x,y,z,w,h,d,r,mat,t='#ffffff'){
   r=Math.min(r,w*.46,h*.46,d*.46);
   const half=[w/2,h/2,d/2],parts=5,col=color(t);
   for(let axis=0;axis<3;axis++)for(let sign of [-1,1]){
      const other=[0,1,2].filter(k=>k!==axis),uAxis=other[0],vAxis=other[1];
      function get(i,j){let p=[0,0,0];p[axis]=half[axis]*sign;p[uAxis]=half[uAxis]*(i/parts*2-1);p[vAxis]=half[vAxis]*(j/parts*2-1);
        const cl=p.map((v,k)=>Math.max(-half[k]+r,Math.min(half[k]-r,v))),dv=p.map((v,k)=>v-cl[k]);let len=Math.hypot(...dv)||1;
        return {p:p.map((v,k)=>cl[k]+dv[k]/len*r).map((v,k)=>v+[x,y,z][k]),n:dv.map(v=>v/len),uv:[i/parts*w*1.2,j/parts*d*1.2]};}
      for(let i=0;i<parts;i++)for(let j=0;j<parts;j++){
        const a=get(i,j),b=get(i+1,j),c=get(i+1,j+1),d0=get(i,j+1);
        for(let [u,v,w0] of [[a,b,c],[a,c,d0]])for(const k of [u,v,w0])vertex(k.p,k.n,k.uv,mat,col);
      }
   }
 }
 function cyl(x,y,z,r0,r1,h,mat,t='#ffffff',seg=16){const a=y-h/2,b=y+h/2,c=color(t);
   for(let k=0;k<seg;k++){let t0=k*2*Math.PI/seg,t1=(k+1)*2*Math.PI/seg;let n0=[Math.cos(t0),0,Math.sin(t0)],n1=[Math.cos(t1),0,Math.sin(t1)];
    const p=[x+r0*n0[0],a,z+r0*n0[2]],q=[x+r0*n1[0],a,z+r0*n1[2]],r=[x+r1*n1[0],b,z+r1*n1[2]],s=[x+r1*n0[0],b,z+r1*n0[2]];
    for(const [pt,n,uv] of [[p,n0,[k/seg,0]],[q,n1,[(k+1)/seg,0]],[r,n1,[(k+1)/seg,1]],[p,n0,[k/seg,0]],[r,n1,[(k+1)/seg,1]],[s,n0,[k/seg,1]]])vertex(pt,n,uv,mat,c);
    const cent=[x,b,z],normal=[0,1,0];for(const pt of [cent,s,r])vertex(pt,normal,[(pt[0]-x)/.4+.5,(pt[2]-z)/.4+.5],mat,c);
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
   const X=30,Y=19,C=color(tint),cols=X,rows=Y;
   function p(i,j){const f=i/X,g=j/Y;const x=x0+(x1-x0)*f;
     const phase=f*6*Math.PI;
     const fold=(Math.sin(phase)*.055+Math.sin(phase*2+.3)*.010)*(.87+.13*g);
     return [x,y0+(y1-y0)*g,z+fold];}
   for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){
     const a=p(i,j),b=p(i+1,j),c=p(i+1,j+1),d=p(i,j+1);
     let normal=[-.52*Math.cos((i+.5)/X*6*Math.PI),0,1];
     const uv=(u,v)=>[u*2.0,v*1.8];
     for(const [pt,tt] of [[a,uv(i/X,j/Y)],[b,uv((i+1)/X,j/Y)],[c,uv((i+1)/X,(j+1)/Y)],[a,uv(i/X,j/Y)],[c,uv((i+1)/X,(j+1)/Y)],[d,uv(i/X,(j+1)/Y)]])vertex(pt,normal,tt,M.curtain,C);
   }
   for(let f=0;f<=5;f++){let x=x0+(x1-x0)*f/5;rail([x,y0+.04,z+.023],[x,y1-.06,z+.023],.003,M.cream,'#f9e5ce');}
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
   plankZone(0,6.30,0,7.05);plankZone(.54,2.94,-.79,.31);
   // Entire ceiling remains continuous: NO horizontal beam above the deep window nook.
   box(3.15,2.804,3.15,6.30,.075,7.71,M.plaster,'#fff8ef');
   paneX(0,0,7.05,0,2.77,M.plaster,plaster);
   paneX(6.30,0,7.05,0,2.77,M.plaster,plaster);
   paneZ(7.05,0,.50,0,2.77,M.plaster,plaster);
   paneZ(7.05,1.39,6.30,0,2.77,M.plaster,plaster);
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
   // The two adjoining blue-grey framed windows occupy 30%-80% of wall height.
   quad([.72,.83,-.83],[2.76,.83,-.83],[2.76,2.20,-.83],[.72,2.20,-.83],[0,0,1],M.sky,'#ffffff',1,1);
   for(const [x0,x1] of [[.70,1.73],[1.73,2.78]]){
     windowFrame(-.60,x0,x1,.82,2.22);
     box((x0+x1)/2,1.07,-.565,x1-x0,.054,.097,M.steel,'#71828a');
     box((x0+x1)/2,.835,-.56,x1-x0,.027,.105,M.steel,'#657481');
     // Glazing mullion and bottom-panel frame; no floor-to-ceiling sliding doors.
     box((x0+x1)/2,1.12,-.567,x1-x0-.04,.030,.064,M.steel,'#778b93');
   }
   box(1.74,1.52,-.537,.045,1.39,.12,M.steel,'#667985');
   // Fine hardware handles and realistic window sill.
   for(const xx of [1.65,1.82]){rail([xx,1.38,-.49],[xx,1.53,-.49],.009,M.steel,'#d3c6b4');}
   box(1.74,.79,-.55,2.22,.052,.19,M.white,'#e9e7df');
   // White returns and skirting emphasize the alcove depth.
   for(const [x,z0,z1] of [[.073,0,7.00],[6.22,0,7.00],[.55,-.63,.30],[2.93,-.63,.30],[3.17,.23,3.73],[4.72,4.57,7]]){
     box(x,.061,(z0+z1)/2,.024,.121,z1-z0,M.white,'#f8f3e9');
   }
   box(1.75,.060,-.59,2.2,.118,.032,M.white,'#ede7dc');
   // The other rooms keep their original lightweight floor plan.
   paneX(3.25,0,3.78,0,2.77);
   paneX(3.25,4.43,4.55,0,2.77);
   paneX(4.79,4.55,7.05,0,2.77);
   paneZ(4.55,4.79,5.07,0,2.77);paneZ(4.55,5.79,6.30,0,2.77);
   box(.46,1.05,6.77,.050,2.13,.69,M.walnut,'#f1e1d0');
   cyl(.43,.96,6.44,.035,.035,.05,M.steel,'#e0d8cb');
 }
 function living(){
   // Real wall jog behind the sofa at the AC side; flush with left wall elsewhere.
   box(.38,1.385,.75,.72,2.77,.30,M.plaster,'#f7f2e9');
   // Split-unit air conditioner: beveled enclosure, vent, slit louvers and status LED.
   roundBox(.64,2.34,.93,.83,.32,.24,.034,M.white,'#fafaf9');
   box(.64,2.19,1.062,.77,.021,.015,M.dark,'#343b3f');
   for(let i=0;i<15;i++){box(.25+i*.053,2.183,1.074,.010,.025,.020,M.steel,'#b2b5b3');}
   box(.63,2.315,1.058,.65,.012,.014,M.ivory,'#e9e8e4');
   cyl(.96,2.34,1.056,.009,.009,.01,M.leaf,'#8cc684',10);
   // The approved three-seat sofa is flush against the left wall. NO chaise, rug, coffee table.
   const x=.69,z=2.43;
   for(const zz of [1.46,3.42])for(const xx of [.20,1.12]){
     roundBox(xx,.100,zz,.095,.20,.09,.018,M.walnut,'#7b5743');
   }
   roundBox(.72,.335,z,1.09,.34,2.16,.11,M.sofa,'#e2d1bf');
   // Rounded backrest touching plaster.
   roundBox(.19,.72,z,.30,.73,2.20,.085,M.sofa,'#eee0d0');
   for(let i=0;i<3;i++){
      const zz=1.75+i*.68;
      pad(.75,.53,zz,1.03,.22,.65,M.sofa,'#f3e8de');
      pad(.36,.81,zz,.34,.64,.62,M.sofa,'#f2e7d9');
      cushionPiping(.31,1.15,.441,zz-.29,zz+.29,'#ae9e8f');
      rail([.33,.505,zz-.26],[1.20,.505,zz-.26],.006,M.ivory,'#cfc0b0');
   }
   for(const zz of [1.27,3.59])roundBox(.78,.63,zz,1.12,.55,.21,.065,M.sofa,'#e1d1c4');
   // Separate cream and amber accent cushions with soft rounded corners and seams.
   pad(.79,.79,1.98,.24,.42,.35,M.cream,'#ffffff');
   pad(.82,.78,2.59,.25,.42,.37,M.walnut,'#ffd2a6');
   pad(.78,.80,3.20,.22,.40,.34,M.cream,'#f4e4ce');
   for(const [zz,t] of [[1.98,'#f2e7d7'],[2.59,'#b77a3a'],[3.20,'#eee2d3']]){
     rail([.68,.91,zz-.13],[.68,.92,zz+.13],.004,M.ivory,t);
   }
   // Grey-topped white storage cabinet, correctly opposite the sofa.
   box(3.005,.30,2.50,.425,.59,1.88,M.white,'#fffefb');
   box(2.78,.31,2.50,.018,.53,1.84,M.ivory,'#f5efe3');
   roundBox(3.0,.621,2.50,.475,.060,1.93,.017,M.slate,'#f2ece5');
   box(3.0,.043,2.50,.44,.075,1.85,M.dark,'#6c6e70');
   for(let zz of [1.89,2.50,3.11])box(2.765,.31,zz,.013,.47,.015,M.white,'#dbd7d1');
   // Wall TV MOUNT ONLY — no television, no electronics, no decorations.
   for(let yy of [1.42,1.82])box(3.171,yy,2.50,.062,.061,.97,M.black,'#cac3b3');
   for(const zz of [2.05,2.95]){
      box(3.127,1.64,zz,.065,.65,.067,M.black,'#b4ada3');
      for(let yy of [1.46,1.58,1.71,1.84]){
         box(3.085,yy,zz,.018,.027,.026,M.black,'#e3dccc');
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
   curtain(.59,.95,.29,.035,2.63,'#f3dfc8');
   curtain(2.50,2.88,.29,.035,2.63,'#f1dac2');
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
     const a=k*Math.PI*2/3+.20;
     const sx=1.70+Math.cos(a)*.18,sz=2.42+Math.sin(a)*.18;
     const ex=1.70+Math.cos(a)*.56,ez=2.42+Math.sin(a)*.56;
     rail([sx,2.51,sz],[ex,2.48,ez],.036,M.black,'#8b837d');
     roundBox(ex,2.475,ez,.25,.022,.14,.011,M.black,'#6d6964');
   }
 }
 function dining(){
   // Exact layout: rectangular dark timber table beside left wall, chairs 2+2 on LONG sides.
   const x=.94,z=4.51;
   roundBox(x,.735,z,.89,.065,1.35,.021,M.walnut,'#d8cfc4');
   box(x,.667,z,.71,.071,1.10,M.black,'#80796e');
   for(const xx of [x-.37,x+.37])for(const zz of [z-.58,z+.58]){
     roundBox(xx,.355,zz,.055,.70,.057,.012,M.black,'#7d776e');
   }
   for(const zz of [z-.56,z+.56])box(x,.66,zz,.69,.055,.047,M.walnut,'#e1d2c2');
   function chair(cx,cz,side){
      const backX=cx+side*.205,frontX=cx-side*.195;
      for(const zz of [cz-.19,cz+.19]){
        roundBox(backX,.425,zz,.044,.850,.047,.010,M.black,'#9b9388');
        roundBox(frontX,.205,zz,.047,.408,.050,.010,M.black,'#a9a096');
      }
      pad(cx,.455,cz,.475,.120,.47,M.ivory,'#fff6e8');
      box(cx,.377,cz,.48,.045,.46,M.black,'#837d75');
      for(const yy of [.61,.75,.85]){
        roundBox(backX,yy,cz,.060,.056,.39,.013,M.black,'#938c81');
      }
      rail([frontX,.23,cz-.19],[frontX,.23,cz+.19],.012,M.black,'#9e978d');
   }
   for(const zz of [4.08,4.89]){chair(.275,zz,-1);chair(1.61,zz,1);}
   // Reference-matched three-head L track. Two heads on near-camera longitudinal
   // segment, third on return. They point TOWARD the dining tabletop.
   const y=2.720;
   box(1.19,y,5.16,.030,.026,1.30,M.black,'#6e6257');
   box(1.48,y,4.53,.60,.026,.030,M.black,'#6c6056');
   function spotlight(sx,sz,tx,tz){
      const collar=[sx,2.625,sz],head=[sx+(tx-sx)*.10,2.49,sz+(tz-sz)*.10],lens=[sx+(tx-sx)*.17,2.395,sz+(tz-sz)*.17];
      rail([sx,y-.01,sz],[sx,2.614,sz],.027,M.black,'#80776d');
      bar(collar,head,.056,M.wood,'#c7a581',16);
      bar(head,lens,.095,M.black,'#6c6259',20);
      // Warm lens at the end, still physically facing the table.
      bar([lens[0],lens[1],lens[2]],[lens[0],lens[1]-.007,lens[2]],.079,M.bulb,'#fff5ce',20);
   }
   spotlight(1.19,5.21,.90,4.49);
   spotlight(1.19,5.65,.90,4.51);
   spotlight(1.71,4.53,.98,4.47);
 }
 function kitchen(){
   // White cabinets, graphite counters and brushed-steel refrigerator, without clutter.
   box(3.32,.45,6.69,2.54,.89,.62,M.white,'#f8f8f5');
   box(3.32,.920,6.69,2.58,.055,.68,M.slate,'#626568');
   for(let xx of [2.52,3.17,3.82,4.45]){
     box(xx,.41,6.365,.015,.70,.02,M.slate,'#c8c9c7');
   }
   box(3.28,1.45,6.92,2.55,.80,.32,M.white,'#f2f0e9');
   for(let xx of [2.85,3.46,4.07])box(xx,1.48,6.73,.014,.60,.018,M.slate,'#c5c6c5');
   // Sink and stove details on the dark counter.
   box(3.23,.952,6.65,.53,.018,.35,M.steel,'#a5abad');
   box(3.23,.96,6.65,.42,.01,.28,M.dark,'#484b4c');
   bar([3.12,.98,6.63],[3.12,1.16,6.63],.018,M.steel,'#a4afb1');
   for(let xx of [3.86,4.12])for(let zz of [6.53,6.74])cyl(xx,.957,zz,.08,.08,.012,M.black,'#262728');
   box(1.56,1.05,6.40,.69,2.10,.70,M.steel,'#c4c9cc');
   box(1.20,1.05,6.40,.012,2.04,.69,M.steel,'#80888a');
   for(let yy of [.62,1.57])box(1.20,yy,6.32,.024,.25,.020,M.dark,'#6e7478');
   box(4.22,.44,5.76,.68,.85,.58,M.white,'#f7f8f4');
   box(4.22,.89,5.76,.72,.06,.62,M.slate,'#737777');
 }
 function bedroomBath(){
   // Understated placeholders until bedroom/bath video references are supplied.
   roundBox(4.98,.49,2.53,1.47,.42,2.04,.06,M.cream,'#e8dfd2');
   roundBox(4.98,.73,2.53,1.45,.15,2.00,.045,M.white,'#f7f4ec');
   for(let xx of [4.58,5.33])roundBox(xx,.85,1.86,.55,.12,.40,.04,M.cream,'#eeede8');
   box(5.92,1.07,3.58,.49,2.14,.72,M.wood,'#b6aa98');
   box(5.32,.42,5.38,.62,.84,.57,M.white,'#f8f8f6');
   cyl(5.32,.86,5.38,.14,.15,.07,M.steel,'#d1d8d8');
   box(5.81,.20,6.17,.53,.42,.69,M.white,'#f4f5f3');
   cyl(5.81,.48,6.17,.23,.23,.12,M.white,'#fbfaf9');
 }
 drawFloor();living();dining();kitchen();bedroomBath();
 // The physical bedroom and bathroom door geometry is dynamic by tag, so state toggles work.
 const baseCount=verts.length/12;
 function doorGeometry(open){
  // Door leaf orientation moves from the closed doorway to against adjacent wall.
  if(open){box(3.63,1.08,3.79,.72,2.14,.075,M.wood,'#aa9682');box(5.08,1.08,4.93,.075,2.14,.69,M.wood,'#b6a595');}
  else{box(3.25,1.08,4.10,.075,2.14,.64,M.wood,'#aa9682');box(5.43,1.08,4.55,.70,2.14,.075,M.wood,'#b6a595');}
 }
 // Build separate door buffers once for each of 4 combinations.
 const staticVertices=new Float32Array(verts),staticBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,staticBuffer);gl.bufferData(gl.ARRAY_BUFFER,staticVertices,gl.STATIC_DRAW);
 const doorBuffers=[];
 function oneDoor(kind,opened){verts.length=0;
  if(kind===0){if(opened)box(3.64,1.08,3.79,.72,2.14,.08,M.wood,'#ad9582');else box(3.25,1.08,4.10,.08,2.14,.64,M.wood,'#ad9582');}
  else {if(opened)box(5.08,1.08,4.91,.08,2.14,.69,M.wood,'#bfae9a');else box(5.43,1.08,4.55,.70,2.14,.08,M.wood,'#bfae9a');}
  const arr=new Float32Array(verts),b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,arr,gl.STATIC_DRAW);doorBuffers.push({buffer:b,count:arr.length/12});
 }
 oneDoor(0,false);oneDoor(0,true);oneDoor(1,false);oneDoor(1,true);
 function bindBuffer(buffer){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);const stride=48;
  const map=[[attrs.p,3,0],[attrs.n,3,12],[attrs.uv,2,24],[attrs.color,3,32],[attrs.mat,1,44]];
  for(const [loc,n,offset] of map){if(loc<0)continue;gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,n,gl.FLOAT,false,stride,offset);}
 }
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
 const glLost=e=>{e.preventDefault();window.__HW3D_READY=false;old.style.opacity='1';canvas.style.opacity='0';};
 canvas.addEventListener('webglcontextlost',glLost);
 let width=0,height=0,lastTime=0,firstPaint=false;
 function render(now){
   // Do not run heavy WebGL loops on hidden tabs.
   if(document.hidden){requestAnimationFrame(render);return;}
   try {
   const dpr=Math.min(window.devicePixelRatio||1,1.55),w=Math.round(window.innerWidth*dpr),h=Math.round(window.innerHeight*dpr);
   if(w!==width||h!==height){width=w;height=h;canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
   const night=bridge.getNight()?1:0;
   gl.clearColor(night?.13:.73,night?.16:.79,night?.21:.77,1);
   gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   const p=bridge.player;
   const fv=1/Math.tan((window.innerWidth<window.innerHeight?70:77)*Math.PI/360);
   gl.uniform3f(uni.cam,p.x,1.59,p.z);gl.uniform1f(uni.yaw,p.yaw);gl.uniform1f(uni.pitch,p.pitch);gl.uniform2f(uni.focal,fv/(w/h),fv);gl.uniform1f(uni.night,night);
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
  {x0:4.72,x1:4.86,z0:4.55,z1:6.89}, // pantry / bathroom partition
  {x0:4.79,x1:5.07,z0:4.48,z1:4.62}, // bathroom door sides
  {x0:5.79,x1:6.12,z0:4.48,z1:4.62},
  {x0:.06,x1:1.31,z0:1.19,z1:3.69}, // detailed 3-seat sofa
  {x0:.48,x1:1.42,z0:3.78,z1:5.22}, // dining table
  {x0:.02,x1:.54,z0:3.78,z1:5.13}, // left chairs
  {x0:1.32,x1:1.84,z0:3.78,z1:5.13}, // right chairs
  {x0:2.73,x1:3.24,z0:1.56,z1:3.51}, // TV cabinet
  {x0:2.66,x1:3.22,z0:.51,z1:1.17}, // empty 5-tier rack
  {x0:.04,x1:.76,z0:.57,z1:.93}, // AC wall bump-out
  {x0:1.15,x1:1.96,z0:6.0,z1:6.77}, // fridge
  {x0:2.03,x1:4.62,z0:6.34,z1:7.0}, // kitchen counter
  {x0:3.85,x1:4.58,z0:5.42,z1:6.11}, // kitchen pantry unit
 ];
 requestAnimationFrame(render);
 console.info('Housewalk: Living & Dining v4 WebGL renderer ready, '+baseCount+' triangles / 3');
})();