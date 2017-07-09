// https://github.com/hstarorg/emmet-monaco
const expandAbbreviation = (emmet, source, language) => {
  try {
    let target = emmet.expandAbbreviation(source, language, language);
    let result = emmet.tabStops.extract(target, { escape(ch) { return ch; } });
    return result.text;
  } catch (e) {

  }
};

const enableEmmet = (editor, emmet, options) => {
  if (!emmet) {
    throw new Error('Must include emmet.');
  }
  if (!editor) {
    throw new Error('Must provide monaco-editor instance.');
  }
  if (editor.model.getLanguageIdentifier().language === 'html') {
    editor.addCommand(monaco.KeyCode.Tab, () => {
      let word = editor.model.getValueInRange(editor.getSelection());
      let pos = editor.getPosition();
      if (!word) {
        let lineContent = editor.model.getLineContent(pos.lineNumber);
        word = emmet.utils.action.extractAbbreviation(lineContent.substring(0, pos.column));
      }
      // Get expand text
      let expandText = expandAbbreviation(emmet, word, 'html');
      if (expandText) {
        // replace range content: pos.column , pos.column -word.length;
        let range = new monaco.Range(pos.lineNumber, pos.column - word.length, pos.lineNumber, pos.column);
        let id = { major: 1, minor: 1 };
        var op = { identifier: id, range, text: expandText, forceMoveMarkers: true };
        editor.executeEdits('', [op]);
      }
    });
  }
};


require.config({
  paths: {
    'vs': '../node_modules/monaco-editor/min/vs',
    'emmet': 'js/vendors/emmet-min',
    'vue': '../node_modules/vue/dist/vue.min'
  }
});

require(['vs/editor/editor.main', 'emmet', 'vue'], function (vs, emmet, Vue) {
  Vue.component('panel', {
    template: '#panel',
    mounted() {
      let vm = this;
      this.$refs.handle.addEventListener('mousedown', initialiseResize, false);
      function initialiseResize(e) {
        window.addEventListener('mousemove', startResizing, false);
        window.addEventListener('mouseup', stopResizing, false);
      }
      function startResizing(e) {
        vm.$el.style.width = (e.clientX - vm.$el.offsetLeft) + 'px';
      }
      function stopResizing(e) {
        window.removeEventListener('mousemove', startResizing, false);
        window.removeEventListener('mouseup', stopResizing, false);
        //editor.layout();
      }
    }
  });
  Vue.component('editor', {
    props: {
       language: { type: String, default: 'javascript' },
       value: { type: String, default: ''}
    },
    template: '<div></div>',
    data() {
      return {
        editor: {},
        internalValue: this.value
      };
    },
    mounted() {
      this.editor = window.monaco.editor.create(this.$el, {
        value: this.value,
        language: this.language,
        autoIndent: false,
        fontSize: 18,
        formatOnPaste: true,
        lineNumbersMinChars: 2,
        minimap: {
          enabled: false
        },
        renderIndentGuides: true,
        automaticLayout: true
      });
      enableEmmet(this.editor, emmet);
      this.editor.onDidChangeModelContent(event => {
        this.internalValue = this.editor.getValue();
        this.$emit('input', this.internalValue);
      });
    },
    destroyed() {
      if (typeof this.editor !== 'undefined') {
        this.editor.dispose();
      }
    },
    watch: {
      language() {
        window.monaco.editor.setModelLanguage(this.editor.getModel(), this.language)
      },
      value(newValue, oldValue) {
        if (newValue !== this.internalValue){
          this.editor.setValue(newValue);
        }
      }
    }
  });
  const app = new Vue({
    el: '#editorApp',
    data: {
      panels: {
        html: true,
        css: true,
        javascript: true,
        output: true
      },
      values: {
        html: '<h1>test</h1>',
        css: 'h1 { color: red; }',
        javascript: [
          'function x() {',
          '\tconsole.log("Hello world!");',
          '}'
        ].join('\n')
      }
    },
    mounted() {
      this.updatePreview();
    },
    watch: {
      values: {
        handler() {
           this.updatePreview();
        },
        deep: true
      },
    },
    computed: {
      preview() {
        return `<html>
  <head>
    <style>
      ${this.values.css}
    </style>
  </head>
  <body>
    ${this.values.html}
    <script>
      ${this.values.javascript}
    </script>
  </body>
</html>`;
      }
    },
    methods: {
      updatePreview(){
        const win = this.$refs.preview.contentDocument || this.$refs.preview.contentWindow.document;
        win.open();
        win.write(this.preview);
        win.close();
      }
    }
  });
});




