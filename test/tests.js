(function() {
  var expect;

  expect = chai.expect;

  describe('SQLQuery', function() {
    var dragSpy, server, todo;
    todo = function() {
      return expect().to.contain('implementation');
    };
    server = null;
    dragSpy = jQuery.fn.draggabilly = sinon.spy();
    beforeEach(function() {
      return server = sinon.fakeServer.create();
    });
    afterEach(function() {
      server.restore();
      return jQuery('#test').remove();
    });
    describe('Init & config', function() {
      it('should load', function() {
        return expect(SQLQuery).to.exist;
      });
      it('output success config.animation can be set', function() {
        return expect(SQLQuery.config.animation).to.be.truthy;
      });
      it('output error config.animationError can be set', function() {
        return expect(SQLQuery.config.animationError).to.be.truthy;
      });
      it('has a hashCode(sql) function to get cache keys', function() {
        return expect(SQLQuery.hashCode('test')).to.be.equal(3556498);
      });
      return it('should try to load cache on init()', function() {
        server.respondWith([
          200, {
            "Content-Type": "application/json"
          }, JSON.stringify({})
        ]);
        SQLQuery.init({
          location: {
            pathname: '/test.html',
            search: ''
          }
        });
        return expect(server.requests[0].url).to.be.equal('slides/test.cache');
      });
    });
    describe('Cache options', function() {
      it('?cache generates a cache file of all data-db blocks', function() {
        var html, lastArg, parseHTML;
        lastArg = '';
        server.respondWith([
          200, {
            "Content-Type": "application/json"
          }, JSON.stringify({})
        ]);
        server.respondImmediately = true;
        html = "<section id=\"test\">\n<pre data-db=\"test\"><code class=\"sql\">test</code></pre>\n</section>";
        jQuery(html).appendTo('body');
        parseHTML = jQuery.parseHTML;
        sinon.stub(jQuery, 'parseHTML', function() {
          lastArg = arguments[0];
          arguments[0] = '<div></div>';
          return parseHTML.apply(this, arguments);
        });
        SQLQuery.init({
          location: {
            pathname: '/test.html',
            search: 'cache'
          }
        });
        jQuery.parseHTML.restore();
        return expect(lastArg).to.contain.string('%7B%223556498%22%3A%22%22%7D');
      });
      it('cache does not load cache file', function() {
        var parseHTML;
        server.respondWith([
          200, {
            "Content-Type": "application/json"
          }, JSON.stringify({})
        ]);
        parseHTML = jQuery.parseHTML;
        sinon.stub(jQuery, 'parseHTML', function() {
          arguments[0] = '<div></div>';
          return parseHTML.apply(this, arguments);
        });
        SQLQuery.init({
          location: {
            pathname: '/test.html',
            search: 'cache'
          }
        });
        jQuery.parseHTML.restore();
        return expect(server.requests).to.have.length(0);
      });
      it('can find data in cache file', function() {
        var cache, html, spy;
        cache = {
          "3556498": {
            "headers": ["test"],
            content: [["sql"]]
          }
        };
        server.respondWith('get', 'slides/test.cache', [
          200, {
            "Content-Type": "application/json"
          }, JSON.stringify(cache)
        ]);
        spy = sinon.spy(SQLtoMarkdown, 'parse');
        window.marked = function() {
          return '';
        };
        html = "<section id=\"test\">\n<pre data-db=\"test\" class=\"run\"><code class=\"sql\">test</code></pre>\n</section>";
        jQuery(html).appendTo('body');
        SQLQuery.init({
          location: {
            pathname: '/test.html',
            search: ''
          }
        });
        server.respond();
        expect(spy.calledWithMatch(cache["3556498"])).to.be["true"];
        return spy.restore();
      });
      return it('error if no connection and no cache', function() {
        var html;
        html = "<section id=\"test\">\n<pre data-db=\"test\" class=\"run\"><code class=\"sql\"></code></pre>\n</section>";
        jQuery(html).appendTo('body');
        SQLQuery.init();
        server.respond();
        return expect(jQuery('#test .output').hasClass('error')).to.be["true"];
      });
    });
    describe('URL options', function() {
      beforeEach(function() {
        var html;
        html = "<section id=\"test\">\n<pre><code class=\"sql\">sql1</code></pre>\n<pre data-db=\"test\" class=\"run\"><code class=\"sql\">sql2</code></pre>\n<pre data-db=\"test\"><code class=\"sql\">sql3</code></pre>\n</section>";
        jQuery(html).appendTo('body');
        server.respondWith([
          200, {
            "Content-Type": "application/json"
          }, JSON.stringify({})
        ]);
        return server.respond();
      });
      it('without url options .run + data-db are executed', function() {
        SQLQuery.init({
          location: {
            pathname: '/test.html',
            search: ''
          }
        });
        return expect(server.requests).to.have.length(2);
      });
      it('?sqlrun force run of all data-db blocs', function() {
        SQLQuery.init({
          location: {
            pathname: '/test.html',
            search: 'sqlrun'
          }
        });
        return expect(server.requests).to.have.length(3);
      });
      return it('?sqlnorun disable inital run of .run blocs', function() {
        SQLQuery.init({
          location: {
            pathname: '/test.html',
            search: 'sqlnorun'
          }
        });
        return expect(server.requests).to.have.length(1);
      });
    });
    return describe('Annotations', function() {
      it('should set attributes contenteditable and spellcheck', function() {
        var code, html;
        html = "<section id=\"test\">\n<pre><code class=\"sql\"></code></pre>\n</section>";
        jQuery(html).appendTo('body');
        SQLQuery.init();
        code = jQuery('#test code.sql')[0];
        expect(code.contentEditable).to.be.equal('true');
        return expect(code.spellcheck).to.be["false"];
      });
      it('with data-db="SCHEMA" a run button  and output is added', function() {
        var html;
        html = "<section id=\"test\">\n<pre data-db=\"test\"><code class=\"sql\"></code></pre>\n</section>";
        jQuery(html).appendTo('body');
        SQLQuery.init();
        expect(jQuery('#test .output')).to.have.length(1);
        return expect(jQuery('#test pre div.run')).to.have.length(1);
      });
      it('.fragment and data-fragment-index on pre', function() {});
      it('data-output-fragment-index to add data-fragment-index to output', function() {
        var html;
        html = "<section id=\"test\">\n<pre data-db=\"test\" data-output-fragment-index=\"2\"><code class=\"sql\"></code></pre>\n</section>";
        jQuery(html).appendTo('body');
        SQLQuery.init();
        return expect(jQuery('#test .output').data('fragment-index')).to.be.equal(2);
      });
      it('.start-hidden applies .fragment to output', function() {
        var html;
        html = "<section id=\"test\">\n<pre data-db=\"test\" class=\"start-hidden\"><code class=\"sql\"></code></pre>\n</section>";
        jQuery(html).appendTo('body');
        SQLQuery.init();
        return expect(jQuery('#test .output').hasClass('fragment')).to.be["true"];
      });
      it('.col2 surrounds with a div.layout-two', function() {
        var html;
        html = "<section id=\"test\">\n<pre data-db=\"test\" class=\"col2\"><code class=\"sql\"></code></pre>\n</section>";
        jQuery(html).appendTo('body');
        SQLQuery.init();
        return expect(jQuery('#test .output').parent().hasClass('layout-two')).to.be["true"];
      });
      it('by default output can be dragged', function() {
        var html;
        dragSpy.reset();
        html = "<section id=\"test\">\n<pre data-db=\"test\"><code class=\"sql\"></code></pre>\n</section>";
        jQuery(html).appendTo('body');
        SQLQuery.init();
        return expect(dragSpy.calledOnce).to.be["true"];
      });
      ['left', 'right', 'top', 'bottom', 'nodrag'].forEach(function(className) {
        return it('class' + className + ' disables drag', function() {
          var html;
          dragSpy.reset();
          html = "<section id=\"test\">\n<pre data-db=\"test\" class=\"";
          html += className;
          html += "\"<code class=\"sql\"></code></pre>\n</section>";
          jQuery(html).appendTo('body');
          SQLQuery.init();
          return expect(dragSpy.called).to.be["false"];
        });
      });
      return it('a class can be forwarded to output with output-classname', function() {
        return todo();
      });
    });
  });

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
