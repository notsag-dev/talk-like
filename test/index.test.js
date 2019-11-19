const assert = require('assert');
const model = require('../index');

describe('Chatty', () => {
  describe('train', () => {
    it('generates a proper dictionary for a 1-element array', () => {
      const m = Object.create(model);
      m.init();
      assert.deepEqual(m.train(['hey how are you']), {
        hey: {how: 1},
        how: {are: 1},
        are: {you: 1},
      });
    });

    it('generates a proper dictionary for a 2-element array', () => {
      const m = Object.create(model);
      m.init();
      assert.deepEqual(m.train(['hey how are you', 'how is it']), {
        hey: {how: 1},
        how: {are: 1, is: 1},
        are: {you: 1},
        is: {it: 1},
      });
    });
  });

  describe('getCoincidencesArray', () => {
    it('Generates a simple array of coincidences', () => {
      const m = Object.create(model);
      m.init();
      m.wordDict = {
        hey: {how: 1},
        how: {are: 1},
        are: {you: 1},
      };
      assert.deepEqual(
        [{word: 'how', weight: 1}],
        m.getCoincidencesArray('hey'),
      );
    });
  });

  describe('getNextWord', () => {
    it('get a word that makes sense for a simple dict', () => {
      const m = Object.create(model);
      m.init();
      m.wordDict = {
        hey: {yo: 1},
      };
      assert.equal(m.getNextWord('hey'), 'yo');
    });
  });
});
