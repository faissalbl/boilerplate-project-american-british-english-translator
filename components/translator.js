const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js")
const britishOnly = require('./british-only.js')

const AMERICAN_TO_BRITISH = 'american-to-british';
const BRITISH_TO_AMERICAN = 'british-to-american';

class Translator {
  constructor() {
    this.britishToAmericanSpelling = {};
    this.britishToAmericanTitles = {};

    for (const [key, value] of Object.entries(americanToBritishSpelling)) {
      this.britishToAmericanSpelling[value] = key;
    }

    for (const [key, value] of Object.entries(americanToBritishTitles)) {
      this.britishToAmericanTitles[value] = key;
    }
  }

  static get AMERICAN_TO_BRITISH() {
    return AMERICAN_TO_BRITISH;
  }

  static get BRITISH_TO_AMERICAN() {
    return BRITISH_TO_AMERICAN;
  }

  removePunctuationMarks(text) {
    return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  }

  translate(text, locale) {
    const americanToBritish = locale === AMERICAN_TO_BRITISH;
    const britishToAmerican = locale === BRITISH_TO_AMERICAN;

    if (!americanToBritish && !britishToAmerican) {
      return;
    }

    let translatableMap;
    let titlesMap;
    let spellingMap;
    let timeSeparatorPair;
    if (americanToBritish) {
      translatableMap = americanOnly;
      titlesMap = americanToBritishTitles;
      spellingMap = americanToBritishSpelling;
      timeSeparatorPair = [':', '.'];
    } else if (britishToAmerican) {
      translatableMap = britishOnly;
      titlesMap = this.britishToAmericanTitles;
      spellingMap = this.britishToAmericanSpelling;
      timeSeparatorPair = ['.', ':'];
    }

    const words = text.split(' ');

    // translation could contain term of more than one word. 
    // so we have to look for translatable segments of the text.
    const translatableSegments = {};
    for (let i = 0; i < words.length; i++) {
      for (let j = words.length; j > i; j--) {
        const segmentWords = words.slice(i, j);
        const segment = this.removePunctuationMarks(segmentWords.join(' ').toLowerCase());
        const translatedSegment = translatableMap[segment];
        if (translatedSegment) {
          translatableSegments[segment] = translatedSegment;
        }
      }
    }

    // now we have to look for spelling and titles
    const translatableSpellings = {};
    const translatableTitles = {};
    words.forEach(w => {
      let wLower = w.toLowerCase();
      if (wLower in titlesMap) {
        let translatedTitle = titlesMap[wLower];
        translatedTitle = translatedTitle.charAt(0).toUpperCase() + translatedTitle.slice(1);
        translatableTitles[wLower] = translatedTitle;
      }

      wLower = this.removePunctuationMarks(wLower);
      if (wLower in spellingMap) {
        translatableSpellings[wLower] = spellingMap[wLower];
      }
    });

    // now we translate the text
    let translatedText = text;
    for (const [segment, translatedSegment] of Object.entries(translatableSegments)) {
      translatedText = translatedText.replace(new RegExp(segment, 'i'), `<span class="highlight">${translatedSegment}</span>`);
    }

    for (const [spelling, translatedSpelling] of Object.entries(translatableSpellings)) {
      translatedText = translatedText.replace(new RegExp(spelling, 'i'), `<span class="highlight">${translatedSpelling}</span>`);
    }

    for (const [title, translatedTitle] of Object.entries(translatableTitles)) {
      translatedText = translatedText.replace(new RegExp(title, 'i'), `<span class="highlight">${translatedTitle}</span>`);
    }
    
    // now we translate the time
    const timeRegexPattern = `([0-9]+)${timeSeparatorPair[0]}([0-9]+)`;
    const timeRegex = new RegExp(timeRegexPattern, 'g');
    const matches = translatedText.match(timeRegex);
    if (matches) {
      matches.forEach(match => {
        const translatedTime = match.replace(timeSeparatorPair[0], timeSeparatorPair[1]);
        translatedText = translatedText.replace(match, `<span class="highlight">${translatedTime}</span>`);
      });
    }
    
    return translatedText;
  }
}

module.exports = Translator;