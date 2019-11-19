#!/usr/bin/env node
const lyrics = require('../../lyrics-corpus/');
const chatty = require('../');
const readline = require('readline');

const logHelp = () => {
  console.log(`
    NAME
      talk-like -- Talk like your favorite singer!

    SYNOPSIS
      talk-like [artistName]

    EXAMPLES
      talk-like nirvana
      talk-like rage against the machine
  `);
};

const talkLike = async (artistName, numSongs = 20) => {
  if (!args.length) {
    logHelp();
    return;
  }
  console.log('Loading random songs...\n');
  const corpus = await lyrics.generateLyricsCorpus(artistName, '', numSongs, true, false);
  if (!corpus.length) {
    console.log('Artist not found.');
  }
  const artist = Object.create(chatty);
  artist.init();
  artist.train(corpus);
  console.log('\nPress enter to generate new messages...')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.on('line', (start) => {
    console.log(artist.generateMsgStartingWith(start));
    console.log('\n***');
  });
};

const [, , ...args] = process.argv;
talkLike(args.join(' '));
