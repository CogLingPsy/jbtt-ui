export class SuggestionModel {
  public active = false;

  constructor(
    public readonly id: number,
    public readonly sentenceId: number,
    public readonly start: number,
    public readonly end: number,
    public readonly errorText: string,
    public readonly replacements: string[]
  ) {
  }
}
