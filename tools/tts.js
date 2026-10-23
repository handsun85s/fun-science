/* 用这台 Windows 电脑合成中文朗读（serve.js 现场合成、build-audio.js 提前生成都用它）
   用 Windows 自带的 System.Speech（中文“慧慧”），不联网。
   常驻一个 PowerShell 进程负责合成（每次新开要两三秒，常驻后一句只要零点几秒）。 */
'use strict';
const fs = require('fs');
const { spawn } = require('child_process');

const TTS_OK = process.platform === 'win32';
// 每行收到一个任务：两段 base64（文字、输出路径），文字只当数据用，不会被当成命令执行
const WORKER = `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$zh = $s.GetInstalledVoices() | Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.Name -like 'zh*' } | Select-Object -First 1
if (-not $zh) { [Console]::Out.WriteLine('NO_ZH_VOICE'); exit 2 }
$s.SelectVoice($zh.VoiceInfo.Name)
$s.Rate = -1
$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(16000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
$utf8 = [System.Text.Encoding]::UTF8
[Console]::Out.WriteLine('READY')
while ($null -ne ($line = [Console]::In.ReadLine())) {
  try {
    $parts = $line.Split(' ')
    $text = $utf8.GetString([Convert]::FromBase64String($parts[0]))
    $out = $utf8.GetString([Convert]::FromBase64String($parts[1]))
    $s.SetOutputToWaveFile($out, $fmt)
    $s.Speak($text)
    $s.SetOutputToNull()
    [Console]::Out.WriteLine('OK')
  } catch {
    $s.SetOutputToNull()
    [Console]::Out.WriteLine('ERR ' + $_.Exception.Message)
  }
}
`;
let worker = null, workerReady = null, pending = null, queue = Promise.resolve();

function startWorker() {
  if (workerReady) return workerReady;
  workerReady = new Promise((resolve, reject) => {
    const ps = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', WORKER], { windowsHide: true });
    worker = ps;
    let buf = '';
    ps.stdout.setEncoding('utf8');
    ps.stdout.on('data', d => {
      buf += d;
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (line === 'READY') resolve();
        else if (line === 'NO_ZH_VOICE') reject(new Error('这台电脑上没有中文语音'));
        else if (pending) { const cb = pending; pending = null; cb(line); }
      }
    });
    ps.on('error', err => reject(err));
    ps.on('exit', () => {
      // 进程意外退出：下次用到时重新启动
      worker = null;
      workerReady = null;
      if (pending) { const cb = pending; pending = null; cb('ERR 合成进程退出了'); }
      reject(new Error('合成进程启动失败'));
    });
  });
  workerReady.catch(() => { workerReady = null; });
  return workerReady;
}

async function synthesizeNow(text, out) {
  await startWorker();
  const tmp = `${out}.${process.pid}.tmp.wav`;
  const b64 = s => Buffer.from(s, 'utf8').toString('base64');
  const line = await new Promise(resolve => {
    const timer = setTimeout(() => {
      pending = null;
      if (worker) worker.kill(); // 卡住了就重启
      resolve('ERR 合成超时');
    }, 60000);
    pending = l => { clearTimeout(timer); resolve(l); };
    worker.stdin.write(`${b64(text)} ${b64(tmp)}\n`);
  });
  if (line !== 'OK' || !fs.existsSync(tmp)) {
    fs.rmSync(tmp, { force: true });
    throw new Error('合成失败：' + line);
  }
  fs.renameSync(tmp, out);
}

/* 把一段文字合成成 wav 文件（16kHz、16 位、单声道），一次只合成一句 */
function synthesize(text, out) {
  const job = queue.then(() => synthesizeNow(text, out));
  queue = job.catch(() => {});
  return job;
}

function stopWorker() {
  if (worker) worker.kill();
}

module.exports = { TTS_OK, startWorker, synthesize, stopWorker };
