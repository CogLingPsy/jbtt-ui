import { SuggestionModel } from 'components/SuggestionModel';

export class SentenceModel {
  constructor(
    public readonly id: number,
    public text: string,
    public readonly suggestions: SuggestionModel[]
  ) {
  }

  applySuggestion(suggestion: SuggestionModel, replacement: string) {
    this.text = `${this.text.substring(0, suggestion.start)}${replacement}${this.text.substring(suggestion.end, this.text.length)}`;
    const usedSuggestionIndex = this.suggestions.findIndex(s => s.id === suggestion.id);
    this.suggestions.splice(usedSuggestionIndex, 1);
  }
}
