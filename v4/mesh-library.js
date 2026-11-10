// Retained detailed furniture geometry from PR4, adapted to PBR buffers.
export function interiorDetails(){
 const M={floor:0,plaster:1,black:2,cream:3,sofa:4,white:5,slate:6,steel:7,curtain:8,cabinet:9,leaf:3,walnut:10,ivory:11,sky:12,dark:13,bulb:14,wood:15};
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
 function pad(x,y,z,w,h,d,material=M.sofa,t='#ffffff'){
    roundBox(x,y,z,w,h,d,Math.min(.105,h*.44,d*.15),material,t);
 }
 function windowFrame(z,x0,x1,y0,y1){
   const c='#697d87';
   for(const xx of [x0,x1])box(xx,(y0+y1)/2,z,.045,y1-y0+.055,.09,M.steel,c);
   for(const yy of [y0,y1])box((x0+x1)/2,yy,z,x1-x0,.042,.096,M.steel,c);
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
   const x=2.81,z=3.43;
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
 function living(){
   const acStart=verts.length;
   // Split-unit air conditioner: beveled enclosure, vent, slit louvers and status LED.
   roundBox(.64,2.34,.93,.83,.32,.24,.034,M.white,'#fafaf9');
   box(.64,2.19,1.062,.77,.030,.015,M.black,'#343b3f');
   for(let i=0;i<3;i++)box(.64,2.182+i*.009,1.075,.72,.003,.018,M.steel,'#939a9b');
   for(let i=0;i<15;i++){box(.25+i*.053,2.183,1.074,.010,.025,.020,M.steel,'#b2b5b3');}
   box(.63,2.315,1.058,.65,.012,.014,M.ivory,'#e9e8e4');
   cyl(.96,2.34,1.056,.009,.009,.01,M.leaf,'#8cc684',10);
   // The enclosure back must sit ON the mounting face (z=.90), not 9 cm inside it.
   for(let i=acStart;i<verts.length;i+=12)verts[i+2]+=.17;
   // Grey-topped white storage cabinet, correctly opposite the sofa.
   box(2.82,.275,2.10,.425,.54,2.00,M.white,'#fffefb');
   box(2.59,.285,2.10,.018,.48,1.95,M.ivory,'#f5efe3');
   roundBox(2.82,.565,2.10,.475,.050,2.04,.017,M.slate,'#f2ece5');
   box(2.82,.043,2.10,.44,.075,1.94,M.dark,'#6c6e70');
   for(let zz of [1.60,2.10,2.60])box(2.575,.285,zz,.013,.43,.009,M.white,'#dbd7d1');
   trolley();
   // Wall TV MOUNT ONLY — no television, no electronics, no decorations.
   for(let yy of [1.42,1.82])box(3.025,yy,2.50,.062,.061,.97,M.black,'#cac3b3');
   for(const zz of [2.05,2.95]){
      box(2.985,1.64,zz,.065,.65,.067,M.black,'#b4ada3');
      for(let yy of [1.46,1.58,1.71,1.84]){
         box(2.95,yy,zz,.018,.027,.026,M.dark,'#161718');
      }
   }
   // Empty white metal 5-tier shelf just BEFORE the recessed window.
   const X=2.84,Z=.82;
   for(const xx of [2.615,3.065])for(const zz of [.55,1.09]){
      roundBox(xx,1.00,zz,.028,1.98,.029,.007,M.white,'#fffaf1');
   }
   for(const yy of [.16,.60,1.04,1.48,1.92]){
     roundBox(X,yy,Z,.45,.033,.56,.008,M.white,'#fffdf8');
   }
   // Living: lamp -> 3-blade fan -> lamp; niche has its OWN centrally placed lamp.
   for(const [cx,zz] of [[1.70,3.49],[1.70,1.39],[2.22,.48]]){
      cyl(cx,2.720,zz,.074,.074,.10,M.black,'#6d5b4c',24);
      cyl(cx,2.660,zz,.061,.060,.016,M.bulb,'#ffe0af',24);

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
 function dining(){const start=verts.length;
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
   const trackStart=verts.length;
   // Reference-matched three-head L track. Two heads on near-camera longitudinal
   // segment, third on return. They point TOWARD the dining tabletop.
   const y=2.720;
   box(.99,y,5.24,1.86,.034,.040,M.black,'#beb8b0');
   box(1.90,y,5.56,.040,.034,.68,M.black,'#beb8b0');
   function spotlight(sx,sz,tx,tz){
      const mount=[sx,2.63,sz],direction=[tx-sx,-1.8,tz-sz],len=Math.hypot(...direction),dir=direction.map(v=>v/len);
      const end=mount.map((v,i)=>v+dir[i]*.18);
      bar([sx,y,sz],mount,.018,M.black,'#c1b8ad',12);
      bar(mount,mount.map((v,i)=>v+dir[i]*.052),.042,M.steel,'#9b9c98',20);
      bar(mount.map((v,i)=>v+dir[i]*.050),end,.055,M.black,'#beb9b1',24);
      // Closed luminous disk normal to the aimed head, rather than a hollow tube.
      const u=[1,0,0],v=[0,-dir[2],dir[1]],vl=Math.hypot(...v),col=color('#ffe5b9');
      const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
      const vv=v.map(n=>n/vl),uu=cross(vv,dir);
      for(let i=0;i<24;i++){const points=[end];for(const k of [i,i+1])points.push(end.map((q,j)=>q+.047*(uu[j]*Math.cos(k*Math.PI/12)+vv[j]*Math.sin(k*Math.PI/12))));for(const pt of points)vertex(pt,dir,[.5,.5],M.bulb,col);}
   }
   spotlight(.53,5.24,.65,4.45);spotlight(1.40,5.24,1.16,4.45);spotlight(1.90,5.72,1.0,4.51);

 for(let i=trackStart;i<verts.length;i+=12)verts[i+2]-=.55;
 for(let i=start;i<verts.length;i+=12){verts[i]=.90+(verts[i]-.96)*.9375;verts[i+2]-=.45;}
 }
 function kitchen(){const kitchenStart=verts.length;
   // South-wall run, mirrored to face the living room: bathroom / washer / sink / hob / fridge.
   // Cabinet run fitted to the traced lower-middle kitchen, ending at the bath wall.
   const front=6.35,back=6.98;
   box(3.015,.12,6.69,1.65,.16,.53,M.black,'#777470');
   box(3.015,.38,6.69,1.65,.48,.58,M.cabinet,'#dedbd5');
   for(const x of [2.47,3.02,3.57]){
     roundBox(x,.49,front,.535,.68,.027,.007,M.cabinet,'#d1d0ca');
     box(x,.836,front-.010,.57,.012,.028,M.black,'#8d8982');
   }
   // Counter is constructed around a real open basin rather than covering its cavity.
   const y=.885;
   roundBox(2.725,y,6.65,1.07,.045,.68,.008,M.black,'#8b8c8b');
   roundBox(3.8125,y,6.65,.065,.045,.68,.008,M.black,'#8b8c8b');
   box(3.52,y,6.39,.56,.045,.16,M.black,'#8b8c8b');
   box(3.52,y,6.93,.56,.045,.12,M.black,'#8b8c8b');
   const sinkStart=verts.length;
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
   for(let i=sinkStart;i<verts.length;i+=12)verts[i]+=.18;
   // Small off-white backsplash tiles and recessed grout, interrupted by the window.
   for(let x=2.20;x<4.47;x+=.105)for(let yy=.94;yy<1.80;yy+=.105){
     if(x>3.04&&x<4.0&&yy>1.02&&yy<1.75)continue;
     box(x+.05,yy+.05,6.977,.101,.101,.017,M.ivory,'#f0ece2');
   }
   windowFrame(6.99,3.07,3.97,1.05,1.72);
   // Frame interior edges are matte black, with a small sliding handle.
   for(const x of [3.07,3.97])box(x,1.385,6.94,.042,.71,.09,M.black,'#9a9997');
   for(const yy of [1.05,1.72])box(3.52,yy,6.94,.94,.042,.09,M.black,'#9a9997');

   box(3.10,1.32,6.90,.015,.11,.025,M.steel,'#acb1ae');
   // White upper doors with fine shadow reveals and a warm under-cabinet strip.
   box(3.335,2.16,6.83,2.28,.78,.32,M.white,'#f7f6f0');
   for(const x of [2.42,2.88,3.34,3.80,4.26])roundBox(x,2.16,6.653,.448,.775,.025,.005,M.white,'#faf8f1');
   box(3.335,1.757,6.67,2.23,.010,.020,M.bulb,'#fff2d0');
   const hoodStart=verts.length;
   // Low-profile cooker hood, grease-filter grille and controls.
   roundBox(2.55,1.74,6.67,.67,.075,.49,.012,M.steel,'#bdc0bc');
   box(2.55,1.695,6.68,.52,.015,.32,M.black,'#777a78');
   for(let x=2.34;x<2.79;x+=.025)box(x,1.684,6.69,.009,.006,.25,M.steel,'#a9aaa6');
   for(const x of [2.40,2.45,2.50])box(x,1.736,6.412,.012,.012,.007,M.black);
   for(let i=hoodStart;i<verts.length;i+=12)verts[i+1]+=.07;
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
     roundBox(1.75,yy,6.297,.72,h,.045,.022,M.steel,'#b8b8b3');
     box(1.75,yy-h/2+.027,6.269,.65,.018,.018,M.black,'#555a5b');
   }
   box(1.75,2.465,6.70,.80,.60,.58,M.cabinet,'#c2bfb8');
   box(1.75,2.465,6.385,.76,.56,.025,M.cabinet,'#ccc9c2');
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
 for(let i=kitchenStart;i<verts.length;i+=12)verts[i]+=.40;
 }

 living();dining();kitchen();return {vertices:new Float32Array(verts),M};
}
