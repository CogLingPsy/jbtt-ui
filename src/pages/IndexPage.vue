<template>
  <q-page class="row justify-evenly q-pt-lg">
    <div class="col-xs-12 col-md-6 col-lg-6">
      <QuillEditor
        :options="options"
        ref="editor"
        theme="snow"
        content=""
        contentType="html"
        @click="handleClick"
        @textChange="onTextChange"
        style="height: fit-content; min-height: 300px"
      />
    </div>
    <div class="col-xs-12 col-md-4 col-lg-2">
      <div class="row items-center">
        <q-circular-progress
          show-value
          :indeterminate="pendingChanges"
          class="text-primary q-ma-md"
          :value="suggestionsNum"
          :max="suggestionsNum"
          size="50px"
          color="primary"
        />
        <div class="text-h5">Suggestions</div>
      </div>
      <q-scroll-area class="q-ma-md" style="height: 80%">
        <template v-for="sentence in suggest" :key="sentence.id">
          <q-card
            v-for="suggest in sentence.suggestions"
            :key="suggest.id"
            ref="card"
            class="q-ma-md"
            bordered
          >
            <q-card-section
              @click="toggleSuggestion(suggest)">
              <div class="row items-center">{{ suggest.errorText }}
                <q-space></q-space>
                <q-btn
                  color="grey"
                  round
                  flat
                  dense
                  :icon="suggest.active ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                />
              </div>
            </q-card-section>
            <q-slide-transition>
              <div v-show="suggest.active">
                <q-card-actions class="q-pt-none">
                  <q-chip
                    clickable
                    @click="applySuggestion(sentence, suggest, r)"
                    v-for="r in suggest.replacements"
                    :key="r"
                    color="primary" text-color="white"
                  >
                    {{ r }}
                  </q-chip>
                </q-card-actions>
              </div>
            </q-slide-transition>
          </q-card>
        </template>
      </q-scroll-area>
    </div>
  </q-page>
</template>

<script lang="ts">
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { defineComponent } from 'vue';
import { markupText } from 'components/SentenceProcessor';
import { QCard, scroll } from 'quasar';
import { SentenceService } from 'components/SentenceService';
import { SentenceModel } from 'components/SentenceModel';
import { SuggestionModel } from 'components/SuggestionModel';

const { getScrollTarget, setVerticalScrollPosition } = scroll;

export default defineComponent({
  name: 'IndexPage',
  components: { QuillEditor },
  data: () => {
    return {
      options: {
        modules: {
          toolbar: false
        }
      },
      activeSuggestion: null as SuggestionModel | null,
      suggest: [] as SentenceModel[],
      lastChangeTs: 0,
      timer: null as null | number,
      pendingChanges: false
    };
  },

  computed: {
    suggestionsNum: function(): number {
      return this.suggest.map(s => s.suggestions.length).reduce((partialSum, a) => partialSum + a, 0);
    }
  },

  methods: {
    async setSuggest(ts: number): Promise<boolean> {
      const editor = this.$refs.editor as typeof QuillEditor;

      let index = 0;
      const selection: { index: number } | null = editor.getQuill().getSelection(true);
      if (selection !== null) {
        index = selection.index;
      }
      const text: string = editor.getText().slice(0, -1);
      const suggest = await SentenceService.getSuggest(text);
      const markup = markupText(suggest);

      if (ts >= this.lastChangeTs) {
        this.suggest = suggest;
        editor.setContents(markup, 'silent');
        if (editor.getText().length <= index) {
          index = editor.getText().length - 1;
        }
        editor.getQuill().focus();
        editor.getQuill().getSelection(true);
        editor.getQuill().setSelection(index, 0, 'silent');
        return true;
      } else {
        return false;
      }
    },
    async onTextChange() {
      const ts = new Date().valueOf();
      if (this.timer !== null) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.pendingChanges = true;
      this.lastChangeTs = ts;
      this.timer = setTimeout(async () => {
        const suggestWasApplied = await this.setSuggest(ts);
        this.pendingChanges = !suggestWasApplied;
      }, 2000) as unknown as number;
    },
    toggleSuggestion(suggest: SuggestionModel) {
      if (this.activeSuggestion !== null) {
        if (this.activeSuggestion.id === suggest.id) {
          this.activeSuggestion = null;
          suggest.active = false;
        } else {
          this.activeSuggestion.active = false;
          this.activeSuggestion = suggest;
          this.activeSuggestion.active = true;
        }
      } else {
        this.activeSuggestion = suggest;
        this.activeSuggestion.active = true;
      }
    },
    scrollToElement(el: HTMLElement) {
      const target = getScrollTarget(el);
      const offset = el.offsetTop - 100;
      const duration = 100;
      setVerticalScrollPosition(target, offset, duration);
    },
    applySuggestion(sentence: SentenceModel, suggestion: SuggestionModel, replacement: string) {
      sentence.applySuggestion(suggestion, replacement);
      const markup = markupText(this.suggest);
      const editor = this.$refs.editor as typeof QuillEditor;
      editor.setContents(markup, 'silent');
    },
    handleClick(e: PointerEvent) {
      if (e.target) {
        const clickedHint: HTMLElement | null = (e.target as HTMLElement).closest('.hint');
        if (clickedHint !== null) {
          const { sentId, suggId } = clickedHint.dataset;
          if (sentId !== undefined && suggId !== undefined) {
            const sentenceId = parseInt(sentId);
            const suggestionId = parseInt(suggId);
            const suggestion = this.suggest[sentenceId].suggestions.find(s => s.id === suggestionId);
            if (suggestion !== undefined) {
              if (this.activeSuggestion !== null) {
                this.activeSuggestion.active = false;
              }
              this.activeSuggestion = suggestion;
              suggestion.active = true;
            }

            this.scrollToElement((this.$refs.card as typeof QCard[])[suggestionId].$el);
          }
        } else {
          const editor = this.$refs.editor as typeof QuillEditor;
          editor.getQuill().focus();
        }
      }
    }
  }
});
</script>

<style>
.hint {
  border-bottom: 2px solid #EA1537;
}

.ql-editor {
  font-size: 18px;
}
</style>
