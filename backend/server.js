const http = require("http");
const url = require("url");

const PORT = 3000;

function parseDate(str) {
  if (!str) return null;
  if (str.includes("/")) {
    const [d, m, y] = str.split("/");
    return new Date(+y, +m - 1, +d);
  }
  const [y, m, d] = str.split("-");
  return new Date(+y, +m - 1, +d);
}

function formatDate(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

// Truque do dia 0: pedir o dia 0 do mês seguinte retorna o último dia do mês atual
function ultimoDiaMes(ano, mes) {
  return new Date(ano, mes + 1, 0).getDate();
}

function diasEntre(a, b) {
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Se o dia do pagamento não existe no mês (ex: dia 31 em fevereiro), usa o último dia disponível
function dataPagamentoNoMes(diaPagamento, ano, mes) {
  const ultimo = ultimoDiaMes(ano, mes);
  const dia = Math.min(diaPagamento, ultimo);
  return new Date(ano, mes, dia);
}

function calcular({dataInicial, dataFinal, primeiroPagamento, valorEmprestimo, taxaJuros}) {
  const BASE_DIAS = 360;

  const dtInicio = parseDate(dataInicial);
  const dtFinal = parseDate(dataFinal);
  const dtPrimeiro = parseDate(primeiroPagamento);

  if (!dtInicio || !dtFinal || !dtPrimeiro) return {erro: "Datas inválidas."};
  if (dtFinal <= dtInicio) return {erro: "A data final deve ser maior que a data inicial."};
  if (dtPrimeiro <= dtInicio || dtPrimeiro >= dtFinal) return {erro: "O primeiro pagamento deve ser entre a data inicial e a data final."};

  const PV = parseFloat(valorEmprestimo);
  const taxa = parseFloat(taxaJuros) / 100;
  const diaPagamento = dtPrimeiro.getDate();

  // +1 porque tanto o mês do primeiro pagamento quanto o da data final são incluídos
  const nParcelas = (dtFinal.getFullYear() - dtPrimeiro.getFullYear()) * 12 + (dtFinal.getMonth() - dtPrimeiro.getMonth()) + 1;

  const amortizacaoMensal = PV / nParcelas;

  // Map com timestamp como chave garante que datas duplicadas (ex: pagamento que cai no fim de mês) apareçam só uma vez
  const datasSet = new Map();
  const addData = (d) => datasSet.set(d.getTime(), d);

  addData(new Date(dtInicio));

  {
    let ano = dtInicio.getFullYear();
    let mes = dtInicio.getMonth();
    while (true) {
      const fimMes = new Date(ano, mes, ultimoDiaMes(ano, mes));
      if (fimMes >= dtFinal) break;
      if (fimMes > dtInicio) addData(fimMes);
      mes++;
      if (mes > 11) {
        mes = 0;
        ano++;
      }
    }
  }

  {
    let ano = dtPrimeiro.getFullYear();
    let mes = dtPrimeiro.getMonth();
    for (let k = 0; k < nParcelas; k++) {
      const isUltima = k === nParcelas - 1;
      // A última parcela sempre cai na data final, independente do dia do pagamento
      const dp = isUltima ? new Date(dtFinal) : dataPagamentoNoMes(diaPagamento, ano, mes);
      addData(dp);
      mes++;
      if (mes > 11) {
        mes = 0;
        ano++;
      }
    }
  }

  addData(new Date(dtFinal));

  const datas = Array.from(datasSet.values()).sort((a, b) => a - b);

  const linhas = [];
  let saldoPrincipal = PV;
  let jurosAcumulado = 0;
  let numeroParcela = 0;
  let dtAnterior = dtInicio;

  for (let i = 0; i < datas.length; i++) {
    const dt = datas[i];

    const isParcela =
      numeroParcela < nParcelas &&
      (() => {
        if (numeroParcela === nParcelas - 1) return isSameDay(dt, dtFinal);
        let ano = dtPrimeiro.getFullYear();
        let mes = dtPrimeiro.getMonth();
        for (let k = 0; k < numeroParcela; k++) {
          mes++;
          if (mes > 11) {
            mes = 0;
            ano++;
          }
        }
        return isSameDay(dt, dataPagamentoNoMes(diaPagamento, ano, mes));
      })();

    const dias = i === 0 ? 0 : diasEntre(dtAnterior, dt);
    const saldoDevedorAtual = saldoPrincipal + jurosAcumulado;
    // Juros compostos sobre o saldo devedor (principal + juros acumulados), base 360 dias — fórmula da planilha
    const jurosPeriodo = i === 0 ? 0 : saldoDevedorAtual * (Math.pow(1 + taxa, dias / BASE_DIAS) - 1);

    let consolidada = "",
      totalParcela = 0,
      amortizacao = 0;
    let jurosPago = 0,
      provisao = 0,
      acumulado = 0,
      pago = 0;

    if (i === 0) {
      linhas.push({
        data: formatDate(dt),
        valorEmprestimo: PV,
        saldoDevedor: PV,
        consolidada: "",
        total: 0,
        amortizacao: 0,
        saldo: PV,
        provisao: 0,
        acumulado: 0,
        pago: 0,
      });
      dtAnterior = dt;
      continue;
    }

    if (isParcela) {
      numeroParcela++;
      amortizacao = amortizacaoMensal;
      jurosPago = jurosAcumulado + jurosPeriodo;
      totalParcela = amortizacao + jurosPago;
      saldoPrincipal -= amortizacao;
      consolidada = `${numeroParcela}/${nParcelas}`;
      pago = jurosPago;
      jurosAcumulado = 0; // zera após pagamento — os juros acumulados foram quitados
    } else {
      // Fim de mês sem pagamento: provisiona os juros mas não quita nada
      jurosAcumulado += jurosPeriodo;
      provisao = jurosPeriodo;
      acumulado = jurosAcumulado;
    }

    const saldoDevedor = saldoPrincipal + jurosAcumulado;

    linhas.push({
      data: formatDate(dt),
      valorEmprestimo: 0,
      saldoDevedor,
      consolidada,
      total: totalParcela,
      amortizacao,
      saldo: saldoPrincipal < 0.01 ? 0 : saldoPrincipal,
      provisao,
      acumulado,
      pago,
    });

    dtAnterior = dt;
  }

  return {linhas, nParcelas, amortizacaoMensal};
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsed = url.parse(req.url, true);

  if (req.method === "POST" && parsed.pathname === "/calcular") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const dados = JSON.parse(body);
        const resultado = calcular(dados);
        res.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
        res.end(JSON.stringify(resultado));
      } catch {
        res.writeHead(400, {"Content-Type": "application/json"});
        res.end(JSON.stringify({erro: "Requisição inválida."}));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
