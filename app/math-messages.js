const messages = {
  empty: 'Trage in jedes Zahlenfeld eine Zahl ein. Entferne Felder, die du nicht brauchst.',
  'too-long': 'Eine Eingabe darf höchstens 32 Zeichen haben, einschließlich Leerzeichen.',
  'non-digit': 'Gib eine ganze Zahl ohne Minuszeichen ein, zum Beispiel 24. Rechenzeichen, Brüche und Kommazahlen passen hier nicht.',
  'out-of-range': 'Hier sind Zahlen von 0 bis 999999 möglich.',
  'too-many-entries': 'Eine Liste darf höchstens 20 Zahlen enthalten.',
  'duplicate-values': 'In einer Menge darf jede Zahl nur einmal stehen. Entferne doppelte Zahlen; auch 02 und 2 sind dieselbe Zahl.',
};
export const numericInputMessage = reason => messages[reason] || 'Prüfe deine Zahlen noch einmal. Diese Eingabe lässt sich noch nicht bewerten.';
