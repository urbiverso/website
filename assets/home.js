document.documentElement.classList.add('js');
const reduz=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const suave=t=>t*t*(3-2*t);
const foraDaTela=r=>r.bottom<0||r.top>innerHeight;
const aleatorio=s=>()=>(s=(s*16807)%2147483647)/2147483647;

/* Textos desenhados no canvas (o resto do texto está no HTML de cada idioma); vale o lang da página */
const TEXTOS={
  'pt-BR':{
    etapas:{inicio:'Início',pedido:'Pedido',analise:'Análise',aprovado:'Aprovado?',ajuste:'Ajuste',execucao:'Execução',faturamento:'Faturamento',entrega:'Entrega',fim:'Fim'},
    sim:'sim', nao:'não',
    unidades:{semanas:'semanas',dias:'dias',horas:'horas',minutos:'minutos',segundo:'segundo',segundos:'segundos',milissegundos:'milissegundos'},
  },
  en:{
    etapas:{inicio:'Start',pedido:'Order',analise:'Review',aprovado:'Approved?',ajuste:'Revision',execucao:'Execution',faturamento:'Billing',entrega:'Delivery',fim:'End'},
    sim:'yes', nao:'no',
    unidades:{semanas:'weeks',dias:'days',horas:'hours',minutos:'minutes',segundo:'second',segundos:'seconds',milissegundos:'milliseconds'},
  },
};
const T=TEXTOS[document.documentElement.lang]||TEXTOS['pt-BR'];

/* Céu: as estrelas giram devagar em volta do centro, no sentido anti-horário (as de dentro mais rápido); rolar dá um empurrão */
const ceu=document.getElementById('ceu'), cx=ceu.getContext('2d');
let estrelas=[], W=0, H=0, giroCeu=0;
function semear(){
  const dpr=Math.min(devicePixelRatio||1,2), novaLargura=innerWidth!==W;
  W=innerWidth; H=innerHeight; ceu.width=W*dpr; ceu.height=H*dpr; cx.setTransform(dpr,0,0,dpr,0,0);
  if(!novaLargura) return;
  const R=Math.hypot(W,H)/2*1.02, rnd=aleatorio(7);
  estrelas=Array.from({length:Math.round(W*H/2300)},()=>{const rho=R*Math.sqrt(rnd());
    return {rho,th:rnd()*6.283,k:.35+.65*(1-rho/R),r:.3+rnd()*1.1,fase:rnd()*6.28,vel:.4+rnd()*1.2,cor:rnd()<.08?'247,161,17':rnd()<.1?'42,169,224':'255,255,255'};});
}
function desenharCeu(t){
  cx.clearRect(0,0,W,H);
  for(const e of estrelas){
    const th=e.th-giroCeu*e.k, x=W/2+e.rho*Math.cos(th), y=H/2+e.rho*Math.sin(th);
    if(x<-2||y<-2||x>W+2||y>H+2) continue;
    const a=reduz?.7:.45+.45*Math.sin(t/1000*e.vel+e.fase);
    cx.fillStyle=`rgba(${e.cor},${a.toFixed(2)})`;
    cx.beginPath();cx.arc(x,y,e.r,0,6.283);cx.fill();
  }
}
semear(); addEventListener('resize',semear);

const vortice=document.getElementById('vortice'), topo=document.getElementById('topo');

/* A frase principal e o botão aparecem ao entrar na tela */
const revelar=[...document.querySelectorAll('.revela')];
if(reduz) revelar.forEach(e=>e.classList.add('on'));
else{const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');o.unobserve(e.target);}}),{threshold:.3});revelar.forEach(e=>o.observe(e));}

/* Títulos dos blocos acendem palavra por palavra conforme a leitura */
const acesos=[...document.querySelectorAll('.acende')].map(el=>{
  el.innerHTML=el.textContent.trim().split(/\s+/).map(w=>`<span class="p">${w}</span>`).join(' ');
  return {el,ps:[...el.querySelectorAll('.p')]};
});
function acender(){
  if(reduz) return;
  for(const a of acesos){
    const r=a.el.getBoundingClientRect(); if(foraDaTela(r)) continue;
    const n=Math.round(clamp((innerHeight*.92-r.top)/(r.height+innerHeight*.25))*a.ps.length);
    a.ps.forEach((w,i)=>w.classList.toggle('on',i<n));
  }
}

/* 02 · letreiro: quatro faixas em sentidos alternados, montadas a partir da lista acessível */
const itensInfra=[...document.querySelectorAll('#itens-infra li')].map(li=>li.textContent);
[[0,3,70],[3,6,58],[6,9,64],[9,11,52]].forEach(([a,b,dur],i)=>{
  const f=document.createElement('div'); f.className='faixa'+(i%2?' volta apagada':''); f.style.setProperty('--dur',dur+'s');
  const copia=itensInfra.slice(a,b).concat(itensInfra.slice(a,b)).map(t=>`<span>${t}</span>`).join('');
  f.innerHTML=copia+copia; document.getElementById('letreiro').appendChild(f);
});

/* 01 · fluxograma de um processo de empresa. Um brilho percorre o processo de ponta a ponta;
   conforme a rolagem, a volta que levava semanas passa a levar milissegundos. */
const flx=document.getElementById('fluxo'), fc=flx.getContext('2d');
let FW=0;
function medirFluxo(){const d=Math.min(devicePixelRatio||1,2);FW=flx.clientWidth;flx.width=flx.height=Math.round(FW*d);fc.setTransform(d,0,0,d,0,0);}
medirFluxo(); addEventListener('resize',medirFluxo);
// etapas em coordenadas de 0 a 1: centro, largura e altura
const ETAPA={
  inicio:     {x:.17,y:.13,w:.2, h:.075,forma:'pilula', rotulo:T.etapas.inicio},
  pedido:     {x:.5, y:.13,w:.24,h:.09, forma:'caixa',  rotulo:T.etapas.pedido},
  analise:    {x:.83,y:.13,w:.24,h:.09, forma:'caixa',  rotulo:T.etapas.analise},
  aprovado:   {x:.83,y:.39,w:.27,h:.15, forma:'losango',rotulo:T.etapas.aprovado},
  ajuste:     {x:.5, y:.39,w:.2, h:.09, forma:'caixa',  rotulo:T.etapas.ajuste},
  execucao:   {x:.83,y:.65,w:.24,h:.09, forma:'caixa',  rotulo:T.etapas.execucao},
  faturamento:{x:.5, y:.65,w:.26,h:.09, forma:'caixa',  rotulo:T.etapas.faturamento},
  entrega:    {x:.17,y:.65,w:.24,h:.09, forma:'caixa',  rotulo:T.etapas.entrega},
  fim:        {x:.17,y:.87,w:.2, h:.075,forma:'pilula', rotulo:T.etapas.fim},
};
const borda=(n,lado)=>{const e=ETAPA[n];return {d:[e.x+e.w/2,e.y],e:[e.x-e.w/2,e.y],c:[e.x,e.y-e.h/2],b:[e.x,e.y+e.h/2]}[lado];};
const LIGACOES=[
  ['inicio','d','pedido','e'],
  ['pedido','d','analise','e'],
  ['analise','b','aprovado','c'],
  ['aprovado','e','ajuste','d',T.nao],
  ['ajuste','c','pedido','b'],
  ['aprovado','b','execucao','c',T.sim],
  ['execucao','e','faturamento','d'],
  ['faturamento','e','entrega','d'],
  ['entrega','b','fim','c'],
].map(([de,ld,para,lp,rotulo])=>({de,para,a:borda(de,ld),b:borda(para,lp),rotulo,luz:0}));
const ligacao=(de,para)=>LIGACOES.find(l=>l.de===de&&l.para===para);
// o brilho anda de centro a centro; a cada três voltas, uma passa pelo ajuste
const trajeto=nomes=>{const p=nomes.map(n=>[ETAPA[n].x,ETAPA[n].y]),acum=[0];
  for(let i=1;i<p.length;i++) acum.push(acum[i-1]+Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]));
  return {nomes,p,acum,total:acum[acum.length-1]};};
const DIRETO=trajeto(['inicio','pedido','analise','aprovado','execucao','faturamento','entrega','fim']);
const COM_AJUSTE=trajeto(['inicio','pedido','analise','aprovado','ajuste','pedido','analise','aprovado','execucao','faturamento','entrega','fim']);
const pontoEm=(t,d)=>{d=clamp(d,0,t.total);let i=1;while(i<t.acum.length-1&&t.acum[i]<d)i++;
  const k=(d-t.acum[i-1])/((t.acum[i]-t.acum[i-1])||1);return [lerp(t.p[i-1][0],t.p[i][0],k),lerp(t.p[i-1][1],t.p[i][1],k)];};
let atual=DIRETO, andado=0, voltas=0;
const luzEtapa=Object.fromEntries(Object.keys(ETAPA).map(k=>[k,0]));
const SEMANA=6.048e8, DIA=8.64e7, HORA=3.6e6, MINUTO=6e4, SEGUNDO=1e3;
function duracao(ms){
  if(ms>=2*SEMANA) return [Math.round(ms/SEMANA),T.unidades.semanas];
  if(ms>=2*DIA) return [Math.round(ms/DIA),T.unidades.dias];
  if(ms>=2*HORA) return [Math.round(ms/HORA),T.unidades.horas];
  if(ms>=2*MINUTO) return [Math.round(ms/MINUTO),T.unidades.minutos];
  if(ms>=SEGUNDO){const n=Math.round(ms/SEGUNDO);return [n,n>1?T.unidades.segundos:T.unidades.segundo];}
  return [Math.round(ms),T.unidades.milissegundos];
}
function contorno(n,x,y,w,h){
  fc.beginPath();
  if(n.forma==='losango'){fc.moveTo(x,y-h/2);fc.lineTo(x+w/2,y);fc.lineTo(x,y+h/2);fc.lineTo(x-w/2,y);fc.closePath();return;}
  const r=n.forma==='pilula'?h/2:6, x0=x-w/2, y0=y-h/2;
  fc.moveTo(x0+r,y0);fc.arcTo(x0+w,y0,x0+w,y0+h,r);fc.arcTo(x0+w,y0+h,x0,y0+h,r);fc.arcTo(x0,y0+h,x0,y0,r);fc.arcTo(x0,y0,x0+w,y0,r);fc.closePath();
}
function fluxo(dt){
  const r=flx.getBoundingClientRect(); if(foraDaTela(r)) return;
  const e=suave(reduz?1:clamp((innerHeight*.9-r.top)/(innerHeight*.55+r.height/2)));
  const ms=Math.pow(10,lerp(Math.log10(3*SEMANA),Math.log10(40),e));
  const vel=DIRETO.total/(7000*Math.pow(10,-1.5*e));   // na tela: de 7 s a uns 0,2 s por volta
  const rastro=lerp(.06,.5,e);
  for(const k in luzEtapa) luzEtapa[k]*=Math.exp(-dt/450);
  for(const l of LIGACOES) l.luz*=Math.exp(-dt/600);
  if(!reduz){
    const antes=andado; andado+=vel*dt;
    atual.acum.forEach((d,i)=>{
      if(d>antes&&d<=andado) luzEtapa[atual.nomes[i]]=1;
      if(i&&atual.acum[i-1]<andado&&d>antes) ligacao(atual.nomes[i-1],atual.nomes[i]).luz=1;   // a ligação acende enquanto o brilho passa por ela
    });
    if(andado>atual.total+rastro){voltas++; atual=voltas%3===2?COM_AJUSTE:DIRETO; andado=0; luzEtapa.inicio=1;}
  }
  const S=FW, X=v=>v*S, fonte=Math.max(9,S*.026);
  fc.clearRect(0,0,S,S);
  // ligações, com ponta de seta
  fc.font=`500 ${fonte.toFixed(1)}px "Geist Mono", ui-monospace, monospace`;
  if('letterSpacing' in fc) fc.letterSpacing='1px';
  for(const {a,b,rotulo,luz} of LIGACOES){
    const ax=X(a[0]), ay=X(a[1]), bx=X(b[0]), by=X(b[1]), ang=Math.atan2(by-ay,bx-ax), t=6, l=reduz?0:luz;
    const cor=`rgba(${Math.round(lerp(255,42,l))},${Math.round(lerp(255,169,l))},${Math.round(lerp(255,224,l))},${(.22+.6*l).toFixed(3)})`;
    if(l>.02){fc.lineWidth=5; fc.strokeStyle=`rgba(42,169,224,${(.16*l).toFixed(3)})`; fc.beginPath(); fc.moveTo(ax,ay); fc.lineTo(bx,by); fc.stroke();}
    fc.lineWidth=1; fc.strokeStyle=cor; fc.beginPath(); fc.moveTo(ax,ay); fc.lineTo(bx,by); fc.stroke();
    fc.fillStyle=cor; fc.beginPath(); fc.moveTo(bx,by); fc.lineTo(bx-t*Math.cos(ang-.45),by-t*Math.sin(ang-.45)); fc.lineTo(bx-t*Math.cos(ang+.45),by-t*Math.sin(ang+.45)); fc.closePath(); fc.fill();
    if(rotulo){
      const horizontal=Math.abs(by-ay)<1;
      fc.textAlign=horizontal?'center':'left'; fc.textBaseline=horizontal?'bottom':'middle';
      fc.fillStyle='#8A89A0'; fc.fillText(rotulo.toUpperCase(),horizontal?(ax+bx)/2:ax+8,horizontal?ay-5:(ay+by)/2);
    }
  }
  // o brilho: rastro atrás da cabeça; dentro das etapas ele some e a etapa acende
  if(!reduz){
    const ini=Math.max(0,andado-rastro), fim=Math.min(andado,atual.total);
    fc.lineCap='round';
    for(let k=0,seg=36;k<seg&&fim>ini;k++){
      const [x0,y0]=pontoEm(atual,lerp(ini,fim,k/seg)), [x1,y1]=pontoEm(atual,lerp(ini,fim,(k+1)/seg)), a=(k+1)/seg;
      fc.strokeStyle=`rgba(42,169,224,${(a*.25).toFixed(3)})`; fc.lineWidth=4+a*5;
      fc.beginPath(); fc.moveTo(X(x0),X(y0)); fc.lineTo(X(x1),X(y1)); fc.stroke();
      fc.strokeStyle=`rgba(${Math.round(lerp(42,220,a*a))},${Math.round(lerp(169,240,a*a))},255,${(a*.95).toFixed(3)})`; fc.lineWidth=1+a*1.8;
      fc.beginPath(); fc.moveTo(X(x0),X(y0)); fc.lineTo(X(x1),X(y1)); fc.stroke();
    }
    if(andado<=atual.total){
      const [hx,hy]=pontoEm(atual,andado), g=fc.createRadialGradient(X(hx),X(hy),0,X(hx),X(hy),12);
      g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(.3,'rgba(42,169,224,.6)'); g.addColorStop(1,'rgba(42,169,224,0)');
      fc.fillStyle=g; fc.beginPath(); fc.arc(X(hx),X(hy),12,0,6.283); fc.fill();
    }
  }
  // etapas
  fc.textAlign='center'; fc.textBaseline='middle'; fc.lineWidth=1.2;
  for(const k in ETAPA){
    const n=ETAPA[k], l=reduz?.5:luzEtapa[k], x=X(n.x), y=X(n.y);
    contorno(n,x,y,X(n.w),X(n.h));
    fc.fillStyle='#07071A'; fc.fill();
    if(l>.01){fc.fillStyle=`rgba(247,161,17,${(.12*l).toFixed(3)})`; fc.fill();}
    fc.strokeStyle=`rgba(${Math.round(lerp(255,247,l))},${Math.round(lerp(255,161,l))},${Math.round(lerp(255,17,l))},${(.3+.7*l).toFixed(3)})`; fc.stroke();
    fc.fillStyle=`rgba(238,237,242,${(.55+.45*l).toFixed(3)})`; fc.fillText(n.rotulo.toUpperCase(),x,y+.5);
  }
  // quanto leva uma volta
  const [q,u]=duracao(ms);
  fc.textAlign='right'; fc.textBaseline='alphabetic';
  if('letterSpacing' in fc) fc.letterSpacing='0px';
  if('fontStretch' in fc) fc.fontStretch='condensed';
  fc.fillStyle='#EEEDF2'; fc.font=`600 ${Math.round(S*.11)}px Archivo, system-ui, sans-serif`; fc.fillText(String(q),X(.95),X(.9));
  if('fontStretch' in fc) fc.fontStretch='normal';
  if('letterSpacing' in fc) fc.letterSpacing='1.5px';
  fc.fillStyle='#8A89A0'; fc.font=`500 ${fonte.toFixed(1)}px "Geist Mono", ui-monospace, monospace`; fc.fillText(u.toUpperCase(),X(.95),X(.955));
}

/* 03 · escala: um ponto se liga aos vizinhos, a rede cresce, a câmera se afasta, inclina,
   e a rede se revela parte de uma galáxia, que ela vai tomando até o fim. Galáxia em WebGL; rede em canvas 2D por cima. */
const esc=document.getElementById('c3'), palco=esc.querySelector('.palco');
const glc=document.getElementById('galaxia'), rede=document.getElementById('rede'), rc=rede.getContext('2d');
const gl=glc.getContext('webgl',{premultipliedAlpha:true,alpha:true,antialias:false});
let GW=0, GH=0, gdpr=1, ancora={x:0,y:0}, mEsc=300, giroGal=0;

const GAL=(()=>{
  const rnd=aleatorio(20260928), gauss=()=>{let u=0;for(let i=0;i<6;i++)u+=rnd();return (u-3)*1.4142;};
  const movel=innerWidth<700, NE=movel?16000:32000, NN=movel?900:2200;
  const passo=Math.tan(21*Math.PI/180), r0=.1;
  const braco=(r,k)=>k+Math.log(Math.max(r,r0)/r0)/passo;          // ângulo do braço k no raio r
  const cor=[[1,.86,.66],[.8,.82,.9],[.66,.8,1],[.3,.7,.94],[.86,.4,.76]];
  const nos=Array.from({length:90},()=>{const r=.2+rnd()*.78,a=braco(r,rnd()<.5?0:Math.PI)+gauss()*.1;return [r*Math.cos(a),r*Math.sin(a)];});
  const v=[];
  const disco=()=>.05-Math.log(1-rnd()*(1-Math.exp(-1/.3)))*.3;  // exponencial truncada
  for(let i=0;i<NE;i++){
    const u=rnd(); let x,y,c,b,t=.9+rnd()*1.3;
    if(u<.1){const r=Math.abs(gauss())*.08+Math.abs(gauss())*.025,a=rnd()*6.283;x=r*Math.cos(a);y=r*Math.sin(a)*.88;c=0;b=.14+.26*rnd();t=1.1+rnd()*1.3;}
    else if(u<.16){const n=nos[(rnd()*nos.length)|0];x=n[0]+gauss()*.011;y=n[1]+gauss()*.011;c=rnd()<.55?4:3;b=.45+.5*rnd();t=1.2+rnd()*1.6;}
    else{
      const r=disco(); let a;
      if(rnd()<.78){const k=rnd()<.85?(rnd()<.5?0:Math.PI):(rnd()<.5?Math.PI/2:Math.PI*1.5);a=braco(r,k)+gauss()*(.2+.12*r);c=rnd()<.5?2:rnd()<.35?3:1;b=(.3+.55*rnd()*rnd())*(.4+.6*Math.min(1,r/.4));}
      else{a=rnd()*6.283;c=r<.3?0:1;b=.1+.28*rnd();}
      const rr=r*(1+gauss()*.05); x=rr*Math.cos(a); y=rr*Math.sin(a);
      if(rnd()<.012){t=2.6+rnd()*1.8;b=.95;}
    }
    v.push(x,y,...cor[c],b,t,0,0);
  }
  for(let i=0;i<NN;i++){                                              // névoa: manchas grandes e fracas
    const u=rnd(); let x,y,c,t,b;
    if(u<.12){const r=Math.abs(gauss())*.07,a=rnd()*6.283;x=r*Math.cos(a);y=r*Math.sin(a)*.88;c=[1,.78,.5];t=.1+rnd()*.1;b=.026;}
    else{const r=disco(),k=rnd()<.5?0:Math.PI,a=braco(r,k)+gauss()*(.16+.1*r);x=r*Math.cos(a);y=r*Math.sin(a);c=rnd()<.8?[.34,.52,1]:[.8,.3,.72];t=.05+rnd()*.08;b=.045+.03*rnd();}
    v.push(x,y,...c,b,t,1,0);
  }
  const rO=.56, aO=braco(rO,0), O=[rO*Math.cos(aO),rO*Math.sin(aO)];
  const N=v.length/9; let max=0;
  for(let i=0;i<N;i++){const d=Math.hypot(v[i*9]-O[0],v[i*9+1]-O[1]);v[i*9+8]=d;if(d>max)max=d;}
  return {v:new Float32Array(v),N,NE,O,max};
})();

// a rede: nós em volta da origem, em todas as escalas; cada um se liga aos dois vizinhos mais próximos que já existiam
const REDE=(()=>{
  const rnd=aleatorio(5), O=GAL.O, n=[{x:O[0],y:O[1],d:0,origem:true}];
  for(let i=0;i<420;i++){const r=.0012*Math.pow(.26/.0012,rnd()),a=rnd()*6.283;n.push({x:O[0]+Math.cos(a)*r,y:O[1]+Math.sin(a)*r,d:r,azul:rnd()<.22});}
  n.sort((a,b)=>a.d-b.d);
  n.forEach((p,k)=>{if(!k)return;const m=[];for(let j=0;j<k;j++)m.push([Math.hypot(p.x-n[j].x,p.y-n[j].y),j]);m.sort((a,b)=>a[0]-b[0]);p.lig=m.slice(0,2).map(q=>q[1]);});
  return n;
})();

let U={};
if(gl){
  const sombreador=(tipo,src)=>{const s=gl.createShader(tipo);gl.shaderSource(s,src);gl.compileShader(s);return s;};
  const prog=gl.createProgram();
  gl.attachShader(prog,sombreador(gl.VERTEX_SHADER,`
attribute vec2 aP;attribute vec3 aC;attribute float aB,aT,aK,aD;
uniform vec2 uM0,uM1,uT,uTela;uniform float uR,uVis,uDpr,uEsc,uNev;
varying vec3 vC;varying float vA;
void main(){
  vec2 p=aP.x*uM0+aP.y*uM1+uT;
  gl_Position=vec4(p.x/uTela.x*2.-1.,1.-p.y/uTela.y*2.,0.,1.);
  float aceso=1.-smoothstep(uR*.82,uR,aD);
  vC=mix(vec3(.55,.58,.68),aC,aceso);
  float a=aB*mix(.14*uVis,1.,aceso);
  if(aK>.5){a*=uNev;gl_PointSize=min(aT*uEsc,160.)*uDpr;}else{gl_PointSize=aT*uDpr;}
  vA=a;
}`));
  gl.attachShader(prog,sombreador(gl.FRAGMENT_SHADER,`
precision mediump float;varying vec3 vC;varying float vA;
void main(){vec2 d=gl_PointCoord-.5;float q=dot(d,d)*4.;if(q>1.)discard;float f=exp(-q*3.5)*vA;gl_FragColor=vec4(vC*f,f);}`));
  gl.linkProgram(prog); gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER,GAL.v,gl.STATIC_DRAW);
  [['aP',2,0],['aC',3,2],['aB',1,5],['aT',1,6],['aK',1,7],['aD',1,8]].forEach(([n,t,o])=>{const l=gl.getAttribLocation(prog,n);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,t,gl.FLOAT,false,36,o*4);});
  ['uM0','uM1','uT','uTela','uR','uVis','uDpr','uEsc','uNev'].forEach(n=>U[n]=gl.getUniformLocation(prog,n));
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE,gl.ONE); gl.clearColor(0,0,0,0);
}

function medirGalaxia(){
  gdpr=Math.min(devicePixelRatio||1,2); GW=palco.clientWidth; GH=palco.clientHeight;
  for(const c of [glc,rede]){c.width=Math.round(GW*gdpr);c.height=Math.round(GH*gdpr);}
  rc.setTransform(gdpr,0,0,gdpr,0,0);
  if(gl) gl.viewport(0,0,glc.width,glc.height);
  const pr=palco.getBoundingClientRect(), env=palco.querySelector('.env').getBoundingClientRect(), txt=palco.querySelector('.texto').getBoundingClientRect();
  if(innerWidth>=900){ancora={x:env.left-pr.left+env.width*.75,y:GH*.5}; mEsc=Math.min(env.width*.62,GH*.95);}
  else{const y0=txt.bottom-pr.top+12; ancora={x:GW/2,y:y0+(GH-y0)/2}; mEsc=Math.min(GW*.96,(GH-y0)*.95);}
}
medirGalaxia(); addEventListener('resize',medirGalaxia);

function galaxia(dt){
  const r=esc.getBoundingClientRect(); if(foraDaTela(r)) return;
  const p=reduz?1:clamp((innerHeight*.6-r.top)/(innerHeight*.6+(r.height-innerHeight)*.75));
  const f1=clamp(p/.5), f2=suave(clamp((p-.5)/.28)), f3=suave(clamp((p-.78)/.22));
  const R0=.0009, R1=.12, R2=.3, Rmax=GAL.max*1.02;
  const R=p<.5?R0*Math.pow(R1/R0,f1):p<.78?R1*Math.pow(R2/R1,f2):R2*Math.pow(Rmax/R2,f3);
  const s1=.36*mEsc/R1, s=p<.5?.36*mEsc/R:s1*Math.pow(.47*mEsc/s1,f2);
  const incl=lerp(1,.58,f2), beta=lerp(0,-.42,f2);
  if(!reduz) giroGal+=dt*.00004*suave(clamp((p-.6)/.4));
  const ca=Math.cos(-giroGal), sa=Math.sin(-giroGal), cb=Math.cos(beta), sb=Math.sin(beta);
  const m00=s*(cb*ca-sb*incl*sa), m10=s*(sb*ca+cb*incl*sa), m01=s*(-cb*sa-sb*incl*ca), m11=s*(-sb*sa+cb*incl*ca);
  const wx=GAL.O[0]*(1-f2), wy=GAL.O[1]*(1-f2), tx=ancora.x-(m00*wx+m01*wy), ty=ancora.y-(m10*wx+m11*wy);
  const tela=(q)=>[m00*q.x+m01*q.y+tx, m10*q.x+m11*q.y+ty];
  const nev=clamp((p-.45)/.4);
  if(gl){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.uM0,m00,m10); gl.uniform2f(U.uM1,m01,m11); gl.uniform2f(U.uT,tx,ty); gl.uniform2f(U.uTela,GW,GH);
    gl.uniform1f(U.uR,R); gl.uniform1f(U.uVis,suave(clamp((p-.42)/.3))); gl.uniform1f(U.uDpr,gdpr); gl.uniform1f(U.uEsc,s); gl.uniform1f(U.uNev,nev);
    gl.drawArrays(gl.POINTS,0,GAL.NE);
    if(nev>.01) gl.drawArrays(gl.POINTS,GAL.NE,GAL.N-GAL.NE);
  }
  rc.clearRect(0,0,GW,GH);
  const aRede=1-suave(clamp((p-.42)/.3)), aLig=1-suave(clamp((p-.3)/.3)), tam=lerp(3.2,1.3,clamp(p/.6));
  if(aLig>0){
    rc.lineWidth=1; rc.strokeStyle=`rgba(42,169,224,${(.55*aLig).toFixed(3)})`; rc.beginPath();
    for(let i=1;i<REDE.length;i++){const q=REDE[i]; if(q.d>R) break; const [x,y]=tela(q);
      for(const j of q.lig){const [x2,y2]=tela(REDE[j]); rc.moveTo(x,y); rc.lineTo(x2,y2);}}
    rc.stroke();
  }
  for(const q of REDE){
    if(q.d>R) break;
    const a=q.origem?Math.max(aRede,.9):aRede; if(a<=0) continue;
    const [x,y]=tela(q); if(x<-10||y<-10||x>GW+10||y>GH+10) continue;
    rc.globalAlpha=a*(.3+.7*clamp((R-q.d)/(R*.2+1e-9)));
    if(q.origem){
      const pulso=reduz?0:(performance.now()/1600)%1;
      rc.strokeStyle=`rgba(247,161,17,${(.6*(1-pulso)).toFixed(3)})`; rc.lineWidth=1.2;
      rc.beginPath(); rc.arc(x,y,5+pulso*16*(1-p),0,6.283); rc.stroke();
      rc.fillStyle='#F7A111'; rc.beginPath(); rc.arc(x,y,lerp(5,2.6,f2),0,6.283); rc.fill();
    }else{rc.fillStyle=q.azul?'#2AA9E0':'#EEEDF2'; rc.beginPath(); rc.arc(x,y,tam,0,6.283); rc.fill();}
  }
  rc.globalAlpha=1;
}

/* Um laço só para tudo que se move */
let angulo=0, ultimo=performance.now(), rolagemAnterior=scrollY;
function laco(t){
  const dt=Math.min(t-ultimo,100); ultimo=t;
  const rolou=Math.abs(scrollY-rolagemAnterior); rolagemAnterior=scrollY;
  if(!reduz){
    angulo-=dt*.006+rolou*.08;                       // vórtice: ~60s por volta; rolar (para qualquer lado) acelera
    vortice.style.transform=`rotate(${angulo}deg)`;
    giroCeu+=dt*.00004+rolou*.00025;                 // céu: bem mais devagar, no mesmo sentido
  }
  topo.classList.toggle('mostra',scrollY>innerHeight*.55);
  desenharCeu(t); acender(); fluxo(dt); galaxia(dt);
  requestAnimationFrame(laco);
}
requestAnimationFrame(laco);
