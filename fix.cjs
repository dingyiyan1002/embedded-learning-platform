const fs = require('fs');
const f = 'C:\\Users\\6\\Downloads\\qianrushi1\\src\\components\\CodeTypingPractice.tsx';
let c = fs.readFileSync(f, 'utf8');

// Fix 1: FloatingKeyboard lastKey display
const target1 = "{lastKey==='Space'?'Space':lastKey.length>1?lastKey:'"+lastKey+"'";
const repl1 = "{(() => { const k = lastKey; if (k === 'Space' || k === String.fromCharCode(32)) return 'Space'; if (k.length <= 2) return k; return JSON.stringify(k); })()}";
c = c.replace(target1, repl1);

// Fix 2: toolbar kbd
const target2 = "(lastKey===' '||lastKey==='Space')?'Space':lastKeyPressed";
const repl2 = "(lastKey==='Space') ? 'Space' : lastKeyPressed";
c = c.replace(target2, repl2);

fs.writeFileSync(f, c, 'utf8');
console.log('Fixed OK');
