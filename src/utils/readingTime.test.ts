import { expect, test } from 'vitest'
import { readingTime } from './readingTime'

test('retorna 1 para texto muito curto', () => {
  expect(readingTime('olá mundo')).toBe(1)
})

test('retorna 2 para 400 palavras', () => {
  const text = Array(400).fill('palavra').join(' ')
  expect(readingTime(text)).toBe(2)
})

test('retorna 1 para texto vazio', () => {
  expect(readingTime('')).toBe(1)
})

test('ignora espaços extras', () => {
  const text = '  palavra   outra  '
  expect(readingTime(text)).toBe(1)
})
