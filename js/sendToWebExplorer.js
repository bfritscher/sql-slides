(function () {
    'use strict';
    function sendToWebExplorer() {
        const html = $('section.present[data-markdown] code.lang-html');
        const htmlText = html.text();
        const htmlVisible = !!htmlText && !html.parent().hasClass('hide');
        const css = $('section.present[data-markdown] code.lang-css');
        const cssText = css.text();
        const cssVisible = !!cssText && !css.parent().hasClass('hide');
        const javascript = $('section.present[data-markdown] code.lang-javascript');
        const javascriptText = javascript.text();
        const javascriptVisible = !!javascriptText && !javascript.parent().hasClass('hide');
        const outputVisible = htmlVisible || javascriptText.indexOf('console.log') > -1;
        const count = [htmlVisible, cssVisible, javascriptVisible, outputVisible].reduce(function(count, value) {
            return value ? count + 1  : count;
        }, 0) || 1;
        const width = Math.round(100 / count) + '%';
        const widthDefault = '25%';
        const data = {
            panels: {
                html: {
                    visible: htmlVisible,
                    width: htmlVisible ? width : widthDefault
                },
                css: {
                    visible: cssVisible,
                    width: cssVisible ? width : widthDefault
                },
                javascript: {
                    visible: javascriptVisible,
                    width: javascriptVisible ? width : widthDefault
                },
                output: {
                    visible: outputVisible,
                    width: outputVisible ? width : widthDefault
                }
            },
            values: {
                html: htmlText,
                css: cssText,
                javascript: javascriptText
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
