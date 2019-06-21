module.exports = (grunt) ->
    through = require 'through'
    cheerio = require 'cheerio'
    slash = require 'slash'
    modRewrite = require('connect-modrewrite')
    url = require('url')

    grunt.initConfig
        coffee:
            test:
                files:
                    'test/tests.js':'test/test.*.coffee'
        watch:
            livereload:
                options:
                    livereload: 35728
                files: [
                    'index.html'
                    'slides/{,*/}*.{md,html}'
                    'js/*.js'
                    'css/*.css'
                    'images/**'
                    'test/*.js'
                    'test/index.html'
                ]
            index:
                options:
                    spawn: false
                files: [
                    'templates/_index.html'
                    'templates/_section.html'
                    'slides/*.json'
                ]
                tasks: ['clean:html','buildIndex']

            coffeelint:
                options:
                    spawn: false
                files: ['Gruntfile.coffee', 'test/*.coffee']
                tasks: ['coffeelint', 'coffee:test']

            jshint:
                files: ['js/*.js']
                tasks: ['jshint']

        connect:

            livereload:
                options:
                    port: 9001
                    # Change hostname to '0.0.0.0' to access
                    # the server from outside.
                    hostname: 'localhost'
                    base: '.'
                    open: true
                    livereload: 35728
                    middleware: (connect, options, middlewares) ->
                        rewrite = modRewrite(['^(.*)$ /slides/$1'])
                        middlewares.unshift (req, res, next)->
                            r = url.parse(req.url)
                            return if grunt.file.exists(__dirname, r.pathname) then next() else rewrite req, res, next
                        middlewares
        coffeelint:

            options:
                indentation:
                    value: 4
                max_line_length:
                    level: 'ignore'

            all: ['Gruntfile.coffee', 'test/*.coffee']

        jshint:

            options:
                jshintrc: '.jshintrc'

            all: ['js/*.js']

        buildIndex:
            build:
                src: ['slides/*.json']
                dest: ''

        filterMarkdown:
            build:
                src: ['slides/*_serie.md']
                dest: '.tmp/filtered/'

        buildMarkdown:
            filtered:
                src: ['.tmp/filtered/*.md']
                dest: '.tmp/build/filtered/'
            full:
                src: ['slides/*.md']
                dest: '.tmp/build/full/'

        clean:
            dist:
                files: [{
                    dot: true,
                    src: [
                        '.tmp'
                        'dist/{,*/}*'
                        'dist/.git*'
                    ]
                }]
            html:
                files: [{
                      src: [
                          '*.html'
                      ]
                }]
        copy:
            dist:
                files: [{
                    expand: true
                    src: [
                        'slides/*.*'
                        'node_modules/animate.css/animate.min.css'
                        'node_modules/draggabilly/dist/draggabilly.pkgd.min.js'
                        'node_modules/jquery/dist/jquery.min.js'
                        'node_modules/reveal.js/css/{,*/}*.css'
                        'node_modules/reveal.js/js/*'
                        'node_modules/reveal.js/plugin/**'
                        'node_modules/reveal.js/lib/**'
                        'js/**'
                        'css/**'
                        'fonts/**'
                    ]
                    dest: 'dist/'
                },{
                    expand: true
                    cwd: 'slides/'
                    src: [
                        'images/**'
                        'videos/**'
                        'js/**'
                    ]
                    dest: 'dist/'
                },{
                    expand: true
                    src: ['*.html']
                    dest: 'dist/'
                    filter: 'isFile'
                }]
            pdf:
                files: [{
                    expand: true
                    src: ['.tmp/build/full/*.pdf']
                    dest: 'dist/pdf/'
                    flatten: true
                    rename: (dest, src) ->
                        dest + src.replace('_serie.pdf','_serie_solution.pdf')
                },{
                    expand: true
                    src: ['.tmp/build/filtered/*.pdf']
                    dest: 'dist/pdf/'
                    flatten: true
                    rename: (dest, src) ->
                        dest + src.replace('.pdf','_enonce.pdf')
                }]

        markdownpdf:
            options:
                preProcessHtml: (data) ->
                    through (data) ->
                        #strip note:
                        data = data.toString()
                        data = data.replace(/note:/gm, '')
                        absolutePath = 'file:///' + process.cwd().replace(/ /g, '%20').replace(/\\/g, '/') + '/slides/'
                        find = /img src="/g
                        replace = 'img src="' + absolutePath
                        data = data.replace(find, replace)

                        #add comment class to previous
                        $ = cheerio.load('<body>' + data + '</body>')
                        $('body').contents().filter (idx, elem) ->
                            return elem.type == 'comment'
                        .each (idx, elem) ->
                            match = elem.nodeValue.match(/class="(.*?)"/)
                            if match
                                $(elem).prev().addClass(match[1])
                            #add data-title as title
                            match = elem.nodeValue.match(/data-title="(.*?)"/)
                            if match
                                $('<p class="sql-title">' + match[1] + '</p>').insertBefore($(elem).prev())

                        #wrap col2
                        $('.col2').each (idx, pre) ->
                            $pre = $(pre)
                            table = $pre.next('table')
                            output = $('<div class="output"></div>')
                            $('<div class="layout-two"></div>')
                            .insertBefore($pre)
                            .append(pre)
                            .append(output)
                            output.append(table)

                        #preload header/footer image
                        data = $('body').html() +  '\n<img class="hide" src="' + absolutePath  + '/images/common/logo_heg.png" />\n'
                        data += '<img class="hide" src="' + absolutePath + '/images/common/logo_hes-so_noir.jpg" />\n'
                        grunt.file.write slash(__dirname) + '/.tmp/' +  $('h4').first().text().slice(0,10)  + '.html', data
                        this.queue(data)
                paperBorder: '0.5cm'
                highlightCssPath: 'node_modules/highlight.js/styles/vs.css'
                cssPath: __dirname + '/css/pdf.css'
                assetDir: 'file:///' +  process.cwd().replace(/ /g, '%20').replace(/\\/g, '/') + '/slides/images/'
                title: grunt.file.read 'slides/title' if grunt.file.exists 'slides/title'
                remarkable:
                    html: true
            files:
                src: ['.tmp/build/{full,filtered}/*.md']
                dest: 'dist/'

    # Load all grunt tasks.
    require('load-grunt-tasks')(grunt)
    grunt.loadTasks('tasks')

    grunt.registerMultiTask 'buildIndex',
        'Build slides from templates/_index.html and slides/*.json.',
        ->
            indexTemplate = grunt.file.read 'templates/_index.html'
            sectionTemplate = grunt.file.read 'templates/_section.html'
            this.files.forEach (file) ->
                file.src.filter (filepath) ->
                    if !grunt.file.exists filepath
                        grunt.log.warn('Source file "' + filepath + '" not found.')
                        false
                    else
                        true
                .map (filepath) ->
                    slides = grunt.file.readJSON filepath
                    theFile = filepath.match(/\/([^/]*)$/)[1]
                    onlyName = theFile.substr(0, theFile.lastIndexOf('.')) || theFile
                    filedest = file.dest + onlyName + '.html'
                    niceName = onlyName.split('_')
                    .map (string) ->
                        string.charAt(0).toUpperCase() + string.slice(1)
                    .join(' ')
                    html = grunt.template.process indexTemplate, data:
                        slides:
                            slides
                        title:
                            niceName
                        section: (slide) ->
                            grunt.template.process sectionTemplate, data:
                                slide:
                                    slide
                    grunt.file.write filedest, html
                    grunt.log.writeln 'File "' + filedest + '" created.'


    grunt.registerMultiTask 'filterMarkdown',
        'Remove fragment code and sub-sections to create a exercice md',
        ->
            XRegExp = XRegExp = require('xregexp').XRegExp
            replacer = (match) ->
                if match.indexOf('output-in-statement') > -1
                    return match
                else
                    return ''
            this.files.forEach (file) ->
                file.src.filter (filepath) ->
                    if !grunt.file.exists filepath
                        grunt.log.warn('Source file "' + filepath + '" not found.')
                        false
                    else if !grunt.file.exists filepath.replace('.md', '.cache')
                        grunt.log.warn('Cache file "' + filepath + '" not found.')
                        false
                    else
                        true
                .map (filepath) ->

                    slide = XRegExp('^\\n\\n\\n\\n', 'gm')
                    subslide = XRegExp('^\\n\\n\\n', 'gm')
                    firstSlide = XRegExp('(.*?)(---subslide---.*)?', 's')
                    data = grunt.file.read filepath
                    data = XRegExp.replace(data, slide, '---slide---\n')
                    data = XRegExp.replace(data, subslide, '---subslide---\n')
                    slides = data.split('---slide---\n')
                    data = slides.map (s) ->
                        s = s.match(/^([\s\S]*?)(?:---subslide---[\s\S]*)?$/)[1]
                        s = s.replace(/```sql\n[\s\S!]*?\n```\n<!--.*?[fragment|start\-hidden].*?-->\n/g, replacer)
                        return s
                    .join('\n')
                    theFile = filepath.match(/\/([^/]*)$/)[1]
                    filedest = file.dest + theFile
                    grunt.file.write filedest, data
                    grunt.file.copy filepath.replace('.md', '.cache'), filedest.replace('.md', '.cache')
                    grunt.log.writeln 'File "' + filedest + '" created.'

    grunt.registerMultiTask 'buildMarkdown',
        'Build cache results into markdown files in slides/*.md.',
        ->
            SQLtoMarkdown = require('./js/sqltomarkdown.js')
            SQLQuery = require('./js/sqlquery.js')
            this.files.forEach (file) ->
                file.src.filter (filepath) ->
                    if !grunt.file.exists filepath
                        grunt.log.warn('Source file "' + filepath + '" not found.')
                        false
                    else
                        true
                .map (filepath) ->
                    md = grunt.file.read filepath
                    if !grunt.file.exists filepath.replace('.md', '.cache')
                        grunt.log.warn('Cache file "' + filepath + '" not found.')
                        cache = {}
                    else
                        cache = grunt.file.readJSON filepath.replace('.md', '.cache')

                    replacer = (match, sql, db) ->
                        classes = /class="(.*?)"/.exec(match)
                        title = /data-title=".*?"/.exec(match)
                        return '' if classes && classes[1].indexOf('nopdf') > -1
                        response = cache[SQLQuery.hashCode(sql)]
                        if !response
                            console.log('ERROR')
                            console.log(sql)
                            console.log(SQLQuery.hashCode(sql))
                        if response && response.error
                            table = response.error + '\n<!-- .element class="warn" -->\n'
                        else
                            table = SQLtoMarkdown.parse(response, 10)
                        # hack should find something better link to folder structure :-(
                        if match.indexOf('output-in-statement') > -1 && filepath.indexOf('filtered') > -1
                            return table
                        else
                            answer = '```sql\n' + sql + '\n```\n\n'
                            answer += '<!-- .element '
                            answer += ' class="' + classes[1] + '" ' if classes
                            #re-add title comment to parse it in markdownpdf html
                            answer += ' ' + title + ' ' if title
                            answer += ' -->\n\n'
                            return answer + table
                    theFile = filepath.match(/\/([^/]*)$/)[1]
                    filedest = file.dest + theFile
                    md = md.replace(/```sql\n([\s\S!]*?\n)```\n(?:.*?data-db="(.*?)".*?-->\n)?/gm, replacer)
                    grunt.file.write filedest, md
                    grunt.log.writeln 'File "' + filedest + '" created.'

    grunt.registerTask 'new',
        'Create a new slidedeck',
        (name) ->
            if !name
                return grunt.log.error 'a name must be provided!'
            name = name.toLowerCase().replace(' ', '_')
            listTemplate = grunt.file.read 'templates/_list.json'
            fileTemplate = grunt.file.read 'templates/_file.md'
            list = grunt.template.process listTemplate, data:
                filename: name
            file = grunt.template.process fileTemplate, data:
                filename: name
            #todo check file exist?
            grunt.file.write 'slides/' + name + '.json', list
            grunt.file.write 'slides/' + name + '.md', file
            grunt.log.writeln 'File "' + name + '.md|json" created.'

    grunt.registerTask 'test',
        '*Lint* javascript and coffee files.', [
            'coffeelint'
            'jshint'
        ]

    grunt.registerTask 'serve',
        'Run presentation locally and start watch process (living document).', [
            'buildIndex'
            'connect:livereload'
            'watch'
        ]

    grunt.registerTask 'dist',
        'Save presentation files to *dist* directory.', [
            'test'
            'clean:html'
            'clean:dist'
            'buildIndex'
            'copy:dist'
            'filterMarkdown'
            'buildMarkdown'
            'markdownpdf'
            'copy:pdf'
        ]


    # Define default task.
    grunt.registerTask 'default', [
        'test'
        'serve'
    ]