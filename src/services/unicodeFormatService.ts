// Comprehensive Unicode Font Stylers & Inverters

// 1. Math Sans-Serif Bold (2-byte / surrogate pairs handled via Array.from / code points)
const BOLD_MAP: Record<string, string> = {
  a: '𝗮', b: '𝗯', c: '𝗰', d: '𝗱', e: '𝗲', f: '𝗳', g: '𝗴', h: '𝗵', i: '𝗶', j: '𝗷',
  k: '𝗸', l: '𝗹', m: '𝗺', n: '𝗻', o: '𝗼', p: '𝗽', q: '𝗾', r: '𝗿', s: '𝘀', t: '𝘁',
  u: '𝘂', v: '𝘃', w: '𝘄', x: '𝘅', y: '𝘆', z: '𝘇',
  A: '𝗔', B: '𝗕', C: '𝗖', D: '𝗗', E: '𝗘', F: '𝗙', G: '𝗚', H: '𝗛', I: '𝗜', J: '𝗝',
  K: '𝗞', L: '𝗟', M: '𝗠', N: '𝗡', O: '𝗢', P: '𝗣', Q: '𝗤', R: '𝗥', S: '𝗦', T: '𝗧',
  U: '𝗨', V: '𝗩', W: '𝗪', X: '𝗫', Y: '𝗬', Z: '𝗭',
  '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
};

const BOLD_UNMAP: Record<string, string> = {};
Object.entries(BOLD_MAP).forEach(([k, v]) => {
  BOLD_UNMAP[v] = k;
});

// 2. Combining Characters
const COMBINING_STRIKE = '\u0336';
const COMBINING_UNDERLINE = '\u0332';

export const UnicodeFormatService = {
  // Convert to Bold or revert
  toggleBold(text: string): string {
    const chars = Array.from(text);
    const isAlreadyBold = chars.some(char => BOLD_UNMAP[char]);
    
    if (isAlreadyBold) {
      // Revert back to plain text
      return chars.map(char => BOLD_UNMAP[char] || char).join('');
    } else {
      // Convert to bold
      return chars.map(char => BOLD_MAP[char] || char).join('');
    }
  },

  // Toggle Underline (iterating over full code points so surrogates are never split)
  toggleUnderline(text: string): string {
    const isAlreadyUnderlined = text.includes(COMBINING_UNDERLINE);
    if (isAlreadyUnderlined) {
      return text.replaceAll(COMBINING_UNDERLINE, '');
    } else {
      const chars = Array.from(text);
      return chars.map(char => {
        if (char === '\n' || char === '\r' || char === ' ' || char === COMBINING_STRIKE || char === COMBINING_UNDERLINE) {
          return char;
        }
        return char + COMBINING_UNDERLINE;
      }).join('');
    }
  },

  // Toggle Strikethrough (iterating over full code points so surrogates are never split)
  toggleStrike(text: string): string {
    const isAlreadyStriked = text.includes(COMBINING_STRIKE);
    if (isAlreadyStriked) {
      return text.replaceAll(COMBINING_STRIKE, '');
    } else {
      const chars = Array.from(text);
      return chars.map(char => {
        if (char === '\n' || char === '\r' || char === ' ' || char === COMBINING_STRIKE || char === COMBINING_UNDERLINE) {
          return char;
        }
        return char + COMBINING_STRIKE;
      }).join('');
    }
  },

  // Toggle Title (Uppercase Bold Sans)
  toggleTitle(text: string): string {
    const chars = Array.from(text);
    const isAlreadyBoldUpper = chars.some(char => BOLD_UNMAP[char]);

    if (isAlreadyBoldUpper) {
      return chars.map(char => BOLD_UNMAP[char] || char).join('');
    } else {
      return chars.map(char => {
        const plain = BOLD_UNMAP[char] || char;
        const upper = plain.toUpperCase();
        return BOLD_MAP[upper] || upper;
      }).join('');
    }
  },
};
