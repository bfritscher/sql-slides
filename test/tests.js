(function() {
  var expect;

  expect = chai.expect;

  describe('SQLQuery', function() {
    var server;
    server = null;
    beforeEach(function() {
      return server = sinon.fakeServer.create();
    });
    afterEach(function() {
      return server.restore();
    });
    return it('should load', function() {
      return expect(SQLQuery).to.exist;
    });
  });


  /*
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
   */

}).call(this);

(function() {
  var expect;

  expect = chai.expect;

  describe('SQLtoMarkdown', function() {
    it('should load', function() {
      return expect(SQLtoMarkdown).to.exist;
    });
    it('should return empty on wrong input', function() {
      return expect(SQLtoMarkdown.parse()).to.equal('');
    });
    it('no data', function() {
      return expect(SQLtoMarkdown.parse({
        headers: [],
        content: []
      })).to.equal('');
    });
    it('only header', function() {
      return expect(SQLtoMarkdown.parse({
        headers: ['a', 'b'],
        content: []
      })).to.equal('| a | b | \n|---|---| \n');
    });
    it('only content, should have an empty header to be valid', function() {
      return expect(SQLtoMarkdown.parse({
        headers: [],
        content: [['a', 'b']]
      })).to.equal('|   |   | \n|---|---| \n| a | b | \n');
    });
    return it('should return a valid markdown table with headers', function() {
      return expect(SQLtoMarkdown.parse({
        headers: ['ha', 'hb'],
        content: [['a', 'b'], ['c', 'd']]
      })).to.equal('| ha | hb | \n|----|----| \n| a  | b  | \n| c  | d  | \n');
    });
  });

}).call(this);
