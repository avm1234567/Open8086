const instData = require('../js/instructions_data.js');

function searchInstructions(query) {
  query = query.trim().toUpperCase();
  if (!query) return Object.keys(instData).sort();

  const allKeys = Object.keys(instData);

  // 1. Check for mnemonic matches (exact, prefix, contains)
  const exactMatches = [];
  const prefixMatches = [];
  const containsMatches = [];

  for (let k of allKeys) {
    const name = instData[k].name.toUpperCase();
    if (name === query) {
      exactMatches.push(k);
    } else if (name.startsWith(query)) {
      prefixMatches.push(k);
    } else if (name.includes(query)) {
      containsMatches.push(k);
    }
  }

  // If there are mnemonic matches, return them directly!
  // This completely eliminates false positives like AAS/DAS/JNZ when searching "SUB",
  // or 114 instructions when searching "OR", or 73 instructions when searching "AND".
  if (exactMatches.length > 0 || prefixMatches.length > 0 || containsMatches.length > 0) {
    prefixMatches.sort((a, b) => a.localeCompare(b));
    containsMatches.sort((a, b) => a.localeCompare(b));
    return [...exactMatches, ...prefixMatches, ...containsMatches];
  }

  // 2. If no mnemonic matches, search by topic, concept, or category (e.g. "multiply", "divide", "jump", "stack")
  const descriptiveMatches = [];
  for (let k of allKeys) {
    const item = instData[k];
    const cat = (item.category || '').toUpperCase();
    const title = (item.description || '').split(/\r?\n/)[0].trim().toUpperCase();
    const titleWords = title.split(/[\s,.:()]+/).filter(Boolean);

    let score = 0;
    if (cat === query) score += 100;
    else if (cat.includes(query)) score += 50;

    if (titleWords.some(w => w === query)) score += 80;
    else if (titleWords.some(w => w.startsWith(query))) score += 40;

    if (score > 0) {
      descriptiveMatches.push({ name: k, score });
    }
  }

  descriptiveMatches.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return descriptiveMatches.map(m => m.name);
}

const testCases = [
  'SUB',
  'MOV',
  'ADD',
  'MUL',
  'DIV',
  'OR',
  'AND',
  'NOT',
  'CMP',
  'JMP',
  'JE',
  'multiply',
  'divide',
  'jump',
  'shift',
  'rotate',
  'stack'
];

testCases.forEach(q => {
  const res = searchInstructions(q);
  console.log(`Query: "${q}" -> [${res.join(', ')}]`);
});
