(function () {
    'use strict';
    function sendToWebExplorer() {
        const html = $('section.present[data-markdown] code.lang-html').text();
        const css = $('section.present[data-markdown] code.lang-css').text();
        const javascript = $('section.present[data-markdown] code.lang-javascript').text();

        const data = {
            panels: {
                html: {
                    visible: !!html
                },
                css: {
                    visible: !!css
                },
                javascript: {
                    visible: !!javascript
                },
                output: {
                    visible: !!html
                }
            },
            values: {
                html,
                css,
                javascript
            },
            options: {
                fontSize: 22,
                menuAlwaysShow: false
            }
        };
        const form = $('<form method="post" action="https://fritscher.ch/webexplorer/" target="_blank"><textarea name="json">' + btoa(JSON.stringify(data)) + '</textarea></form>');
        $('body').append(form);
        form.submit();
        form.remove();
    }


    jQuery('code.lang-javascript, code.lang-html, code.lang-css').each(function(index, code){
        var pre = code.parentElement;
        var $run = jQuery('<div class="run">run</div>')
        .appendTo(pre);
        $run.click(sendToWebExplorer);
    });
})();