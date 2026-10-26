import { test } from 'node:test'
import assert from 'node:assert/strict'
import { foldBpm, formatKey } from '../src/renderer/src/lib/music.ts'

test('every notation converts to every other', () => {
  const same = [
    ['8A', 'Am', '1m'],
    ['8B', 'C', '1d'],
    ['1A', 'Abm', '6m'],
    ['12B', 'E', '5d'],
    ['11A', 'F#m', '4m']
  ]
  for (const [camelot, musical, openKey] of same) {
    for (const input of [camelot, musical, openKey]) {
      assert.equal(formatKey(input, 'camelot'), camelot, input)
      assert.equal(formatKey(input, 'musical'), musical, input)
      assert.equal(formatKey(input, 'openkey'), openKey, input)
    }
  }
})

test('musical spellings from tags', () => {
  assert.equal(formatKey('A minor', 'camelot'), '8A')
  assert.equal(formatKey('G#m', 'musical'), 'Abm')
  assert.equal(formatKey('C♯m', 'camelot'), '12A')
  assert.equal(formatKey('Bbmaj', 'camelot'), '6B')
  assert.equal(formatKey('d', 'camelot'), '10B')
  assert.equal(formatKey('Cb', 'camelot'), '1B')
})

test('unknown keys pass through unchanged', () => {
  assert.equal(formatKey('Am/C', 'camelot'), 'Am/C')
  assert.equal(formatKey('13A', 'musical'), '13A')
})

test('foldBpm moves octave errors into range', () => {
  assert.equal(foldBpm(174, 65, 130), 87)
  assert.equal(foldBpm(62, 65, 130), 124)
  assert.equal(foldBpm(124, 65, 130), 124)
  assert.equal(foldBpm(0, 65, 130), 0)
  // range narrower than an octave: leave it rather than overshoot
  assert.equal(foldBpm(140, 120, 130), 140)
})
