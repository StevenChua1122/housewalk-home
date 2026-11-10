/*
 * Housewalk Real Rooms v3 - dependency-free WebGL renderer.
 * This layer upgrades the mirrored-plan living/dining area while preserving
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
 void main(){
  float tileX=mod(floor(vMaterial+.02),4.0),tileY=floor((vMaterial+.02)/4.0);
  vec2 tuv=(vec2(tileX,tileY)+0.012+fract(vUV)*0.976)*0.25;
  vec4 tex=texture2D(uAtlas,tuv);
  vec3 n=normalize(vNormal);
  vec3 sun=normalize(vec3(-0.56,0.88,-0.47));
  float nd=max(dot(n,sun),0.0);
  float d=0.71+nd*0.38;
  float groundLight=0.0;
  if(vMaterial<0.5){
    float leaf=sin(vWorld.x*6.7+vWorld.z*1.8)*sin(vWorld.z*6.3-vWorld.x*2.7);
    groundLight=(0.05+0.13*smoothstep(0.0,1.0,leaf))*max(0.0,1.0-vWorld.z/4.6);
  }
  vec3 base=tex.rgb*vTint;
  base*=d+groundLight;
  float warm=0.06*max(0.0,1.0-vWorld.z/5.0);
  base*=mix(vec3(1.045,1.015,0.965),vec3(0.50,0.58,0.72),uNight);
  base.r+=(warm*(1.0-uNight));
  base.g+=(warm*0.40*(1.0-uNight));
  if(vMaterial>13.45&&vMaterial<14.55)base=mix(base,vec3(1.0,0.79,0.46),.78);
  if(vMaterial>11.5&&vMaterial<12.5)base*=mix(1.0,.30,uNight);
  base=pow(max(base,vec3(0.005)),vec3(.96));
  gl_FragColor=vec4(base,1.0);
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
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlas());gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.generateMipmap(gl.TEXTURE_2D);gl.uniform1i(uni.atlas,0);
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
 function drawFloor(){
   box(3.15,-.042,3.525,6.3,.09,7.05,M.wood,'#b2a18d');
   // Individual planks with different warm natural-oak grain, no grid/tile floor.
   for(let x=0;x<6.3;x+=.177){const row=Math.round(x/.177),offset=(row%2)*.59;
      for(let z=-offset;z<7.05;z+=1.2){let z0=Math.max(0,z),z1=Math.min(7.05,z+1.2);if(z1-z0<.012)continue;
         const t=.90+rng()*.18;box(x+.084,.004,(z0+z1)/2,.170,.016,z1-z0-.009,M.floor,[t,t*.985,t*.956]);
      }
   }
   // Ceiling and warm matte plaster walls.
   box(3.15,2.805,3.525,6.30,.09,7.05,M.plaster,'#fff7ed');
   paneX(0,0,7.05,0,2.77);paneX(6.30,0,7.05,0,2.77);
   paneZ(7.05,0,.50,0,2.77);paneZ(7.05,1.39,6.30,0,2.77);
   paneZ(0,0,.55,0,2.77);paneZ(0,2.87,3.66,0,2.77);paneZ(0,5.80,6.30,0,2.77);
   // Living and bedroom windows at north face: no fake opaque window plane.
   for(const [x0,x1] of [[.55,2.87],[3.66,5.80]]){
     paneZ(0,x0,x1,0,.19,M.plaster);paneZ(0,x0,x1,2.51,2.77,M.plaster);
     for(const xp of [x0,(x0+x1)/2,x1])box(xp,1.37,-.02,.047,2.31,.105,M.dark,'#161b1c');
     box((x0+x1)/2,.20,-.04,x1-x0,.042,.12,M.steel,'#73716d');
     box((x0+x1)/2,2.51,-.04,x1-x0,.04,.12,M.dark,'#272a2b');
     box((x0+x1)/2,1.51,-.04,x1-x0,.022,.11,M.dark,'#303536');
   }
   // Real balcony rail beyond living window, greenery, soft outdoor backdrop.
   paneZ(-1.07,0,3.24,0,3.3,M.sky,'#f4f7ea',.08);
   for(let x=.16;x<3.22;x+=.19)bar([x,.14,-.44],[x,1.09,-.44],.008,M.dark,'#2b322f',5);
   bar([0,1.11,-.44],[3.25,1.11,-.44],.019,M.dark,'#353b37');
   // Doorways and partitions from the mirrored 6300 x 7050mm plan.
   paneX(3.25,0,3.78,0,2.77);paneX(3.25,4.43,4.55,0,2.77);
   paneX(4.79,4.55,7.05,0,2.77);
   paneZ(4.55,4.79,5.07,0,2.77);paneZ(4.55,5.79,6.30,0,2.77);
   // Realistic baseboards; wall recessed lines.
   for(const [x,z0,z1] of [[.085,0,7],[6.21,0,7],[3.16,.15,3.72],[4.7,4.55,7]]){
     box(x,.065,(z0+z1)/2,.027,.13,z1-z0,M.white,'#eee8dd');
   }
   for(const [z,x0,x1] of [[6.94,1.39,6.23],[6.94,.09,.49]])box((x0+x1)/2,.063,z,x1-x0,.12,.025,M.white,'#ece7dc');
   // Main door opened to the entrance wall.
   box(.46,1.05,6.77,.050,2.13,.69,M.walnut,'#a48b78');cyl(.43,.96,6.44,.035,.035,.05,M.steel,'#ad9d87');
 }
 function living(){
   // Physical AC recess / wall jog at end of sofa, not a completely straight wall.
   box(.36,1.39,.74,.71,2.77,.31,M.plaster,'#f7f0e6');
   box(.57,2.26,.77,.67,.37,.23,M.white,'#f8f9f8');box(.57,2.13,.65,.56,.035,.035,M.slate,'#bfc3bd');
   // Three-seater sofa. Distinct seams and dense woven cushions (NOT L-shaped).
   const x=.70,z=2.44;
   for(let zz of [1.62,2.44,3.26]){ // feet
     for(let xx of [.33,1.07])box(xx,.105,zz,.055,.17,.06,M.dark,'#2f3132');
   }
   roundBox(x,.40,z,.89,.42,2.05,.075,M.sofa,'#8d8b89');
   roundBox(.31,.675,z,.21,.50,2.02,.065,M.sofa,'#858584');
   for(let i=-1;i<=1;i++){
      let zc=z+i*.63;
      roundBox(.79,.55,zc,.74,.22,.60,.055,M.sofa,['#989693','#928f8d','#979491'][i+1]);
      roundBox(.36,.77,zc,.22,.55,.57,.055,M.sofa,'#969391');
      // Light welt piping seam along each seat edge.
      box(1.16,.43,zc,.012,.022,.50,M.ivory,'#9b9892');
   }
   for(let side of [-1,1]){
      const end=z+side*1.09;
      roundBox(.73,.60,end,.98,.53,.17,.055,M.sofa,'#858584');
   }
   // Two clean fabric cushions, no plush toys or stray household objects.
   roundBox(.75,.78,2.88,.21,.36,.30,.045,M.cream,'#ddd0b9');
   roundBox(.79,.77,2.15,.20,.34,.27,.045,M.walnut,'#a68b6e');
   // Cabinet facing sofa, grey top and white doors, directly against right wall.
   box(3.00,.30,2.52,.41,.59,1.85,M.white,'#fbf9f5');
   box(2.80,.32,2.52,.019,.53,1.81,M.white,'#f9f8f5');
   box(3.0,.625,2.52,.47,.065,1.92,M.slate,'#777b7b');
   box(3.0,.035,2.52,.43,.07,1.85,M.dark,'#6d7170');
   for(let zz of [1.9,2.52,3.14]){
     box(2.786,.32,zz,.012,.48,.013,M.slate,'#d2d1cc');
   }
   // An EMPTY black wall-mount bracket in lieu of a TV screen.
   box(3.155,1.81,2.52,.065,.077,.90,M.black,'#1b1d1d');
   box(3.155,1.48,2.52,.065,.077,.90,M.black,'#1b1d1d');
   for(let zz of [2.12,2.92]){
     box(3.125,1.62,zz,.052,.64,.052,M.black,'#1d2223');
     for(let yy of [1.47,1.58,1.77])box(3.089,yy,zz,.017,.026,.025,M.steel,'#5d6466');
   }
   // Tall narrow empty white open metal shelf between TV cabinet and window.
   const shelfZ=.85,shelfX=2.90;
   for(let xx of [2.70,3.10])for(let zz of [.60,1.10]){
     box(xx,1.03,zz,.033,2.05,.033,M.white,'#fffefa');
   }
   for(let yy of [.17,.61,1.05,1.49,1.93]){
     box(shelfX,yy,shelfZ,.44,.027,.52,M.white,'#f6f5ef');
     box(shelfX,yy+.01,.60,.45,.024,.025,M.steel,'#dedbd3');
   }
   // Taupe floor-length curtains, waving folds and curtain rail, no clutter.
   for(const [lo,hi] of [[.60,.96],[2.49,2.79]]){
      for(let xx=lo;xx<hi;xx+=.075){let q=Math.round((xx-lo)/.075);roundBox(xx,1.33,.14,.087,2.48,.095,.024,M.curtain,q%2?'#a08f84':'#b5a396');}
   }
   bar([.56,2.63,.16],[2.89,2.63,.16],.020,M.steel,'#beb9ac');
   // Two living downlights with fan between them, plus one in window niche.
   for(const zz of [3.53,1.44,.37]){
     cyl(1.70,2.68,zz,.098,.099,.20,M.black,'#1a1a1b');
     cyl(1.70,2.565,zz,.071,.071,.015,M.bulb,'#f5ddae');
   }
   // Simple black ceiling fan in the middle, blades fully opaque.
   cyl(1.70,2.61,2.48,.11,.11,.27,M.black,'#232325');
   for(let k=0;k<3;k++){
     let a=(k/3)*Math.PI*2+.16;
     const sx=1.70+Math.cos(a)*.21,sz=2.48+Math.sin(a)*.21,ex=1.70+Math.cos(a)*.56,ez=2.48+Math.sin(a)*.56;
     bar([sx,2.49,sz],[ex,2.47,ez],.049,M.black,'#202123',8);
     roundBox(ex,2.465,ez,.21,.026,.16,.012,M.black,'#292b2b');
   }
 }
 function dining(){
   // Rectangular dining table close to LEFT wall, long dimension north/south.
   const x=.94,z=4.49;
   roundBox(x,.742,z,.86,.055,1.31,.020,M.black,'#202223');
   box(x,.674,z,.68,.071,1.08,M.black,'#28292a');
   for(let xx of [x-.35,x+.35])for(let zz of [z-.56,z+.56]){
     box(xx,.350,zz,.059,.70,.059,M.black,'#272727');
   }
   // Exactly four ladder-back black chairs, 2 per LONG side; cream upholstered seats.
   function chair(cx,cz,side){
     // side = -1 on left looking right; +1 on right looking left.
     const backX=cx+side*.20,frontX=cx-side*.19;
     // Feet and lower stretchers.
     for(let zz of [cz-.19,cz+.19]){
       box(backX,.42,zz,.049,.84,.050,M.black,'#17191a');
       box(frontX,.20,zz,.049,.40,.050,M.black,'#1a1c1d');
     }
     roundBox(cx,.445,cz,.47,.105,.46,.035,M.cream,'#f2e7d6');
     box(cx,.367,cz,.48,.052,.48,M.black,'#202122');
     for(let yy of [.63,.74,.84]){
       box(backX,yy,cz,.055,.061,.40,M.black,'#1b1c1c');
     }
     box(cx,.22,cz,.42,.034,.035,M.black,'#222526');
   }
   for(let zz of [4.08,4.88]){chair(.29,zz,-1);chair(1.59,zz,1);}
   // Dining L-shaped black track light: two bulbs on near-camera segment parallel to table.
   const y=2.708;
   bar([1.20,y,4.55],[1.20,y,5.78],.022,M.black,'#171819',6);
   bar([1.20,y,4.55],[1.73,y,4.55],.022,M.black,'#171819',6);
   function spot(sx,sz,targetX,targetZ){
      // Spotlight cylinder points AWAY from the entrance toward the dining tabletop.
      // Visitors see the dark rear housings of the two near-camera spotlights.
      const top=[sx,2.64,sz],mid=[sx,2.55,sz],tail=[sx+(targetX-sx)*.17,2.37,sz+(targetZ-sz)*.17];
      bar(top,mid,.056,M.wood,'#bfa078',12);
      bar(mid,tail,.086,M.black,'#1c1d1d',16);
      const aim=[tail[0]-mid[0],tail[1]-mid[1],tail[2]-mid[2]],dist=Math.hypot(...aim)||1,normal=aim.map(v=>v/dist);
      let a=[1,0,0],b=[0,0,1];const rr=.076,cc=color('#f8d6a5');
      // Bury warm emissive lens at the inward-facing end: it does not face the player.
      for(let i=0;i<16;i++){
        const t0=i/16*Math.PI*2,t1=(i+1)/16*Math.PI*2;
        const e0=tail.map((v,j)=>v+rr*(Math.cos(t0)*a[j]+Math.sin(t0)*b[j]));
        const e1=tail.map((v,j)=>v+rr*(Math.cos(t1)*a[j]+Math.sin(t1)*b[j]));
        for(const pos of [tail,e0,e1])vertex(pos,normal,[.5,.5],M.bulb,cc);
      }
   }
   spot(1.20,5.24,.88,4.52);spot(1.20,5.67,1.0,4.35);spot(1.62,4.55,1.0,4.34);
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
 let width=0,height=0,lastTime=0;
 function render(now){
   // Do not run heavy WebGL loops on hidden tabs.
   if(document.hidden){requestAnimationFrame(render);return;}
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
   requestAnimationFrame(render);
 }
 window.HW3DColliders=[
  {x0:.20,x1:1.22,z0:1.28,z1:3.56}, // sofa
  {x0:.48,x1:1.42,z0:3.79,z1:5.19}, // dining table
  {x0:.02,x1:.54,z0:3.78,z1:5.13}, // left chairs
  {x0:1.32,x1:1.84,z0:3.78,z1:5.13}, // right chairs
  {x0:2.73,x1:3.24,z0:1.56,z1:3.51}, // TV cabinet
  {x0:2.65,x1:3.16,z0:.55,z1:1.14}, // empty rack
  {x0:.08,x1:.72,z0:.58,z1:.90}, // AC wall bump-out
  {x0:1.15,x1:1.96,z0:6.0,z1:6.77}, // fridge
  {x0:2.03,x1:4.62,z0:6.34,z1:7.0}, // kitchen counter
  {x0:3.85,x1:4.58,z0:5.42,z1:6.11}, // kitchen pantry unit
 ];
 window.__HW3D_READY=true;
 old.style.opacity='0';canvas.style.opacity='1';
 document.documentElement.dataset.renderer='webgl-v3';
 requestAnimationFrame(render);
 console.info('Housewalk: Real Rooms WebGL renderer ready, '+baseCount+' triangles / 3');
})();