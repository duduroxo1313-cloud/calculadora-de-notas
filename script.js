// Cada aluno: { nome: "Ana", notas: [8, 6.5] }
const alunos = [];
let calculado = false;
const el = (id) => document.getElementById(id);
const media = (notas) => notas.reduce((soma, n) => soma + n, 0) / notas.length;

// Atualiza a lista, a tabela, o gráfico e os cartões
function atualizar() {
  const todas = alunos.flatMap((a) => a.notas);
  const comNotas = alunos.filter((a) => a.notas.length > 0);
  const selecionado = el("alunoSelect").value;
  el("alunoSelect").innerHTML = '<option value="">Selecione um aluno</option>';
  el("tabela").innerHTML = "";
  el("grafico").innerHTML = "";
  alunos.forEach((a, i) => {
    const m = calculado && a.notas.length > 0 ? media(a.notas) : null;
    const acima = a.notas.filter((n) => n > 7);
    el("alunoSelect").innerHTML += `<option value="${i}">${a.nome}</option>`;
    el("tabela").innerHTML += `<tr><td>${a.nome}</td><td>${a.notas.join(", ") || "-"}</td>
      <td>${m === null ? "-" : m.toFixed(2)}</td><td>${acima.join(", ") || "-"}</td></tr>`;
    if (m !== null) {
      el("grafico").innerHTML += `<div class="coluna"><span>${m.toFixed(2)}</span>
        <div class="trilho"><div class="barra" style="height:${m * 10}%"></div></div><small>${a.nome}</small></div>`;
    }
  });
  el("alunoSelect").value = alunos[selecionado] ? selecionado : "";
  el("totalAlunos").textContent = alunos.length;
  el("totalNotas").textContent = todas.length;
  el("totalAcima").textContent = todas.filter((n) => n > 7).length;
  el("mediaTurma").textContent =
    calculado && comNotas.length > 0 ? media(comNotas.map((a) => media(a.notas))).toFixed(2) : "-";
}

// Cadastra um aluno novo na lista
el("btnCadastrar").addEventListener("click", () => {
  const nome = el("nomeAluno").value.trim();
  const existe = alunos.some((a) => a.nome.toLowerCase() === nome.toLowerCase());
  let erro = "";
  if (nome === "") erro = "Digite o nome do aluno.";
  if (existe) erro = "Esse aluno já está cadastrado.";
  el("msgAluno").textContent = erro;
  if (erro) return;
  alunos.push({ nome: nome, notas: [] });
  el("nomeAluno").value = "";
  atualizar();
  el("alunoSelect").value = alunos.length - 1;
});

// Adiciona uma nota ao aluno selecionado
el("btnAdicionar").addEventListener("click", () => {
  const aluno = alunos[el("alunoSelect").value];
  const nota = parseFloat(el("nota").value);
  const erro = !aluno || isNaN(nota) || nota < 0 || nota > 10;
  el("mensagem").textContent = erro ? "Selecione um aluno e digite uma nota de 0 a 10." : "";
  if (erro) return;
  aluno.notas.push(nota);
  calculado = false;
  el("nota").value = "";
  atualizar();
});

el("btnCalcular").addEventListener("click", () => {
  calculado = true;
  atualizar();
});
el("btnLimpar").addEventListener("click", () => {
  alunos.length = 0;
  calculado = false;
  atualizar();
});

// Tecla Enter: aciona o mesmo botão que o clique
el("nomeAluno").addEventListener("keydown", (e) => {
  if (e.key === "Enter") el("btnCadastrar").click();
});
el("nota").addEventListener("keydown", (e) => {
  if (e.key === "Enter") el("btnAdicionar").click();
});