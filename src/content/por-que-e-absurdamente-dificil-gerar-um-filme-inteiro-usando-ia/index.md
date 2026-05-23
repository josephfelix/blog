---
title: "Por que é absurdamente difícil gerar um filme inteiro usando IA"
date: 2026-05-06
type: article
tags: [inteligência artificial, geração de vídeo, ciência da computação, tecnologia]
description: "Quem afirma que IA vai substituir Hollywood em dois anos raramente calculou o custo computacional de gerar um único frame com qualidade cinematográfica."
draft: false
---

## Por que estou escrevendo isso?

Fui inspirado pela vontade de criar episódios de anime para o meu filho de 10 anos, que adora One Piece. Após pesquisar a viabilidade, descobri que gerar vídeos de qualidade cinematográfica é exponencialmente mais complexo do que parece — apesar de vídeos curtos serem abundantes nas redes sociais.

---

## O maior equívoco sobre IA generativa

"Em dois anos a IA vai substituir Hollywood" é uma afirmação comum, mas imprecisa. Quem faz essa previsão raramente calculou o custo computacional de gerar um único frame com qualidade cinematográfica.

---

## O que custa gerar uma imagem?

Modelos como Stable Diffusion não criam imagens em um passo único. Funcionam através de um processo iterativo chamado **denoising** em um espaço latente comprimido:

- Começam com ruído gaussiano puro
- Em cada etapa (*step*), a rede prediz e remove parte desse ruído, condicionada por texto
- O processo típico envolve 20–50 steps
- **Cada step é um forward pass completo** da rede neural

### Matemática por trás

O custo computacional segue a fórmula:

> Y = X · W

Onde operações lineares custam O(n·d·m). O mecanismo de atenção — coração dos transformers modernos — é definido por:

$$\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^T}{\sqrt{d}}\right) V$$

O custo quadrático O(n²·d) vem do produto $QK^T$, onde $n$ é o número de tokens (pixels/patches) e $d$ a dimensão do espaço latente.

Para uma imagem com 30 steps:
- Um forward pass: bilhões de operações
- Total por imagem: 10¹⁰ a 10¹² FLOPs

---

## Deep Dive: SDXL

O Stable Diffusion XL é referência em geração de imagens de alta qualidade. Sua arquitetura inclui:

- **UNet refinada:** ~2,6B parâmetros
- **VAE:** comprime/descomprime entre espaço de pixel e latente
- **Dois encoders de texto:** CLIP ViT-L e OpenCLIP ViT-bigG, ~700M parâmetros

**Consumo total:** 6,5–7GB em disco (fp16)

### Requisitos de hardware

- **VRAM mínima:** ~6GB com otimizações agressivas
- **VRAM confortável:** 10–12GB
- **RAM do sistema:** 12–16GB sem offloading

### O problema da resolução

O custo da atenção cresce **quadraticamente** com resolução. Uma imagem 2048×2048 custa quatro vezes mais que 1024×1024, não duas vezes.

---

## Estimativa de FLOPs por imagem (SDXL)

Para processamento de latente 128×128 (equivalente a 1024×1024 em pixels):

- Um forward pass: ~80–120 bilhões de FLOPs
- Com 30 steps: ~2,4–3,6 trilhões de FLOPs
- Incluindo VAE e encoders: **~3–4 trilhões de FLOPs totais**

Para contexto: NVIDIA RTX 4090 atinge ~82,6 TFLOPs em fp16 teoricamente.

---

## Flux: a nova geração 🚀

O Flux, desenvolvido por Black Forest Labs, usa arquitetura baseada em **transformers** (Diffusion Transformer — DiT), em vez de UNet puro.

### Melhorias

- Melhor compreensão semântica de prompts
- Maior consistência visual em cenas complexas
- Mãos e anatomia significativamente mais coerentes
- Composição mais fiel a descrições detalhadas

### Custo do salto de qualidade

- **VRAM:** 16–24GB sem quantização agressiva
- **RAM:** 24–32GB sem offloading
- **FLOPs:** 30–50% acima do SDXL por step

---

## Comparativo visual: SDXL vs Flux

**Vídeo usando SDXL:**

<video controls width="100%" style="border-radius: 8px; margin-bottom: 1rem;">
  <source src="/blog/_content/por-que-e-absurdamente-dificil-gerar-um-filme-inteiro-usando-ia/luffy_sdxl.mp4" type="video/mp4" />
</video>

**Vídeo usando Flux:**

<video controls width="100%" style="border-radius: 8px; margin-bottom: 1rem;">
  <source src="/blog/_content/por-que-e-absurdamente-dificil-gerar-um-filme-inteiro-usando-ia/luffy_flux.mp4" type="video/mp4" />
</video>

## Benchmark: SDXL vs Flux

| Métrica | SDXL (RTX 4090) | SDXL (A100 80GB) | Flux.1 Dev (RTX 4090) | Flux.1 Dev (A100 80GB) |
|---------|----------------|-----------------|----------------------|----------------------|
| Tempo por imagem | ~4–6s | ~2–3s | ~12–18s | ~5–8s |
| VRAM usada | ~10–12GB | ~12GB | ~20–24GB | ~22–26GB |
| Throughput | ~0,15–0,25 img/s | ~0,35–0,5 img/s | ~0,06–0,08 img/s | ~0,13–0,2 img/s |
| Observações | Estável, sem gargalos | Excelente headroom | Lento em VRAM < 24GB | Gargalo CPU↔GPU offload |

O A100 escala melhor pela banda de memória superior (2TB/s vs ~1TB/s da 4090) e capacidade de manter o modelo inteiro em VRAM.

---

## O custo escondido de um frame

Uma imagem de alta qualidade representa:

- Dezenas de forward passes por rede com bilhões de parâmetros
- Cada forward: trilhões de operações matemáticas
- Atenção quadrática dominando o perfil de custo em alta resolução

**Analogia:** Cada frame é resultado de bilhões de micro-decisões matemáticas onde cada pixel influencia todos os outros, mediado por camadas de atenção que modelam dependências de longo alcance.

---

## De imagem para vídeo: a explosão de custo

Cinema: 24 frames por segundo. Um clipe de 5 segundos = **120 frames**.

Se cada frame custa ~5s em 4090 com SDXL:

> 120 × 5s = **600 segundos** = 10 minutos de GPU para 5 segundos de vídeo a 1024p

### O problema real: consistência temporal

Gerar 120 imagens independentes não é um vídeo — é um slideshow com personagens que mudam de rosto a cada corte, iluminação aleatória e mãos que desaparecem.

Manter consistência visual requer:

1. **Conditioning adicional** (image-to-image com frame anterior) — propaga erros progressivamente
2. **Modelos de vídeo nativos** (Sora, Wan, CogVideoX) — adicionam dimensão temporal à atenção, multiplicando custo ainda mais

Para um clipe de 16 frames a 512p, o custo rivaliza com dezenas de imagens individuais.

---

## Escalando para um filme inteiro

**2 horas de filme a 24 FPS = 172.800 frames**

Usando SDXL em A100 com throughput de ~0,4 imagens/segundo:

- 172.800 ÷ 0,4 = **432.000 segundos de GPU time**
- = **120 horas** de A100 contínua
- Sem contar áudio, pós-produção, consistência de personagem ou edição

### Custo financeiro

A100 em cloud: $2,5–4/hora

- 120 horas = **$300–480 só de frames brutos**

Isso assumindo geração perfeita sem rejeições, sem iterações criativas, sem retakes. Na realidade, produção cinematográfica envolve centenas de takes e revisões — multiplicando o custo por 10×–100×.

**Problema não resolvido:** Não existe pipeline confiável para manter identidade de personagem, direção de câmera e continuidade narrativa ao longo de 172.800 frames. Não é questão de poder computacional — é problema de pesquisa em aberto.

---

## E no final…

"IA vai substituir Hollywood em dois anos" só faz sentido se você nunca calculou quantas multiplicações de matriz existem entre um prompt e um frame.

Cada imagem representa trilhões de operações, dezenas de execuções de redes com bilhões de parâmetros. Um filme inteiro é um problema industrial que demanda clusters de GPU, orquestração de infraestrutura e pipelines de controle de qualidade para lidar com desafios de consistência temporal ainda não solucionados.

---

## Link do modelo LoRA

Publiquei o modelo LoRA que usei para os testes no Hugging Face:

[josephfelix/luffy-lora](https://huggingface.co/josephfelix/luffy-lora/tree/main)
