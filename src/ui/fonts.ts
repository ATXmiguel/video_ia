import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';

export const DISPLAY = loadAnton('normal', {weights: ['400'], subsets: ['latin']}).fontFamily;
export const BODY = loadInter('normal', {weights: ['600', '800'], subsets: ['latin']}).fontFamily;
