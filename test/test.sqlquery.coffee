expect = chai.expect

describe 'SQLQuery', ->

    todo = ->
        expect().to.contain('implementation')
    
    server = null
    dragStub = jQuery.fn.draggabilly = sinon.stub()
    
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
            SQLQuery.init({location: {pathname: '/test.html', search:'cache'}})
            jQuery.parseHTML.restore()
            expect(lastArg).to.contain.string('%7B%223556498%22%3A%22%22%7D')
         
        it 'cache does not load cache file', ->
            server.respondWith [200,
                { "Content-Type": "application/json" },
                JSON.stringify({})]
            parseHTML = jQuery.parseHTML
            sinon.stub jQuery, 'parseHTML', ->
                arguments[0]='<div></div>'
                return parseHTML.apply(this, arguments)
            SQLQuery.init({location: {pathname: '/test.html', search:'cache'}})
            jQuery.parseHTML.restore()
            
            expect(server.requests).to.have.length(0)
        
        it 'can find data in cache file', ->
            todo()
            
        it 'error if no connection and no cache', ->
            todo()

    describe 'URL options', ->
        it '?sqlrun force run of all data-db blocs', ->
            todo()
            
        it '?sqlnorun disable inital run of .run blocs', ->
            todo()
            
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
            todo()
        
        it 'without url options .run + data-db are executed', ->
            todo()
        
        it '.fragment and data-fragment-index on pre', ->
            todo()
        
        it 'data-output-fragment-index to add data-fragment-index to output', ->
            todo()
            
        it '.start-hidden applies .fragment to output', ->
            todo()
        
        it '.col2 surrounds with a div.layout-two', ->
            todo()
        
        it 'by default output can be dragged', ->
            todo()
            
        it 'if absolute classes(left, top,...) or nodrag drag is disabled', ->
            todo()
        
        it 'a class can be forwarded to output with output-classname', ->
            todo()