const expressionEl = document.querySelector('#expression');
const resultEl = document.querySelector('#result');
const decimalEl = document.querySelector('#decimal');
let expression = '';
let justCalculated = false;

const operatorSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
const isOperator = (value) => Object.hasOwn(operatorSymbols, value);

function formattedExpression(value) {
  return value.replace(/[+\-*/]/g, (char) => ` ${operatorSymbols[char]} `);
}

function binaryToDecimal(binary) {
  return BigInt(`0b${binary}`);
}

function calculate() {
  if (!expression || isOperator(expression.at(-1))) return;
  try {
    // A leading minus can occur when a previous calculation produced a negative value.
    const match = expression.match(/^(-?[01]+)((?:[+*/-][01]+)*)$/);
    if (!match) throw new Error('invalid expression');
    let value = binaryToDecimal(match[1].replace('-', ''));
    if (match[1].startsWith('-')) value = -value;
    const operations = match[2].matchAll(/([+*/-])([01]+)/g);
    for (const [, operator, digits] of operations) {
      const next = binaryToDecimal(digits);
      if (operator === '+') value += next;
      if (operator === '-') value -= next;
      if (operator === '*') value *= next;
      if (operator === '/') {
        if (next === 0n) throw new Error('division by zero');
        value /= next;
      }
    }
    const negative = value < 0n;
    const binary = `${negative ? '-' : ''}${(negative ? -value : value).toString(2)}`;
    resultEl.innerHTML = `${binary}<small>₂</small>`;
    decimalEl.textContent = `ฐานสิบ: ${value.toString(10)}`;
    expressionEl.textContent = `${formattedExpression(expression)} =`;
    expression = binary;
    justCalculated = true;
  } catch {
    resultEl.textContent = 'Error';
    decimalEl.textContent = 'ตรวจสอบรูปแบบการคำนวณ';
    justCalculated = true;
  }
}

function update() {
  expressionEl.textContent = expression ? formattedExpression(expression) : '0';
  if (!justCalculated) {
    const current = expression.split(/[+\-*/]/).filter(Boolean).at(-1) || '0';
    resultEl.innerHTML = `${current}<small>₂</small>`;
    try { decimalEl.textContent = `ฐานสิบ: ${binaryToDecimal(current)}`; } catch { decimalEl.textContent = 'ฐานสิบ: —'; }
  }
}

function input(value) {
  if (value === 'clear') { expression = ''; justCalculated = false; update(); return; }
  if (value === 'backspace') { expression = expression.slice(0, -1); justCalculated = false; update(); return; }
  if (value === 'equals') { calculate(); return; }
  if (isOperator(value)) {
    if (!expression) return;
    expression = isOperator(expression.at(-1)) ? `${expression.slice(0, -1)}${value}` : `${expression}${value}`;
    justCalculated = false;
  } else {
    if (justCalculated) expression = '';
    expression += value;
    justCalculated = false;
  }
  update();
}

document.querySelector('.keys').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button) input(button.dataset.action || button.dataset.value);
});

window.addEventListener('keydown', (event) => {
  const key = event.key;
  if (key === 'Enter' || key === '=') { event.preventDefault(); input('equals'); }
  else if (key === 'Escape') input('clear');
  else if (key === 'Backspace') input('backspace');
  else if (['0', '1', '+', '-', '*', '/'].includes(key)) input(key);
});

update();
