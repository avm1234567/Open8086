const path = require('path');
const fs = require('fs');
const instData = require(path.join(__dirname, '../js/instructions_data.js'));
const cpuSource = fs.readFileSync(path.join(__dirname, '../js/cpu.js'), 'utf-8');

const allDocInsts = Object.keys(instData);
console.log('Total documented instructions in emu8086 docs:', allDocInsts.length);

const missingInCPU = [];
for (let name of allDocInsts) {
  const casePattern = new RegExp('case\\s+["\']' + name + '["\']', 'i');
  if (!casePattern.test(cpuSource)) {
    missingInCPU.push(name);
  }
}

console.log('Missing in CPU switch cases count:', missingInCPU.length);
if (missingInCPU.length > 0) {
  console.log('Missing:', JSON.stringify(missingInCPU));
} else {
  console.log('ALL 116 instructions have explicit cases in CPU!');
}
