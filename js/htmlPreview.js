(function() {
  'use strict';

  function generatePreviews() {
    jQuery('.html-preview').each(function(x, item) {
      const $preview = jQuery('<p class="preview"></p>');
      $preview.addClass(Object.values(item.classList).filter(name => name.startsWith('output-')).map(name => name.slice(7)).join(' '));
      const $code = jQuery(item.children[0]);
      $code.on('blur keyup paste input', function() {
        $preview.html($code.text());
      }).blur();
      jQuery(item).before($preview);
    });
  }

  Reveal.addEventListener('ready', function() {
    generatePreviews();
  });

  Reveal.registerPlugin('htmlPreview', {
    init: function() {
        return new Promise(resolve => resolve());
    }
  });
})();
