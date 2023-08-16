import {
  common,
  composed,
  hate,
  homophobic,
  racist,
} from '../../lib/badwords/dictionary.json';

const localListES = [...common, ...composed, ...hate, ...homophobic, ...racist];

/**
 * Determine if a string contains profane language.
 * @param string - String to evaluate for profanity.
 */
export function isProfane(string: string) {
  return (
    localListES.filter((word) => {
      const wordExp = new RegExp(
        `\\b${word.replace(/(\W)/g, '\\$1')}\\b`,
        'gi'
      );
      return wordExp.test(string) || string.includes(word);
    }).length > 0 || false
  );
}
