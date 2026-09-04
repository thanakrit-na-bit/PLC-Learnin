'use strict';

const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const els = {
  a: document.querySelector('#operand-a'),
  b: document.querySelector('#operand-b'),
  custom: document.querySelector('#custom-base'),
  result: document.querySelector('#result'),
  resultBase: document.querySelector('#result-base'),
  decimal: document.querySelector('#decimal-result'),
  validation: document.querySelector('#validation'),
  algorithm: document.querySelector('#algorithm'),
  steps: document.querySelector('#step-list'),
  detailList: document.querySelector('#detail-list'),

  quizType: document.querySelector('#quiz-type'),
  quizQuestion: document.querySelector('#quiz-question'),
  quizInput: document.querySelector('#quiz-input'),
  quizFeedback: document.querySelector('#quiz-feedback'),
  quizStreak: document.querySelector('#quiz-streak'),

  tableStart: document.querySelector('#table-start'),
  tableCount: document.querySelector('#table-count'),
  tableRows: document.querySelector('#conversion-rows'),

  convInput: document.querySelector('#conv-input'),
  convInputBase: document.querySelector('#conv-input-base'),
  convSrcCustom: document.querySelector('#conv-src-custom'),
  convDstCustom: document.querySelector('#conv-dst-custom'),
  convResult: document.querySelector('#conv-result'),
  convDstBase: document.querySelector('#conv-dst-base'),
  convDecimal: document.querySelector('#conv-decimal'),
  convToDec: document.querySelector('#conv-to-dec'),
  convFromDec: document.querySelector('#conv-from-dec'),
};

let base = 2;

const valueOf = (char) => digits.indexOf(char);
const isDigit = (char) => valueOf(char) >= 0;

function valid(value) {
  return value.length > 0 && [...value].every((char) => isDigit(char) && valueOf(char) < base);
}

function toDecimal(value) {
  let total = 0n;
  for (const char of value) total = total * BigInt(base) + BigInt(valueOf(char));
  return total;
}

function fromDecimal(value) {
  if (value === 0n) return '0';
  let out = '';
  const b = BigInt(base);
  while (value > 0n) {
    out = digits[Number(value % b)] + out;
    value /= b;
  }
  return out;
}

function baseLabel() {
  return `ฐาน ${base}`;
}

function updateValidation() {
  els.validation.innerHTML = `อักขระที่ใช้ได้ใน${baseLabel()}: <b>0 – ${digits[base - 1]}</b>`;
}

function renderCalculation(a, b) {
  const maxCols = Math.max(a.length, b.length);
  const aArr = [...a].reverse();
  const bArr = [...b].reverse();
  const carryCols = [];
  const sumCols = [];
  const stepRows = [];
  let carry = 0;

  for (let i = 0; i < maxCols; i += 1) {
    carryCols.push(carry);
    const aDigit = aArr[i] === undefined ? 0 : valueOf(aArr[i]);
    const bDigit = bArr[i] === undefined ? 0 : valueOf(bArr[i]);
    const total = aDigit + bDigit + carry;
    const out = total % base;
    const nextCarry = Math.floor(total / base);
    sumCols.push(out);
    stepRows.push({ column: maxCols - i, a: aDigit, b: bDigit, carry, total, nextCarry });
    carry = nextCarry;
  }

  const extra = carry > 0 ? 1 : 0;
  const totalCols = maxCols + extra;

  let carryHtml = '';
  let aHtml = '';
  let bHtml = '';
  let sumHtml = '';

  for (let ci = totalCols - 1; ci >= 0; ci -= 1) {
    const carryVal = carryCols[ci] || 0;
    const aVal = aArr[ci] === undefined ? '' : aArr[ci];
    const bVal = bArr[ci] === undefined ? '' : bArr[ci];
    let sumVal = '';
    if (ci === maxCols && carry > 0) sumVal = digits[carry];
    else if (ci < sumCols.length) sumVal = digits[sumCols[ci]];
    carryHtml += `<span class="${carryVal ? 'on' : ''}">${carryVal ? digits[carryVal] : '&nbsp;'}</span>`;
    aHtml += `<span class="${aVal ? '' : 'off'}">${aVal || '&nbsp;'}</span>`;
    bHtml += `<span class="${bVal ? '' : 'off'}">${bVal || '&nbsp;'}</span>`;
    sumHtml += `<span>${sumVal || '&nbsp;'}</span>`;
  }

  els.algorithm.innerHTML = `
    <div class="algo-row carry" aria-hidden="true"><span class="algo-sign"></span>${carryHtml}</div>
    <div class="algo-row" aria-hidden="true"><span class="algo-sign"></span>${aHtml}</div>
    <div class="algo-row" aria-hidden="true"><span class="algo-sign plus">+</span>${bHtml}</div>
    <div class="algo-rule" aria-hidden="true"></div>
    <div class="algo-row result" aria-hidden="true"><span class="algo-sign"></span>${sumHtml}</div>
  `;

  els.steps.innerHTML = stepRows
    .map(
      (s) => `
        <div class="step">
          <span class="col">หลักที่ ${s.column}</span>
          <b>${digits[s.a]} + ${digits[s.b]}${s.carry ? ` + ${digits[s.carry]}` : ''} = ${s.total}</b>
          <span class="carry">${s.nextCarry ? `ทด ${digits[s.nextCarry]} ไปหลักถัดไป ↗` : 'ไม่มีตัวทด'}</span>
        </div>`
    )
    .join('');

  const sum = toDecimal(a) + toDecimal(b);
  els.detailList.innerHTML = `
    <h3>ตรวจสอบเป็นฐานสิบ <span>(DECIMAL CHECK)</span></h3>
    <div class="check-grid">
      <div class="check-row"><code>${a}<sub>${base}</sub></code><span>= ${toDecimal(a).toString()} (สิบ)</span></div>
      <div class="check-row"><code>${b}<sub>${base}</sub></code><span>= ${toDecimal(b).toString()} (สิบ)</span></div>
    </div>
    <div class="check-total">
      <code>${toDecimal(a)} + ${toDecimal(b)} = <b>${sum}</b></code>
      <span>แปลงกลับเป็น${baseLabel()}: <b>${fromDecimal(sum)}</b><sub>${base}</sub></span>
    </div>
  `;
}

function calculate() {
  const a = els.a.value.trim().toUpperCase();
  const b = els.b.value.trim().toUpperCase();
  els.a.value = a;
  els.b.value = b;

  const aOk = valid(a);
  const bOk = valid(b);
  els.a.closest('label').classList.toggle('invalid', a.length > 0 && !aOk);
  els.b.closest('label').classList.toggle('invalid', b.length > 0 && !bOk);

  if (!aOk || !bOk) {
    const problems = [];
    if (!aOk) problems.push('ตัวตั้ง');
    if (!bOk) problems.push('ตัวบวก');
    els.result.textContent = '—';
    els.resultBase.textContent = baseLabel();
    els.decimal.textContent = `${problems.join(' และ ')}ไม่ถูกต้อง โปรดกรอกตัวเลขให้ตรงกับ${baseLabel()}`;
    els.algorithm.innerHTML = '';
    els.steps.innerHTML = '';
    els.detailList.innerHTML = '';
    return;
  }

  const aDec = toDecimal(a);
  const bDec = toDecimal(b);
  const answer = aDec + bDec;
  els.result.textContent = fromDecimal(answer);
  els.resultBase.textContent = baseLabel();
  els.decimal.textContent = `= ${answer.toString()} ในฐานสิบ`;
  renderCalculation(a, b);
}

function updateBase(nextBase) {
  base = nextBase;
  document.querySelectorAll('.base-card[data-base]').forEach((card) => {
    card.classList.toggle('selected', Number(card.dataset.base) === base);
  });
  updateValidation();
  document.querySelectorAll('#base-a, #base-b').forEach((el) => {
    el.textContent = baseLabel();
  });
  calculate();
}

const quiz = { a: '', b: '', streak: 0 };

function randomOperand(b) {
  const length = 2 + Math.floor(Math.random() * 3);
  for (;;) {
    let s = '';
    for (let i = 0; i < length; i += 1) s += digits[Math.floor(Math.random() * b)];
    const value = toDecimal(s);
    if (value > 0n) return { s, value };
  }
}

function renderStreak() {
  els.quizStreak.textContent = `🔥 สตรีคติดต่อ: ${quiz.streak}/3`;
  els.quizStreak.classList.toggle('master', quiz.streak >= 3);
}

function quizNew(message) {
  quiz.a = randomOperand(base);
  quiz.b = randomOperand(base);
  els.quizType.textContent = `โจทย์การบวก${baseLabel()}กัน 2 ตัว`;
  els.quizQuestion.textContent = `${quiz.a.s} + ${quiz.b.s} = ?`;
  els.quizInput.value = '';
  els.quizInput.focus();
  if (message) {
    els.quizFeedback.className = 'feedback right';
    els.quizFeedback.textContent = message;
  } else {
    els.quizFeedback.className = 'feedback';
    els.quizFeedback.textContent = `ตอบได้เลย! (ตอบเป็น${baseLabel()})`;
  }
  renderStreak();
}

function quizCheck() {
  const raw = els.quizInput.value.trim().toUpperCase();
  if (!valid(raw)) {
    els.quizFeedback.className = 'feedback wrong';
    els.quizFeedback.textContent = `กรอกคำตอบเป็นตัวเลขที่ถูกต้องของ${baseLabel()}`;
    els.quizInput.focus();
    return;
  }
  const user = toDecimal(raw);
  const expected = quiz.a.value + quiz.b.value;

  if (user === expected) {
    quiz.streak += 1;
    const left = 3 - quiz.streak;
    const message =
      quiz.streak >= 3
        ? 'ถูกต้อง! 🎉 ยินดีด้วย คุณเป็น Base Master แล้ว'
        : `ถูกต้อง! เก่งมาก ต่ออีก ${left} ข้อติดก็เป็น Base Master`;
    quizNew(message);
  } else {
    quiz.streak = 0;
    renderStreak();
    els.quizFeedback.className = 'feedback wrong';
    els.quizFeedback.textContent = `ยังไม่ถูกนะ… คำตอบที่ถูกคือ ${fromDecimal(expected)} (${baseLabel()})`;
    els.quizInput.value = '';
    els.quizInput.focus();
  }
}

function renderTable() {
  const start = Math.min(240, Math.max(0, parseInt(els.tableStart.value, 10) || 0));
  const count = Math.min(32, Math.max(1, parseInt(els.tableCount.value, 10) || 16));
  const end = Math.min(240, start + count);
  let html = '';
  for (let n = start; n < end; n += 1) {
    html += `<tr><td class="dec"><b>${n}</b></td><td><code>${n.toString(2)}</code></td><td><code>${n.toString(8)}</code></td><td><code>${n.toString(16).toUpperCase()}</code></td></tr>`;
  }
  els.tableRows.innerHTML = html || '<tr><td colspan="4">ไม่มีข้อมูลในช่วงนี้</td></tr>';
}

let convSrc = 2;
let convDst = 10;

function valueInBase(value, b) {
  let total = 0n;
  for (const char of value) {
    const v = valueOf(char);
    if (v < 0 || v >= b) return null;
    total = total * BigInt(b) + BigInt(v);
  }
  return total;
}

function fromDecimalBase(value, b) {
  if (value === 0n) return '0';
  let out = '';
  const bb = BigInt(b);
  while (value > 0n) {
    out = digits[Number(value % bb)] + out;
    value /= bb;
  }
  return out;
}

function renderConvSteps(raw, src, dst, dec) {
  let html = '';
  let sum = 0n;
  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i];
    const v = BigInt(valueOf(ch));
    const pos = raw.length - 1 - i;
    const term = v * (BigInt(src) ** BigInt(pos));
    sum += term;
    html += `
      <div class="step">
        <span class="col">หลักที่ ${raw.length - i}</span>
        <b>${ch} × ${src}<sup>${pos}</sup> = ${term.toString()}</b>
        <span class="carry">รวม ${sum.toString()}</span>
      </div>`;
  }
  els.convToDec.innerHTML = `<p class="cstep-sum">ค่าในฐานสิบ = <b>${dec.toString()}</b></p>${html}`;

  let div = '';
  if (dec === 0n) {
    div = `<div class="step"><span class="col">–</span><b>0</b><span class="carry none">ไม่มีเศษ</span></div>`;
  } else {
    let cur = dec;
    const rows = [];
    while (cur > 0n) {
      const q = cur / BigInt(dst);
      const r = Number(cur % BigInt(dst));
      rows.push({ num: cur, q, r });
      cur = q;
    }
    div = rows
      .map(
        (row, i) => `
        <div class="step">
          <span class="col">ขั้น ${rows.length - i}</span>
          <b>${row.num.toString()} ÷ ${dst} = ${row.q.toString()} เศษ ${row.r}</b>
          <span class="carry">เศษ ${digits[row.r]}</span>
        </div>`
      )
      .join('');
  }
  els.convFromDec.innerHTML = div + '<p class="cstep-sum">อ่านเศษจาก<b>ล่างขึ้นบน</b></p>';
}

function convert() {
  const raw = els.convInput.value.trim().toUpperCase();
  els.convInput.value = raw;
  const inputLabel = els.convInput.closest('label');
  els.convInputBase.textContent = `ฐาน ${convSrc}`;
  els.convDstBase.textContent = `ฐาน ${convDst}`;

  if (!raw) {
    inputLabel.classList.remove('invalid');
    els.convResult.textContent = '—';
    els.convDecimal.textContent = 'กรอกตัวเลขที่ต้องการแปลงก่อน';
    els.convToDec.innerHTML = '';
    els.convFromDec.innerHTML = '';
    return;
  }

  const dec = valueInBase(raw, convSrc);
  if (dec === null) {
    inputLabel.classList.add('invalid');
    els.convResult.textContent = 'ERR';
    els.convDecimal.textContent = `มีอักขระที่ไม่ถูกต้องสำหรับฐาน ${convSrc}`;
    els.convToDec.innerHTML = '';
    els.convFromDec.innerHTML = '';
    return;
  }
  inputLabel.classList.remove('invalid');

  els.convResult.textContent = fromDecimalBase(dec, convDst);
  els.convDecimal.textContent = `= ${dec.toString()} ในฐานสิบ`;
  renderConvSteps(raw, convSrc, convDst, dec);
}

function syncConvPicks() {
  document.querySelectorAll('.conv-pick button[data-src-base]').forEach((btn) => {
    btn.classList.toggle('selected', Number(btn.dataset.srcBase) === convSrc);
  });
  document.querySelectorAll('.conv-pick button[data-dst-base]').forEach((btn) => {
    btn.classList.toggle('selected', Number(btn.dataset.dstBase) === convDst);
  });
}

function switchView(view) {
  document.querySelectorAll('.tabs button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  document.querySelector('#calculator-view').classList.toggle('hidden', view !== 'calculator');
  document.querySelector('#quiz-view').classList.toggle('hidden', view !== 'quiz');
  document.querySelector('#table-view').classList.toggle('hidden', view !== 'table');
  document.querySelector('#convert-view').classList.toggle('hidden', view !== 'convert');
  if (view === 'quiz') quizNew();
  if (view === 'table') renderTable();
  if (view === 'convert') convert();
}

document.querySelectorAll('.tabs button').forEach((button) => {
  button.addEventListener('click', () => switchView(button.dataset.view));
});

document.querySelectorAll('.base-card[data-base]').forEach((card) => {
  card.addEventListener('click', () => updateBase(Number(card.dataset.base)));
});

els.custom.addEventListener('input', () => {
  const value = parseInt(els.custom.value, 10);
  if (Number.isNaN(value) || value < 2 || value > 36) return;
  base = value;
  document.querySelectorAll('.base-card').forEach((card) => card.classList.remove('selected'));
  updateValidation();
  document.querySelectorAll('#base-a, #base-b').forEach((el) => {
    el.textContent = baseLabel();
  });
  calculate();
  if (!document.querySelector('#quiz-view').classList.contains('hidden')) quizNew();
});

document.querySelector('#calculate').addEventListener('click', calculate);
document.querySelector('#clear').addEventListener('click', () => {
  els.a.value = '';
  els.b.value = '';
  calculate();
});
document.querySelector('#swap').addEventListener('click', () => {
  [els.a.value, els.b.value] = [els.b.value, els.a.value];
  calculate();
});

document.querySelectorAll('.examples button').forEach((button) => {
  button.addEventListener('click', () => {
    const [a, b, nextBase] = button.dataset.example.split(',');
    els.a.value = a;
    els.b.value = b;
    updateBase(Number(nextBase));
  });
});

[els.a, els.b].forEach((input) => {
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') calculate();
  });
  input.addEventListener('input', calculate);
});

els.quizInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') quizCheck();
});
document.querySelector('#check-quiz').addEventListener('click', quizCheck);
document.querySelector('#new-quiz').addEventListener('click', () => quizNew());
document.querySelector('#refresh-table').addEventListener('click', renderTable);

document.querySelectorAll('.conv-pick button[data-src-base]').forEach((btn) => {
  btn.addEventListener('click', () => {
    convSrc = Number(btn.dataset.srcBase);
    els.convSrcCustom.value = convSrc;
    syncConvPicks();
    convert();
  });
});
document.querySelectorAll('.conv-pick button[data-dst-base]').forEach((btn) => {
  btn.addEventListener('click', () => {
    convDst = Number(btn.dataset.dstBase);
    els.convDstCustom.value = convDst;
    syncConvPicks();
    convert();
  });
});
els.convSrcCustom.addEventListener('input', () => {
  const v = parseInt(els.convSrcCustom.value, 10);
  if (Number.isNaN(v) || v < 2 || v > 36) return;
  convSrc = v;
  syncConvPicks();
  convert();
});
els.convDstCustom.addEventListener('input', () => {
  const v = parseInt(els.convDstCustom.value, 10);
  if (Number.isNaN(v) || v < 2 || v > 36) return;
  convDst = v;
  syncConvPicks();
  convert();
});
document.querySelector('#conv-swap').addEventListener('click', () => {
  [convSrc, convDst] = [convDst, convSrc];
  els.convSrcCustom.value = convSrc;
  els.convDstCustom.value = convDst;
  syncConvPicks();
  convert();
});
els.convInput.addEventListener('input', convert);
els.convInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') convert();
});
convert();

switchView('calculator');
renderTable();
calculate();