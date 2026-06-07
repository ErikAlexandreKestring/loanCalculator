# Loan Calculator

Calculadora de empréstimos

Permite simular empréstimos com amortização mensal fixa, exibindo uma tabela detalhada com todas as datas relevantes, parcelas, juros e saldo devedor ao longo do período.

---

## Tecnologias

| Camada   | Tecnologia                     |
| -------- | ------------------------------ |
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Backend  | Node.js                        |

---

## Funcionalidades

- Cálculo de amortização mensal fixa (`Valor / nParcelas`)
- Juros compostos proporcionais por período (base 360 dias)
- Tabela com **todas as datas relevantes**: data inicial, fins de mês, dias de pagamento e data final
- Validações em tempo real nos campos do formulário
- Tratamento do dia de pagamento em meses mais curtos (ex: dia 31 → último dia do mês seguinte)
- Layout responsivo fiel ao modelo fornecido

---

## Como rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) v14 ou superior

### 1. Clone o repositório

```bash
git clone https://github.com/ErikAlexandreKestring/loanCalculator.git
cd loanCalculator
```

### 2. Inicie o backend

```bash
npm start
```

O servidor sobe em `http://localhost:3000`.

### 3. Abra o frontend

Abra o arquivo `frontend/index.html` no navegador.

> **Dica:** use a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) do VS Code para recarregamento automático.

---

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

---

## Lógica de cálculo

A calculadora segue as fórmulas da planilha `Calculadora_Emprestimos.xlsx` fornecida:

| Variável           | Fórmula                                               |
| ------------------ | ----------------------------------------------------- |
| Amortização mensal | `Valor ÷ nParcelas` (divisão simples do principal)    |
| Juros do período   | `SaldoDevedor × ((1 + taxaAnual) ^ (dias ÷ 360) - 1)` |
| Total da parcela   | `Amortização + JurosAcumulados`                       |
| Saldo devedor      | `SaldoPrincipal + JurosAcumuladosNoPeriodo`           |

> Os juros são calculados sobre o **saldo devedor** (principal + juros acumulados), usando juros compostos com base de 360 dias — fórmula idêntica à da planilha fornecida.

### Datas geradas na tabela

- Data inicial
- Último dia de cada mês entre a data inicial e a data final
- Dia de pagamento de cada mês (do primeiro pagamento até a data final)
- Data final (sempre é o último pagamento)

### Regra do último dia do mês

Se o dia do primeiro pagamento não existir no mês seguinte (ex: dia 31 em fevereiro), o pagamento é ajustado para o último dia daquele mês.

---

## Exemplo

Com os dados padrão da planilha:

| Campo               | Valor         |
| ------------------- | ------------- |
| Data inicial        | 01/01/2024    |
| Data final          | 01/01/2034    |
| Primeiro pagamento  | 15/02/2024    |
| Valor do empréstimo | R$ 140.000,00 |
| Taxa de juros       | 7% a.a.       |
| Parcelas geradas    | 120           |
| Amortização mensal  | R$ 1.166,67   |

---

## Autor

**Erik Alexandre Kestring**
[LinkedIn](https://www.linkedin.com/in/erik-kestring-280b05267/) · [GitHub](https://github.com/ErikAlexandreKestring)
