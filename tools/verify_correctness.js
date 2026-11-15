const path = require('path');
const Memory = require(path.join(__dirname, '../js/memory.js'));
const CPU = require(path.join(__dirname, '../js/cpu.js'));
const Assembler = require(path.join(__dirname, '../js/assembler.js'));
const experiments = require(path.join(__dirname, '../js/experiments_data.js'));

let allPassed = true;

function runTest(expId, inspectFn) {
  const exp = experiments.find(e => e.id === expId);
  const asm = new Assembler();
  const res = asm.assemble(exp.code);
  const mem = new Memory();
  const cpu = new CPU(mem);
  cpu.reset(res.startIP);
  for (let dw of res.dataWrites) mem.loadBuffer(0x0700, dw.offset, dw.bytes);
  const instMap = {};
  for (let inst of res.instructions) instMap[inst.ip] = inst;

  let steps = 0;
  while (!cpu.halted && steps < 1000) {
    const inst = instMap[cpu.getReg16('IP')];
    if (!inst) break;
    cpu.executeInstruction(inst);
    steps++;
  }
  inspectFn(cpu, mem, res);
}

// Check 3a: Largest element in [25h, 4Ah, 12h, 89h, 34h] -> 89h (137 dec)
runTest('exp3a', (cpu, mem, res) => {
  const largestSym = res.symbols['LARGEST'];
  const val = mem.readByteSeg(0x0700, largestSym.offset);
  const pass = (val === 0x89);
  if (!pass) allPassed = false;
  console.log('Exp 3a result at [largest]: 0x' + val.toString(16), '(Expected: 0x89) ->', pass ? 'PASS' : 'FAIL');
});

// Check 4a: Bubble sort ascending [45h, 12h, 89h, 23h, 05h] -> [05h, 12h, 23h, 45h, 89h]
runTest('exp4a', (cpu, mem, res) => {
  const arraySym = res.symbols['ARRAY'];
  const sorted = [];
  for (let i = 0; i < 5; i++) {
    sorted.push('0x' + mem.readByteSeg(0x0700, arraySym.offset + i).toString(16));
  }
  const pass = (JSON.stringify(sorted) === JSON.stringify(['0x5', '0x12', '0x23', '0x45', '0x89']));
  if (!pass) allPassed = false;
  console.log('Exp 4a sorted array:', sorted.join(', '), '(Expected: 0x5, 0x12, 0x23, 0x45, 0x89) ->', pass ? 'PASS' : 'FAIL');
});

// Check 3d: Smallest signed in [15, -10, 42, -50, 8, -3] -> -50 (0xCE or 206 unsigned)
runTest('exp3d', (cpu, mem, res) => {
  const minSym = res.symbols['MIN_SIGNED'];
  const val = mem.readByteSeg(0x0700, minSym.offset);
  const signedVal = val > 127 ? val - 256 : val;
  const pass = (signedVal === -50);
  if (!pass) allPassed = false;
  console.log('Exp 3d signed min:', signedVal, '(Expected: -50) ->', pass ? 'PASS' : 'FAIL');
});

// Check 4c: Reversed array [11h, 22h, 33h, 44h, 55h, 66h] -> [66h, 55h, 44h, 33h, 22h, 11h]
runTest('exp4c', (cpu, mem, res) => {
  const arraySym = res.symbols['ARRAY'];
  const rev = [];
  for (let i = 0; i < 6; i++) {
    rev.push('0x' + mem.readByteSeg(0x0700, arraySym.offset + i).toString(16));
  }
  const pass = (JSON.stringify(rev) === JSON.stringify(['0x66', '0x55', '0x44', '0x33', '0x22', '0x11']));
  if (!pass) allPassed = false;
  console.log('Exp 4c reversed array:', rev.join(', '), '(Expected: 0x66, 0x55, 0x44, 0x33, 0x22, 0x11) ->', pass ? 'PASS' : 'FAIL');
});

// Check Anonymous ORG Data Dereferencing
(function testAnonymousOrgData() {
  const code = `
  ORG 100H
  MOV AL, [200H]
  MOV BX, -4
  IMUL BX
  HLT
  ORG 200H
  DB 05H
  `;
  const asm = new Assembler();
  const res = asm.assemble(code);
  const mem = new Memory();
  const cpu = new CPU(mem);
  cpu.reset(res.startIP);
  for (let dw of res.dataWrites) mem.loadBuffer(0x0700, dw.offset, dw.bytes);
  const instMap = {};
  for (let inst of res.instructions) instMap[inst.ip] = inst;
  while (!cpu.halted) {
    const inst = instMap[cpu.getReg16('IP')];
    if (!inst) break;
    cpu.executeInstruction(inst);
  }
  const pass = (cpu.getReg8('AL') === 0xEC && cpu.getReg16('AX') === 0xFFEC && cpu.getReg16('DX') === 0xFFFF);
  if (!pass) allPassed = false;
  console.log('Anonymous ORG 200H + DB 05H dereference & IMUL BX ->', pass ? 'PASS' : 'FAIL');
})();

if (allPassed) {
  console.log('\n>>> ALL ALGORITHMIC VERIFICATIONS PASSED! <<<');
  process.exit(0);
} else {
  console.log('\n>>> ALGORITHMIC VERIFICATION FAILED! <<<');
  process.exit(1);
}
