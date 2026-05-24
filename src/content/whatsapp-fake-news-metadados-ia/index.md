---
title: "1 mudança no WhatsApp que diminuiria muito as fake news"
date: 2026-05-23
type: security
tags: [segurança, forense, whatsapp, inteligência artificial, fake news, metadados]
description: "Descobri que imagens geradas por IA carregam uma assinatura criptográfica nos bytes. O WhatsApp apaga tudo isso antes de entregar a imagem pra você."
cover: /blog/_content/whatsapp-fake-news-metadados-ia/cover.png
coverAlt: "Capa do artigo sobre WhatsApp e fake news"
ogTitle: "O WhatsApp apaga a assinatura que detecta fake news"
draft: false
---

Um motorista foi flagrado usando o Gemini para gerar imagens falsas e cobrar mais dos passageiros. A plataforma detectou. O motorista foi punido.

[Motorista é flagrado usando o Gemini para cobrar mais de passageiros](https://tecnoblog.net/noticias/motorista-e-flagrado-usando-o-gemini-para-cobrar-mais-de-passageiros/) (Tecnoblog)

<img src="/blog/_content/whatsapp-fake-news-metadados-ia/tecnoblog-motorista-gemini.png" alt="Print da notícia do Tecnoblog sobre motorista flagrado usando Gemini" class="mx-auto rounded-lg" />

O suporte identificou a imagem falsa por conta da marca d'água do Gemini. O SynthID embute um sinal invisível ao olho humano em toda imagem gerada, e foi esse sinal que denunciou o motorista.

E se não tivesse essa marca d'água? Eles não teriam descoberto? O cara que fraudou a imagem teria ganho a causa?

Decidi testar com duas imagens: uma foto real e uma gerada pelo Gemini. Sem ML, sem API proprietária. Só `exiftool` e `strings`.

---

## As duas imagens

**Foto real:** interior de táxi em São Paulo, tirada com Motorola Moto G(7) em 29/01/2022.

![Interior de táxi em São Paulo, foto tirada com Motorola Moto G7](/blog/_content/whatsapp-fake-news-metadados-ia/foto_real.jpg)

**Imagem gerada por IA:** gerada com o Gemini (Google Generative AI).

![Imagem gerada por IA com o Google Gemini](/blog/_content/whatsapp-fake-news-metadados-ia/imagem_ia.png)

Visualmente próximas. Forensicamente, mundos diferentes.

---

## 1. EXIF: o cabeçalho que câmeras gravam sem você pedir

Desde 1995, toda imagem JPEG carrega um bloco de metadados chamado EXIF. Câmeras digitais gravam isso automaticamente: fabricante, modelo, hora exata, configurações de lente, às vezes GPS. É invisível pra quem abre a imagem, mas está lá.

```bash
exiftool foto_real.jpg
```

```
ExifTool Version Number         : 12.40
File Name                       : foto_real.jpg
File Size                       : 3.4 MiB
Make                            : motorola
Camera Model Name               : moto g(7)
Software                        : Windows Photo Editor 10.0.10011.16384
Date/Time Original              : 2022:01:29 19:48:56
ISO                             : 2914
Exposure Time                   : 1/15
F Number                        : 1.8
Focal Length                    : 4.0 mm
GPS Latitude                    : 23 deg 34' 9.15" S
GPS Longitude                   : 46 deg 38' 38.03" W
GPS Altitude                    : 824.3 m Above Sea Level
GPS Processing Method           : CELLID
Image Width                     : 2602
Image Height                    : 2128
```

Agora a mesma operação na imagem gerada:

```bash
exiftool imagem_ia.png
```

```
ExifTool Version Number         : 12.40
File Name                       : imagem_ia.png
File Size                       : 2.0 MiB
File Type                       : PNG
MIME Type                       : image/png
Image Width                     : 1408
Image Height                    : 768
Bit Depth                       : 8
Color Type                      : RGB with Alpha
Compression                     : Deflate/Inflate
Interlace                       : Noninterlaced
Image Size                      : 1408x768
Megapixels                      : 1.1
```

Três coisas saltam na comparação. Primeiro, nenhum dado de câmera: sem `Make`, sem `ISO`, sem `F Number`, sem `GPS`. A foto real tem 13 campos de metadados de sensor; a imagem gerada tem só propriedades básicas do arquivo. Segundo, `Color Type: RGB with Alpha`. Câmeras nunca produzem canal alpha, isso só existe em imagens geradas por software. Terceiro, a proporção 1408×768 é um múltiplo de 128, o padrão de saída de modelos de difusão. Sensores de câmera usam 4:3 ou 3:2.

A ausência de metadados de sensor já resolve o caso. Uma foto real sem `Make` e sem `ISO` simplesmente não existe.

---

## 2. Strings: o que está escrito nos bytes crus

O EXIF conta a história oficial do arquivo. O `strings` conta o que está no binário mesmo, sem filtro nenhum.

```bash
strings foto_real.jpg | grep -iE 'motorola|moto|android|windows|photo|editor|wgs|cellid'
```

```
motorola
moto g(7)
Windows Photo Editor 10.0.10011.16384
Windows Photo Editor 10.0.10011.16384
WGS-84
CELLID2022:01:29
```

O hardware está literalmente escrito nos bytes em múltiplos lugares do arquivo, não só no cabeçalho EXIF. São chunks separados, alguns sem estrutura formal, só texto plano dentro do binário. O `WGS-84` é o sistema de coordenadas do GPS. O `CELLID` indica que o GPS foi triangulado por torre de celular, não por satélite. Detalhe que só aparece no binário cru.

```bash
strings imagem_ia.png | grep -iE 'google|gemini|c2pa|synthid|claim|trainedAlgorithmic'
```

```
c2pa.claim.v2
c2pa.created  Created by Google Generative AI.
digitalSourceType  trainedAlgorithmicMedia
c2pa.edited   Applied imperceptible SynthID watermark.
digitalSourceType  trainedAlgorithmicMedia
Google LLC
Google C2PA Media Services 1P ICA G3
Google C2PA Root CA G3
Google Core Time Stamping Authority T9
```

Isso é um manifesto C2PA. C2PA é um padrão aberto de rastreabilidade de mídia adotado por Google, Adobe, Microsoft e outros. O arquivo traz dois campos que encerram qualquer dúvida: `Created by Google Generative AI` e `Applied imperceptible SynthID watermark`. O segundo é o SynthID, uma marca d'água invisível ao olho humano que o Gemini embute nos pixels, detectável algoritmicamente.

Não é texto solto no arquivo. O manifesto inclui a cadeia PKI completa: `Google C2PA Root CA G3` → `Google C2PA Media Services 1P ICA G3` → assinatura do arquivo. É uma assinatura digital verificável, como um certificado SSL, mas embutida na imagem.

---

## 3. Por que tirar um screenshot não resolve

A tentativa óbvia de contornar isso seria tirar um screenshot da imagem gerada. O EXIF passa a mostrar o dispositivo que fez o screenshot, e o golpista vira o "fotógrafo".

Mas o screenshot tem a própria assinatura:

```bash
exiftool screenshot.jpg
```

```
Make                            : Apple
Model                           : iPhone 14 Pro
Software                        : iOS 17.2
```

Sem `ISO`. Sem `F Number`. Sem `Focal Length`. Sem `Lens Model`.

Um iPhone que tira uma foto real tem todas essas entradas. Um iPhone que tira um screenshot tem só os campos de dispositivo, sem nenhum dado de câmera. Isso não saiu do sensor; saiu da tela. Cada etapa de processamento deixa um fingerprint diferente, e não dá pra imitar uma câmera só reescrevendo campos de texto.

---

## 4. O limite: quando o WhatsApp entra no caminho

Testei um caso diferente: peguei uma imagem gerada por IA e mandei pelo WhatsApp. A pergunta era se as mesmas técnicas ainda funcionam depois que o arquivo passa pelo pipeline do app.

```bash
exiftool whatsapp.jpeg
```

```
ExifTool Version Number         : 12.40
File Name                       : whatsapp.jpeg
File Size                       : 180 KiB
JFIF Version                    : 1.01
Resolution Unit                 : None
X Resolution                    : 1
Y Resolution                    : 1
Image Width                     : 1086
Image Height                    : 1448
Encoding Process                : Progressive DCT, Huffman coding
```

Vazio. Sem `Make`, sem `ISO`, sem `GPS`, sem nenhum dado de sensor. Mas também sem nenhum marcador de gerador: sem C2PA, sem SynthID.

O motivo está nos primeiros bytes do arquivo:

```bash
xxd whatsapp.jpeg | head -1
```

```
00000000: ffd8 ffe0 0010 4a46 4946 ...    ......JFIF......
```

`ffd8 ffe0`: o marcador `ffe0` é APP0, o cabeçalho JFIF mínimo. Um arquivo com EXIF começa com `ffd8 ffe1` (APP1). O WhatsApp reescreve o arquivo do zero, substituindo qualquer estrutura de metadados por um cabeçalho JFIF em branco.

```bash
strings whatsapp.jpeg | grep -iE 'google|gemini|c2pa|synthid|claim|trainedAlgorithmic'
```

```
(sem resultado)
```

O manifesto C2PA que estava no arquivo original não existe mais. O WhatsApp re-encoda tudo como Progressive DCT JPEG, destruindo qualquer payload fora dos pixels brutos.

O que o app faz com cada imagem que passa por ele:

| Metadado | Antes | Depois |
|---|---|---|
| Bloco EXIF (Make, ISO, GPS) | presente | removido |
| Manifesto C2PA | presente | removido |
| SynthID (marca nos pixels) | presente | destruído no re-encoding |
| Resolução | original | substituída por `1x1` |
| Dimensões | original | redimensionado arbitrariamente |

Depois do WhatsApp, a imagem gerada e a foto real têm o mesmo perfil de metadados. Ambas chegam como JFIF 1.01 com resolução `1x1` e sem nenhum campo de câmera. `exiftool` e `strings` ficam cegos. O que resta pra análise são artefatos visuais nos pixels: ruído de difusão, inconsistências de iluminação, frequências espaciais anômalas. Isso requer ML, não linha de comando.

---

## A única coisa que o WhatsApp precisaria fazer

O manifesto C2PA já existe. O Google assina cada imagem gerada pelo Gemini com uma cadeia PKI completa. A Adobe faz o mesmo com o Firefly. A Microsoft, com o Designer. O padrão é aberto e os maiores geradores já adotaram.

O problema não está na tecnologia, está no pipeline do WhatsApp. O app poderia preservar o manifesto C2PA ao re-encodar a imagem. Na prática, bastaria não destruir os chunks do binário que não afetam a renderização visual. A informação de proveniência ocupa alguns kilobytes num arquivo que já vai comprimido; o custo é marginal.

Com C2PA intacto, qualquer verificador poderia checar a assinatura e mostrar pro usuário: *"Esta imagem foi criada por Google Generative AI"*. Sem modelo de ML, sem servidor externo, sem latência. A informação já estaria nos bytes, assinada pelo gerador.

O que o WhatsApp precisa fazer é só isso: parar de apagar a assinatura.

---

*Ferramentas usadas:*

- `exiftool`: leitura de metadados EXIF/XMP/IPTC ([exiftool.org](https://exiftool.org))
- `strings`: extração de texto de arquivos binários (padrão Unix/Linux/macOS)
- `xxd`: dump hexadecimal bruto
- Para análise mais funda: `binwalk` (estrutura de chunks), `identify -verbose` do ImageMagick
