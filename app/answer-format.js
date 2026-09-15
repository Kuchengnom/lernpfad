/** Shared answer display for immediate and restored feedback. */
export function expectedAnswer(exercise) {
  if (exercise.choices) return exercise.choices.find(choice => choice.id === exercise.correctChoiceIds[0]).text;
  if (exercise.tiles) return exercise.correctOrder.map(id => exercise.tiles.find(tile => tile.id === id).text).join(' ');
  if (exercise.type === 'numeric-input') return exercise.acceptedValues.join(' oder ');
  if (exercise.type === 'number-list') {
    const values = exercise.expectedValues.join(exercise.comparison === 'multiset' ? ' · ' : ', ');
    return exercise.comparison === 'set' ? `{ ${values} }` : values;
  }
  return exercise.modelAnswer ?? exercise.acceptedAnswers[0];
}
