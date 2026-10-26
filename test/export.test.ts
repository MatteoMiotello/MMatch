import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toM3u8, toNml, traktorLocation } from '../src/main/export.ts'

const track = {
  path: '/Users/dj/Music/Deep & Dark.mp3',
  title: 'Deep & Dark',
  artist: 'Someone',
  playable: true
}

test('traktorLocation on boot volume', () => {
  assert.deepEqual(traktorLocation('/Users/dj/Music/a.mp3'), {
    volume: 'Macintosh HD',
    dir: '/:Users/:dj/:Music/:',
    file: 'a.mp3',
    key: 'Macintosh HD/:Users/:dj/:Music/:a.mp3'
  })
})

test('traktorLocation on external volume', () => {
  const l = traktorLocation('/Volumes/USB/Techno/b.wav')
  assert.equal(l.volume, 'USB')
  assert.equal(l.key, 'USB/:Techno/:b.wav')
})

test('m3u8', () => {
  assert.equal(
    toM3u8([track]),
    '#EXTM3U\n#EXTINF:-1,Someone - Deep & Dark\n/Users/dj/Music/Deep & Dark.mp3\n'
  )
})

test('nml escapes and links playlist to collection', () => {
  const nml = toNml([track], 'Set <1>')
  assert.match(nml, /TITLE="Deep &amp; Dark"/)
  assert.match(nml, /NAME="Set &lt;1&gt;"/)
  assert.match(nml, /KEY="Macintosh HD\/:Users\/:dj\/:Music\/:Deep &amp; Dark.mp3"/)
  assert.match(nml, /<PLAYLIST ENTRIES="1"/)
})
