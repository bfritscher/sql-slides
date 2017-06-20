(function () {
  'use strict';

    function embed(link) {
      var iframe = document.createElement('iframe'),
          url = link.dataset.href.replace(/edit/, 'embed');
      iframe.src = url.split('&')[0];
      iframe._src = url.split('&')[0]; // support for google slide embed
      iframe.className = link.className; // inherit all the classes from the link
      iframe.id = link.id; // also inherit, giving more style control to the user
      iframe.style.border = '1px solid #aaa';

      iframe.style.width = link.dataset.width || '100%';
      iframe.style.minHeight = link.dataset.height || '300px';
      if (link.dataset.height) {
        iframe.style.maxHeight = link.dataset.height;
      }
      link.parentNode.replaceChild(iframe, link);

      var onmessage = function (event) {
        event = event || window.event;
        // * 1 to coerse to number, and + 2 to compensate for border
        iframe.style.height = (event.data.height * 1 + 2) + 'px';
      };

      if (window.addEventListener) {
        window.addEventListener('message', onmessage, false);
      } else {
        window.attachEvent('onmessage', onmessage);
      }
    }

    //init only on slide shown
    Reveal.addEventListener( 'slidechanged', function( event ) {
      jQuery(event.currentSlide).find('pre.jsbin-embed').each(function(index, pre){
        embed(pre);
      });
    });

})();
