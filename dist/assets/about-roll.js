import { aboutDefaults } from './about-content.js';

// Twenty equally sized intervals; consecutive rolls may repeat, just like a D20.
export function rollD20(random = Math.random) {
  const sample = random();
  if (!Number.isFinite(sample) || sample < 0 || sample >= 1) throw new RangeError('Random sample must be in [0, 1).');
  return 1 + Math.floor(sample * 20);
}

export function outcomeForRoll(value, outcomes) {
  if (!Number.isInteger(value) || value < 1 || value > 20) throw new RangeError('D20 result must be between 1 and 20.');
  const matching = (Array.isArray(outcomes) ? outcomes : []).filter(item => {
    if (!item || item.min === '' || item.min === null || item.min === undefined) return false;
    const min = Number(item.min), max = Number(item.max ?? item.min);
    return Number.isInteger(min) && Number.isInteger(max) && min >= 1 && max <= 20 && min <= max && value >= min && value <= max;
  });
  // A specific 1 or 20 takes precedence over a general range in the CMS.
  matching.sort((a, b) => (Number(a.max ?? a.min) - Number(a.min)) - (Number(b.max ?? b.min) - Number(b.min)));
  return matching[0] || aboutDefaults.roll_outcomes.find(item => value >= item.min && value <= item.max);
}
