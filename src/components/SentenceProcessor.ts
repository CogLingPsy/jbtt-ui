import { SentenceModel } from 'components/SentenceModel';

function markupSentence(sentence: SentenceModel): string {
  let markedText = sentence.text;
  let shift = 0;
  sentence.suggestions.forEach((suggestion) => {
    const toMark = markedText.substring(suggestion.start + shift, suggestion.end + shift);
    const marked = `<em class="hint" data-sent-id="${sentence.id}" data-sugg-id="${suggestion.id}">${toMark}</em>`;
    markedText = markedText.substring(0, suggestion.start + shift)
      + marked + markedText.substring(suggestion.end + shift);
    shift += marked.length - toMark.length;
  });
  return markedText;
}

export function markupText(sentences: SentenceModel[]) {
  const marked = sentences.map((sentence) => markupSentence(sentence));
  let text = '';
  marked.forEach(sentence => {
    if (text !== '' && !text.endsWith('\n') && sentence !== '\n') {
      text += ' ' + sentence;
    } else {
      text += sentence;
    }
  });
  return `<p>${text}</p>`;
}
