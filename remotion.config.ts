import {Config} from '@remotion/cli/config';
import fs from 'node:fs';

// The bundled headless Chrome can sit past Windows' 260-char path limit; use a short copy when present.
const shortChrome = 'C:/Users/migue/.cache/remotion-chrome/chrome-headless-shell.exe';
if (fs.existsSync(shortChrome)) Config.setBrowserExecutable(shortChrome);
