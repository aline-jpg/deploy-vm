# Deploy automático em VM — CRUD de Tarefas

Trabalho 2 de DevOps Avançado — UniALFA

## Integrantes

- Mihari Barbosa da Silva (RA 260266)
- Aline Eduarda Morais de Rezende (RA 250279)

## Sobre o projeto

Aplicação CRUD de **tarefas**: pelo navegador é possível criar, listar, editar, marcar como concluída e excluir tarefas. Os dados ficam salvos em um arquivo JSON dentro de um volume do Docker, então não se perdem quando o container é recriado a cada deploy.

**Tecnologias utilizadas:**

- Node.js 20 (servidor HTTP e API REST, sem dependências externas)
- HTML, CSS e JavaScript puro (interface)
- Docker e Docker Compose (execução da aplicação na VM)
- GitHub Actions com Runner self-hosted (deploy automático)
- Ubuntu Server em máquina virtual (VirtualBox)

**Rotas da API:**

| Método | Rota | Ação |
|--------|------|------|
| GET | `/api/tarefas` | Lista as tarefas |
| POST | `/api/tarefas` | Cria uma tarefa |
| PUT | `/api/tarefas/:id` | Edita o título ou marca como concluída |
| DELETE | `/api/tarefas/:id` | Exclui a tarefa |

**Estrutura do repositório:**

```
├── .github/workflows/deploy.yml   # workflow do deploy automático
├── app/
│   ├── server.js                  # servidor e API
│   ├── package.json
│   └── public/                    # interface (index.html, style.css, app.js)
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Como o Runner local e o deploy automático funcionam

**Runner self-hosted:** é um programa do GitHub Actions instalado dentro da própria VM. Ele fica conectado ao GitHub aguardando trabalhos. Quando um workflow usa `runs-on: self-hosted`, o GitHub entrega o job para esse Runner, que executa os comandos diretamente na VM, e não nos servidores do GitHub. Ele foi registrado em *Settings → Actions → Runners* do repositório e roda como serviço (`svc.sh`), iniciando junto com a VM. O usuário que executa o Runner pertence ao grupo `docker`, para poder subir os containers.

**Deploy automático:** o arquivo `.github/workflows/deploy.yml` é disparado a cada `push` na branch `main`. O Runner da VM então:

1. baixa o código atualizado do repositório (`actions/checkout`);
2. executa `docker compose up -d --build`, que reconstrói a imagem e recria o container com a nova versão;
3. remove imagens antigas (`docker image prune -f`).

Dessa forma, basta fazer um commit na `main` para a nova versão aparecer no navegador, sem nenhum deploy manual.

## Como executar e acessar a aplicação na VM

**Ambiente da VM:** Ubuntu Server no VirtualBox, com Docker e Docker Compose instalados e o Runner do GitHub Actions registrado e online (status *Idle*).

**Rede:** a VM usa rede **NAT** com redirecionamento de portas no VirtualBox:

| Porta no computador (host) | Porta na VM | Uso |
|---|---|---|
| 8080 | 80 | Aplicação web |
| 2222 | 22 | Acesso por SSH |

**Acesso à aplicação:** com a VM ligada, abra no navegador do computador que hospeda a VM:

```
http://localhost:8080
```

Dentro da VM a aplicação responde na porta 80 (`http://IP_DA_VM`, onde o IP aparece em `ip a`).

**Acesso à VM por SSH:**

```bash
ssh -p 2222 vagrant@127.0.0.1
```

**Execução manual (sem o Runner), se necessário:**

```bash
git clone https://github.com/aline-jpg/devops-deploy-vm.git
cd devops-deploy-vm
docker compose up -d --build
```

**Teste local sem Docker:** `cd app && node server.js` e acesse `http://localhost:3000`.

## Demonstração do deploy automático

1. **Runner online:** *Settings → Actions → Runners* mostrando o Runner com status **Idle**.
2. **Antes da alteração:** aplicação funcionando em `http://localhost:8080` com o texto original da página.
3. **Alteração:** mudança do texto do título/versão em `app/public/index.html`, seguida de commit na `main`.
4. **Workflow executado:** aba **Actions** com o job `deploy` concluído com sucesso (verde).
5. **Depois da alteração:** a mesma página, atualizada no navegador, sem nenhum comando manual na VM.

(Prints da demonstração na pasta `prints/` do repositório.)
