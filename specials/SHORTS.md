# Shorts do E Se De Repente

Vídeos verticais de cerca de 1 minuto no visual do filme "E se, de repente, a internet acabasse?". O canal é @esederrepente, em português do Brasil.

O modelo é `specials/short-pix-parou/`: copie a pasta e troque roteiro, cenas, fontes e metadados. `specials/shorts_log.json` lista o que já saiu.

## Formato

- **Quadro:** 1080x1920, 24 fps, de 50 a 60 s. O palco continua 1920x1080, mas o celular mostra só o meio dele.
- **Área segura no palco:** x de 690 a 1230. Texto também fica em y de 90 a 830, porque a interface do Shorts cobre a parte de baixo.
- **Ritmo:** cerca de 2,2 s por plano, uma ação específica por plano, cerca de 25 planos. Sem legenda corrida; o pouco texto faz parte da cena.
- **Roteiro:** de 130 a 150 palavras, frases curtas, português falado. Números por extenso, para a voz não errar.
- **Estrutura:** gancho concreto nos primeiros segundos, a pergunta "E se, de repente...?", um fato real grande, o que provavelmente acontece, um caso real parecido, o desfecho com a dona Neide ou o Caio, e uma pergunta para os comentários.

## Voz

Narração na Thalita (`pt-BR-ThalitaMultilingualNeural`, edge-tts, grátis), escolhida pelo Miguel de ouvido. Pequenos erros de pronúncia são aceitos em Shorts; reescreva só o que mudar o sentido. Pausas vêm do campo `after` de cada fala.

A ElevenLabs está fora do plano. O código segue em `voice_engine.py` e só roda com `"voiceEngine": "elevenlabs"` no film.json.

## Fatos

Pesquise antes de escrever e só afirme o que tem fonte. Liste tudo em `SOURCES.md` e as principais fontes na descrição. O futuro é raciocínio e precisa soar assim ("provavelmente"). Sem números inventados, logos reais, nada maldoso sobre pessoas ou grupos reais, nem alarme apresentado como certeza. Evite temas médicos, eleitorais ou tragédias recentes.

## Peças disponíveis

- **Cenários:** `mercado`, `mercadoVazio`, `sala`, `salaNoite`, `rua`, `ruaFechada`, `ruaNoite`, `hospital`, `praca`, `pracaTarde`, `cidade`, `cidadeNoite`.
- **Objetos do Brasil:** `phone` (telas `chat`, `load`, `erro`, `pix`, `mapa`, `call`, `home`, `off`; `pix` com `t3="ok"` mostra sucesso), `maquininha`, `caderno`, `nota`, `radio`, `moto`, `globe`, `rede`, `big`, `counter`, `fact`, `bars`, `mural`, `bilhete`, `carta`, `envelope`, `hd`, `cama`, `atm`, `truck`, `aviao`, `vulcao`, `qmark`, `chapter`, `livro`, `caixaCorreio`.
- **Outros objetos:** `clock`, `mug`, `plate`, `coffeepot`, `newspaper`, `ladder`, `bucket`, `hand`.
- **Ações (`a("nome", quadro)`):** `face`, `snapFace`, `turn`, `lookUp`, `lookDown`, `lean`, `back`, `flinch`, `doubleOver`, `sigh`, `nod`, `wave`, `fuss`, `rise`, `fall`, ou qualquer pose: `armsUp`, `handToMouth`, `phoneEar`, `point`, `reach`, `checkPhone`, `phoneUp`, `phoneShake`, `handsHead`, `armsFold`, `give`, `knock`.
- **Elenco:** `caio`, `neide`, `bia`, `cliente`, `gui`, `guy2`, `gal`, `gal2`. Pessoas inventadas; a descrição do vídeo diz isso.

## Cuidados vistos no modelo

- A checagem de enquadramento só lê posições. Só olhar os fotogramas pega a mão cobrindo o texto do celular ou uma tela que contradiz a fala.
- `rede` e `globe` ficam quase vazios e escuros no vertical. Prefira uma pessoa, um número grande ou um objeto.
- Um contador ainda subindo mostra o número errado no meio do plano. Use `n` menor que a duração do plano.
- Um `on=` na segunda palavra de uma fala gera um plano curto demais.
- Se o texto do relógio do celular aparecer, passe `t4` com a hora da história.

## Instagram

Só poste se a conta aberta no Chrome mostrar o @ `esederrepente`. Enquanto ela mostrar `shifthappensyoudecide` ou outro @, não poste e avise o Miguel. Uma falha no Instagram nunca bloqueia o YouTube.

1. O Chrome perde a conexão com arquivos grandes, então faça uma cópia de até 6,5 MB:

```bash
ffmpeg -y -v error -i out/film/<slug>/<slug>.mp4 -c:v libx264 -b:v 780k -maxrate 900k -bufsize 1600k -pix_fmt yuv420p -c:a aac -b:a 96k out/film/<slug>/<slug>_ig.mp4
```

2. Em instagram.com: barra lateral "Criar", depois "Selecionar do computador". Use `find` para achar o `input[type=file]` e `file_upload` para enviar; nunca clique no seletor de arquivos.
3. Mantenha o corte original 9:16, clique em Avançar duas vezes, escreva a legenda (`description` de `meta.json`) e clique em Compartilhar.
4. Se a conexão cair, procure o post no perfil antes de tentar de novo. Salve o link em `specials/shorts_log.json`, no campo `instagram` da entrada do dia.

## Comandos

Rode da pasta da worktree, nesta ordem:

```bash
python3 specials/<slug>/gen.py
```

```bash
python3 scripts/make_film.py <slug> --no-render
```

```bash
node scripts/film_stills.mjs public/special/<slug>/build.json out/film/<slug>/st 0.3 @out/film/<slug>/mid.txt
```

```bash
python3 scripts/make_film.py <slug>
```

```bash
python3 scripts/check_short.py <slug>
```

```bash
python3 scripts/publish_short_esederrepente.py <slug>
```

`mid.txt` tem um número de quadro por linha, tirado de `out/film/<slug>/timeline.csv`. Para avisar o Miguel:

```bash
python3 scripts/voice_engine.py alert "E Se De Repente: <título>" "<texto>"
```

O aviso fica em `out/AVISOS_esederrepente.md` e aparece como notificação do Windows.
