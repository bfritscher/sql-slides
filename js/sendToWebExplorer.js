(function () {
    'use strict';
    var editor = jQuery('<div style="transition: 1s; z-index: 900; position:fixed;top:100%;left:0;width:100%;height:100%;"><iframe style="width:100%;height:100%;border:0;" src="//fritscher.ch/webexplorer/"></iframe></div>');
    var close = jQuery('<div class="run" style="  cursor: pointer; position: absolute;bottom: 4px;right: 4px;font-family: sans-serif;font-weight: bold;font-size: 14px;">X</div>');

    function sendToWebExplorer() {
        const html = $('section.present[data-markdown] code.html');
        const htmlText = html.text();
        const htmlVisible = !!htmlText && !html.parent().hasClass('hide');
        const css = $('section.present[data-markdown] code.css');
        const cssText = css.text();
        const cssVisible = !!cssText && !css.parent().hasClass('hide');
        const javascript = $('section.present[data-markdown] code.javascript');
        const javascriptText = javascript.text();
        const javascriptVisible = !!javascriptText && !javascript.parent().hasClass('hide');
        const outputVisible = htmlVisible || javascriptText.indexOf('console.log') > -1;
        const count = [htmlVisible, cssVisible, javascriptVisible, outputVisible].reduce(function(count, value) {
            return value ? count + 1  : count;
        }, 0) || 1;
        const width = Math.round(100 / count);
        const widthDefault = 25;
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
        editor.css({'top': '0%'});
        editor.children()[0].contentWindow.postMessage(data, '*');
        /*
        const form = $('<form method="post" action="https://fritscher.ch/webexplorer/" target="_blank"><textarea name="json">' + btoa(JSON.stringify(data)) + '</textarea></form>');
        $('body').append(form);
        form.submit();
        form.remove();
        */
    }
    close.click(function(){
        editor.css({'top': '100%'});
    });

    Reveal.addEventListener( 'ready', function() {
        if( window.location.search.match( /print-pdf/gi)) {
            return;
        }
        editor.append(close);
        jQuery('body').append(editor);
        jQuery('code.javascript, code.html, code.css').each(function(index, code){
            var pre = code.parentElement;
            var $run = jQuery('<div class="run">run</div>')
            .appendTo(pre);
            $run.click(sendToWebExplorer);
        });
    } );

    Reveal.registerPlugin( 'sendToWebExplorer', {
        init: function() {
            return new Promise(resolve => resolve());
        }
    });

})();
