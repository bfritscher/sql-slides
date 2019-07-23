(function() {
    'use strict';
    var $ul = jQuery('<ul></ul>');

    function createSectionEntry(item, x, y) {
        var $li = jQuery('<li></li>');
        if (y > 0) {
            $li.addClass('subsection');
        }
        $li.appendTo($ul).on('click', function() {
            Reveal.slide(x, y);
            Reveal.toggleOverview();
        });
        Reveal.addEventListener('slidechanged', function(event) {
            $li.toggleClass('active', event.indexh === x && event.indexv === y);
        });

        var title = jQuery(item)
            .find('h1, h2, h3, h4, p')
            .first();
        var text = '';
        if (title) {
            $li.addClass(title.prop('tagName'));
            text = title.text().trim();
            if (text === '') {
                //try images
                text = title.find('img').attr('alt');
                if (!text || text === '') {
                    text = x + '-' + y;
                }
            }
            if (text.length > 54) {
                text = text.substr(0, 54) + '...';
            }
        }
        $li.text(text);
    }

    function buildToC() {
        jQuery('.slides > section').each(function(x, item) {
            var subsections = jQuery(item).find('section');
            if (subsections.length > 0) {
                subsections.each(function(y, item) {
                    createSectionEntry(item, x, y);
                });
            } else {
                createSectionEntry(item, x, 0);
            }
        });

        var $toc = jQuery('<div id="toc" class="toc" style="display:none"></div>');
        $toc.appendTo(jQuery('.reveal'));
        var $button = jQuery('<button id="tocshow">TOC</button>');
        $button.on('click', function() {
            $toc.show();
            $toc.css({ width: '100%', height: '100%', 'z-index': 900 });
        });
        $button.appendTo(jQuery('.reveal'));
        $toc.append($ul);
        $toc.on('click', function() {
            $toc.hide();
        });
    }

    Reveal.addEventListener('ready', function() {
        if (window.location.search.match(/print-pdf/gi)) {
          return;
        }
        buildToC();
    });

    Reveal.registerPlugin('toc', {
        init: function() {
            return new Promise(resolve => resolve());
        }
    });
})();
