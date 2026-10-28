const lista = document.getElementById("lista");
const vazio = document.getElementById("vazio");
const aviso = document.getElementById("aviso");
const form = document.getElementById("form-nova");
const campo = document.getElementById("titulo");

async function api(caminho, opcoes = {}) {
  const resp = await fetch(caminho, {
    headers: { "Content-Type": "application/json" },
    ...opcoes,
  });
  const dados = await resp.json();
  if (!resp.ok) throw new Error(dados.erro || "Algo deu errado.");
  return dados;
}

function mostrarErro(e) {
  aviso.textContent = e.message;
}

async function carregar() {
  try {
    aviso.textContent = "";
    desenhar(await api("/api/tarefas"));
  } catch (e) {
    mostrarErro(e);
  }
}

function desenhar(tarefas) {
  lista.innerHTML = "";
  vazio.hidden = tarefas.length > 0;

  for (const t of tarefas) {
    const li = document.createElement("li");
    if (t.concluida) li.classList.add("feita");

    const caixa = document.createElement("input");
    caixa.type = "checkbox";
    caixa.checked = t.concluida;
    caixa.setAttribute("aria-label", `Concluir: ${t.titulo}`);
    caixa.onchange = () => atualizar(t.id, { concluida: caixa.checked });

    const texto = document.createElement("span");
    texto.className = "texto";
    texto.textContent = t.titulo;

    const editar = document.createElement("button");
    editar.className = "secundario";
    editar.textContent = "Editar";
    editar.onclick = () => editarTitulo(li, t, texto, editar);

    const excluir = document.createElement("button");
    excluir.className = "secundario perigo";
    excluir.textContent = "Excluir";
    excluir.onclick = () => remover(t.id);

    li.append(caixa, texto, editar, excluir);
    lista.appendChild(li);
  }
}

function editarTitulo(li, tarefa, texto, botao) {
  const entrada = document.createElement("input");
  entrada.type = "text";
  entrada.className = "editar";
  entrada.value = tarefa.titulo;
  entrada.maxLength = 120;
  li.replaceChild(entrada, texto);
  entrada.focus();
  botao.textContent = "Salvar";
  botao.onclick = () => atualizar(tarefa.id, { titulo: entrada.value });
  entrada.onkeydown = (ev) => {
    if (ev.key === "Enter") atualizar(tarefa.id, { titulo: entrada.value });
    if (ev.key === "Escape") carregar();
  };
}

async function atualizar(id, dados) {
  try {
    await api(`/api/tarefas/${id}`, { method: "PUT", body: JSON.stringify(dados) });
    carregar();
  } catch (e) {
    mostrarErro(e);
  }
}

async function remover(id) {
  try {
    await api(`/api/tarefas/${id}`, { method: "DELETE" });
    carregar();
  } catch (e) {
    mostrarErro(e);
  }
}

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  try {
    await api("/api/tarefas", { method: "POST", body: JSON.stringify({ titulo: campo.value }) });
    campo.value = "";
    carregar();
  } catch (e) {
    mostrarErro(e);
  }
});

carregar();
