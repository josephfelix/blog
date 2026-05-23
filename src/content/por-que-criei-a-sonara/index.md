---
title: "Por que eu criei a Sonara, uma linguagem de programação pra compor música"
date: 2026-05-23
type: project
tags: [rust, música, linguagem de programação, supercollider, open source, projeto]
description: "O SuperCollider é poderoso, mas parece feito pra engenheiros de som. Eu queria escrever música como código, quase como uma partitura. Então criei a Sonara."
cover: /blog/_content/por-que-criei-a-sonara/cover.png
coverAlt: "Logo da linguagem Sonara"
draft: false
---

Tudo começou com uma pergunta simples: por que escrever música precisa ser tão difícil?

Não estou falando de teoria musical. Estou falando do ato físico de representar música como dados. Existem basicamente três caminhos. O primeiro é uma DAW, onde você arrasta blocos numa linha do tempo. O segundo é MIDI, um formato binário dos anos 80. O terceiro é notação musical tradicional, que tem sua própria curva de aprendizado enorme e não produz nada que um computador consiga processar direto.

Nenhuma dessas opções satisfaz quem pensa em música como código.

---

## O SuperCollider parece feito pra outro planeta

Quando fui pesquisar sobre síntese de áudio programável, cheguei no SuperCollider. É um software incrível: open source, ativo há décadas, usado por pesquisadores de áudio e artistas de música eletrônica experimental no mundo inteiro.

Aí eu abri o código de um acorde simples em sclang, a linguagem do SuperCollider:

```supercollider
(
SynthDef(\acorde, { |out=0, freq=440, amp=0.5, dur=1.0|
    var sig = SinOsc.ar(freq, 0, 1.0)
            + SinOsc.ar(freq * 2, 0, 0.4)
            + SinOsc.ar(freq * 3, 0, 0.2);
    var env = EnvGen.kr(
        Env([0, 1, 0.7, 0], [0.005, 0.04, dur * 0.95]),
        doneAction: 2
    );
    Out.ar(out, (sig * env * amp).dup);
}).add;

Synth(\acorde, [\freq, 261.63, \amp, 0.5, \dur, 2.0]);
)
```

Isso é um único acorde de Dó maior. Uma nota. Com dois segundos de duração.

Você precisa definir um `SynthDef`, entender o que é `EnvGen`, saber o que `doneAction: 2` faz, conhecer a diferença entre `.ar` e `.kr`, entender que `.dup` duplica o sinal pro canal estéreo, calcular manualmente que 261.63 Hz é o Dó médio, e ainda assim não ter escrito nenhuma nota de fato. Você escreveu a definição do instrumento.

Se quiser tocar uma música, você ainda precisa criar um `Score`, calcular os timestamps de cada nota em segundos, gerar mensagens OSC no formato certo, e renderizar tudo em modo NRT (non-real-time). É poderoso. É também completamente inacessível pra quem quer só escrever uma melodia.

---

## O que eu queria era isso

```sonara
tempo 120
scale C_major

section verse {
  chords  { C | Am | F | G }
  melody  { E4 E4 G4 E4 D4 C4 }
  bass    { Cw2 Aw2 Fw2 Gw2 }
  drums   { kick hihat snare hihat }
}
```

Isso é uma música. Você declara o tempo, a escala, e o que cada instrumento toca dentro de cada seção. As seções tocam em sequência; dentro de cada seção, tudo toca ao mesmo tempo.

Sem definir sintetizadores. Sem calcular frequências. Sem mensagens OSC. Só a música em si.

A sintaxe foi desenhada pra parecer uma partitura simplificada. `E4` é Mi na quarta oitava. `Eh4` é Mi meia nota. `Et4` é Mi colcheia de tercina. `C | Am | F | G` é uma progressão de acordes. `kick hihat snare hihat` é um padrão de bateria. Você lê em voz alta e consegue ouvir o que vai sair.

---

## O problema de distribuição que ninguém menciona

A Sonara escreve um script SuperCollider e chama o `sclang` na linha de comando em modo não-interativo. Não é preguiça de implementação. Significa que a síntese de áudio é delegada a um motor que pesquisadores passaram décadas refinando. Eu foco na linguagem; o SuperCollider faz o trabalho pesado de gerar os bytes do áudio.

Mas isso criou um problema de distribuição: eu precisava que músicos que talvez não programem conseguissem instalar e usar a ferramenta. Pedir pra alguém instalar Rust, clonar o repositório, compilar e adicionar ao PATH é matar o projeto antes de começar.

A solução foi compilar os binários com antecedência pra Linux, macOS e Windows, e escrever um script de instalação que você roda com um único comando:

```bash
curl -fsSL https://sonara-lang.github.io/install.sh | bash
```

Trinta segundos e a ferramenta está funcionando. Sem toolchain. Sem dependência de runtime. Um arquivo executável.

---

## O Jingle Bells e a Moonlight Sonata

Pra provar que a linguagem funcionava, escolhi dois exemplos de domínio público.

O Jingle Bells foi o primeiro. 114 linhas de Sonara, resultado reconhecível, prova de conceito básica. Até aí, ok.

A Moonlight Sonata foi onde as coisas ficaram sérias. Beethoven, Opus 27, Número 2, primeiro movimento. Aquela peça em Dó sustenido menor com os arpejos em tercinas que correm por baixo o tempo inteiro.

O problema: tercinas.

O primeiro movimento usa três notas por tempo, o tempo todo. Não é colcheia, não é semicolcheia. É um terço de tempo. E a Sonara, naquele ponto, não sabia o que era um terço de tempo.

Eu tinha durações para inteira (`w`), meia (`h`), quarto (padrão) e oitavo (`e`). As durações que qualquer pessoa aprende em teoria musical básica. Colcheia de tercina não é uma duração "normal" — é uma subdivisão que existe pra resolver o conflito entre o binário da notação e o ternário do ritmo.

Às quase uma da manhã, adicionei o `t`. Colcheia de tercina. Um terço de tempo. Refiz os 69 compassos do primeiro movimento, cada um com doze notas em tercinas:

```sonara
melody { G#t3 C#t4 Et4  G#t3 C#t4 Et4  G#t3 C#t4 Et4  G#t3 C#t4 Et4 }
```

Esse é o primeiro compasso. A diferença entre uma melodia que rasteja e uma que flui como Beethoven pretendia foi uma letra num arquivo de código.

---

## Por que isso importa em tempos de IA

Existe um problema que vai ficando mais evidente conforme IA de geração de áudio se torna mais comum: música gerada por IA não tem representação editável.

Você pede uma música pro Suno ou pro Udio, recebe um MP3, e não tem como editar a progressão de acordes, mudar o tempo da terceira estrofe, ou colaborar com outra pessoa na composição. A música existe como áudio, não como dado estruturado.

Um arquivo `.son` é diferente. É texto. Você coloca num repositório git, faz diff entre versões, manda pro colega revisar, faz fork e experimenta uma progressão diferente. A composição vira algo que você pode versionar, colaborar e publicar como código.

```sonara
// v1 — progressão original
chords { C | Am | F | G }

// v2 — experiência com a subdominante
chords { C | Am | Dm | G }
```

Isso é um commit de música. A diferença entre as duas versões é legível, revisável, revertível.

Com IA no pipeline, isso fica ainda mais interessante. Você pode usar um modelo pra sugerir variações de melodia ou progressões de acordes, representar o resultado em Sonara, editar manualmente, e renderizar. O humano mantém controle criativo sobre a estrutura; a IA acelera a exploração.

---

## O projeto

A Sonara é open source, escrita em Rust, com zero dependências externas. O compilador tem menos de seiscentos kilobytes.

O repositório está em [github.com/sonara-lang/sonara-lang](https://github.com/sonara-lang/sonara-lang). A documentação e o instalador estão em [sonara-lang.github.io](https://sonara-lang.github.io/).

Se você quiser experimentar, o Jingle Bells e a Moonlight Sonata estão nos exemplos do repositório. E se quiser contribuir com novos recursos de síntese, novos tipos de instrumento, ou simplesmente reportar um bug na hora de compor alguma coisa: pull requests são bem-vindos.
