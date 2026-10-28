# Corrige sucursales (STOCK = Talagante, STOCREMO = Maipú) y agrega popularidad por ventas (A/B/C).
# Uso: python3 scripts/actualizar_v4.py <carpeta del proyecto> [--sin-popularidad]
import json, sys, os
root=sys.argv[1]; con_pop='--sin-popularidad' not in sys.argv
pf=os.path.join(root,'src/data/products.json'); xf=os.path.join(root,'public/data/index.json')
P=json.load(open(pf,encoding='utf-8')); X=json.load(open(xf,encoding='utf-8'))
SW={'Maipú':'Talagante','Talagante':'Maipú'}
pop=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'popularidad_ventas_12m.json'))) if con_pop else {}
for p in P:
    p['disp']=[SW.get(s,s) for s in p.get('disp',[])]
    p['stk']={SW.get(k,k):v for k,v in p.get('stk',{}).items()}
    if con_pop: p['pop']=pop.get(p['codigo'],'')
if con_pop:
    R={'A':1,'B':2,'C':3}
    for r in X: r['v']=R.get(pop.get(r['c'],''),9)
json.dump(P,open(pf,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
json.dump(X,open(xf,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('ok',len(P),'productos; A:',sum(1 for p in P if p.get('pop')=='A'))
