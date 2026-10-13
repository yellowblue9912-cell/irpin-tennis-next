import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('./ratingInsights.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { calculateRatingInsights: calculate } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);
const player = (id, rating = 3, is_active = true) => ({ id, rating, rating_base: 3, is_active });
const row = (id, opponent, before, after, match = '1', day = 1) => ({
  player_id: id, opponent_id: opponent, rating_before: before, rating_after: after,
  source_type: 'league', source_match_id: match, event_date: `2026-01-0${day}T00:00:00.001Z`,
});

test('no fabricated numbers without match history', () => {
  assert.deepEqual(calculate('a', [player('a')], []), {
    averageOpponentRating: null, opponentMatches: 0, highestRank: null,
  });
});
test('averages pre-match opponents per match, including repeat opponents and zero changes', () => {
  const history = [row('a','b',3,3.01),row('b','a',2,1.99),
    row('a','b',3.01,3.01,'2',2),row('b','a',1.99,1.99,'2',2),
    row('a','c',3.01,2.96,'3',3),row('c','a',4,4.05,'3',3)];
  const result = calculate('a', [player('a',2.96),player('b',1.99),player('c',4.05)], history);
  assert.equal(result.opponentMatches, 3);
  assert.equal(result.averageOpponentRating, (2+1.99+4)/3);
});
test('doubles averages both opposing players, not own partner', () => {
  const history = [row('a','c',3,3.03),row('b','c',5,5.03),row('c','a',2,1.97),row('d','a',4,3.97)];
  assert.equal(calculate('a', ['a','b','c','d'].map(id=>player(id)), history).averageOpponentRating, 3);
  assert.equal(calculate('b', ['a','b','c','d'].map(id=>player(id)), history).averageOpponentRating, 3);
});
test('opponent changes can improve peak even when the player does not play', () => {
  const history = [row('a','c',3,3.01),row('c','a',2,1.99),
    row('b','c',3.02,2.97,'2',2),row('c','b',1.99,2.04,'2',2)];
  assert.equal(calculate('a', [player('a',3.01),player('b',2.97),player('c',2.04)], history).highestRank, 1);
});
test('same-match updates are atomic; inactive players do not take ranking places', () => {
  const history = [row('a','b',3,3.03),row('b','a',3.1,3.13)];
  assert.equal(calculate('a', [player('a',3.03),player('b',3.13),player('c',7,false)], history).highestRank, 2);
});
test('ties use displayed precision and database name order', () => {
  const history = [row('a','b',3.001,3.001),row('b','a',3.004,3.004)];
  assert.equal(calculate('a', [player('a'),player('b')], history).highestRank, 1);
  assert.equal(calculate('b', [player('a'),player('b')], history).highestRank, 2);
});
test('missing opponent history is not counted as zero', () => {
  assert.equal(calculate('a', [player('a')], [row('a','b',3,3.01)]).opponentMatches, 0);
});
test('inactive profile keeps opponent average but has no active ranking peak', () => {
  const result = calculate('a', [player('a',3,false),player('b')], [row('a','b',3,3),row('b','a',3,3)]);
  assert.equal(result.averageOpponentRating, 3);
  assert.equal(result.highestRank, null);
});
