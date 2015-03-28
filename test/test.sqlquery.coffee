expect = chai.expect

describe 'SQLQuery', ->

    server = null
    
    beforeEach ->
        server = sinon.fakeServer.create()

    afterEach ->
        server.restore()
    
    it 'should load', ->
        expect(SQLQuery).to.exist
    
###
    animation can be changed
    config.animation
    config.animationError
    
    url options
    cache --generates cache file
    sqlnorun disable inital run
    sqlrun forces run
    
    function
    hashCode
    
    code.sql block get
    contenteditable and no spellcheck
    
    if data-db other things happend (output generation)
        (a run div is added)
    
    annotations  are applied to pre/code block
    fragment
    data-fragment-index
    
    Some can be passed to output
    start-hidden applies fragment to output
    data-output-fragment-index to add data-fragment-index to output
    
    classes
    col2 surrounds with a div.layout-two
    by default output can be dragged
    except if it has a class of absolute value or nodrag
    
    a class can be forwarded to output with output-classname
    
    message if cache file
    find in cache
    get from server
###