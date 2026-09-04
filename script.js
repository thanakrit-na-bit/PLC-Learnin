const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const els = { a: document.querySelector('#operand-a'), b: document.querySelector('#operand-b'), custom: document.querySelector('#custom-base'), result: document.querySelector('#result'), resultBase: document.querySelector('#result-base'), decimal: document.querySelector('#decimal-result'), validation: document.querySelector('#validation'), steps: document.querySelector('#step-list') };
let base = 2;
const valueOf = (char) => digits.indexOf(char);
function valid(value) { return value && [...value.toUpperCase()].every((char) => valueOf(char) >= 0 && valueOf(char) < base); }
function toDecimal(value) { return [...value.toUpperCase()].reduce((total, char) => total * BigInt(base) + BigInt(valueOf(char)), 0n); }
function fromDecimal(value) { if (value === 0n) return '0'; let output = ''; while (value > 0n) { output = digits[Number(value % BigInt(base))] + output; value /= BigInt(base); } return output; }
function baseLabel() { return `ฐาน ${base}`; }
function renderSteps(a, b) {
  const max = Math.max(a.length, b.length); let carry = 0; const rows = [];
  for (let index = 0; index < max; index += 1) {
    const aDigit = valueOf(a.at(-(index + 1))) || 0; const bDigit = valueOf(b.at(-(index + 1))) || 0;
    const total = aDigit + bDigit + carry; const resultDigit = total % base; const nextCarry = Math.floor(total / base);
    rows.unshift(`<div class="step"><span>หลักที่ ${max - index}</span><b>${digits[aDigit]} + ${digits[bDigit]}${carry ? ` + ${carry}` : ''} = ${digits[resultDigit]}</b><span class="carry">${nextCarry ? `ทด ${nextCarry} ไปหลักถัดไป` : 'ไม่มีตัวทด'}</span></div>`); carry = nextCarry;
  }
  els.steps.innerHTML = rows.join('');
}
function calculate() {
  const a = els.a.value.trim().toUpperCase(); const b = els.b.value.trim().toUpperCase(); els.a.value = a; els.b.value = b;
  if (!valid(a) || !valid(b)) { els.result.textContent = 'Error'; els.decimal.textContent = `กรอกอักขระให้ถูกต้องสำหรับ${baseLabel()}`; els.steps.innerHTML = ''; return; }
  const answer = toDecimal(a) + toDecimal(b); els.result.textContent = fromDecimal(answer); els.resultBase.textContent = baseLabel(); els.decimal.textContent = `= ${answer.toString()} ในฐานสิบ`; renderSteps(a, b);
}
function updateBase(nextBase) {
  base = nextBase; document.querySelectorAll('.base-card[data-base]').forEach((card) => card.classList.toggle('selected', Number(card.dataset.base) === base));
  els.validation.innerHTML = `อักขระที่ใช้ได้ใน${baseLabel()}: <b>0 – ${digits[base - 1]}</b>`; document.querySelectorAll('#base-a, #base-b').forEach((el) => { el.textContent = baseLabel(); }); calculate();
}
document.querySelectorAll('.base-card[data-base]').forEach((card) => card.addEventListener('click', () => updateBase(Number(card.dataset.base))));
els.custom.addEventListener('input', () => { const value = Number(els.custom.value); if (value >= 2 && value <= 36) { base = value; document.querySelectorAll('.base-card').forEach((card) => card.classList.remove('selected')); els.validation.innerHTML = `อักขระที่ใช้ได้ใน${baseLabel()}: <b>0 – ${digits[base - 1]}</b>`; document.querySelectorAll('#base-a, #base-b').forEach((el) => { el.textContent = baseLabel(); }); calculate(); } });
document.querySelector('#calculate').addEventListener('click', calculate);
document.querySelector('#clear').addEventListener('click', () => { els.a.value = ''; els.b.value = ''; calculate(); });
document.querySelector('#swap').addEventListener('click', () => { [els.a.value, els.b.value] = [els.b.value, els.a.value]; calculate(); });
document.querySelectorAll('.examples button').forEach((button) => button.addEventListener('click', () => { const [a, b, nextBase] = button.dataset.example.split(','); els.a.value = a; els.b.value = b; updateBase(Number(nextBase)); }));
[els.a, els.b].forEach((input) => input.addEventListener('keydown', (event) => { if (event.key === 'Enter') calculate(); }));
calculate();
