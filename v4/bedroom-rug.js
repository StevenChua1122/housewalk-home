/* Original vector reconstruction of the cream cat runner. No private image is
 * embedded. The rug is always present; real bed geometry supplies its occlusion. */
import * as THREE from './vendor/three.module.min.js';
export function bedroomRug(cloth){
 const group=new THREE.Group();group.name='Bedroom cat-shaped runner';group.position.set(5.02,0,1.31);group.userData={x0:4.35,x1:5.69,z0:1.075,z1:1.545,parallelToBed:true,underAC:true};
 const s=new THREE.Shape();s.moveTo(.59,-.17);s.bezierCurveTo(.68,-.24,.70,-.14,.64,-.07);s.bezierCurveTo(.70,-.03,.70,.03,.64,.07);s.bezierCurveTo(.70,.14,.68,.24,.59,.17);s.lineTo(-.45,.22);s.bezierCurveTo(-.69,.27,-.72,.11,-.60,.10);s.lineTo(-.32,.075);s.bezierCurveTo(-.26,.05,-.26,.015,-.35,.01);s.lineTo(-.61,.02);s.bezierCurveTo(-.74,.02,-.72,-.09,-.61,-.10);s.lineTo(-.34,-.08);s.bezierCurveTo(-.27,-.09,-.27,-.13,-.37,-.14);s.lineTo(-.59,-.15);s.bezierCurveTo(-.72,-.13,-.70,-.25,-.54,-.23);s.closePath();
 const g=new THREE.ExtrudeGeometry(s,{depth:.004,bevelEnabled:true,bevelSize:.004,bevelThickness:.002,bevelSegments:2,curveSegments:30});g.rotateX(-Math.PI/2);
 const body=new THREE.Mesh(g,cloth('#e5dfd0'));body.position.y=.025;body.receiveShadow=true;group.add(body);
 const ink=new THREE.MeshStandardMaterial({color:'#565650',roughness:1});
 function line(points,r=.0045){const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,.033,z)));const o=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(12,points.length*2),r,6,false),ink);o.receiveShadow=true;group.add(o);}
 const outline=s.getSpacedPoints(180).map(p=>[p.x*.91,-p.y*.88]);line(outline,.0055);
 for(const z of [-.062,.062]){line([[.55,z-.008],[.554,z+.008]],.006);for(let i=0;i<2;i++)line([[.53,z+Math.sign(z)*.025+i*.014],[.50,z+Math.sign(z)*.030+i*.014]],.002);}
 line([[.535,0],[.528,.009],[.528,-.009],[.535,0]],.003);line([[.50,0],[.487,-.012],[.474,-.010]],.0025);
 return group;
}
