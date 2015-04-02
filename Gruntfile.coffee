# Generated on 2015-03-24 using generator-reveal 0.4.0
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
                    livereload: true
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
                    port: 9000
                    # Change hostname to '0.0.0.0' to access
                    # the server from outside.
                    hostname: 'localhost'
                    base: '.'
                    open: true
                    livereload: true
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
                dest: 'dist/filtered/'
            full:
                src: ['slides/*.md']
                dest: 'dist/full/'
                
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
                        'slides/**'
                        'bower_components/animate-css/animate.min.css'
                        'bower_components/draggabilly/dist/draggabilly.pkgd.min.js'
                        'bower_components/jquery/dist/jquery.min.js'
                        'bower_components/reveal.js/css/{,*/}*.css'
                        'bower_components/reveal.js/js/*'
                        'bower_components/reveal.js/plugin/**'
                        'bower_components/reveal.js/lib/**'
                        'js/**'
                        'css/**'
                        'fonts/**'
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
                    src: ['dist/full/*.pdf']
                    dest: 'dist/pdf/'
                    flatten: true
                    rename: (dest, src) ->
                        dest + src.replace('_serie.pdf','_serie_solution.pdf')
                },{
                    expand: true
                    src: ['dist/filtered/*.pdf']
                    dest: 'dist/pdf/'
                    flatten: true
                    rename: (dest, src) ->
                        dest + src.replace('.pdf','_enonce.pdf')
                }]

        markdownpdf:
            options:
                preProcessMd: ->
                    self = this
                    through (data) ->
                        data = data.toString()
                        .replace(/images\//g, __dirname + '/slides/images/')
                        this.queue(data)
                preProcessHtml: (data) ->
                    through (data) ->
                        #strip note:
                        data = data.toString()
                        data = data.replace(/<p>note: /gm, '<p>')
                        
                        #add comment class to previous
                        $ = cheerio.load('<body>' + data + '</body>')
                        $('body').contents().filter (idx, elem) ->
                            return elem.type == 'comment';
                        .each (idx, elem) ->
                            match = elem.nodeValue.match(/class="(.*?)"/)
                            if match
                                $(elem).prev().addClass(match[1])
                        
                        #wrap col2
                        $('.col2').each (idx, pre) ->
                            $pre = $(pre)
                            table = $pre.next('table')
                            $('<div class="layout-two"></div>')
                            .insertBefore($pre)
                            .append(pre)
                            .append(table)
                            
                        #preload header/footer image
                        data = $('body').html() +  '\n<img class="hide" src="' + slash(__dirname) + '/slides/images/common/logo_heg.png" />\n'
                        data += '<img class="hide" src="' + slash(__dirname) + '/slides/images/common/logo_hes-so_noir.jpg" />\n'
                        
                        this.queue(data)
                paperBorder: '0.5cm'
                highlightCssPath: 'bower_components/highlightjs/styles/vs.css'
                cssPath: 'css/pdf.css'
                assetDir: slash(__dirname) + '/slides/images'
                remarkable:
                    html: true
            files:
                src: ['dist/{full,filtered,slides}/*.md']
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
                    else if !grunt.file.exists filepath.replace('.md', '.cache')
                        grunt.log.warn('Cache file "' + filepath + '" not found.')
                        false
                    else
                        true
                .map (filepath) ->
                    md = grunt.file.read filepath
                    cache = grunt.file.readJSON filepath.replace('.md', '.cache')
                    replacer = (match, sql, db) ->
                        classes = /class="(.*?)"/.exec(match)
                        return '' if classes && classes[1].indexOf('nopdf') > -1
                        response = cache[SQLQuery.hashCode(sql)]
                        if response && response.error
                            table = response.error + '\n<!-- .element class="warn" -->\n'
                        else
                            table = SQLtoMarkdown.parse(response, 10)
                        if match.indexOf('output-in-statement') > -1
                            return table
                        else
                            answer = '```sql\n' + sql + '\n```\n\n'
                            answer += '<!-- .element class="' + classes[1] + '" -->\n\n' if classes
                            return answer + table
                    theFile = filepath.match(/\/([^/]*)$/)[1]
                    filedest = file.dest + theFile
                    md = md.replace(/```sql\n([\s\S!]*?)\n```\n(?:.*?data-db="(.*?)".*?-->\n)?/gm, replacer)
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