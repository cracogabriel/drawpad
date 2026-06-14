# Interfaces de Comunicação — Drawpad

Este documento descreve todas as interfaces utilizadas para comunicação entre o frontend (React) e o backend (Ruby on Rails) do Drawpad. As interfaces se dividem em dois protocolos: **HTTP REST** para operações de leitura/escrita pontuais, e **WebSocket via Action Cable** para sincronização em tempo real.

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Estruturas de Dados](#estruturas-de-dados)
3. [Interface HTTP REST](#interface-http-rest)
4. [Interface WebSocket (Action Cable)](#interface-websocket-action-cable)
5. [Diagramas de Sequência](#diagramas-de-sequência)
6. [Estratégia de Cache](#estratégia-de-cache)

---

## Visão Geral

```
┌──────────────────────┐          HTTP REST         ┌──────────────────────┐
│                      │ ────────────────────────►  │                      │
│   Frontend (React)   │    GET /api/v1/rooms/:id   │   Backend (Rails)    │
│                      │ ◄────────────────────────  │                      │
│   ws://host/cable    │       JSON response        │   ws://host/cable    │
│                      │                            │                      │
│  Action Cable Client │ ◄──── WebSocket ─────────► │  Action Cable Server │
└──────────────────────┘                            └──────────────────────┘
```

O frontend combina os dois protocolos da seguinte forma:

| Momento              | Protocolo                  | Finalidade                     |
| -------------------- | -------------------------- | ------------------------------ |
| Ao entrar na sala    | HTTP GET                   | Carregar figuras existentes    |
| Ao conectar ao canal | WebSocket (subscribe)      | Entrar no stream da sala       |
| Ao desenhar          | WebSocket (perform `draw`) | Publicar nova figura           |
| Ao receber figura    | WebSocket (broadcast)      | Atualizar canvas em tempo real |
| Ao reconectar        | HTTP GET + WebSocket       | Re-sincronizar estado          |

---

## Estruturas de Dados

### Room (Sala)

Representa uma sala de desenho colaborativo. Identificada por um nome textual único.

```json
{
  "id": 1,
  "identifier": "minha-sala"
}
```

| Campo        | Tipo      | Descrição                          |
| ------------ | --------- | ---------------------------------- |
| `id`         | `integer` | Chave primária no banco de dados   |
| `identifier` | `string`  | Nome único da sala (slug URL-safe) |

---

### Figure (Figura)

Representa um elemento desenhado no canvas. O campo `data` é polimórfico: sua estrutura depende do `figure_type`.

```json
{
  "id": 42,
  "figure_type": "brush",
  "data": { ... }
}
```

| Campo         | Tipo      | Valores possíveis                        |
| ------------- | --------- | ---------------------------------------- |
| `id`          | `integer` | Chave primária                           |
| `figure_type` | `string`  | `"brush"` \| `"circle"` \| `"rectangle"` |
| `data`        | `object`  | Ver estruturas abaixo                    |

---

### BrushData — `figure_type: "brush"`

Traço livre composto por uma sequência de pontos.

```json
{
  "color": "#6366f1",
  "strokeWidth": 5,
  "points": [100, 150, 110, 160, 125, 170]
}
```

| Campo         | Tipo       | Descrição                                                                              |
| ------------- | ---------- | -------------------------------------------------------------------------------------- |
| `color`       | `string`   | Cor em hexadecimal (ex.: `"#ef4444"`)                                                  |
| `strokeWidth` | `number`   | Espessura do traço em pixels (`2`, `5` ou `14`)                                        |
| `points`      | `number[]` | Array plano de coordenadas `[x1, y1, x2, y2, ...]` no sistema de coordenadas do canvas |

---

### CircleData — `figure_type: "circle"`

Círculo definido por centro e raio.

```json
{
  "color": "#22c55e",
  "x": 400,
  "y": 300,
  "radius": 80
}
```

| Campo    | Tipo     | Descrição                       |
| -------- | -------- | ------------------------------- |
| `color`  | `string` | Cor em hexadecimal              |
| `x`      | `number` | Coordenada X do centro (pixels) |
| `y`      | `number` | Coordenada Y do centro (pixels) |
| `radius` | `number` | Raio em pixels                  |

---

### RectangleData — `figure_type: "rectangle"`

Retângulo definido por canto superior esquerdo, largura e altura.

```json
{
  "color": "#f97316",
  "x": 200,
  "y": 150,
  "width": 300,
  "height": 200
}
```

| Campo    | Tipo     | Descrição                                        |
| -------- | -------- | ------------------------------------------------ |
| `color`  | `string` | Cor em hexadecimal                               |
| `x`      | `number` | Coordenada X do canto superior esquerdo (pixels) |
| `y`      | `number` | Coordenada Y do canto superior esquerdo (pixels) |
| `width`  | `number` | Largura em pixels                                |
| `height` | `number` | Altura em pixels                                 |

---

## Interface HTTP REST

Base URL: `http://localhost:3000`

### `GET /api/v1/rooms/:id`

Carrega uma sala e todas as suas figuras. Se a sala não existir, é criada automaticamente. Os dados são servidos com cache Redis (TTL de 1 hora).

**Parâmetros de rota:**

| Parâmetro | Tipo     | Descrição                    |
| --------- | -------- | ---------------------------- |
| `:id`     | `string` | Identificador (slug) da sala |

**Exemplo de requisição:**

```
GET /api/v1/rooms/minha-sala
```

**Resposta de sucesso — `200 OK`:**

```json
{
  "room": {
    "id": 1,
    "identifier": "minha-sala"
  },
  "figures": [
    {
      "id": 10,
      "figure_type": "brush",
      "data": {
        "color": "#111111",
        "strokeWidth": 5,
        "points": [50, 100, 60, 110, 75, 120]
      }
    },
    {
      "id": 11,
      "figure_type": "circle",
      "data": {
        "color": "#6366f1",
        "x": 400,
        "y": 300,
        "radius": 60
      }
    }
  ]
}
```

**Utilizado pelo frontend em:** [src/services/drawingService.ts](frontend/src/services/drawingService.ts)

---

### `POST /api/v1/rooms`

Cria uma sala com um identificador específico. Operação idempotente: retorna a sala existente se o identificador já estiver em uso.

**Corpo da requisição (`application/json`):**

```json
{
  "room": {
    "identifier": "minha-sala"
  }
}
```

**Resposta de sucesso — `201 Created`:**

```json
{
  "room": {
    "id": 1,
    "identifier": "minha-sala"
  }
}
```

---

### `GET /health`

Endpoint de verificação de disponibilidade do servidor.

**Resposta:** `200 OK` com corpo `"OK"` (texto simples).

---

## Interface WebSocket (Action Cable)

O backend utiliza **Action Cable** (biblioteca WebSocket nativa do Rails). O frontend usa o cliente oficial `@rails/actioncable`.

**Endpoint de conexão:** `ws://localhost:3000/cable`

**Utilizado pelo frontend em:** [src/hooks/useActionCable.ts](frontend/src/hooks/useActionCable.ts)

---

### Subscrição ao Canal — `DrawingChannel`

O frontend se inscreve ao canal enviando os parâmetros abaixo. O servidor associa o cliente ao stream da sala correspondente.

**Parâmetros de subscrição:**

```json
{
  "channel": "DrawingChannel",
  "room_id": "minha-sala"
}
```

| Campo     | Tipo     | Descrição                                             |
| --------- | -------- | ----------------------------------------------------- |
| `channel` | `string` | Nome do canal Action Cable (fixo: `"DrawingChannel"`) |
| `room_id` | `string` | Identificador da sala a ser acompanhada               |

**Comportamento do servidor:**

- Se `room_id` for fornecido, o cliente é inscrito no stream `drawing_room_<room_id>`.
- Se `room_id` estiver ausente, a conexão é rejeitada com `reject`.

---

### Ação `draw` — Cliente → Servidor

Enviada pelo frontend ao concluir o desenho de uma figura (ao soltar o mouse/toque). O servidor persiste a figura e faz o broadcast para todos os clientes da sala.

**Sintaxe Action Cable:**

```js
subscription.perform("draw", payload);
```

**Payload:**

```json
{
  "room_id": "minha-sala",
  "figure_type": "brush",
  "data": {
    "color": "#6366f1",
    "strokeWidth": 5,
    "points": [10, 20, 30, 40, 50, 60]
  }
}
```

| Campo         | Tipo     | Obrigatório | Descrição                                                         |
| ------------- | -------- | ----------- | ----------------------------------------------------------------- |
| `room_id`     | `string` | Sim         | Identificador da sala                                             |
| `figure_type` | `string` | Sim         | `"brush"` \| `"circle"` \| `"rectangle"`                          |
| `data`        | `object` | Sim         | Dados da figura (ver [Estruturas de Dados](#estruturas-de-dados)) |

**Processamento pelo servidor:**

1. Valida presença de `room_id`, `figure_type` e `data`.
2. Busca ou cria a sala no banco de dados.
3. Persiste a figura em PostgreSQL.
4. Invalida o cache Redis da sala.
5. Faz broadcast do evento `new_figure` para todos os clientes do stream.

---

### Evento `new_figure` — Servidor → Todos os Clientes

Transmitido pelo servidor via broadcast para **todos os clientes inscritos na sala** (incluindo o remetente original) após uma figura ser salva com sucesso.

**Payload recebido pelo frontend:**

```json
{
  "event": "new_figure",
  "figure_id": 42,
  "figure_type": "brush",
  "data": {
    "color": "#6366f1",
    "strokeWidth": 5,
    "points": [10, 20, 30, 40, 50, 60]
  }
}
```

| Campo         | Tipo      | Descrição                                 |
| ------------- | --------- | ----------------------------------------- |
| `event`       | `string`  | Tipo do evento (fixo: `"new_figure"`)     |
| `figure_id`   | `integer` | ID da figura persistida no banco          |
| `figure_type` | `string`  | Tipo da figura                            |
| `data`        | `object`  | Dados da figura (mesma estrutura enviada) |

**Processamento pelo frontend:**

- Compara a figura recebida com as figuras pendentes localmente (otimistic update).
- Se houver correspondência, remove da fila de pendentes.
- Adiciona a figura à lista de figuras confirmadas e renderiza no canvas.

---

### Evento `error` — Servidor → Remetente

Enviado **somente ao cliente que causou o erro** (via `transmit`, não broadcast) quando a persistência da figura falha por dados inválidos.

**Payload:**

```json
{
  "event": "error",
  "message": "Validation failed: Figure type is not included in the list"
}
```

| Campo     | Tipo     | Descrição                        |
| --------- | -------- | -------------------------------- |
| `event`   | `string` | Tipo do evento (fixo: `"error"`) |
| `message` | `string` | Mensagem de erro descritiva      |

---

## Diagramas de Sequência

### Entrada na Sala

```
Frontend                   Backend (HTTP)           Redis             PostgreSQL
   │                            │                     │                   │
   │── GET /api/v1/rooms/sala ──►│                     │                   │
   │                            │── GET room:sala:figures ──►│             │
   │                            │                     │ (cache miss)       │
   │                            │◄── nil ─────────────│                   │
   │                            │──────────────────── SELECT figures ─────►│
   │                            │◄──────────────────── figures[] ──────────│
   │                            │── SETEX room:sala:figures 3600 ─────────►│
   │◄── { room, figures[] } ────│                     │                   │
   │                            │                     │                   │
   │ (renderiza canvas)         │                     │                   │
```

---

### Desenho em Tempo Real (multi-cliente)

```
Cliente A           Action Cable Server          Cliente B
   │                       │                        │
   │── subscribe ──────────►│                        │
   │   { channel, room_id } │◄──── subscribe ────────│
   │                       │      { channel, room_id }
   │                       │                        │
   │ (usuário desenha)      │                        │
   │── perform("draw") ────►│                        │
   │   { room_id, figure_type, data }                │
   │                       │── INSERT figure ──► PostgreSQL
   │                       │── DEL room:sala ──► Redis
   │                       │                        │
   │◄── broadcast ──────────│─────── broadcast ──────►│
   │  { event: "new_figure",│  { event: "new_figure", │
   │    figure_id, data }   │    figure_id, data }    │
   │                        │                        │
   │ (confirma figura       │                 (adiciona figura
   │  pendente no canvas)   │                  ao canvas)
```

---

### Reconexão

```
Frontend                  Action Cable            Backend (HTTP)
   │                          │                        │
   │ (perde conexão)          │                        │
   │◄── disconnected() ───────│                        │
   │                          │                        │
   │ (reconecta)              │                        │
   │── subscribe ─────────────►│                        │
   │◄── connected() ──────────│                        │
   │                          │                        │
   │── GET /api/v1/rooms/sala ──────────────────────────►│
   │◄── { room, figures[] } ───────────────────────────│
   │                          │                        │
   │ (limpa pendentes,        │                        │
   │  re-renderiza canvas)    │                        │
```

---

## Estratégia de Cache

O backend adota uma estratégia **cache-aside** com Redis para a leitura de figuras:

```
Leitura (GET /api/v1/rooms/:id):

  Redis HIT  → retorna dados do Redis (sem acesso ao PostgreSQL)
  Redis MISS → lê do PostgreSQL → armazena no Redis (TTL: 3600s) → retorna

Escrita (perform "draw"):

  INSERT no PostgreSQL → DEL chave Redis (invalida o cache)

Próxima leitura após escrita:
  Redis MISS → lê dados atualizados do PostgreSQL → repovoar cache
```

**Chave de cache:**

```
room:<identifier>:figures
```

Exemplo: `room:minha-sala:figures`
