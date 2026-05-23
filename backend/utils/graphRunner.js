const { spawn } = require('child_process');
const path = require('path');

const ENGINE_PATH = process.env.CPP_ENGINE_PATH
  ? path.resolve(process.env.CPP_ENGINE_PATH)
  : path.resolve(__dirname, '../../cpp/metro_engine');

const DATA_PATH = process.env.DATA_PATH
  ? path.resolve(process.env.DATA_PATH)
  : path.resolve(__dirname, '../../data/stations.json');

/**
 * Run the C++ metro engine with given arguments.
 * Returns a parsed JSON result.
 */
function runEngine(args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ENGINE_PATH, args, {
      env: { ...process.env, DATA_PATH },
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (chunk) => (stdout += chunk));
    proc.stderr.on('data', (chunk) => (stderr += chunk));

    proc.on('error', (err) => {
      reject(new Error(`Failed to start engine: ${err.message}`));
    });

    proc.on('close', (code) => {
      if (stderr) console.error('[CPP stderr]', stderr.trim());
      try {
        const result = JSON.parse(stdout.trim());
        if (result.error) return reject(new Error(result.error));
        resolve(result);
      } catch {
        reject(new Error(`Invalid JSON from engine: ${stdout.trim()}`));
      }
    });
  });
}

module.exports = { runEngine };