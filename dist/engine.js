// Statistical engine. Constants follow conventional three-decimal SPC tables.
export const CONSTANTS={2:{d2:1.128,A2:1.880,D3:0,D4:3.267},3:{d2:1.693,A2:1.023,D3:0,D4:2.574},4:{d2:2.059,A2:.729,D3:0,D4:2.282},5:{d2:2.326,A2:.577,D3:0,D4:2.114},6:{d2:2.534,A2:.483,D3:0,D4:2.004},7:{d2:2.704,A2:.419,D3:.076,D4:1.924},8:{d2:2.847,A2:.373,D3:.136,D4:1.864},9:{d2:2.970,A2:.337,D3:.184,D4:1.816},10:{d2:3.078,A2:.308,D3:.223,D4:1.777}};
export const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
export function stdev(a){const m=mean(a);return a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;}
export function number(s){if(typeof s==='number')return Number.isFinite(s)?s:NaN;const v=String(s).trim();if(!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:[eE][+-]?\d+)?$/.test(v))return NaN;return Number(v.replace(',','.'));}
function cells(line,delimiter){if(!delimiter)return[line.trim()];const out=[];let token='',q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(q&&line[i+1]==='"'){token+='"';i++;}else q=!q;}else if(c===delimiter&&!q){out.push(token.trim());token='';}else token+=c;}if(q)throw new Error('Aspas não fechadas no arquivo.');out.push(token.trim());return out;}
export function parseData(text,mode='xbar',n=5,delimiter='auto'){
 if(!['imr','xbar'].includes(mode))throw new Error('Selecione uma carta válida.');
 if(mode==='xbar'&&(!Number.isInteger(n)||n<2||n>10))throw new Error('Use subgrupos de 2 a 10 peças.');
 const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).map((s,i)=>({s:s.trim(),line:i+1})).filter(x=>x.s);
 if(!lines.length)throw new Error('Insira as medições do processo.');
 let d=delimiter==='auto'?(lines.some(x=>x.s.includes(';'))?';':lines.some(x=>x.s.includes('\t'))?'\t':mode==='xbar'||lines.some(x=>(x.s.match(/,/g)||[]).length>1)?',':null):({'semicolon':';','comma':',','tab':'\t','line':null}[delimiter]);
 if(delimiter!=='auto'&&!['semicolon','comma','tab','line'].includes(delimiter))throw new Error('Separador inválido.');
 const groups=[];
 for(let i=0;i<lines.length;i++){
  const row=cells(lines[i].s,d);if(i===0&&row.every(c=>/^(?:x|v|valor|value|medicao|medição|leitura)\s*\d*$/i.test(c)))continue;
  const nums=row.map(number);if(nums.some(x=>!Number.isFinite(x)))throw new Error(`Linha ${lines[i].line}: há uma célula vazia ou um valor inválido. Use apenas medições numéricas.`);
  if(mode==='xbar'){if(nums.length!==n)throw new Error(`Linha ${lines[i].line}: encontradas ${nums.length} medições; cada subgrupo precisa de ${n}.`);groups.push(nums);}else for(const x of nums)groups.push([x]);
 }
 if(groups.length<2)throw new Error('São necessários pelo menos 2 pontos ou subgrupos para calcular.');
 if(groups.flat().length>2000)throw new Error('Use até 2.000 medições por análise.');
 return groups;
}
export function signalsFor(values,cl,sigma,enabled=['r1','r2','r3']){
 const events=[];if(!(sigma>0))return events;
 const add=(rule,start,end,text)=>events.push({rule,start,end,text});
 const z=values.map(x=>(x-cl)/sigma);
 for(let i=0;i<z.length;i++){
  if(enabled.includes('r1')&&Math.abs(z[i])>3+1e-10)add('r1',i,i,'Ponto além de 3σ');
  if(enabled.includes('r2')&&i>=8){const a=z.slice(i-8,i+1);if(a.every(x=>x>1e-10)||a.every(x=>x< -1e-10))add('r2',i-8,i,'9 pontos no mesmo lado da média');}
  if(enabled.includes('r3')&&i>=5){const a=values.slice(i-5,i+1);if(a.slice(1).every((x,j)=>x>a[j])||a.slice(1).every((x,j)=>x<a[j]))add('r3',i-5,i,'6 pontos em tendência contínua');}
  if(enabled.includes('r4')&&i>=2){const a=z.slice(i-2,i+1);if(a.filter(x=>x>2+1e-10).length>=2||a.filter(x=>x< -2-1e-10).length>=2)add('r4',i-2,i,'2 de 3 pontos além de 2σ no mesmo lado');}
  if(enabled.includes('r5')&&i>=4){const a=z.slice(i-4,i+1);if(a.filter(x=>x>1+1e-10).length>=4||a.filter(x=>x< -1-1e-10).length>=4)add('r5',i-4,i,'4 de 5 pontos além de 1σ no mesmo lado');}
 }
 return events;
}
export function analyze(groups,{mode='xbar',lsl=49.9,usl=50.1,target=50,rules=['r1','r2','r3']}={}){
 if(!['imr','xbar'].includes(mode))throw new Error('Selecione uma carta válida.');
 if(!Array.isArray(groups)||groups.length<2)throw new Error('Base insuficiente.');
 const n=groups[0].length;if(mode==='imr'&&n!==1)throw new Error('A carta I–MR exige uma medição por ponto.');
 if(mode==='xbar'&&!CONSTANTS[n])throw new Error('Tamanho de subgrupo inválido.');
 if(groups.some(g=>g.length!==n||g.some(x=>!Number.isFinite(x))))throw new Error('Subgrupos inconsistentes ou valores inválidos.');
 if(!Number.isFinite(lsl)||!Number.isFinite(usl)||lsl>=usl)throw new Error('A especificação exige LI menor que LS.');
 if(!Number.isFinite(target)||target<lsl||target>usl)throw new Error('O alvo precisa estar entre LI e LS.');
 const all=groups.flat(),m=mean(all),s=stdev(all),primary=groups.map(mean);
 const secondary=mode==='imr'?all.slice(1).map((x,i)=>Math.abs(x-all[i])):groups.map(g=>Math.max(...g)-Math.min(...g));
 const rbar=mean(secondary),c=CONSTANTS[mode==='imr'?2:n],within=rbar/c.d2;
 const band=mode==='imr'?3*within:c.A2*rbar;
 const limits={cl:m,lcl:m-band,ucl:m+band},rangeLimits={cl:rbar,lcl:c.D3*rbar,ucl:c.D4*rbar};
 const events=signalsFor(primary,m,band/3,rules).map(e=>({...e,chart:mode==='imr'?'I':'X̄'}));
 secondary.forEach((v,i)=>{if(v>rangeLimits.ucl+1e-10||v<rangeLimits.lcl-1e-10)events.push({rule:'r1',start:mode==='imr'?i+1:i,end:mode==='imr'?i+1:i,text:'Amplitude fora dos limites de controle',chart:mode==='imr'?'MR':'R'});});
 events.sort((a,b)=>a.end-b.end||a.chart.localeCompare(b.chart));
 const index=sd=>sd>0?{p:(usl-lsl)/(6*sd),pk:Math.min((usl-m)/(3*sd),(m-lsl)/(3*sd))}:{p:null,pk:null};
 const cp=index(within),pp=index(s),oos=all.filter(x=>x<lsl||x>usl).length;
 return{groups,all,n,count:all.length,points:groups.length,mean:m,s,within,rbar,primary,secondary,limits,rangeLimits,events,cp:cp.p,cpk:cp.pk,pp:pp.p,ppk:pp.pk,oos,ppmObserved:oos/all.length*1e6,lsl,usl,target,mode,zero:within===0,short:groups.length<20,stable:events.length===0&&within>0&&groups.length>=20};
}
function random(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return(seed+.5)/4294967296;};}
export const SCENARIOS=[
 {id:'stable',name:'Usinagem sob controle',tag:'Estabilidade',process:'Diâmetro do eixo • Torno CNC 04',unit:'mm',lsl:49.9,usl:50.1,target:50,description:'Amostras de eixos coletadas em sequência após o setup. Observe o comportamento natural e avalie o potencial do processo.',note:'Cenário sintético com variação comum. Confirme o sistema de medição e o plano de coleta antes de concluir capacidade.'},
 {id:'shift',name:'Mudança após o setup',tag:'Causa especial',process:'Diâmetro do eixo • Troca de ferramenta',unit:'mm',lsl:49.8,usl:50.2,target:50,description:'Uma troca de ferramenta ocorreu no subgrupo 21 (no ponto 26 em I–MR). As peças ainda podem atender à especificação. O processo manteve o mesmo comportamento?',note:'O deslocamento da média pede investigação da troca de ferramenta. Conformidade dimensional não comprova estabilidade.'},
 {id:'trend',name:'Desgaste progressivo',tag:'Tendência',process:'Diâmetro do eixo • Desgaste de inserto',unit:'mm',lsl:49.8,usl:50.2,target:50,description:'O desgaste do inserto altera gradualmente o diâmetro. Procure sequências crescentes, mesmo dentro dos limites de controle.',note:'Relacione a sequência temporal à vida da ferramenta. Revise a frequência de inspeção e os critérios de troca no Plano de Controle.'},
 {id:'variation',name:'Variação entre peças',tag:'Dispersão',process:'Diâmetro do eixo • Fixação irregular',unit:'mm',lsl:49.8,usl:50.2,target:50,description:'A fixação ficou irregular em uma amostra. Comece pela carta de amplitude: a média sozinha pode esconder o problema.',note:'Investigue fixação, cavacos, pressão e repetibilidade da medição. A dispersão precisa ser estável para interpretar a carta de localização.'},
 {id:'incapable',name:'Estável, mas fora da meta',tag:'Capacidade',process:'Diâmetro do eixo • Tolerância estreita',unit:'mm',lsl:49.97,usl:50.03,target:50,description:'O comportamento é consistente, mas a tolerância foi reduzida. Estar sob controle é suficiente para atender ao cliente?',note:'A variação comum é grande para a tolerância. Melhore o sistema e reduza a dispersão; ajustes a cada peça podem piorar a situação.'},
 {id:'offcenter',name:'Processo descentralizado',tag:'Centralização',process:'Diâmetro do eixo • Offset de máquina',unit:'mm',lsl:49.9,usl:50.1,target:50,description:'A dispersão é pequena, mas o offset aproxima a média do limite superior. Compare Cp e Cpk.',note:'Cp mede a largura potencial; Cpk considera a posição da média. Um ajuste de centralização deve ser planejado e validado.'}
];
export function scenarioData(id='stable',mode='xbar',n=5){
 const scenario=SCENARIOS.find(x=>x.id===id)||SCENARIOS[0];const rng=random(81237);const normal=()=>Math.sqrt(-2*Math.log(rng()))*Math.cos(2*Math.PI*rng());
 const size=mode==='imr'?50:30,cols=mode==='imr'?1:n;
 const groups=Array.from({length:size},(_,i)=>Array.from({length:cols},(_,j)=>{
  let center=50,sd=id==='trend'?(mode==='xbar'?.004:.008):.017;
  if(id==='shift'&&i>=(mode==='imr'?25:20))center+=.082;
  if(id==='trend')center+=mode==='imr'?i*.004:(i<10?0:(i-10)*.006);
  if(id==='variation'&&i===(mode==='imr'?32:19))return +(50+(mode==='imr'?.16:(j%2===0?.13:-.13))).toFixed(4);
  if(id==='offcenter')center+=.071;
  return +(center+normal()*sd).toFixed(4);
 }));
 return{scenario,groups,text:groups.map(g=>g.join(';')).join('\n')};
}
