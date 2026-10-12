const form=document.getElementById('form'), aviso=document.getElementById('aviso');
/* Textos que o script escreve na tela (o resto está no HTML de cada idioma); vale o lang da página */
const TEXTOS={
  'pt-BR':{
    niveis:{
      1:['Iniciante','Conheço muito pouco e ainda preciso aprender mais.'],
      2:['Explorador','Tenho familiaridade com as ferramentas mais comuns, como ChatGPT e Claude, e talvez já tenha desenvolvido alguma solução com programação assistida por IA.'],
      3:['Avançado','Conheço profundamente o tema e as soluções disponíveis no mercado, e já usei várias delas profissionalmente.'],
    },
    faltaPerfil:'qual opção descreve você', faltaNome:'o nome', faltaEmail:'um e-mail válido',
    falta:l=>`Falta preencher ${l.join(', ')}.`,
    enviando:'Enviando…',
    erro422:'Algum dado não passou na conferência. Confira o e-mail e o tamanho dos textos.',
    erro429:'Muitas tentativas seguidas. Tente de novo daqui a pouco.',
    erro404:'O cadastro está fechado no momento.',
    erro:'Não conseguimos enviar agora. Tente de novo em instantes.',
    semConexao:'Não conseguimos enviar agora. Confira a sua conexão e tente de novo.',
  },
  en:{
    niveis:{
      1:['Beginner','I know very little and still need to learn more.'],
      2:['Explorer','I’m familiar with the most common tools, like ChatGPT and Claude, and may have already built something with AI-assisted programming.'],
      3:['Advanced','I know the subject and the solutions on the market in depth, and have used several of them professionally.'],
    },
    faltaPerfil:'which option describes you', faltaNome:'your name', faltaEmail:'a valid email',
    falta:l=>`Please fill in ${l.join(', ')}.`,
    enviando:'Sending…',
    erro422:'Some of the data didn’t pass validation. Check the email and the length of the texts.',
    erro429:'Too many attempts in a row. Please try again shortly.',
    erro404:'Sign-ups are closed at the moment.',
    erro:'We couldn’t send it right now. Please try again in a moment.',
    semConexao:'We couldn’t send it right now. Check your connection and try again.',
  },
};
const T=TEXTOS[document.documentElement.lang]||TEXTOS['pt-BR'];

/* Perguntas condicionais: "o que quer construir" só com "tenho uma ideia"; "uso de IA no trabalho" só para quem trabalha numa empresa */
const mostrar=(el,sim)=>{if(el.hidden===!sim) return; el.hidden=!sim; el.classList.toggle('surge',sim);};
const soComIdeia=document.getElementById('so-com-ideia'), soEmpresa=document.getElementById('so-empresa');
form.addEventListener('change',e=>{
  if(e.target.name==='ideia') mostrar(soComIdeia,e.target.value==='tem-ideia');
  if(e.target.name==='perfil') mostrar(soEmpresa,e.target.value==='empresa');
});

/* Nível de conhecimento: a régua começa sem resposta; a descrição acompanha a posição */
const NIVEIS=T.niveis;
const nivel=document.getElementById('nivel'), regua=document.getElementById('f-nivel'), descricao=document.getElementById('descricao-nivel');
function marcarNivel(){
  const v=+regua.value, [nome,texto]=NIVEIS[v];
  nivel.classList.add('tocado');
  regua.style.setProperty('--pct',(v-1)*50+'%');
  regua.setAttribute('aria-valuetext',nome);
  descricao.innerHTML=`<b>${nome}.</b> ${texto}`;
  nivel.querySelectorAll('.marcas button').forEach(b=>b.classList.toggle('atual',+b.dataset.v===v));
}
regua.addEventListener('input',marcarNivel);
regua.addEventListener('change',marcarNivel);
nivel.querySelectorAll('.marcas button').forEach(b=>b.addEventListener('click',()=>{regua.value=b.dataset.v;marcarNivel();}));

/* Envio: POST na URL de entrada da campanha (app de leads no hub). A app guarda nome, e-mail e uma lista
   de pares pergunta/resposta; as perguntas saem do próprio formulário, e as condicionais escondidas não vão. */
const ENTRADA='https://hub.urbiverso.com.br/api/wh/funil_leads/wh_3aaf168c54f472aafc284c6cfe3df4c37f3b3d5c87e8aff4d0d81599af49b3b3';
const texto=el=>el?el.textContent.replace(/\s+/g,' ').trim():'';
const semOpcional=el=>{const c=el.cloneNode(true);c.querySelectorAll('.opcional').forEach(o=>o.remove());return texto(c);};
const legenda=nome=>texto(form.querySelector(`input[name="${nome}"]`).closest('fieldset').querySelector('legend'));
const rotulo=id=>semOpcional(form.querySelector(`label[for="${id}"] > span`));
const escolha=nome=>{const i=form.querySelector(`input[name="${nome}"]:checked`);if(!i) return '';const l=i.closest('label');return texto(l.querySelector('b'))||texto(l);};
const visivel=el=>!el.closest('[hidden]');
function respostas(){
  const r=[], add=(pergunta,resposta)=>{resposta=(resposta||'').trim();if(resposta) r.push({pergunta,resposta});};
  add(legenda('perfil'),escolha('perfil'));
  add(rotulo('f-empresa'),form.empresa.value);
  add(rotulo('f-telefone'),form.telefone.value);
  add(legenda('tamanho'),escolha('tamanho'));
  add(legenda('ideia'),escolha('ideia'));
  if(visivel(form.construir)) add(rotulo('f-construir'),form.construir.value);
  if(nivel.classList.contains('tocado')) add(legenda('nivel'),NIVEIS[regua.value][0]);
  if(visivel(form.uso_ia)) add(rotulo('f-uso-ia'),form.uso_ia.value);
  add(rotulo('f-origem'),form.origem.value);
  return r;
}
const botao=form.querySelector('.envio button'), rotuloBotao=botao.textContent;
const avisar=(msg,erro)=>{aviso.classList.toggle('erro',!!erro);aviso.textContent=msg;};
let enviando=false;
form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(enviando) return;
  const falta=[];
  if(!form.perfil.value) falta.push(T.faltaPerfil);
  if(!form.nome.value.trim()) falta.push(T.faltaNome);
  if(!form.email.checkValidity()||!form.email.value.trim()) falta.push(T.faltaEmail);
  if(falta.length){avisar(T.falta(falta),true);return;}
  enviando=true; botao.disabled=true; botao.textContent=T.enviando; avisar('');
  try{
    const r=await fetch(ENTRADA,{method:'POST',mode:'cors',credentials:'omit',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({nome:form.nome.value.trim(),email:form.email.value.trim(),respostas:respostas()})});
    if(r.ok){
      document.getElementById('sucesso-email').textContent=form.email.value.trim();
      form.hidden=true; document.getElementById('chamada').hidden=true;
      const ok=document.getElementById('sucesso'); ok.hidden=false; ok.querySelector('h2').focus();
      return;
    }
    avisar(r.status===422?T.erro422
      :r.status===429?T.erro429
      :r.status===404?T.erro404
      :T.erro,true);
  }catch{
    avisar(T.semConexao,true);
  }finally{
    enviando=false; botao.disabled=false; botao.textContent=rotuloBotao;
  }
});
