// CRUD de tarefas — Node.js puro (sem dependencias externas).
// Os dados ficam em um arquivo JSON dentro de /app/data (volume do Docker).
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "tarefas.json");
const PUBLIC_DIR = path.join(__dirname, "public");

fs.mkdirSync(DATA_DIR, { recursive: true });

function carregar() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function salvar(tarefas) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tarefas, null, 2));
}

function responder(res, status, corpo) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(corpo));
}

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    let texto = "";
    req.on("data", (parte) => {
      texto += parte;
      if (texto.length > 1e5) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(texto ? JSON.parse(texto) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
};

function servirArquivo(req, res) {
  const alvo = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const caminho = path.normalize(path.join(PUBLIC_DIR, alvo));
  if (!caminho.startsWith(PUBLIC_DIR) || !fs.existsSync(caminho)) {
    res.writeHead(404);
    return res.end("Nao encontrado");
  }
  res.writeHead(200, { "Content-Type": TIPOS[path.extname(caminho)] || "text/plain" });
  fs.createReadStream(caminho).pipe(res);
}

const servidor = http.createServer(async (req, res) => {
  const url = req.url.split("?")[0];
  const m = url.match(/^\/api\/tarefas(?:\/(\d+))?$/);
  if (!m) return servirArquivo(req, res);

  const id = m[1] ? Number(m[1]) : null;
  const tarefas = carregar();

  try {
    // READ (lista)
    if (req.method === "GET" && id === null) return responder(res, 200, tarefas);

    // CREATE
    if (req.method === "POST" && id === null) {
      const { titulo } = await lerCorpo(req);
      if (!titulo || !String(titulo).trim())
        return responder(res, 400, { erro: "Informe o titulo da tarefa." });
      const nova = {
        id: tarefas.reduce((max, t) => Math.max(max, t.id), 0) + 1,
        titulo: String(titulo).trim(),
        concluida: false,
        criadaEm: new Date().toISOString(),
      };
      tarefas.push(nova);
      salvar(tarefas);
      return responder(res, 201, nova);
    }

    const tarefa = tarefas.find((t) => t.id === id);
    if (id !== null && !tarefa) return responder(res, 404, { erro: "Tarefa nao encontrada." });

    // UPDATE
    if (req.method === "PUT" && id !== null) {
      const dados = await lerCorpo(req);
      if (dados.titulo !== undefined) {
        if (!String(dados.titulo).trim())
          return responder(res, 400, { erro: "O titulo nao pode ficar vazio." });
        tarefa.titulo = String(dados.titulo).trim();
      }
      if (dados.concluida !== undefined) tarefa.concluida = Boolean(dados.concluida);
      salvar(tarefas);
      return responder(res, 200, tarefa);
    }

    // DELETE
    if (req.method === "DELETE" && id !== null) {
      salvar(tarefas.filter((t) => t.id !== id));
      return responder(res, 200, { ok: true });
    }

    responder(res, 405, { erro: "Metodo nao permitido." });
  } catch {
    responder(res, 400, { erro: "Requisicao invalida." });
  }
});

servidor.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
