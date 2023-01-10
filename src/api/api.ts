import { Sentence } from 'components/models';
import axios from 'axios';

export async function getSuggest(text: string): Promise<Sentence[]> {
  return (await axios.post('/api/processText', { text })).data;
}
