# Calculadora de Empréstimos

Calculadora de empréstimos com sistema de amortização proporcional.

## Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Node.js

## Funcionalidades

- Cálculo de empréstimos com amortização mensal fixa
- Juros proporcionais por período (base 360 dias)
- Grid completa com: data inicial, fins de mês, datas de parcela e data final
- Validações em tempo real nos campos
- Tratamento do dia de pagamento em meses mais curtos (ex: dia 31 → último dia do mês)
- Layout responsivo fiel ao modelo sugerido

## Como rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) versão 14 ou superior

### 1. Clone o repositório

```bash
git clone https://github.com/ErikAlexandreKestring/calculadora-emprestimos-totvs.git
cd calculadora-emprestimos-totvs
```

### 2. Inicie o backend

```bash
npm start
# ou, com hot-reload (Node 18+):
npm run dev
```

O servidor sobe em `http://localhost:3000`.

### 3. Abra o frontend

Abra o arquivo `frontend/index.html` diretamente no navegador ou utilize a extensão Live Server.

## Estrutura do projeto

```
loanCalculator/
├── backend/
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── package.json
└── README.md
```

## Lógica de cálculo

A calculadora segue as fórmulas da planilha `Calculadora_Emprestimos.xlsx` fornecida:

| Variável           | Fórmula                                              |
| ------------------ | ---------------------------------------------------- |
| Amortização mensal | `Valor / nParcelas`                                  |
| Juros do período   | `SaldoPrincipal × (taxaAnual / 360) × diasNoPeriodo` |
| Total da parcela   | `Amortização + JurosAcumulados`                      |
| Saldo devedor      | `SaldoPrincipal + JurosAcumuladosNoPeriodo`          |

**Base de dias:** 360 (fixa, conforme célula F2 da planilha)

**Datas geradas na grid:**

- Data inicial
- Último dia de cada mês entre inicial e final
- Dia de pagamento de cada mês (do primeiro pagamento até a data final)
- Data final

**Regra do último dia:** se o dia do primeiro pagamento não existe no mês seguinte (ex: dia 31 em fevereiro), o pagamento cai no último dia daquele mês.

## Exemplo

Com os dados padrão da planilha:

| Campo              | Valor         |
| ------------------ | ------------- |
| Data inicial       | 01/01/2024    |
| Data final         | 01/01/2034    |
| Primeiro pagamento | 15/02/2024    |
| Valor              | R$ 140.000,00 |
| Taxa de juros      | 7% a.a.       |
| Parcelas           | 120           |
| Amortização mensal | R$ 1.166,67   |
