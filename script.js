
const alunos = [];

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
  elMensagem.textContent = texto;
  elMensagem.className = "mensagem" + (tipo ? " " + tipo : "");
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
    vazio.textContent = "Adicione notas e clique em \"Calcular média\" para ver o gráfico.";
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
    const celula = criarTexto("Nenhum aluno cadastrado. Preencha o nome e a nota acima.", "vazio");
    celula.colSpan = 5;
    linha.appendChild(celula);
    tabela.appendChild(linha);
    return;
  }

  alunos.forEach(function (aluno, indice) {
    const linha = document.createElement("tr");
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

    const acao = document.createElement("td");
    const remover = document.createElement("button");
    remover.type = "button";
    remover.className = "remover";
    remover.textContent = "Remover";
    remover.setAttribute("aria-label", "Remover " + aluno.nome);
    remover.addEventListener("click", function () {
      alunos.splice(indice, 1);
      mediaTurma = null;
      desenharTabela();
      mostrarMensagem("Aluno " + aluno.nome + " removido.");
    });
    acao.appendChild(remover);
    linha.appendChild(acao);
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

  desenharTabela();
  mostrarMensagem("Nota " + formatar(valor) + " adicionada para " + aluno.nome + ".", "ok");
  campoNota.value = "";
  campoNota.focus();
}

function calcularMedia() {
  if (alunos.length === 0) {
    mostrarMensagem("Adicione pelo menos um aluno com uma nota.", "erro");
    campoNome.focus();
    return;
  }

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
  const somaTotal = todas.reduce(function (acumulador, nota) {
    return acumulador + nota;
  }, 0);
  mediaTurma = (somaTotal / todas.length).toFixed(2).replace(".", ",");

  desenharTabela();
  mostrarMensagem("Médias calculadas.", "ok");
}

function limparTudo() {
  alunos.length = 0;
  mediaTurma = null;
  desenharTabela();
  mostrarMensagem("Todos os alunos foram removidos.");
  campoNome.focus();
}

btnAdicionar.addEventListener("click", adicionarNota);
btnCalcular.addEventListener("click", calcularMedia);
btnLimpar.addEventListener("click", limparTudo);

[campoNome, campoNota].forEach(function (campo) {
  campo.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") adicionarNota();
  });
});

desenharTabela();