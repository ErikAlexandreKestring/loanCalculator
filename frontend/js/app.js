const API_URL = "http://localhost:3000/calcular";

const form = {
  dataInicial: document.getElementById("dataInicial"),
  dataFinal: document.getElementById("dataFinal"),
  primeiroPagamento: document.getElementById("primeiroPagamento"),
  valorEmprestimo: document.getElementById("valorEmprestimo"),
  taxaJuros: document.getElementById("taxaJuros"),
};

const btnCalcular = document.getElementById("btnCalcular");
const alertError = document.getElementById("alertError");
const tableCard = document.getElementById("tableCard");
const tbody = document.getElementById("resultBody");
const chipParcelas = document.getElementById("chipParcelas");
const chipAmort = document.getElementById("chipAmort");

const fmt = (v) => Number(v).toLocaleString("pt-BR", {minimumFractionDigits: 2, maximumFractionDigits: 2});

const fmtCell = (v) => (Math.abs(v) < 0.005 ? `<span class="val-zero">0,00</span>` : fmt(v));

function todosPreenchidos() {
  return Object.values(form).every((el) => el.value.trim() !== "");
}

Object.values(form).forEach((el) => {
  el.addEventListener("input", () => {
    btnCalcular.disabled = !todosPreenchidos();
    el.classList.remove("error");
    const err = el.closest(".field").querySelector(".field-error");
    if (err) {
      err.textContent = "";
      err.classList.remove("show");
    }
    hideAlert();
  });
});

function showAlert(msg) {
  alertError.textContent = "⚠ " + msg;
  alertError.classList.add("show");
}
function hideAlert() {
  alertError.classList.remove("show");
}

btnCalcular.addEventListener("click", async () => {
  hideAlert();

  let ok = true;
  Object.values(form).forEach((el) => {
    if (!el.value.trim()) {
      el.classList.add("error");
      const err = el.closest(".field").querySelector(".field-error");
      if (err) {
        err.textContent = "Campo obrigatório";
        err.classList.add("show");
      }
      ok = false;
    }
  });
  if (!ok) return;

  btnCalcular.disabled = true;
  btnCalcular.classList.add("loading");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        dataInicial: form.dataInicial.value,
        dataFinal: form.dataFinal.value,
        primeiroPagamento: form.primeiroPagamento.value,
        valorEmprestimo: form.valorEmprestimo.value,
        taxaJuros: form.taxaJuros.value,
      }),
    });
    const data = await res.json();
    if (data.erro) {
      showAlert(data.erro);
      tableCard.classList.remove("show");
      return;
    }
    renderTabela(data);
  } catch {
    showAlert("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
  } finally {
    btnCalcular.disabled = false;
    btnCalcular.classList.remove("loading");
  }
});

function renderTabela({linhas, nParcelas, amortizacaoMensal}) {
  tbody.innerHTML = "";

  linhas.forEach((l) => {
    const tr = document.createElement("tr");
    if (l.consolidada) tr.classList.add("row-parcela");

    tr.innerHTML = `
      <td>${l.data}</td>
      <td>${l.valorEmprestimo > 0 ? fmt(l.valorEmprestimo) : '<span class="val-zero">0,00</span>'}</td>
      <td>${fmtCell(l.saldoDevedor)}</td>
      <td class="sep-parcela" style="text-align:center">${l.consolidada ? `<span class="badge-parcela">${l.consolidada}</span>` : ""}</td>
      <td>${fmtCell(l.total)}</td>
      <td class="sep-principal">${fmtCell(l.amortizacao)}</td>
      <td>${fmtCell(l.saldo)}</td>
      <td class="sep-juros">${fmtCell(l.provisao)}</td>
      <td>${fmtCell(l.acumulado)}</td>
      <td>${fmtCell(l.pago)}</td>
    `;
    tbody.appendChild(tr);
  });

  chipParcelas.textContent = `${nParcelas} parcelas`;
  chipAmort.textContent = `Amortização mensal: R$ ${fmt(amortizacaoMensal)}`;
  chipParcelas.classList.add("show");
  chipAmort.classList.add("show");

  tableCard.classList.add("show");
  tableCard.scrollIntoView({behavior: "smooth", block: "start"});
}
