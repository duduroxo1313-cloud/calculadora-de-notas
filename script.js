// PERSISTÊNCIA DE DADOS NO NAVEGADOR
const STORAGE_KEY = "calculadora_alunos_dados";
let alunos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
  { nome: "Ana Silva", notas: [8.5, 9.0], media: "8,75", acima: [8.5, 9.0] },
  { nome: "João Pedro", notas: [6.0, 5.5], media: "5,75", acima: [] },
];

function salvarDados() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alunos));
}

// ELEMENTOS DE INICIALIZAÇÃO E PERFIL
const telaInicio = document.getElementById("tela-inicio");
const formInicio = document.getElementById("form-inicio");
const campoNomeUsuario = document.getElementById("nome-usuario");
const campoMateria = document.getElementById("materia");
const appPrincipal = document.getElementById("app-principal");
const badgePerfil = document.getElementById("badge-perfil");
const badgeMateria = document.getElementById("badge-materia");
const btnTrocarPerfil = document.getElementById("btn-trocar-perfil");
const subtituloTopo = document.getElementById("subtitulo-topo");
const subtituloTabela = document.getElementById("subtitulo-tabela");

// ELEMENTOS PRINCIPAIS
const campoNome = document.getElementById("nome-aluno");
const campoNota = document.getElementById("nota");
const sugestoes = document.getElementById("sugestoes");
const tabela = document.getElementById("tabela-alunos");
const grafico = document.getElementById("grafico");
const elMensagem = document.getElementById("mensagem");
const btnAdicionar = document.getElementById("btn-adicionar");
const btnCalcular = document.getElementById("btn-calcular");
const btnLimpar = document.getElementById("btn-limpar");
const elTotalAlunos = document.getElementById("total-alunos");
const elTotalNotas = document.getElementById("total-notas");
const elTotalAcima = document.getElementById("total-acima");
const elMediaTurma = document.getElementById("media-turma");

let mediaTurma = null;
let perfilAtual = "Professor";
let nomeUsuario = "";
let materiaAtual = "";

// ENTRADA NO SISTEMA E CONFIGURAÇÃO DO PERFIL
formInicio.addEventListener("submit", function (e) {
  e.preventDefault();

  perfilAtual = document.querySelector('input[name="perfil"]:checked').value;
  nomeUsuario = campoNomeUsuario.value.trim();
  materiaAtual = campoMateria.value.trim();

  if (!nomeUsuario || !materiaAtual) {
    alert("Por favor, preencha seu nome e a matéria.");
    return;
  }

  badgePerfil.textContent =
    (perfilAtual === "Professor" ? " Prof.: " : " Aluno: ") + nomeUsuario;
  badgeMateria.textContent = "📚 Matéria: " + materiaAtual;

  if (perfilAtual === "Aluno") {
    document.body.classList.add("modo-aluno");
    subtituloTopo.textContent =
      "Acompanhe as notas, médias e o desempenho da disciplina de " +
      materiaAtual +
      ".";
    subtituloTabela.textContent =
      "Abaixo estão registradas as notas e médias lançadas.";

    calcularMediaSilencioso();
  } else {
    document.body.classList.remove("modo-aluno");
    subtituloTopo.textContent =
      "Cadastre alunos e suas notas, calcule a média de cada um e descubra quais notas ficaram acima de 7.";
    subtituloTabela.textContent =
      'Depois de lançar as notas, clique em "Calcular média".';
  }

  telaInicio.style.display = "none";
  appPrincipal.classList.remove("oculto-app");

  desenharTabela();
});

btnTrocarPerfil.addEventListener("click", function () {
  telaInicio.style.display = "flex";
  appPrincipal.classList.add("oculto-app");
});

function todasAsNotas() {
  return alunos.reduce(function (lista, aluno) {
    return lista.concat(aluno.notas);
  }, []);
}

function atualizarResumo() {
  const todas = todasAsNotas();
  elTotalAlunos.textContent = alunos.length;
  elTotalNotas.textContent = todas.length;
  elTotalAcima.textContent = todas.filter(function (nota) {
    return nota > 7;
  }).length;
  elMediaTurma.textContent = mediaTurma === null ? "–" : mediaTurma;
}

function mostrarMensagem(texto, tipo) {
  if (elMensagem) {
    elMensagem.textContent = texto;
    elMensagem.className = "mensagem" + (tipo ? " " + tipo : "");
  }
}

function formatar(numero) {
  return String(numero).replace(".", ",");
}

function faixa(valor) {
  if (valor > 7) return "alta";
  if (valor >= 5) return "media";
  return "baixa";
}

function criarNotas(valores) {
  const celula = document.createElement("td");
  valores.forEach(function (valor) {
    const span = document.createElement("span");
    span.className = "nota " + faixa(valor);
    span.textContent = formatar(valor);
    celula.appendChild(span);
  });
  return celula;
}

function criarTexto(texto, classe) {
  const celula = document.createElement("td");
  celula.textContent = texto;
  if (classe) celula.className = classe;
  return celula;
}

function desenharGrafico() {
  grafico.innerHTML = "";

  const calculados = alunos.filter(function (aluno) {
    return aluno.media !== null;
  });

  if (calculados.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "grafico-vazio";
    vazio.textContent =
      perfilAtual === "Professor"
        ? 'Adicione notas e clique em "Calcular média" para ver o gráfico.'
        : "Nenhuma média disponível para exibir no gráfico.";
    grafico.appendChild(vazio);
    return;
  }

  const area = document.createElement("div");
  area.className = "grafico-area";

  [0, 5, 10].concat(7).forEach(function (valor) {
    const linha = document.createElement("div");
    linha.className = "linha-grade" + (valor === 7 ? " sete" : "");
    linha.style.bottom = valor * 10 + "%";
    const rotulo = document.createElement("span");
    rotulo.textContent = valor;
    linha.appendChild(rotulo);
    area.appendChild(linha);
  });

  const barras = document.createElement("div");
  barras.className = "barras";
  const nomes = document.createElement("div");
  nomes.className = "nomes";

  calculados.forEach(function (aluno) {
    const valor = Number(aluno.media.replace(",", "."));

    const coluna = document.createElement("div");
    coluna.className = "coluna";
    const barra = document.createElement("div");
    barra.className = "barra " + faixa(valor);
    barra.style.height = valor * 10 + "%";
    barra.title = aluno.nome + ": " + aluno.media;
    const rotuloValor = document.createElement("span");
    rotuloValor.className = "valor";
    rotuloValor.textContent = aluno.media;
    barra.appendChild(rotuloValor);
    coluna.appendChild(barra);
    barras.appendChild(coluna);

    const nome = document.createElement("div");
    nome.className = "coluna";
    nome.textContent = aluno.nome;
    nome.title = aluno.nome;
    nomes.appendChild(nome);
  });

  area.appendChild(barras);
  grafico.appendChild(area);
  grafico.appendChild(nomes);
}

function desenharTabela() {
  tabela.innerHTML = "";
  sugestoes.innerHTML = "";
  atualizarResumo();
  desenharGrafico();

  if (alunos.length === 0) {
    const linha = document.createElement("tr");
    const celula = criarTexto("Nenhum aluno cadastrado no momento.", "vazio");
    celula.colSpan = perfilAtual === "Aluno" ? 4 : 5;
    linha.appendChild(celula);
    tabela.appendChild(linha);
    return;
  }

  alunos.forEach(function (aluno, indice) {
    const linha = document.createElement("tr");

    // Destaca a linha do próprio aluno se ele estiver consultando
    if (
      perfilAtual === "Aluno" &&
      aluno.nome.toLowerCase() === nomeUsuario.toLowerCase()
    ) {
      linha.className = "aluno-destaque";
    }

    linha.appendChild(criarTexto(aluno.nome, "aluno"));
    linha.appendChild(criarNotas(aluno.notas));

    if (aluno.media === null) {
      linha.appendChild(criarTexto("–", "pendente"));
      linha.appendChild(criarTexto("–", "pendente"));
    } else {
      linha.appendChild(criarTexto(aluno.media, "media-valor"));
      if (aluno.acima.length > 0) {
        linha.appendChild(criarNotas(aluno.acima));
      } else {
        linha.appendChild(criarTexto("Nenhuma", "pendente"));
      }
    }

    // Ações disponíveis apenas para o Professor
    if (perfilAtual === "Professor") {
      const acao = document.createElement("td");
      acao.className = "coluna-acao";
      const remover = document.createElement("button");
      remover.type = "button";
      remover.className = "remover";
      remover.textContent = "Remover";
      remover.setAttribute("aria-label", "Remover " + aluno.nome);
      remover.addEventListener("click", function () {
        alunos.splice(indice, 1);
        mediaTurma = null;
        salvarDados();
        desenharTabela();
        mostrarMensagem("Aluno " + aluno.nome + " removido.");
      });
      acao.appendChild(remover);
      linha.appendChild(acao);
    }

    tabela.appendChild(linha);

    const opcao = document.createElement("option");
    opcao.value = aluno.nome;
    sugestoes.appendChild(opcao);
  });
}

function adicionarNota() {
  const nome = campoNome.value.trim();
  const texto = campoNota.value.trim().replace(",", ".");
  const valor = Number(texto);

  if (nome === "") {
    mostrarMensagem("Digite o nome do aluno.", "erro");
    campoNome.focus();
    return;
  }
  if (texto === "" || Number.isNaN(valor)) {
    mostrarMensagem("Digite uma nota válida.", "erro");
    campoNota.focus();
    return;
  }
  if (valor < 0 || valor > 10) {
    mostrarMensagem("A nota deve estar entre 0 e 10.", "erro");
    campoNota.focus();
    return;
  }

  let aluno = alunos.find(function (a) {
    return a.nome.toLowerCase() === nome.toLowerCase();
  });
  if (!aluno) {
    aluno = { nome: nome, notas: [], media: null, acima: [] };
    alunos.push(aluno);
  }

  aluno.notas.push(valor);
  aluno.media = null;
  mediaTurma = null;
  aluno.acima = [];

  salvarDados();
  desenharTabela();
  mostrarMensagem(
    "Nota " + formatar(valor) + " adicionada para " + aluno.nome + ".",
    "ok",
  );
  campoNota.value = "";
  campoNota.focus();
}

function calcularMediaSilencioso() {
  if (alunos.length === 0) return;

  alunos.forEach(function (aluno) {
    const soma = aluno.notas.reduce(function (acumulador, nota) {
      return acumulador + nota;
    }, 0);
    const media = soma / aluno.notas.length;

    aluno.acima = aluno.notas.filter(function (nota) {
      return nota > 7;
    });

    aluno.media = media.toFixed(2).replace(".", ",");
  });

  const todas = todasAsNotas();
  if (todas.length > 0) {
    const somaTotal = todas.reduce(function (acumulador, nota) {
      return acumulador + nota;
    }, 0);
    mediaTurma = (somaTotal / todas.length).toFixed(2).replace(".", ",");
  }

  salvarDados();
}

function calcularMedia() {
  if (alunos.length === 0) {
    mostrarMensagem("Adicione pelo menos um aluno com uma nota.", "erro");
    campoNome.focus();
    return;
  }

  calcularMediaSilencioso();
  desenharTabela();
  mostrarMensagem("Médias calculadas com sucesso.", "ok");
}

function limparTudo() {
  alunos.length = 0;
  mediaTurma = null;
  salvarDados();
  desenharTabela();
  mostrarMensagem("Todos os alunos foram removidos.");
  campoNome.focus();
}

// EVENT LISTENERS
btnAdicionar.addEventListener("click", adicionarNota);
btnCalcular.addEventListener("click", calcularMedia);
btnLimpar.addEventListener("click", limparTudo);

[campoNome, campoNota].forEach(function (campo) {
  campo.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") adicionarNota();
  });
});

// Inicialização das médias existentes
calcularMediaSilencioso();
