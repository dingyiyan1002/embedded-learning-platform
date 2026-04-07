import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import os from 'os';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50kb' }));

// Temp directory for compiled files
const TEMP_DIR = path.join(os.tmpdir(), 'embedded-learning');
if (!existsSync(TEMP_DIR)) {
  await mkdir(TEMP_DIR, { recursive: true });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Check if GCC is available
app.get('/api/gcc-check', (req, res) => {
  execCommand('gcc --version').then(out => {
    res.json({ available: true, version: out.split('\n')[0] });
  }).catch(() => {
    res.json({ available: false, version: null });
  });
});

/**
 * Compile and run C code
 */
app.post('/api/run', async (req, res) => {
  const { code, stdin = '', mode } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ success: false, output: '请提供有效的 C 代码', type: 'invalid_input' });
  }

  if (code.length > 10000) {
    return res.status(400).json({ success: false, output: '代码过长，最多10000字符', type: 'too_long' });
  }

  const id = `code_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const srcPath = path.join(TEMP_DIR, `${id}.c`);
  const exePath = path.join(TEMP_DIR, `${id}.exe`);

  try {
    await writeFile(srcPath, code, 'utf-8');

    // Compile only mode
    if (mode === 'compile') {
      const compileResult = await execCommand(`gcc -fsyntax-only -Wall -Wextra "${srcPath}" 2>&1`);
      if (compileResult.exitCode === 0) {
        res.json({ success: true, output: '编译成功，无错误', type: 'success' });
      } else {
        const errorLines = parseErrorLines(compileResult.stdout);
        res.json({ success: false, output: compileResult.stdout, type: 'compile_error', errorLines });
      }
      return;
    }

    // Compile
    const compileResult = await execCommand(`gcc -g -Wall "${srcPath}" -o "${exePath}" 2>&1`);

    if (compileResult.exitCode !== 0) {
      const errorLines = parseErrorLines(compileResult.stdout);
      const tips = analyzeErrors(compileResult.stdout);
      res.json({ success: false, output: compileResult.stdout, type: 'compile_error', errorLines, smartTips: tips });
      return;
    }

    // Run with timeout
    const runResult = await execCommand(`"${exePath}"`, { stdin, timeout: 3000 });
    res.json({
      success: true,
      output: runResult.stdout + (runResult.stderr ? `\n[stderr]: ${runResult.stderr}` : ''),
      type: runResult.timedOut ? 'timeout' : 'success',
    });

  } catch (err) {
    res.json({ success: false, output: `系统错误: ${err.message}`, type: 'system_error' });
  } finally {
    // Cleanup temp files
    for (const f of [srcPath, exePath]) {
      unlink(f).catch(() => {});
    }
  }
});

/**
 * Get assembly output
 */
app.post('/api/assembly', async (req, res) => {
  const { code, optimization = '0' } = req.body;
  if (!code) return res.status(400).json({ success: false, output: '请提供代码', type: 'invalid_input' });

  const id = `asm_${Date.now()}`;
  const srcPath = path.join(TEMP_DIR, `${id}.c`);

  try {
    await writeFile(srcPath, code, 'utf-8');
    const result = await execCommand(`gcc -O${optimization} -S -masm=intel "${srcPath}" 2>&1`);
    const asmPath = srcPath.replace('.c', '.s');
    let asmOutput = '';
    try { asmOutput = await readFile(asmPath, 'utf-8'); } catch {}
    unlink(asmPath).catch(() => {});

    // Filter noise lines
    const filtered = asmOutput.split('\n')
      .filter(line => !line.match(/^\s*\.(cfi|type|file|loc|subsection|text|globl|section|align|size)/))
      .join('\n');

    res.json({ success: true, output: filtered, type: 'assembly' });
  } catch (err) {
    res.json({ success: false, output: `错误: ${err.message}`, type: 'system_error' });
  } finally {
    unlink(srcPath).catch(() => {});
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`[Embedded Learning Server] Running on http://localhost:${PORT}`);
});

// ======================== Utilities ========================

function execCommand(cmd, options = {}) {
  const { stdin = '', timeout = 5000 } = options;
  return new Promise((resolve) => {
    const isWindows = os.platform() === 'win32';
    const shell = isWindows ? 'cmd' : '/bin/sh';
    const flag = isWindows ? '/c' : '-c';

    const child = spawn(shell, [flag, cmd], {
      cwd: TEMP_DIR,
      timeout,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    if (stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    }

    child.on('error', () => {
      resolve({ stdout: stderr || stdout || '命令执行失败', exitCode: 1, timedOut: false });
    });

    child.on('close', (code) => {
      resolve({ stdout: stderr || stdout, exitCode: code || 0, timedOut });
    });

    child.on('exit', (code, signal) => {
      if (signal === 'SIGTERM') timedOut = true;
    });
  });
}

function parseErrorLines(output) {
  const lines = [];
  // Match patterns like "file.c:10:5: error: ..."
  const regex = /[\w.]+:(\d+):(\d+):/g;
  let match;
  while ((match = regex.exec(output)) !== null) {
    const lineNum = parseInt(match[1], 10);
    if (!lines.includes(lineNum)) lines.push(lineNum);
  }
  return lines;
}

function analyzeErrors(output) {
  const tips = [];
  const lower = output.toLowerCase();

  if (lower.includes('undeclared') || lower.includes("was not declared")) {
    tips.push({ title: '未声明的变量/函数', hint: '检查拼写是否正确，确认是否已声明或引入了对应的头文件。' });
  }
  if (lower.includes("expected") && lower.includes(";") || lower.includes("expected ';'")) {
    tips.push({ title: '缺少分号', hint: '在上一行语句末尾检查是否缺少分号 ; 。' });
  }
  if (lower.includes("incompatible") && lower.includes("pointer")) {
    tips.push({ title: '指针类型不兼容', hint: '检查指针声明和赋值类型是否匹配，注意 void* 与其他指针的转换。' });
  }
  if (lower.includes("segmentation fault") || lower.includes("segfault")) {
    tips.push({ title: '段错误', hint: '可能的原因：解引用空指针、数组越界访问、使用已释放的内存。' });
  }
  if (lower.includes("format") && lower.includes("%d") && lower.includes("float")) {
    tips.push({ title: '格式化字符串错误', hint: '浮点数应使用 %f 或 %lf，整数使用 %d。' });
  }
  if (lower.includes("scanf") && !lower.includes("&")) {
    tips.push({ title: 'scanf 缺少 &', hint: 'scanf 读取变量时需要传地址，例如 scanf("%d", &a);' });
  }

  return tips;
}
