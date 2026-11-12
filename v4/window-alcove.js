/* V5 window construction. The existing plan envelope / .98 m support projection
 * are retained; window heights are identified photo-fit estimates. No inner beam.
 */
import * as THREE from './vendor/three.module.min.js';
export function windowAlcove({scene,L,wall,white,metal}){
 const b=L.bay,parts={},frame=new THREE.MeshStandardMaterial({color:'#3c4447',roughness:.32,metalness:.55});
 const glass=new THREE.MeshPhysicalMaterial({color:'#d6e1df',roughness:.06,metalness:.04,transparent:true,opacity:.10,depthWrite:false,envMapIntensity:.7,clearcoat:1});
 function box(name,x,y,z,w,h,d,mat,cast=true){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);o.name=name;o.castShadow=cast;o.receiveShadow=true;scene.add(o);parts[name]=o;return o;}
 const mid=(b.left+b.right)/2,width=b.right-b.left;
 box('Living solid below-window wall',mid,b.sill/2,0,width,b.sill,.15,wall);
 // This is the external rear wall above the actual window, not a dropped beam
 // across the alcove mouth. The main ceiling remains one plane at y=2.768.
 box('Living rear window head wall',mid,(b.head+L.height)/2,0,width,L.height-b.head,.15,wall);
 box('Living alcove left return',b.left-.006,L.height/2,b.front/2,.012,L.height,b.front,wall);
 box('Living alcove right return',b.right-.081,L.height/2,b.front/2,.012,L.height,b.front,wall);
 box('Living alcove left skirting',b.left+.010,.059,b.front/2,.020,.088,b.front,white);
 box('Living alcove right skirting',b.right-.093,.059,b.front/2,.020,.088,b.front,white);
 // The closed service panel is visible in real photo 22 / the new approved
 // mockup. It is surface construction on the solid return, never a new passage.
 box('Living closed service panel',b.left+.014,1.04,.51,.018,1.82,.62,white);
 for(const z of [.18,.84])box('Service panel vertical trim '+z,b.left+.023,1.04,z,.020,1.88,.026,white);
 for(const y of [.10,1.98])box('Service panel horizontal trim '+y,b.left+.023,y,.51,.020,.026,.686,white);
 box('Service panel latch',b.left+.037,1.01,.77,.012,.075,.027,metal);
 box('Service panel short handle',b.left+.055,1.03,.745,.022,.015,.070,metal);
 box('Living window sill',mid,b.sill-.018,.115,width,.036,.24,white);
 box('Living rear left masonry jamb',b.left+.010,(b.sill+b.head)/2,0,.020,b.head-b.sill,.15,wall);
 box('Living below-window skirting',mid,.059,.089,width,.088,.020,white);
 const x0=1.38,x1=3.06,c=(x0+x1)/2;
 for(const x of [x0,c,x1])box('Living window outer vertical '+x,x,(b.sill+b.head)/2,.049,.047,b.head-b.sill,.110,frame);
 for(const y of [b.sill,b.divider,b.head])box('Living window horizontal '+y,c,y,.049,x1-x0+.047,.045,.110,frame);
 for(const [a,z]of [[x0+.035,c-.033],[c+.033,x1-.035]]){
  for(const x of [a,z])box('Operable panel stile '+x,x,(b.divider+b.head)/2,.090,.023,b.head-b.divider-.04,.060,frame);
  for(const y of [b.divider+.035,b.head-.035])box('Operable panel rail '+a+y,(a+z)/2,y,.090,z-a,.022,.060,frame);
  for(const [lo,hi]of [[b.sill+.028,b.divider-.028],[b.divider+.050,b.head-.050]])box('Living glass '+a+lo,(a+z)/2,(lo+hi)/2,.065,z-a-.023,hi-lo,.006,glass,false);
 }
 for(const x of [c-.064,c+.064]){
  box('Living handle plate '+x,x,1.52,.128,.027,.16,.017,frame);
  box('Living central handle '+x,x,1.52,.154,.014,.135,.022,metal);
 }
 return {parts,frame,glass,geometry:{...b,depth:b.front-b.back,belowWindowSolid:true,innerBeam:false,floorY:.015,windowWidth:x1-x0}};
}
