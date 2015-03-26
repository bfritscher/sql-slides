# Generated on 2015-03-24 using generator-reveal 0.4.0
module.exports = (grunt) ->

    grunt.initConfig

        watch:

            livereload:
                options:
                    livereload: true
                files: [
                    'index.html'
                    'slides/{,*/}*.{md,html}'
                    'js/*.js'
                    'css/*.css'
                ]

            index:
                files: [
                    'templates/_index.html'
                    'templates/_section.html'
                    'slides/*.json'
                ]
                tasks: ['buildIndex']

            coffeelint:
                files: ['Gruntfile.coffee']
                tasks: ['coffeelint']

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

        coffeelint:

            options:
                indentation:
                    value: 4
                max_line_length:
                    level: 'ignore'

            all: ['Gruntfile.coffee']

        jshint:

            options:
                jshintrc: '.jshintrc'

            all: ['js/*.js']

        buildIndex:
            build:
                src: ['slides/*.json']
                dest: ''
        
        copy:

            dist:
                files: [{
                    expand: true
                    src: [
                        'slides/**'
                        'bower_components/**'
                        'js/**'
                        'css/**'
                    ]
                    dest: 'dist/'
                },{
                    expand: true
                    src: ['index.html']
                    dest: 'dist/'
                    filter: 'isFile'
                }]

        


    # Load all grunt tasks.
    require('load-grunt-tasks')(grunt)

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
                    html = grunt.template.process indexTemplate, data:
                        slides:
                            slides
                        section: (slide) ->
                            grunt.template.process sectionTemplate, data:
                                slide:
                                    slide
                    theFile = filepath.match(/\/([^/]*)$/)[1]
                    onlyName = theFile.substr(0, theFile.lastIndexOf('.')) || theFile
                    filedest = file.dest + onlyName + '.html'
                    grunt.file.write filedest, html
                    grunt.log.writeln 'File "' + filedest + '" created.'

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
            'buildIndex'
            'copy'
        ]

    

    # Define default task.
    grunt.registerTask 'default', [
        'test'
        'serve'
    ]
