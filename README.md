# Drawpad

> Quadro colaborativo em tempo real.

---

## Sobre o Projeto

**Drawpad** é uma aplicação web colaborativa de quadro branco em tempo real, inspirada no [Dontpad](https://dontpad.com/). Basta digitar o nome de uma sala e começar a desenhar. Qualquer pessoa com o mesmo identificador de sala pode se juntar e colaborar instantaneamente, sem necessidade de cadastro.

O foco é ser **rápido**, **simples** e **colaborativo**, com suporte a múltiplas conexões simultâneas e sincronização em tempo real via WebSocket.

---

## Funcionalidades

- **Acesso por sala**: entre em qualquer sala digitando seu identificador, sem login
- **Ferramentas de desenho**: pincel livre, círculos e retângulos
- **Sincronização em tempo real** alterações propagadas instantaneamente para todos na sala via WebSocket
- **Persistência de dados** os desenhos ficam salvos no banco de dados e em cache

---

## Arquitetura

### Diagrama de Fluxo

O diagrama abaixo descreve os principais componentes e a comunicação entre eles:

![Diagrama de Arquitetura Drawpad](assets/drawpad.drawio.png)

### Componentes

| Componente         | Responsabilidade                                              |
| ------------------ | ------------------------------------------------------------- |
| **Frontend**       | Interface do canvas, ferramentas de desenho, WebSocket client |
| **Servidor**       | API HTTP + WebSocket server, roteamento de eventos por sala   |
| **Redis (Cache)**  | Armazenamento rápido dos desenhos de cada sala                |
| **Banco de Dados** | Persistência permanente das figuras                           |

---

## Fluxos de Comunicação

### 1. Fluxo Geral (rascunho)

```
Cliente → digita o ID da sala → entra na sala
         → GET /sala/:id       → Servidor consulta Redis
                                → (miss) consulta Banco de Dados
         → carrega desenhos    → inicia conexão WebSocket
         → ação no canvas      → evento WS → Servidor
                                → propaga para todos na sala
                                → salva no Redis + Banco de Dados
```

---

### 2. Fluxo de Entrada na Sala

```
1. Cliente acessa o site e informa o ID da sala
2. Frontend envia requisição HTTP para carregar a sala
3. Servidor valida a existência da sala
4. Servidor consulta os desenhos no cache Redis
5. (Cache miss) Servidor consulta o banco de dados
6. Servidor retorna todos os desenhos existentes
7. Frontend renderiza os desenhos no canvas
```

---

### 3. Fluxo de Sincronização em Tempo Real

```
1. Após carregar os dados iniciais, cliente inicia conexão WebSocket e é liberado para desenhar
2. Servidor associa o cliente à sala correspondente
3. Conexão WebSocket permanece ativa para troca de eventos
4. Todos os clientes na mesma sala recebem atualizações instantâneas
```

---

### 4. Fluxo de Criação de Figura

```
1. Usuário desenha uma figura no canvas
2. Cliente envia evento WebSocket com os dados da figura
3. Servidor valida os dados recebidos
4. Servidor salva a figura no cache Redis
5. Servidor persiste a figura no banco de dados
6. Servidor propaga o evento para todos os clientes da sala
7. Clientes atualizam o canvas em tempo real
```

---

### 5. Fluxo de Reconexão

```
1. Cliente perde conexão com o servidor
2. Frontend tenta reconectar automaticamente
3. Após reconexão, cliente solicita o estado atual da sala
4. Servidor retorna os dados mais recentes:
   → Cache hit  → retorna do Redis
   → Cache miss → retorna do banco de dados
5. Cliente sincroniza o canvas local
```

---

## Tecnologias Utilizadas

| Camada         | Tecnologia |
| -------------- | ---------- |
| WebSocket      | Socket.IO  |
| Cache          | Redis      |
| Banco de Dados | PostgreSQL |
| Backend        | Ruby       |
| Frontend       | ReactJS    |

---

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
