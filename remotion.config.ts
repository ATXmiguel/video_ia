import {Config} from '@remotion/cli/config';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// The bundled headless Chrome can sit past Windows' 260-char path limit; use a short copy when present.
const shortChrome = path.join(os.homedir(), '.cache', 'remotion-chrome', 'chrome-headless-shell.exe');
if (fs.existsSync(shortChrome)) Config.setBrowserExecutable(shortChrome);
