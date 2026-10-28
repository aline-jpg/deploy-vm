# Deploy automático em VM — CRUD de Tarefas

Trabalho 2 de DevOps Avançado — UniALFA

## Integrantes

- Mihari Barbosa da Silva (RA 260266)
- Aline Eduarda Morais de Rezende (RA 250279)

## Sobre o projeto

Aplicação CRUD de **tarefas**: é possível criar, listar, editar, marcar como concluída e excluir tarefas pelo navegador. Os dados ficam salvos em um arquivo JSON dentro de um volume do Docker, então não se perdem quando o container é recriado no deploy.

**Tecnologias utilizadas:**

- Node.js 20 (servidor HTTP e API REST, sem dependências externas)
- HTML, CSS e JavaScript puro (interface)
- Docker e Docker Compose (execução na VM)
- GitHub Actions com Runner self-hosted (deploy automático)
- Ubuntu Server em máquina virtual

**Rotas da API:**

| Método | Rota | Ação |
|--------|------|------|
| GET | `/api/tarefas` | Lista as tarefas |
| POST | `/api/tarefas` | Cria uma tarefa |
| PUT | `/api/tarefas/:id` | Edita o título ou marca como concluída |
| DELETE | `/api/tarefas/:id` | Exclui a tarefa |

## Como o Runner local e o deploy automático funcionam

**Runner self-hosted:** é um programa do GitHub Actions instalado dentro da própria VM. Ele fica conectado ao GitHub aguardando trabalhos. Quando um workflow pede `runs-on: self-hosted`, o GitHub entrega o job para esse Runner, que executa os comandos diretamente na VM. Ele foi instalado em *Settings → Actions → Runners* do repositório e roda como serviço (`svc.sh`), iniciando junto com a VM.

**Deploy automático:** o arquivo `.github/workflows/deploy.yml` é disparado a cada `push` na branch `main`. O Runner da VM então:

1. baixa o código atualizado do repositório (`actions/checkout`);
2. executa `docker compose up -d --build`, que reconstrói a imagem e recria o container com a nova versão;
3. remove imagens antigas (`docker image prune -f`).

Assim, basta fazer `git push` para a nova versão aparecer no navegador, sem nenhum deploy manual.

## Como executar e acessar a aplicação na VM

**Pré-requisitos na VM:** Ubuntu Server com Docker e Docker Compose instalados, rede em modo Bridge e o Runner do GitHub Actions registrado e online.

**Acesso:** pelo navegador de qualquer computador da rede do laboratório:

```
http://IP_DA_VM
```

Exemplo: `http://192.168.0.50` (a aplicação usa a porta 80). Para descobrir o IP, rode `ip a` na VM.

**Execução manual (sem o Runner), se necessário:**

```bash
git clone <URL_DO_REPOSITORIO>
cd <PASTA_DO_REPOSITORIO>
docker compose up -d --build
```

**Para testar localmente sem Docker:** `cd app && node server.js` e acesse `http://localhost:3000`.

## Demonstração do deploy

1. Print do Runner com status **Idle** em *Settings → Actions → Runners*.
2. Print da aplicação funcionando antes da alteração.
3. Alteração do texto da página (por exemplo, o título em `app/public/index.html`), `git commit` e `git push`.
4. Print do workflow concluído (verde) na aba **Actions**.
5. Print da aplicação já com a nova versão no navegador.
