/* Targeted bedroom, bathroom and doorway-transition completion on the PR #5 shell.
 * Coordinates are source-plan traces / photo-fit estimates, never a surveyed model.
 */
import * as THREE from './vendor/three.module.min.js';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';
import {Reflector} from './vendor/Reflector.js';
import {toiletModel} from './toilet-model.js?v=niche-round3-20261115';
import {bedroomRug} from './bedroom-rug.js';

export function connectedRoomDetails({scene,L,bridge,tex,wall,white,metal,black,taupe,cloth,shadowLights,glass}){
 const named={},mirrors=[],lights=[];
 const put=(o,name)=>{o.castShadow=!o.material?.transparent;o.receiveShadow=true;if(name){o.name=name;named[name]=o;}scene.add(o);return o;};
 const standard=(color,roughness=.75,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness,envMapIntensity:.7});
 const plaster=tex('plaster-color.jpg',true),plasterN=tex('plaster-normal.webp');
 const charcoal=standard('#686867',.88);charcoal.map=plaster;charcoal.normalMap=plasterN;charcoal.normalScale=new THREE.Vector2(.08,.08);
 const tileDark=standard('#68645d',.72),tileLight=standard('#ded8cf',.80),tileFloor=standard('#aaa296',.90),grout=standard('#918b81',.95),lightGrout=standard('#bab5ac',.95);
 const tileMap=tex('refined-tile-color.jpg',true),tileN=tex('refined-tile-normal.webp'),tileR=tex('refined-tile-roughness.jpg');
 for(const m of [tileDark,tileLight,tileFloor]){m.map=tileMap;m.normalMap=tileN;m.normalScale=new THREE.Vector2(.07,.07);m.roughnessMap=tileR;}
 const porcelain=new THREE.MeshPhysicalMaterial({color:'#f6f4ef',roughness:.19,metalness:0,clearcoat:.20,clearcoatRoughness:.18,envMapIntensity:.90});
 const bathChrome=new THREE.MeshPhysicalMaterial({color:'#d8dcdb',roughness:.20,metalness:.95,envMapIntensity:1.65});
 const wood=standard('#b8946d',.58);wood.map=tex('door-ash.jpg',true);
 const lightFace=new THREE.MeshStandardMaterial({color:'#fff7e6',emissive:'#ffe4bb',emissiveIntensity:.8,roughness:.6});
 function box(x,y,z,w,h,d,m=white,r=.006,name){const geo=r?new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)):new THREE.BoxGeometry(w,h,d);const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);return put(o,name);}
 function bar(a,b,r=.009,m=metal,segments=12){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,v.length(),segments),m);o.position.copy(new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return put(o);}
 function cylinder(x,y,z,r,h,m=metal){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,32),m);o.position.set(x,y,z);return put(o);}
 function sphere(x,y,z,sx,sy,sz,m){const o=new THREE.Mesh(new THREE.SphereGeometry(1,28,18),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);return put(o);}
 function tube(points,r=.008,m=metal){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return put(new THREE.Mesh(new THREE.TubeGeometry(curve,48,r,8,false),m));}
 function floorLamp(){
  const start=scene.children.length,x=L.bedroom.lamp.x,z=L.bedroom.lamp.z;
  cylinder(x,.042,z,.155,.055,black);cylinder(x,.08,z,.055,.045,black);bar([x,.08,z],[x,1.80,z],.013,black,16);
  const profile=Array.from({length:25},(_,i)=>{const a=.15+i/24*1.30;return new THREE.Vector2(.15*Math.sin(a),.13*(1-Math.cos(a)));});
  const opal=new THREE.MeshPhysicalMaterial({color:'#f4f1e8',roughness:.5,emissive:'#ffe8c8',emissiveIntensity:.28});
  const outer=new THREE.Mesh(new THREE.LatheGeometry(profile,48),opal);outer.position.set(x,1.80,z);put(outer);
  const inner=new THREE.Mesh(new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(Math.max(.001,p.x-.003),p.y+.003)),48),lightFace);inner.material=lightFace.clone();inner.material.side=THREE.BackSide;inner.position.copy(outer.position);put(inner);cylinder(x,1.875,z,.058,.008,lightFace);
  tube([[x,1.30,z],[x-.04,1.43,z-.025],[x-.16,1.51,z-.13]],.012,black);
  const end=new THREE.Vector3(x-.16,1.51,z-.13),aim=new THREE.Vector3(-.46,-.45,-.60).normalize();
  const shade=new THREE.Mesh(new THREE.CylinderGeometry(.027,.067,.10,32,1,true),opal);shade.position.copy(end);shade.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),aim);put(shade);
  const lens=new THREE.Mesh(new THREE.CircleGeometry(.061,32),lightFace);lens.position.copy(end).addScaledVector(aim,.052);lens.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),aim);put(lens);
  const point=new THREE.PointLight('#ffe3c2',2.0,2.6,2);point.position.set(x,1.88,z);scene.add(point);lights.push(point);
  const reading=new THREE.SpotLight('#ffead4',1.4,2.5,.7,.9,2);reading.position.copy(end);reading.target.position.set(5.4,.6,2.7);scene.add(reading,reading.target);lights.push(reading);
  const group=new THREE.Group();group.name='Bedroom standing lamp';group.userData={floorStanding:true,heads:2,main:'upward bowl',reading:'adjustable',height:1.94};
  for(const o of scene.children.slice(start))if(o.isMesh){scene.remove(o);group.add(o);}scene.add(group);named.lamp=group;
 }
 function mirror(geometry,x,y,z,angle,name){
  const size=matchMedia('(pointer:coarse)').matches?256:512;
  const o=new Reflector(geometry,{color:0xe7e5e0,textureWidth:size,textureHeight:size,clipBias:.003,multisample:0});o.position.set(x,y,z);o.rotation.y=angle;o.layers.set(2);o.castShadow=false;
  // Main camera sees the physical mirror; reflection cameras exclude mirror layer 2,
  // avoiding recursive multi-mirror passes. Cache unchanged views, cap moving updates.
  const original=o.onBeforeRender;let stamp=-Infinity,last='';
  o.onBeforeRender=function(renderer,world,camera){const p=camera.position,q=camera.quaternion,s=[p.x,p.y,p.z,q.x,q.y,q.z,q.w,bridge.getNight(),bridge.doors.map(d=>d.open),window.__HW4_ASSETS].join(',');
   if(s===last||performance.now()-stamp<100)return;stamp=performance.now();last=s;original.call(this,renderer,world,camera);
  };
  o.name=name;o.userData={plainMirror:true,backlight:false};scene.add(o);mirrors.push(o);named[name]=o;return o;
 }
 function archShape(w,h){const r=w/2,s=new THREE.Shape();s.moveTo(-r,0);s.lineTo(r,0);s.lineTo(r,h-r);s.absarc(0,h-r,r,0,Math.PI,false);s.lineTo(-r,0);return s;}
 function archFrame(w,h,x,y,z,angle){const s=archShape(w,h),inner=archShape(w-.035,h-.035);const path=new THREE.Path(inner.getPoints(48).map(p=>new THREE.Vector2(p.x,p.y+.0175)));s.holes.push(path);
  const frame=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:.025,bevelEnabled:true,bevelSize:.003,bevelThickness:.003,bevelSegments:2,steps:1,curveSegments:24}),white);frame.position.set(x,y,z);frame.rotation.y=angle;put(frame,'Bedroom arched mirror frame');
  mirror(new THREE.ShapeGeometry(archShape(w-.037,h-.038),32),x+.029,y+.018,z,angle,'Bedroom full-length mirror');
 }
 function tilesX(x,z0,z1,y0,y1,mat,gap){
  for(let z=z0;z<z1-.001;z+=.60)for(let y=y0;y<y1-.001;y+=.30){const w=Math.min(.60,z1-z),h=Math.min(.30,y1-y);if(gap&&z+w>gap.z0&&z<gap.z1&&y+h>gap.y0&&y<gap.y1)continue;box(x,y+h/2,z+w/2,.010,h-.0025,w-.0025,mat,.00035).castShadow=false;}
 }
 function tilesZ(z,x0,x1,y0,y1,mat){for(let x=x0;x<x1-.001;x+=.60)for(let y=y0;y<y1-.001;y+=.30){const w=Math.min(.60,x1-x),h=Math.min(.30,y1-y);box(x+w/2,y+h/2,z,w-.0025,h-.0025,.010,mat,.00035).castShadow=false;}}
 function basin(){
  const x=6.02,z=4.89,N=96,profile=[[.17,.23,.735],[.19,.25,.825],[.19,.25,.855],[.182,.242,.866],[.151,.210,.855],[.143,.202,.835],[.107,.160,.775],[.065,.095,.756],[.015,.018,.753]];
  const p=[],uv=[],idx=[];
  for(let j=0;j<profile.length;j++){const [rx,rz,y]=profile[j];for(let i=0;i<=N;i++){const t=i/N*Math.PI*2,xx=Math.sign(Math.cos(t))*Math.abs(Math.cos(t))**.35,zz=Math.sign(Math.sin(t))*Math.abs(Math.sin(t))**.35;p.push(x+rx*xx,y,z+rz*zz);uv.push(i/N,j/(profile.length-1));}}
  for(let j=0;j<profile.length-1;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i;idx.push(a,a+N+2,a+1,a,a+N+1,a+N+2);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();const basinAO=[];for(let j=0;j<profile.length;j++)for(let i=0;i<=N;i++){const a=j<4?1:1-(j-3)*.085;basinAO.push(a,a,a);}geo.setAttribute('color',new THREE.Float32BufferAttribute(basinAO,3));const m=porcelain.clone();m.vertexColors=true;m.side=THREE.DoubleSide;put(new THREE.Mesh(geo,m),'Bathroom wall-mounted sink');
  box(x,.742,z,.32,.014,.43,porcelain,.006);cylinder(x,.756,z,.016,.008,bathChrome);
  cylinder(6.13,.922,z,.022,.113,bathChrome);cylinder(6.13,.873,z,.030,.013,bathChrome);
  tube([[6.13,.97,z],[6.11,.993,z],[6.04,.993,z],[6.02,.982,z]],.013,bathChrome);
  cylinder(6.02,.978,z,.014,.020,bathChrome);box(6.13,1.011,z,.071,.009,.023,bathChrome,.004);
  tube([[x,.735,z],[x,.61,z],[x+.04,.555,z],[6.19,.555,z]],.018,white);
  const flange=cylinder(6.202,.555,z,.027,.012,bathChrome);flange.rotation.z=Math.PI/2;
  mirror(new THREE.CircleGeometry(.225,64),6.190,1.56,z,-Math.PI/2,'Bathroom plain round mirror');
  const backing=new THREE.Mesh(new THREE.CylinderGeometry(.227,.227,.007,64),metal);backing.rotation.z=Math.PI/2;backing.position.set(6.196,1.56,z);put(backing);const mount=cylinder(6.204,1.56,z,.060,.012,white);mount.rotation.z=Math.PI/2;
 }
 function toilet(){
  const model=toiletModel(porcelain,bathChrome);scene.add(model);named.toilet=model;
  // Bidet and holder remain on the actual window wall, on either side of the toilet.
  box(6.204,.74,5.20,.016,.056,.036,bathChrome,.004);box(6.186,.74,5.20,.025,.06,.04,metal,.006);bar([6.17,.68,5.20],[6.17,.81,5.20],.014);bar([6.17,.81,5.20],[6.12,.81,5.20],.019);
  tube([[6.17,.68,5.20],[6.08,.27,5.17],[5.98,.19,5.28],[6.10,.25,5.37],[6.20,.25,5.37]],.007,bathChrome);
  const valve=cylinder(6.20,.25,5.37,.021,.035,bathChrome);valve.rotation.z=Math.PI/2;
  const paperMount=cylinder(6.204,.70,6.015,.024,.012,bathChrome);paperMount.rotation.z=Math.PI/2;bar([6.20,.70,6.015],[6.04,.70,6.015],.013);bar([6.04,.70,5.94],[6.04,.70,6.10],.012);
  const paper=new THREE.Mesh(new THREE.LatheGeometry([[.021,-.0725],[.057,-.0725],[.060,-.069],[.060,.069],[.057,.0725],[.021,.0725],[.021,-.0725]].map(p=>new THREE.Vector2(...p)),64),standard('#eee9de',.95));paper.position.set(6.04,.70,6.02);paper.rotation.x=Math.PI/2;put(paper,'Bathroom hollow paper roll');
  const core=new THREE.Mesh(new THREE.LatheGeometry([[.019,-.072],[.022,-.072],[.022,.072],[.019,.072],[.019,-.072]].map(p=>new THREE.Vector2(...p)),48),standard('#ada185',.94));core.position.copy(paper.position);core.rotation.x=Math.PI/2;put(core,'Bathroom cardboard roll core');

 }
 function shower(){
  // Locked 04 RIGHT view: opening on the WINDOW-FACING return (normal -Z),
  // perpendicular to the heater/rail face. Round 2 incorrectly cut normal -X.
  // Preserve the masonry envelope x=6..6.30, z=6.10..6.38, y=0..2.77.
  // Only the cavity/its tiled returns change; every fixture below stays fixed.
  const n={x0:6.016,x1:6.208,y0:1.06,y1:1.38,front:6.088,back:6.238};
  box(6.15,.53,6.24,.30,1.06,.28,tileDark,.001,'Bathroom partition below niche');
  box(6.15,2.075,6.24,.30,1.39,.28,tileDark,.001,'Bathroom partition above niche');
  box(6.008,1.22,6.24,.016,.32,.28,tileDark,0,'Bathroom niche left masonry pier');
  box(6.254,1.22,6.24,.092,.32,.28,tileDark,0,'Bathroom niche right masonry pier');
  box(6.112,1.22,6.309,.192,.32,.142,tileDark,0,'Bathroom niche recessed back');
  tilesX(5.992,6.10,6.38,.02,2.75,tileDark);
  // Clip individual front tiles at the exact aperture; no full tile/decal
  // bridges the hole. All exterior grout courses share the same .02 m origin.
  for(let y=.02;y<2.75-.001;y+=.30){
   const hi=Math.min(y+.30,2.75),parts=hi<=n.y0||y>=n.y1?[[6.0,6.225,y,hi]]:
    [[6.0,n.x0,Math.max(y,n.y0),Math.min(hi,n.y1)],[n.x1,6.225,Math.max(y,n.y0),Math.min(hi,n.y1)],
     ...(y<n.y0?[[6.0,6.225,y,n.y0]]:[]),...(hi>n.y1?[[6.0,6.225,n.y1,hi]]:[])];
   for(const [a,b,c,d]of parts)if(b-a>.001&&d-c>.001)box((a+b)/2,(c+d)/2,6.093,b-a-.001,d-c-.0025,.010,tileDark,.00025).castShadow=false;
  }
  const recessTile=tileDark.clone();recessTile.color.set('#64615a');
  box(6.112,1.22,6.242,.190,.318,.008,recessTile,.0003,'Bathroom niche tiled back face');
  for(const x of [6.017,6.207])box(x,1.22,6.163,.002,.320,.150,tileDark,.0002,'Bathroom niche tiled side return');
  box(6.112,1.055,6.163,.192,.010,.150,tileDark,.0004,'Bathroom niche sill');
  box(6.112,1.385,6.163,.192,.010,.150,tileDark,.0004,'Bathroom niche tiled soffit');
  // Fine grout continues inside the return; it is not an emissive dark patch.
  box(6.112,1.22,6.2375,.188,.0015,.0005,grout,0).castShadow=false;
  named.showerNiche={userData:{...n,normal:[0,0,-1],width:n.x1-n.x0,height:n.y1-n.y0,depth:n.back-n.front,partitionEnvelope:[6,6.30,0,2.77,6.10,6.38]}};
  box(5.95,1.68,6.24,.075,.40,.20,black,.025,'Bathroom black water heater');
  box(5.990,1.68,6.24,.014,.33,.14,black,.005,'Heater contacting mounting pad');
  box(5.909,1.70,6.24,.006,.29,.145,standard('#1b1e20',.44),.018,'Heater inset front fascia');
  box(5.904,1.525,6.24,.006,.009,.042,standard('#6c3b35',.6),.002,'Heater small status lens');
  cylinder(5.905,1.66,6.24,.019,.025,bathChrome).rotation.z=Math.PI/2;
  for(const z of [6.18,6.31])bar([6.0,.97,z],[5.92,.97,z],.013);
  bar([5.92,.96,6.30],[5.92,2.17,6.30],.014);
  tube([[5.92,2.16,6.30],[5.92,2.28,6.35],[5.83,2.31,6.48],[5.75,2.31,6.59]],.015);
  cylinder(5.75,2.300,6.59,.014,.026,bathChrome);
  const rain=cylinder(5.74,2.285,6.59,.108,.018,bathChrome);cylinder(5.74,2.274,6.59,.099,.004,bathChrome);
  for(const [radius,count]of [[.035,12],[.063,20],[.085,28]])for(let i=0;i<count;i++){const a=i*Math.PI*2/count;const dot=new THREE.Mesh(new THREE.SphereGeometry(.0016,6,4),black);dot.position.set(5.74+radius*Math.cos(a),2.271,6.59+radius*Math.sin(a));put(dot);}
  cylinder(5.915,1.480,6.23,.010,.025,white);
  tube([[5.91,1.47,6.23],[5.84,.91,6.22],[5.82,.58,6.26],[5.83,.55,6.34],[5.88,.73,6.34],[5.91,1.22,6.30]],.006,bathChrome);
  bar([5.91,1.20,6.30],[5.865,1.40,6.30],.013);sphere(5.86,1.43,6.30,.015,.043,.026,bathChrome);
  sphere(5.842,1.43,6.30,.003,.035,.022,black);
  for(let i=0;i<9;i++){const a=i*Math.PI*2/9;sphere(5.838,1.43+.023*Math.cos(a),6.30+.013*Math.sin(a),.0015,.0015,.0015,bathChrome);}
  box(5.90,.013,6.73,.12,.005,.12,metal,.002,'Bathroom floor drain');for(let i=0;i<5;i++)box(5.858+i*.021,.0157,6.73,.007,.0002,.082,black,0);
  // The three triangular trays and simplified contents are Blender-authored
  // in final-room-props.glb; do not duplicate the old rectangular empty rack.
  named.bathShelf={userData:{tiers:3,triangular:true,empty:false}};
 }

 // Decorative sign on the real opposite shower wall; it is outside the locked
 // shower camera. Its lettering and bear/towel drawing are thin vector geometry,
 // not an electrical plate, room image, billboard or copied wall photograph.
 function bathPlaque(){
  const start=scene.children.length,x=5.055,y=1.75,z=6.20;
  const ink=standard('#242525',.94),paper=standard('#f2f1e9',.90),aqua=standard('#98c7c5',.87);
  box(x,y,z,.014,.64,.43,paper,.003);
  const P=(u,v,offset=.008)=>[x+offset,y+v,z-u];
  const line=(points,r=.0018,m=ink)=>tube(points.map(p=>P(...p)),r,m);
  const glyph={G:[[[.9,.85],[.7,1],[.25,1],[0,.75],[0,.25],[.25,0],[.9,0],[.9,.5],[.55,.5]]],O:[[[.25,0],[0,.25],[0,.75],[.25,1],[.75,1],[1,.75],[1,.25],[.75,0],[.25,0]]],B:[[[0,0],[0,1],[.65,1],[1,.8],[.65,.55],[0,.55]],[[.65,.55],[1,.3],[.8,0],[0,0]]],A:[[[0,0],[.50,1],[1,0]],[[.23,.40],[.77,.40]]],T:[[[0,1],[1,1]],[[.5,1],[.5,0]]],H:[[[0,0],[0,1]],[[1,0],[1,1]],[[0,.5],[1,.5]]]};
  let cursor=-.16;for(const ch of 'GO BATH'){if(ch===' '){cursor+=.018;continue;}for(const path of glyph[ch])line(path.map(([u,v])=>[cursor+u*.042,.202+v*.060]),.0024);cursor+=.053;}
  // Puffy white bear silhouette with a cyan bath towel over its head and side.
  const outline=[];for(let i=0;i<=72;i++){const a=i/72*Math.PI*2,r=1+.045*Math.cos(11*a);outline.push([-.026+.105*Math.cos(a)*r,-.045+.133*Math.sin(a)*r]);}line(outline,.0026);
  for(const side of [-1,1]){const ear=[];for(let i=0;i<=24;i++){const a=i/24*Math.PI*2;ear.push([-.026+side*.068+.022*Math.cos(a),.064+.025*Math.sin(a)]);}line(ear,.0023);}
  for(const u of [-.059,.005])sphere(...P(u,.015,.010),.0015,.006,.006,ink);
  sphere(...P(-.028,-.019,.010),.0018,.013,.010,ink);
  line([[-.036,-.033],[-.028,-.041],[-.018,-.033]],.0015);
  // A raised blue towel panel with a rolled upper arch and hanging lower end.
  box(x+.010,y-.050,z-.092,.003,.285,.080,aqua,.001);
  line([[.055,-.194],[.145,-.194],[.145,.049],[.124,.112],[.082,.139],[.040,.131],[.019,.104]],.0028);
  const hood=put(new THREE.Mesh(new THREE.TorusGeometry(.067,.020,8,40,Math.PI*.90),aqua));hood.rotation.y=Math.PI/2;hood.position.set(x+.010,y+.070,z-.076);
  line([[-.085,-.159],[-.099,-.183],[-.085,-.203],[-.062,-.194],[-.036,-.207],[-.005,-.194],[.020,-.201],[.048,-.181]],.0025);
  const g=new THREE.Group();g.name='Bathroom GO BATH decorative plaque';g.userData={decorative:true,electrical:false,label:'GO BATH',reference:'IMG_9965',outsideLockedShowerView:true};
  for(const o of scene.children.slice(start)){scene.remove(o);g.add(o);}scene.add(g);named.bathPlaque=g;
 }

 // Bedroom's fixed feature wall, AC-support mass, closed wardrobe and side-wall furniture.
 box(6.208,1.385,2.65,.018,2.77,3.25,charcoal,0,'Bedroom charcoal feature wall');
 // A complete assembly with an explicit rear mounting pad contacts z=.98.
 const acStart=scene.children.length,A=L.bedroom.ac;
 box(A.x,A.y,A.supportPlaneZ+.0125,.78,.25,.025,white,.008);
 box(A.x,A.y,A.z,.83,.32,A.depth,white,.028);
 box(A.x,A.y-.135,A.z+.127,.77,.025,.014,black,.003);
 for(let i=0;i<4;i++)box(A.x,A.y-.15+i*.006,A.z+.135,.74,.002,.018,metal,0);
 box(A.x,A.y-.04,A.z+.125,.64,.008,.008,white,.001);
 const ac=new THREE.Group();ac.name='Bedroom wall AC';ac.userData={supportPlaneZ:A.supportPlaneZ,casingRear:A.z-A.depth/2};
 for(const o of scene.children.slice(acStart)){scene.remove(o);ac.add(o);}scene.add(ac);named[ac.name]=ac;
 bar([3.24,2.67,.425],[4.99,2.67,.425],.008,metal);
 const c=L.bedroom.cabinet,cz=(c.z0+c.z1)/2,cx=(c.x0+c.x1)/2;
 const cabinet=box(cx,.30,cz,c.x1-c.x0,.52,c.z1-c.z0,standard('#c8bba4',.7),.008,'Bedroom corner cabinet');cabinet.userData={...c,frontNormal:[-1,0,0],supportPlaneZ:.98};
 box(cx,.575,cz,c.x1-c.x0+.015,.030,c.z1-c.z0+.012,wood,.005);
 for(const y of [.19,.405]){box(c.x0-.007,y,cz,.018,.20,.456,standard('#d1c4ad',.72),.004);tube([[c.x0-.021,y+.03,cz-.012],[c.x0-.042,y,cz],[c.x0-.021,y-.025,cz+.012]],.008,standard('#a77b4d',.7));}
 for(const x of [c.x0+.025,c.x1-.025])for(const z of [c.z0+.025,c.z1-.025])box(x,.052,z,.032,.074,.032,white,.003);
 box(6.115,1.29,1.36,.22,.035,.62,white,.005,'Bedroom floating shelf');
 // Keep the approved frame silhouette; personal collage pixels are never shipped.
 box(6.084,1.46,1.23,.024,.30,.22,white,.004,'Bedroom personal-photo frame');
 const insert=box(6.070,1.46,1.23,.002,.272,.192,standard('#a5a39b',.95),0,'Bedroom private-photo neutral insert');insert.userData.privateImageOmitted=true;
 cylinder(6.08,1.35,1.54,.035,.085,standard('#3f4140',.55));for(let i=0;i<5;i++)bar([6.08,1.38,1.54],[6.06+(i%2)*.035,1.62,1.50+i*.018],.0018,black,4);
 cylinder(6.08,1.335,1.40,.027,.055,white);
 const rug=bedroomRug(cloth);scene.add(rug);named.rug=rug;
 box(5.37,1.06,4.01,1.66,2.10,.54,white,.009,'Bedroom three-door wardrobe');
 for(let k=0;k<3;k++){const x=4.82+k*.55;box(x,1.065,3.726,.54,2.075,.023,white,.004);bar([x+.20,.93,3.70],[x+.20,1.10,3.70],.007,black);}
 // Fixed west wall: vanity, translucent empty drawers, perforated chair, arched mirror.
 box(3.445,.765,1.14,.40,.045,.80,white,.010,'Bedroom side-wall vanity');
 for(const x of [3.285,3.605])for(const z of [.79,1.49])bar([x,.02,z],[x,.74,z],.017,white);
 const plastic=new THREE.MeshPhysicalMaterial({color:'#e3ded0',roughness:.48,transparent:true,opacity:.7,depthWrite:false});
 for(const x of [3.27,3.62])for(const z of [1.18,1.48])bar([x,.035,z],[x,.70,z],.012,white);box(3.445,.705,1.33,.38,.025,.34,white,.008,'Bedroom translucent drawer frame');
 for(const y of [.17,.37,.57]){box(3.445,y,1.33,.34,.16,.29,plastic,.009);box(3.625,y+.045,1.33,.012,.015,.11,white,.004);}
 archFrame(.46,1.64,3.30,.065,2.0,Math.PI/2);bar([3.32,.025,2.0],[3.32,.10,2.0],.012,white);const base=cylinder(3.43,.025,2.0,.20,.025,white);base.scale.x=.65;base.scale.z=1.08;
 const wave=new THREE.Shape();for(let i=0;i<=80;i++){const a=i/80*Math.PI*2,r=1+.055*Math.sin(a*5+.4)+.035*Math.cos(a*7);const x=.145*Math.cos(a)*r,y=.205*Math.sin(a)*r;if(i===0)wave.moveTo(x,y);else wave.lineTo(x,y);}wave.closePath();
 const wavyFrame=new THREE.Mesh(new THREE.ExtrudeGeometry(wave,{depth:.012,bevelEnabled:true,bevelThickness:.007,bevelSize:.009,bevelSegments:2,curveSegments:24}),white);wavyFrame.rotation.y=Math.PI/2;wavyFrame.position.set(3.40,1.04,1.14);put(wavyFrame);
 mirror(new THREE.ShapeGeometry(wave,32),3.422,1.04,1.14,Math.PI/2,'Bedroom wavy tabletop mirror');box(3.43,.80,1.14,.12,.025,.25,white,.008);
 box(3.84,.43,.94,.38,.035,.39,white,.025,'Bedroom perforated chair seat');
 for(const x of [3.69,3.99])for(const z of [.78,1.10])bar([x,.018,z],[x,.43,z],.012,white);
 // Open perforated chair back: real holes between rounded strips, no opaque dot decal.
 for(let z=.77;z<1.12;z+=.047)bar([3.995,.49,z],[4.02,.86,z],.011,white,8);
 for(let y=.51;y<.86;y+=.047)bar([3.995,y,.76],[3.995,y,1.12],.010,white,8);
 floorLamp();
 // Five softly tapered blades, retained as one real ceiling fan in the same bedroom.
 cylinder(4.85,2.70,2.46,.070,.085,black);bar([4.85,2.64,2.46],[4.85,2.51,2.46],.021,black);sphere(4.85,2.48,2.46,.135,.070,.135,black);
 for(let k=0;k<5;k++){const shape=new THREE.Shape();shape.moveTo(.10,-.035);shape.bezierCurveTo(.26,-.07,.55,-.095,.64,-.025);shape.bezierCurveTo(.68,.035,.60,.09,.46,.095);shape.lineTo(.16,.045);shape.closePath();const blade=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.008,bevelEnabled:true,bevelSize:.003,bevelThickness:.002,bevelSegments:1,curveSegments:12}),black);blade.rotation.x=-Math.PI/2;blade.rotation.z=k*Math.PI*2/5+.25;blade.position.set(4.85,2.48,2.46);put(blade);}
 for(const [x,z]of [[4.36,1.55],[5.0,3.66]]){cylinder(x,2.69,z,.070,.13,black);cylinder(x,2.615,z,.057,.012,lightFace);}

 // Bedroom north window, not an opaque blue wall or a photograph.
 const bedroomFrame=standard('#3c4447',.32,.55),lo=.70,hi=2.50,div=1.08;
 box(3.2375,(lo+hi)/2,0,.025,hi-lo,.15,wall,0);box(4.975,(lo+hi)/2,0,.050,hi-lo,.15,wall,0);
 for(const x of [3.25,4.10,4.95])box(x,(lo+hi)/2,.047,.045,hi-lo,.105,bedroomFrame,.003);
 for(const y of [lo,div,hi])box(4.10,y,.047,1.745,.045,.105,bedroomFrame,.003);
 for(const [x0,x1]of [[3.285,4.067],[4.133,4.915]]){
  for(const x of [x0,x1])box(x,(div+hi)/2,.090,.021,hi-div-.04,.060,bedroomFrame,.002);
  for(const y of [div+.035,hi-.035])box((x0+x1)/2,y,.090,x1-x0,.022,.060,bedroomFrame,.002);
  for(const [a,b]of [[lo+.025,div-.025],[div+.05,hi-.05]])box((x0+x1)/2,(a+b)/2,.065,x1-x0-.025,b-a,.006,glass,0).castShadow=false;
 }
 for(const x of [4.04,4.16]){box(x,1.52,.14,.014,.135,.022,metal,.003);}
 box(4.10,.68,.115,1.78,.035,.24,white,.003);
 // Bathroom tile envelope and physical frosted window reveal, not a scenic backdrop.
 box(5.625,1.385,4.447,1.20,2.70,.006,lightGrout,0);box(5.035,1.385,6.15,.012,2.70,1.72,lightGrout,0);box(5.625,1.385,6.965,1.20,2.70,.012,lightGrout,0);
 box(6.222,1.385,4.90,.008,2.70,.76,grout,0);box(6.222,1.385,6.49,.008,2.70,.94,grout,0);box(6.222,.52,5.65,.008,1.03,.74,grout,0);box(6.222,2.625,5.65,.008,.29,.74,grout,0);
 box(5.625,.0065,5.74,1.35,.005,2.62,grout,0).castShadow=false;
 tilesZ(4.451,5.025,6.225,.02,2.75,tileLight);tilesX(5.043,5.28,6.96,.02,2.75,tileLight);tilesZ(6.957,5.025,6.225,.02,2.75,tileLight);
 // Split tile fields exactly at opening edges, avoiding missing / overlapping tiles.
 tilesX(6.213,4.52,5.28,.02,2.75,tileDark);tilesX(6.213,6.02,6.96,.02,2.75,tileDark);tilesX(6.213,5.28,6.02,.02,1.03,tileDark);tilesX(6.213,5.28,6.02,2.48,2.75,tileDark);
 for(let x=4.95;x<6.3-.001;x+=.30)for(let z=4.43;z<7.05-.001;z+=.30){const w=Math.min(.30,6.3-x),d=Math.min(.30,7.05-z);box(x+w/2,.009,z+d/2,w-.003,.012,d-.003,tileFloor,.0005).castShadow=false;}
 const frosted=new THREE.MeshPhysicalMaterial({color:'#d8e4e5',roughness:.72,metalness:0,emissive:'#bfd4dd',emissiveIntensity:.20,envMapIntensity:.2});
 box(6.28,1.755,5.65,.016,1.37,.66,frosted,.001,'Bathroom frosted window');
 for(const z of [5.28,6.02])box(6.245,1.755,z,.11,1.50,.045,black,.004);
 for(const y of [1.03,2.48])box(6.245,y,5.65,.11,.045,.78,black,.004);
 box(6.145,1.04,5.65,.18,.028,.80,tileDark,.001);bar([6.18,1.08,5.57],[6.18,1.08,5.72],.009,metal);
 basin();toilet();shower();bathPlaque();cylinder(5.55,2.761,5.66,.077,.014,white);cylinder(5.55,2.744,5.66,.095,.020,white);cylinder(5.55,2.73,5.66,.077,.010,lightFace);
 const windowFill=new THREE.PointLight('#edf3ef',1.6,2.6,2);windowFill.position.set(6.08,1.85,5.65);scene.add(windowFill);
 box(4.95,.020,4.88,.075,.006,.80,metal,.001,'Bathroom threshold');
 // Real transition soffit remains outside the living-window alcove.
 box(4.72,2.685,4.96,3.15,.17,1.18,white,0,'Hallway ceiling soffit');const bounce=new THREE.DataTexture(new Uint8Array([55,38,25,255]),1,1);bounce.colorSpace=THREE.LinearSRGBColorSpace;bounce.needsUpdate=true;const soffitMat=white.clone();soffitMat.lightMap=bounce;soffitMat.lightMapIntensity=1.6;
  const underside=new THREE.Mesh(new THREE.PlaneGeometry(3.15,1.18),soffitMat);underside.rotation.x=Math.PI/2;underside.position.set(4.72,2.598,4.96);underside.receiveShadow=true;scene.add(underside);
 cylinder(4.35,2.586,4.98,.09,.020,white);cylinder(4.35,2.573,4.98,.067,.008,lightFace);
 function key(x,z,power,target,shadow,name){const l=new THREE.SpotLight('#ffe6cf',power,4.5,1.2,1,2);l.position.set(x,2.60,z);l.target.position.set(...target);scene.add(l,l.target);l.castShadow=shadow;if(shadow){l.shadow.mapSize.set(512,512);l.shadow.bias=-.0002;l.shadow.normalBias=.018;l.shadow.radius=4;l.shadow.blurSamples=8;shadowLights.push(l);}lights.push(l);l.name=name;return l;}
 key(4.36,1.55,13,[5.10,.45,2.40],true,'Bedroom ceiling key');key(5.0,3.66,3,[5.2,.3,3.0],false,'Bedroom south ceiling fill');const bathKey=key(5.55,5.66,7,[5.9,.3,5.8],true,'Bathroom ceiling key');bathKey.shadow.mapSize.set(1024,1024);bathKey.shadow.normalBias=.005;key(4.35,4.98,3,[4.3,.4,4.9],false,'Hallway soffit fill');
 return {named,mirrors,lights,charcoal,porcelain,updateNight(n){frosted.emissiveIntensity=n?.15:.25;windowFill.intensity=n?1.0:1.8;}};
}
