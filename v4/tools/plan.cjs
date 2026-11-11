// Public schematic of the model coordinates; never embeds the private source plan.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../layout.js'),'utf8'),ctx);const L=ctx.window.HWLayout;
const S=85,X=x=>75+x*S,Z=z=>115+z*S;let out=[];
const rect=(x,z,w,d,fill,stroke='none')=>out.push(`<rect x="${X(x)}" y="${Z(z)}" width="${w*S}" height="${d*S}" fill="${fill}" stroke="${stroke}"/>`);
const line=(x,z,a,b,stroke='#4b5754',width=5)=>out.push(`<path d="M${X(x)},${Z(z)} L${X(a)},${Z(b)}" stroke="${stroke}" stroke-width="${width}" fill="none"/>`);
const text=(t,x,y,size=15,fill='#263c35')=>out.push(`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}">${t}</text>`);
const label=(t,x,z)=>text(t,X(x),Z(z),13);
out.push('<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="885" viewBox="0 0 1100 885"><rect width="1100" height="885" fill="#faf8f3"/><g font-family="Arial,sans-serif">');
text('Housewalk — corrected model plan for review',40,38,25);text('Horizontally mirrored. Metres. Only the outer 6.30 × 7.05 dimensions are stated on the source plan.',40,65,15);
rect(0,0,6.3,7.05,'#e7d4bd');rect(3.15,0,3.15,4.37,'#e2e5d9');rect(4.95,4.37,1.35,2.68,'#d8e5e5');rect(0,0,1.35,.98,'#afa99d');rect(5.0,0,1.3,.98,'#afa99d');
for(const [x,z,w,d,c]of [[.055,1.2,.93,2.14,'#8a8681'],[.06,3.76,1.68,.89,'#383736'],[2.57,1.08,.5,2.04,'#b1aca5'],[2.60,3.12,.44,.63,'#f6f4e9'],[2.61,.52,.47,.59,'#f6f4e9'],[1.75,6.27,.82,.78,'#555d60'],[2.59,6.31,1.65,.74,'#99928a'],[4.245,6.31,.61,.74,'#f4f2eb']])rect(x,z,w,d,c,'#837d73');
for(const [b,c]of [[L.bedroom.bed,'#8e8981'],[L.bedroom.wardrobe,'#f2eee5'],[L.bedroom.vanity,'#f2eee5'],[L.bedroom.mirror,'#acc0bf'],[L.bedroom.cabinet,'#c49d68']])rect(b.x0,b.z0,b.x1-b.x0,b.z1-b.z0,c,'#837d73');
rect(5.265,.985,.83,.24,'#d6e7e7','#659aa5');line(3.24,.425,4.99,.425,'#998573',6);
rect(5.82,4.64,.405,.50,'#f7f4ec','#837d73');rect(5.55,5.48,.675,.46,'#f7f4ec','#837d73');rect(6.0,6.10,.30,.28,'#74716b');
line(5.99,1.31,5.42,1.31,'#9b592d',2);line(5.42,1.31,5.54,1.23,'#9b592d',2);line(5.42,1.31,5.54,1.39,'#9b592d',2);
for(const x of [.46,1.25])for(const z of [3.57,4.83])rect(x-.20,z-.20,.4,.4,'#d9cfbd','#333');
for(const x of [1.44,1.65])rect(x-.09,6.5,.18,.49,'#30383b');
for(const [x,z,a,b] of [[0,0,6.3,0],[0,0,0,7.05],[6.3,0,6.3,7.05],[0,7.05,.3,7.05],[1.32,7.05,6.3,7.05],[3.15,0,3.15,4.37],[3.15,4.37,3.43,4.37],[4.27,4.37,6.3,4.37],[4.95,5.27,4.95,7.05]])line(x,z,a,b);
line(1.35,0,1.35,.98);line(0,.98,1.35,.98);line(5,0,5,.98);line(5,.98,6.3,.98);line(1.38,0,3.06,0,'#709ca5',7);line(3.25,0,4.95,0,'#709ca5',7);line(3.47,7.05,4.37,7.05,'#709ca5',7);line(.3,7.05,1.32,7.05,'#b0916f',6);line(6.3,5.28,6.3,6.02,'#709ca5',7);
for(const d of L.doors){if(d.axis==='x'){line(d.x,d.z,d.x,d.z-d.len,'#967451',3);out.push(`<path d="M${X(d.x+d.len)},${Z(d.z)} A${d.len*S},${d.len*S} 0 0 0 ${X(d.x)},${Z(d.z-d.len)}" fill="none" stroke="#967451" stroke-dasharray="4 3"/>`);}else{line(d.x,d.z,d.x+d.len,d.z,'#967451',3);out.push(`<path d="M${X(d.x)},${Z(d.z+d.len)} A${d.len*S},${d.len*S} 0 0 0 ${X(d.x+d.len)},${Z(d.z)}" fill="none" stroke="#967451" stroke-dasharray="4 3"/>`);}}
label('AC support',.12,.52);label('Niche',1.7,.57);label('LIVING',1.35,2.25);label('SOFA',.2,2.4);label('TV',2.65,2.15);label('DINING',1.72,4.15);label('BEDROOM',4.0,.92);label('KITCHEN',3.05,5.62);label('BATH',5.15,5.8);label('Entrance',.26,6.65);
line(0,-.30,6.30,-.30,'#366d62',1.5);line(-.3,0,-.3,7.05,'#366d62',1.5);text('6.30 m',X(2.85),Z(-.4),16);text('7.05 m',10,Z(3.5),14);
for(const x of [0,6.3])line(x,-.4,x,-.2,'#366d62',1.5);for(const z of [0,7.05])line(-.4,z,-.2,z,'#366d62',1.5);
let yy=130;const notes=[['Dimension provenance',21],['Internal walls: image traces ≈±0.05 m',16],['Heights / furniture: design/photo estimates',16],['Not a measured or certified survey',16],['',16],['Model coordinates',21],['Living partition x=3.15',16],['Bedroom south wall z=4.37',16],['Bedroom door x=3.43…4.27',16],['Bath west wall x=4.95',16],['Bath west door z=4.49…5.27',16],['Niche x=1.35…3.15, depth≈0.98',16],['Window sill≈0.23 / divider≈0.67',16],['Window head≈2.49, ceiling≈2.77',16],['',16],['Bedroom / bathroom estimates',21],['Bed head at east wall x≈6.13',16],['ONE cabinet x=5.78…6.21',16],['Cabinet z=1.06…1.56; height≈0.59',16],['Drawer front west; AC wall faces south',16],['Arrow marks perpendicular orientation',16],['Vanity and mirror on fixed west wall',16],['Bath window on east wall; shower south',16]];
for(const [t,size]of notes){text(t,650,yy,size);yy+=size===21?36:25;}
text('The entire recess stays inside the 6.30 × 7.05 envelope. No added negative-z bay.',75,760,15);text('Shared wall and opening positions retained; bathroom duplicate wall skin removed for door clearance.',75,789,15);text('Private floor plan and real interior photos are deliberately excluded from this schematic and repository.',75,833,14);
out.push('</g></svg>');const dest=process.env.HW_PLAN_OUTPUT||path.resolve(__dirname,'../qa/integrated-v3/plan.svg');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,out.join('\n'));
