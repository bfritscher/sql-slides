expect = chai.expect

describe 'SQLQuery', ->

    todo = ->
        expect().to.contain('implementation')
    
    server = null
    dragSpy = jQuery.fn.draggabilly = sinon.spy()
    
    beforeEach ->
        server = sinon.fakeServer.create()

    afterEach ->
        server.restore()
        jQuery('#test').remove()
    
    describe 'Init & config', ->
        it 'should load', ->
            expect(SQLQuery).to.exist
        
        it 'output success config.animation can be set', ->
            expect(SQLQuery.config.animation).to.be.truthy
            
        it 'output error config.animationError can be set', ->
            expect(SQLQuery.config.animationError).to.be.truthy
            #TODO: test animation config?
        
        it 'has a hashCode(sql) function to get cache keys', ->
            expect(SQLQuery.hashCode('test')).to.be.equal(3556498)
        
        it 'should try to load cache on init()', ->
            server.respondWith [200,
                { "Content-Type": "application/json" },
                JSON.stringify({})]
            SQLQuery.init({location: {pathname: '/test.html', search:''}})
            expect(server.requests[0].url).to.be.equal('slides/test.cache')

    describe 'Cache options', ->
        
        it '?cache generates a cache file of all data-db blocks', ->
            #parse even if not .run but has data-db
            lastArg = ''
            server.respondWith [200,
                { "Content-Type": "application/json" },
                JSON.stringify({})]
            server.respondImmediately = true
            html = """
                   <section id="test">
                   <pre data-db="test"><code class="sql">test</code></pre>
                   </section>
                   """
            jQuery(html).appendTo 'body'
            parseHTML = jQuery.parseHTML
            sinon.stub jQuery, 'parseHTML', ->
                lastArg = arguments[0]
                arguments[0]='<div></div>'
                return parseHTML.apply(this, arguments)
            SQLQuery.init({location: {pathname: '/test.html', search:'generatecache'}})
            jQuery.parseHTML.restore()
            expect(lastArg).to.contain.string('%7B%223556498%22%3A%22%22%7D')
         
        it 'generatecache does not load cache file', ->
            server.respondWith [200,
                { "Content-Type": "application/json" },
                JSON.stringify({})]
            parseHTML = jQuery.parseHTML
            sinon.stub jQuery, 'parseHTML', ->
                arguments[0]='<div></div>'
                return parseHTML.apply(this, arguments)
            SQLQuery.init({location: {pathname: '/test.html', search:'generatecache'}})
            jQuery.parseHTML.restore()
            
            expect(server.requests).to.have.length(0)
        
        it 'can find data in cache file', ->
            cache = {"3556498":{"headers":["test"], content:[["sql"]]}}
            server.respondWith 'get', 'slides/test.cache', [200,
                { "Content-Type": "application/json" },
                JSON.stringify(cache)]
            spy = sinon.spy(SQLtoMarkdown, 'parse')
            window.marked = -> ''
            html = """
                   <section id="test">
                   <pre data-db="test" class="run"><code class="sql">test</code></pre>
                   </section>
                   """
            jQuery(html).appendTo 'body'
            SQLQuery.init({location: {pathname: '/test.html', search:''}})
            server.respond()
            expect(spy.calledWithMatch(cache["3556498"])).to.be.true
            spy.restore()
            
        it 'error if no connection and no cache', ->
            html = """
                   <section id="test">
                   <pre data-db="test" class="run"><code class="sql"></code></pre>
                   </section>
                   """
            jQuery(html).appendTo 'body'
            SQLQuery.init()
            server.respond()
            expect(jQuery('#test .output').hasClass('error')).to.be.true
            
        it '?usecache force to load from cache', ->
            server.respondWith [200,
                { "Content-Type": "application/json" },
                JSON.stringify({})]
            html = """
                   <section id="test">
                   <pre data-db="test" class="run"><code class="sql"></code></pre>
                   </section>
                   """
            jQuery(html).appendTo 'body'
            SQLQuery.init({location: {pathname: '/test.html', search:'usecache'}})
            expect(server.requests).to.have.length(1) #only cache

    describe 'URL options', ->
        beforeEach ->
            html = """
                   <section id="test">
                   <pre><code class="sql">sql1</code></pre>
                   <pre data-db="test" class="run"><code class="sql">sql2</code></pre>
                   <pre data-db="test"><code class="sql">sql3</code></pre>
                   </section>
                   """
            jQuery(html).appendTo 'body'
            server.respondWith [200,
                { "Content-Type": "application/json" },
                JSON.stringify({})]
            server.respond()
        it 'without url options .run + data-db are executed', ->
            SQLQuery.init({location: {pathname: '/test.html', search:''}})
            expect(server.requests).to.have.length(2)
            # cache + 1.run
        
        it '?sqlrun force run of all data-db blocs', ->
            SQLQuery.init({location: {pathname: '/test.html', search:'sqlrun'}})
            expect(server.requests).to.have.length(3)
            # cache + 2
            
        it '?sqlnorun disable inital run of .run blocs', ->
            SQLQuery.init({location: {pathname: '/test.html', search:'sqlnorun'}})
            expect(server.requests).to.have.length(1)
            # cache + 0
            
    describe 'Annotations', ->
        it 'should set attributes contenteditable and spellcheck', ->
            html = """
                   <section id="test">
                   <pre><code class="sql"></code></pre>
                   </section>
                   """
            jQuery(html).appendTo 'body'
            SQLQuery.init()
            code = jQuery('#test code.sql')[0]
            expect(code.contentEditable).to.be.equal('true')
            expect(code.spellcheck).to.be.false
            
        it 'with data-db="SCHEMA" a run button  and output is added', ->
            html = """
                   <section id="test">
                   <pre data-db="test"><code class="sql"></code></pre>
                   </section>
                   """
            jQuery(html).appendTo 'body'
            SQLQuery.init()
            expect(jQuery('#test .output')).to.have.length(1)
            expect(jQuery('#test pre div.run')).to.have.length(1)
        
        it '.fragment and data-fragment-index on pre', ->
            #handled by reveal.js
        
        it 'data-output-fragment-index to add data-fragment-index to output', ->
            html = """
                   <section id="test">
                   <pre data-db="test" data-output-fragment-index="2"><code class="sql"></code></pre>
                   </section>
                   """
            jQuery(html).appendTo 'body'
            SQLQuery.init()
            expect(jQuery('#test .output').data('fragment-index')).to.be.equal(2)
            
        it '.start-hidden applies .fragment to output', ->
            html = """
                   <section id="test">
                   <pre data-db="test" class="start-hidden"><code class="sql"></code></pre>
                   </section>
                   """
            jQuery(html).appendTo 'body'
            SQLQuery.init()
            expect(jQuery('#test .output').hasClass('fragment')).to.be.true
        
        it '.col2 surrounds with a div.layout-two', ->
            html = """
                   <section id="test">
                   <pre data-db="test" class="col2"><code class="sql"></code></pre>
                   </section>
                   """
            jQuery(html).appendTo 'body'
            SQLQuery.init()
            expect(jQuery('#test .output').parent().hasClass('layout-two')).to.be.true
        
        it 'by default output can be dragged', ->
            dragSpy.reset()
            html = """
                   <section id="test">
                   <pre data-db="test"><code class="sql"></code></pre>
                   </section>
                   """
            jQuery(html).appendTo 'body'
            SQLQuery.init()
            expect(dragSpy.calledOnce).to.be.true
        ['left', 'right', 'top', 'bottom', 'nodrag'].forEach (className) ->
            it 'class' + className + ' disables drag', ->
                dragSpy.reset()
                html = """
                       <section id="test">
                       <pre data-db="test" class="
                       """
                html += className
                html += """
                       "<code class="sql"></code></pre>
                       </section>
                       """
                jQuery(html).appendTo 'body'
                SQLQuery.init()
                expect(dragSpy.called).to.be.false
        
        it 'a class can be forwarded to output with output-classname', ->
            todo()
        it 'a title can be added with data-title', ->
            html = """
                   <section id="test">
                   <pre data-title="atitle" data-db="test"><code class="sql"></code></pre>
                   </section>
                   """
            jQuery(html).appendTo 'body'
            SQLQuery.init()
            expect(jQuery('#test pre .code-title').text()).to.be.equal('atitle')
            
            