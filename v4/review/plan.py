"""Draw the audit model, not a traced/surveyed floor plan. Standard-library only."""
import json
from pathlib import Path
from html import escape
root=Path(__file__).resolve().parent
g=json.loads((root/'geometry.json').read_text()); a=g['inheritedEstimates']; c=g['localCandidates']
s=['<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1120" viewBox="0 0 1400 1120">', '<rect width="1400" height="1120" fill="#f8f7f3"/>','<defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6" fill="#405668"/></marker></defs>']
def text(x,y,t,size=15,col='#263e4c',anchor='start'):
 s.append(f'<text x="{x}" y="{y}" font-family="Arial,sans-serif" font-size="{size}" fill="{col}" text-anchor="{anchor}">{escape(t)}</text>')
X=lambda x:130+x*100
Z=lambda z:240+z*100
def rect(x0,z0,x1,z1,fill,stroke='#63717a',dash=''):
 s.append(f'<rect x="{X(x0)}" y="{Z(z0)}" width="{(x1-x0)*100}" height="{(z1-z0)*100}" fill="{fill}" stroke="{stroke}" stroke-width="2" stroke-dasharray="{dash}"/>')
def line(x0,z0,x1,z1,col='#ad793b',dash=''):
 s.append(f'<path d="M{X(x0)},{Z(z0)} L{X(x1)},{Z(z1)}" stroke="{col}" stroke-width="6" stroke-dasharray="{dash}" fill="none"/>')
def dim(x0,z0,x1,z1,label):
 s.append(f'<path d="M{X(x0)},{Z(z0)} L{X(x1)},{Z(z1)}" stroke="#405668" stroke-width="1" marker-start="url(#arrow)" marker-end="url(#arrow)"/>')
 text((X(x0)+X(x1))/2,(Z(z0)+Z(z1))/2-7,label,13,anchor='middle')
text(60,45,'HOUSEWALK — GEOMETRY AUDIT MODEL',28)
text(60,75,'PROVISIONAL: dimensioned source plan and real photographs missing. This is NOT a measured floor-plan trace.',17,'#a3402c')
text(60,103,'All dimensions below are inherited model values or explicitly marked visual estimates. Do not use for construction.',15)
rect(0,0,6.3,7.05,'#ede9df');rect(3.25,0,6.3,4.55,'#e4e9e6');rect(4.79,4.55,6.3,7.05,'#e0e9ed')
rect(.54,-.65,2.94,0,'#ede9df')
for args in [(0,0,0,7.05),(6.3,0,6.3,7.05),(0,7.05,.5,7.05),(1.39,7.05,6.3,7.05),(0,0,.54,0),(2.94,0,6.3,0),(.54,-.65,.54,.29),(2.94,-.65,2.94,.29),(.54,-.65,2.94,-.65)]:line(*args,col='#485764')
for args in [(3.25,0,3.25,3.78),(3.25,4.43,3.25,4.55),(3.25,4.55,6.3,4.55),(4.79,4.55,4.79,5.43),(4.79,6.29,4.79,7.05)]:line(*args,dash='9 5')
line(.70,-.60,2.78,-.60,'#507fa0');line(1.74,-.65,1.74,-.55,'#507fa0')
rect(0,.60,.72,.90,'none','#ba564b','5 3');rect(0,.60,1.20,.90,'#a6c4d7','#245c83')
rect(.04,1.165,1.34,3.695,'none','#ba564b','5 4')
f=c['sofa']['after'];rect(f['x0'],f['z0'],f['x1'],f['z1'],'#a6c4d7','#245c83')
for i in range(1,3):line(.08,1.165+i*2.53/3,.97,1.165+i*2.53/3,'#7a9bad')
for k,col in [('table','#41494c'),('cabinet','#d0cabc'),('trolley','#eef0e9'),('kitchenBase','#8d9695'),('fridge','#65717b'),('washer','#f5f5f0')]:
 f=a[k];rect(f['x0'],f['z0'],f['x1'],f['z1'],col)
for xx in [.49,1.34]:
 for zz in [4.02,5.28]:rect(xx-.22,zz-.22,xx+.22,zz+.22,'#cec5ad')
for x,z,name in [(1.65,6.02,'C1'),(2.30,4.36,'C2'),(2.20,4.85,'C3')]:
 s.append(f'<circle cx="{X(x)}" cy="{Z(z)}" r="7" fill="#9b3761"/>');text(X(x)+10,Z(z)-8,name,14,'#9b3761')
text(X(1.6),Z(.2),'LIVING',16,anchor='middle');text(X(4.75),Z(2),'BEDROOM',17,anchor='middle');text(X(5.55),Z(5.05),'BATH',16,anchor='middle');text(X(3.4),Z(5.55),'KITCHEN',16,anchor='middle');text(X(1.0),Z(6.85),'ENTRY',14,anchor='middle')
dim(0,-1.12,6.3,-1.12,'6.30 m — inherited envelope (source plan unavailable)')
dim(0,7.48,3.25,7.48,'3.25 m partition centre — inherited')
dim(.54,-.86,2.94,-.86,'2.40 m bay width — inherited')
dim(.04,3.98,1.002,3.98,'0.96 m EST.')
dim(0,.43,1.20,.43,'1.20 m EST.')
text(20,590,'7.05 m',15);text(20,612,'inherited',12)
text(850,160,'SOURCE STATUS',20)
notes=[
 'Dark outline: inherited overall envelope',
 'Amber dashed walls: NOT source-plan verified',
 'Blue fill: local photo-fit candidates (estimates)',
 'Red dashed: PR #3 prior furniture/wall bounds',
 '',
 'UNCHANGED, UNVERIFIED MODEL DIMENSIONS',
 'Ceiling: 2.77 m; left clear room width: 3.13 m',
 'Bay back z=-0.65, front return z=+0.29',
 'Return coordinate span: 0.94 m (not surveyed)',
 'Window centre-lines: 2.08 × 1.40 m; 0.82–2.22 m',
 'Sofa: 2.53 m long; depth candidate 1.30 → 0.96 m',
 'Sofa seat top candidate: 0.64 → 0.48 m',
 'Table: 1.76 × 0.86 m; top 0.788 m',
 'Cabinet: approx. 2.04 m long × 0.475 m deep',
 'Kitchen base: 1.67 m run + fridge / washer',
 'Bath door: x=4.79, z=5.43–6.29 m (PR3 estimate)',
 '',
 'CORRECTED LOCAL CONSTRUCTION CONFLICTS',
 'Window side piers close two 0.16 m open strips',
 'Single centre mullion; duplicate lower bar removed',
 'Alcove floor no longer overlaps main plank faces',
 'AC back now attaches to wall face, z=0.90 m',
 'Hood lifted 0.10 m to clear window head',
 '',
 'PENDING ACTUAL FLOOR PLAN',
 'Room widths, partition locations, bath door location,',
 'bay outline/depth, AC wall jog and kitchen layout',
 'must be reconciled before geometry approval.'
]
for i,n in enumerate(notes):text(850,195+i*26,n,14,'#a3402c' if n=='PENDING ACTUAL FLOOR PLAN' else '#263e4c')
text(60,1060,'Review diagram of current model coordinates — no new architectural dimensions claimed as facts.',16,'#a3402c')
s.append('</svg>');(root/'plan.svg').write_text('\n'.join(s))
