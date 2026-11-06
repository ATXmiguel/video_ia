import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadCaveat} from '@remotion/google-fonts/Caveat';

export const DISPLAY = loadAnton('normal', {weights: ['400'], subsets: ['latin']}).fontFamily;
export const BODY = loadInter('normal', {weights: ['600', '800'], subsets: ['latin']}).fontFamily;
export const HAND = loadCaveat('normal', {weights: ['700'], subsets: ['latin']}).fontFamily;
