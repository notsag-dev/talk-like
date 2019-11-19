const path = require('path');
const fs = require('fs');
const {promisify} = require('util');
const readFileAsync = promisify(fs.readFile);

module.exports = {
  init() {
    this.wordDict = {};
  },

  /**
   * Train from a path that contains text files.
   *
   */
  async trainFromCorpusPath(dataPath, newDict = true) {
    if (newDict) {
      this.wordDict = {};
    }
    const files = fs.readdirSync(dataPath);
    const readPromises = [];
    for (let i = 0; i < files.length; i++) {
      readPromises.push(readFileAsync(path.join(dataPath, files[i]), 'utf-8'));
    }
    const res = await Promise.all(readPromises);
    return this.train(res, false);
  },

  /**
   * Remove invalid characters from words.
   *
   */
  getCleanWord(word) {
    return word.replace(/[^A-zÀ-ú']/g, '').toLowerCase();
  },

  /**
   * Train the algorithm.
   *
   * @param Array<string> corpus Text input of the algorithm.
   *
   * @return object dictionary of ngrams and their probabilities.
   *
   */
  train(corpus, newDict = true) {
    if (newDict) {
      this.wordDict = {};
    }
    corpus.forEach(text => {
      const words = text.split(/[\s+]/).map(w => this.getCleanWord(w));
      for (let i = 1; i < words.length; i++) {
        const w = words[i];
        if (!w) {
          continue;
        }
        const pw = words[i - 1];
        if (!this.wordDict[pw]) {
          this.wordDict[pw] = {};
        }
        this.wordDict[pw][w] = this.wordDict[pw][w]
          ? this.wordDict[pw][w] + 1
          : 1;
      }
    });
    return this.wordDict;
  },

  /**
   * Get a random integer in range [min, max]
   *
   */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  },

  /**
   * Select randomly from a set of weighted elements.
   *
   */
  getWeightedRandom(elems) {
    if (!elems || !elems.length) {
      return;
    }
    const maxWeight = elems[elems.length - 1].weight;
    const r = Math.random() * maxWeight;
    let done = false;
    for (let i = 0; i < elems.length; i++) {
      if (r < elems[i].weight) {
        return elems[i];
      }
    }
  },

  /**
   * Getter wordDict.
   *
   */
  getWordDict() {
    return this.wordDict;
  },

  /**
   * Get a word given the previous word.
   * TODO: extend to nGram
   *
   */
  getCoincidencesArray(word) {
    const wordFollowedBy = this.wordDict[word];
    if (!wordFollowedBy) {
      return [];
    }
    return Object.keys(wordFollowedBy).map(word => ({
      word,
      weight: wordFollowedBy[word],
    }));
  },

  /**
   * Get next word from previous word.
   *
   */
  getNextWord(prevWord) {
    let globalWeight = 0;
    const coincidences = this.getCoincidencesArray(prevWord).map(c => {
      globalWeight += c.weight;
      return {obj: c, weight: globalWeight};
    });
    const rand = this.getWeightedRandom(coincidences);
    return rand ? rand.obj.word : '';
  },

  /**
   * Generates a message starting with a specific word.
   *
   */
  generateMsgStartingWith(word, length = 100) {
    let lastWord = word;
    let result = [word];
    for (let i = 0; i < length; i++) {
      const nextWord = this.getNextWord(lastWord);
      if (!nextWord) {
        return result.join(' ');
      }
      result.push(nextWord);
      lastWord = nextWord;
    }
    return result.join(' ');
  },
};
