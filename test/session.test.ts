import { test } from 'node:test'
import assert from 'node:assert/strict'
import { relinkSession } from '../src/renderer/src/lib/session.ts'

const track = { path: '/Volumes/USB/Techno/a.mp3', title: 'a', playable: true }

test('relinkSession moves folder, seen and kept paths', () => {
  const session = relinkSession(
    {
      folders: ['/Volumes/USB/Techno', '/Users/dj/House'],
      hidden: ['/Volumes/USB/Techno'],
      seen: ['/Volumes/USB/Techno/a.mp3', '/Users/dj/House/b.mp3'],
      kept: [track]
    },
    '/Volumes/USB/Techno',
    '/Volumes/USB 1/Techno'
  )
  assert.deepEqual(session.folders, ['/Volumes/USB 1/Techno', '/Users/dj/House'])
  assert.deepEqual(session.hidden, ['/Volumes/USB 1/Techno'])
  assert.deepEqual(session.seen, ['/Volumes/USB 1/Techno/a.mp3', '/Users/dj/House/b.mp3'])
  assert.equal(session.kept[0].path, '/Volumes/USB 1/Techno/a.mp3')
})

test('relinkSession leaves sibling folders with a shared prefix alone', () => {
  const session = relinkSession(
    { folders: ['/Music/Techno', '/Music/Techno 2'], hidden: [], seen: [], kept: [] },
    '/Music/Techno',
    '/Archive/Techno'
  )
  assert.deepEqual(session.folders, ['/Archive/Techno', '/Music/Techno 2'])
})

test('relinkSession onto a folder already in the session merges them', () => {
  const session = relinkSession(
    { folders: ['/Old', '/New'], hidden: [], seen: [], kept: [] },
    '/Old',
    '/New'
  )
  assert.deepEqual(session.folders, ['/New'])
})
