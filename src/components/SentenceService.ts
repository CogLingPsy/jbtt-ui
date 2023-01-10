import { SentenceModel } from 'components/SentenceModel';
import * as api from '../api/api';
import { SuggestionModel } from 'components/SuggestionModel';

export class SentenceService {
  static async getSuggest(text: string): Promise<SentenceModel[]> {
    const suggest = await api.getSuggest(text);
    let suggestionId = 0;
    return suggest.map((sentence, sentenceId) => new SentenceModel(
      sentenceId,
      sentence.text,
      sentence.suggestions.map(suggestion =>
        new SuggestionModel(
          suggestionId++,
          sentenceId,
          suggestion.start,
          suggestion.end,
          sentence.text.substring(suggestion.start, suggestion.end),
          suggestion.replacements
        )).sort((a, b) => a.start - b.start)
    ));
  }
}

