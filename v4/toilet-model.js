/* Close-coupled ceramic toilet. Dimensions are photo fits within the retained
 * footprint; the bowl, annular seat and hinged lid are separate moulded forms. */
import * as THREE from './vendor/three.module.min.js';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';
export function toiletModel(porcelain,metal){
 const group=new THREE.Group();group.name='Bathroom close-coupled toilet';group.position.set(5.90,0,5.70);
 group.userData={projection:.66,width:.38,seatHeight:.462,cisternHeight:.795,lidAngle:94,locationRetained:true};
 function add(geometry,material,name){const o=new THREE.Mesh(geometry,material);o.name=name;o.castShadow=true;o.receiveShadow=true;group.add(o);return o;}
 function rounded(name,x,y,z,w,h,d,r){const o=add(new RoundedBoxGeometry(w,h,d,4,r),porcelain,name);o.position.set(x,y,z);return o;}
 // A smooth longitudinal ceramic envelope with a continuous inner trap cavity.
 // Vector4: longitudinal centre, elevation, longitudinal radius, transverse radius.
 const controls=[[-.005,.016,.170,.143],[-.005,.035,.178,.150],[-.002,.13,.168,.137],[-.025,.22,.156,.137],[-.058,.30,.220,.170],[-.064,.385,.275,.188],[-.064,.417,.281,.189],[-.064,.436,.275,.183],[-.066,.439,.253,.163],[-.070,.424,.228,.147],[-.060,.365,.189,.122],[.012,.27,.104,.076],[.076,.237,.044,.038]];
 const N=112,R=96,p=[],uv=[],ix=[],col=[];
 function sample(t){const f=t*(controls.length-1),j=Math.min(controls.length-2,Math.floor(f)),u=f-j;
  return controls[j].map((_,k)=>{const a=controls[Math.max(0,j-1)][k],b=controls[j][k],c=controls[j+1][k],d=controls[Math.min(controls.length-1,j+2)][k];return .5*((2*b)+(-a+c)*u+(2*a-5*b+4*c-d)*u*u+(-a+3*b-3*c+d)*u*u*u);});}
 for(let j=0;j<=R;j++){const t=j/R,[cx,y,rx,rz]=sample(t);for(let i=0;i<=N;i++){const a=i/N*Math.PI*2,cs=Math.cos(a),sn=Math.sin(a);p.push(cx+rx*cs,y,rz*sn*(1+.035*cs));uv.push(i/N,t);const ao=t<.69?1:THREE.MathUtils.lerp(1,.60,(t-.69)/.31);col.push(ao,ao,ao);}}
 for(let j=0;j<R;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i;ix.push(a,a+N+2,a+1,a,a+N+1,a+N+2);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.setIndex(ix);geo.computeVertexNormals();
 const ceramic=porcelain.clone();ceramic.vertexColors=true;ceramic.side=THREE.DoubleSide;add(geo,ceramic,'Bathroom toilet ceramic bowl and pedestal');
 // Flat annular seat with a gently rolled edge, not a scaled torus/disc.
 const seatP=[],seatI=[],seatUV=[],section=[[.234,.176,.446],[.237,.178,.454],[.232,.174,.465],[.220,.163,.469],[.185,.128,.469],[.179,.123,.460],[.181,.125,.449],[.190,.133,.446],[.234,.176,.446]];
 for(const [rx,rz,y]of section)for(let i=0;i<=N;i++){const a=i/N*Math.PI*2;seatP.push(-.096+rx*Math.cos(a),y,rz*Math.sin(a));seatUV.push(i/N,y);}
 for(let j=0;j<section.length-1;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i;seatI.push(a,a+N+2,a+1,a,a+N+1,a+N+2);}
 const seatGeo=new THREE.BufferGeometry();seatGeo.setAttribute('position',new THREE.Float32BufferAttribute(seatP,3));seatGeo.setAttribute('uv',new THREE.Float32BufferAttribute(seatUV,2));seatGeo.setIndex(seatI);seatGeo.computeVertexNormals();add(seatGeo,porcelain,'Bathroom toilet separate seat ring');
 rounded('Bathroom toilet rear ceramic bridge',.098,.397,0,.210,.075,.312,.023);
 rounded('Bathroom toilet cistern',.222,.568,0,.173,.426,.353,.025);
 rounded('Bathroom toilet cistern cap',.222,.786,0,.185,.025,.363,.010);
 const button=add(new THREE.CylinderGeometry(.023,.023,.004,32),metal,'Bathroom toilet dual flush');button.position.set(.222,.801,0);
 const split=add(new THREE.BoxGeometry(.001,.001,.035),metal,'Flush button divider');split.position.set(.222,.804,0);
 // The thin moulded lid pivots on the same real hinges as the seat. At 94° it
 // rests just in front of the cistern, with no intersection through its front.
 const lidShape=new THREE.Shape();lidShape.moveTo(-.160,0);lidShape.bezierCurveTo(-.180,.035,-.176,.215,-.148,.315);lidShape.bezierCurveTo(-.13,.390,.13,.390,.148,.315);lidShape.bezierCurveTo(.176,.215,.180,.035,.160,0);lidShape.quadraticCurveTo(0,-.010,-.160,0);
 const lidGeo=new THREE.ExtrudeGeometry(lidShape,{depth:.012,bevelEnabled:true,bevelThickness:.003,bevelSize:.003,bevelSegments:3,curveSegments:32});
 // Source shape X is transverse; Y is distance from hinge. Map to X-front/Z-width.
 lidGeo.rotateX(Math.PI/2);lidGeo.rotateY(-Math.PI/2);lidGeo.computeVertexNormals();
 const lid=add(lidGeo,porcelain,'Bathroom toilet separate hinged lid');lid.position.set(.117,.476,0);lid.rotation.z=-94*Math.PI/180;
 for(const z of [-.115,.115]){const hinge=add(new THREE.CylinderGeometry(.012,.012,.050,24),metal,'Bathroom toilet hinge');hinge.rotation.x=Math.PI/2;hinge.position.set(.117,.467,z);}
 const water=new THREE.MeshPhysicalMaterial({color:'#adbdb8',roughness:.08,transparent:true,opacity:.42,depthWrite:false});
 const pool=add(new THREE.CircleGeometry(1,64),water,'Bathroom toilet water');pool.rotation.x=-Math.PI/2;pool.scale.set(.043,.036,1);pool.position.set(.076,.241,0);pool.castShadow=false;
 return group;
}
