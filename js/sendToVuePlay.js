(function () {
    'use strict';
    // Add utility functions for encoding
    function strToU8(str) {
        const encoder = new TextEncoder();
        return encoder.encode(str);
    }

    function strFromU8(arr, latin1) {
        const decoder = new TextDecoder(latin1 ? 'latin1' : 'utf-8');
        return decoder.decode(arr);
    }

    function zlibSync(data) {
        // Simple compression fallback - in a real implementation you'd use a proper zlib library
        // For now, we'll just use the text directly without compression
        return data;
    }

    function utoa(data) {
        try {
            // Try to compress if possible, otherwise fallback to direct encoding
            const compressed = zlibSync(strToU8(data));
            const binary = strFromU8(compressed, true);
            return btoa(binary);
        } catch (e) {
            // Fallback to simple base64 encoding
            return btoa(encodeURIComponent(data));
        }
    }

    function createVueReplStore(files) {
        // Create the serialized state with multiple files
        const serializedState = utoa(JSON.stringify(files));
        return serializedState;
    }

    Reveal.addEventListener('ready', function () {
        if (window.location.search.match(/print-pdf/gi)) {
            return;
        }
        jQuery('code.vue').each(function (index, code) {
            var pre = code.parentElement;
            var $run = jQuery('<div class="run">run</div>').appendTo(pre);
            $run.on('click', function () {
                // Collect all visible Vue code blocks
                const files = {};

                jQuery('section.present[data-markdown] code.vue').each(
                    function (i, codeElement) {
                        const codeText = jQuery(codeElement).text();
                        // Check if first line contains a .vue filename
                        const lines = codeText.split('\n');
                        const firstLine = lines[0].trim();
                        let filename = 'App.vue';
                        let content = codeText;

                        // If first line looks like a comment with .vue filename, use it
                        if (
                            firstLine.match(/^\/\/.*\.vue$/) ||
                            firstLine.match(/^<!--.*\.vue.*-->$/)
                        ) {
                            const match = firstLine.match(/(\w+\.vue)/);
                            if (match) {
                                filename = match[1];
                                // Remove the filename line from content
                                content = lines.slice(1).join('\n').trim();
                            }
                        }

                        files[filename] = content;
                    }
                );

                // Create encoded store for Vue REPL
                const encodedStore = createVueReplStore(files);

                // Generate the play.vuejs.org link
                const playgroundUrl = `https://play.vuejs.org/#${encodedStore}`;

                // Open in new tab
                window.open(playgroundUrl, '_blank');
            });
        });
    });

    Reveal.registerPlugin('sendToVuePlay', {
        init: function () {
            return new Promise((resolve) => resolve());
        },
    });
})();
