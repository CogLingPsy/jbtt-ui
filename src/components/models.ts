export interface Sentence {
  text: string;
  suggestions: Suggestion[];
}

export interface Suggestion {
  start: number;
  end: number;
  replacements: string[];
}

