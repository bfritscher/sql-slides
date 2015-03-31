/* exported SQLQuery */
/* global marked:false, SQLtoMarkdown:false, exports:false */
var SQLQuery = (function () {
  'use strict';
  
  function hashCode(str) {
    var hash = 0, i, chr, len;
    if (str.length === 0){
      return hash;
    }
    for (i = 0, len = str.length; i < len; i++) {
      chr   = str.charCodeAt(i);
      /* jshint ignore:start */
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
      /* jshint ignore:end */
    }
    return hash;
  }
  //Source: http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
  
  if(typeof exports !== 'undefined'){
    exports.hashCode = hashCode;
    return;
  }
  
  var config = {
    animation: 'flipInX',
    animationError: 'tada'
  };
  var mywindow = null;
  var cache = {};
  var cacheCounter = 0;
  var cacheDone = 0;
  var cacheError = 0;
  var generateCache = false;
  
  

  
  function run(db, sql, $output){
    function handleResponse(response){
      if(generateCache){
        cache[hashCode(sql)] = jQuery.extend(true, {}, response);
        cacheDone++;
      }
      if(response.error){
        $output.html(response.error);
        $output.addClass('error animated ' + config.animationError)
        .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
            $output.removeClass('animated ' + config.animationError);
          });
      }else{
        if(response.headers.length === 0){
           response.headers.push('&nbsp;&nbsp;&nbsp;&nbsp;');
        }
        $output.html(marked(SQLtoMarkdown.parse(response)));
        $output.removeClass('error');
        $output.addClass('animated ' + config.animation)
        .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
           $output.removeClass('animated ' + config.animation );
        });
      }
    }
  
    jQuery.ajax({
      url:'https://amc.ig.he-arc.ch/sqlexplorer/api/evaluate',
      type:'POST',
      dataType:'json',
      contentType:'application/json',
      data:JSON.stringify({db: db,sql: sql}),
      success:handleResponse,
      error:function(response, error){
        //try to get from cache
        if(generateCache){
          cacheError++;
        }else{
          var hash = hashCode(sql);
          if(cache.hasOwnProperty(hash)){
            handleResponse(cache[hash]);
          }else{
            $output.html('no connection and no-cache available!');
            console.log(error);
            $output.addClass('error');
          }
        }
      }
    });
  }
  
  function parseCode(){
    jQuery('code.sql').each(function(index, code){
      var $code = jQuery(code);
      $code.attr('contenteditable', '')
      .attr('spellcheck', 'false');
      var $pre = $code.parent();
      var db = $pre.data('db');
      if(db){ //only run if db is known
        if($pre.hasClass('col2')){
          $pre.wrap('<div class="layout-two"></div>');
        }
        var $output = jQuery('<div class="output"></div>').insertAfter($pre);
        
        if($pre.hasClass('start-hidden') || $pre.attr('data-output-fragment-index') !== undefined){
          $output.addClass('fragment');
          if($pre.attr('data-output-fragment-index') !== undefined){
            $output.attr('data-fragment-index', $pre.attr('data-output-fragment-index'));
          }
        }
        var toRemove = [];
        var canDrag = true;
        $pre[0].classList.forEach(function(className){
            //TODO could change to regex... to match w-%
            //TODO more flexible forward classes with output-
           if(['top','left', 'right', 'bottom', 'no-margin', 'w-100'].indexOf(className) > -1){
              $output.addClass(className);
              toRemove.push(className);
              if(['top','left', 'right', 'bottom', 'nodrag'].indexOf(className) > -1){
                //need position absolute conflict with position relative of draggabilly
                canDrag = false;
              }
           }
        });
        if(canDrag){
          $output.draggabilly({});
        }
        toRemove.forEach(function(className){
            $pre.removeClass(className);
        });
        var $run = jQuery('<div class="run">run</div>')
        .appendTo($pre);
        var title = $pre.data('title');
        if(title){
            jQuery('<div class="code-title">' + title + '</div>')
            .appendTo($pre);
        }
        $run.click(function(){
          run(db, $code.text(), $output);
        });
        $code.keydown(function (e) { //ctrl + enter to run
          if (e.ctrlKey && e.keyCode === 13) {
              $run.click();
          }
        });
        if( mywindow.location.search.indexOf('sqlnorun') === -1 &&
            ($pre.hasClass('run') || mywindow.location.search.indexOf('sqlrun') > -1 || generateCache)){
          $run.click();
          if(generateCache){
            cache[hashCode($code.text())] = '';
            cacheCounter++;
          }
        }
      }
    });
  }
  function getCacheName(){
    var match = mywindow.location.pathname.match(/\/(.*?)\.html/);
    if(match && match.length > 0){
        return match[1] + '.cache';
    }else{
        return 'index.cache';
    }
  }
  
  
  function init(fakewindow){
      if(fakewindow){
        mywindow = fakewindow;
      }else{
        mywindow = window;
      }
      generateCache = mywindow.location.search.indexOf('cache') > -1;
      if(!generateCache){
        //try to load cache
        jQuery.ajax({
          dataType: 'json',
          url: 'slides/' + getCacheName(),
          success: function(data){
            cache = data;
          },
          async: false //must be sync in order to be able to write output data-fragment-index before being parsed by Reveal
        })
        .always(parseCode);
      }  
      else if(generateCache){
        parseCode();
        var checkCacheDone = function(){
          if(cacheCounter === cacheDone){
            jQuery('<a download="' + getCacheName() + '" href="data:application/octet-stream;charset=utf-8,' + encodeURIComponent(JSON.stringify(cache)) + '">cache</a>')[0].click();
          }
          else if(cacheCounter === cacheDone + cacheError){
            alert('Caching failed: ' + cacheDone + ' ok and ' + cacheError + ' errors.');
          }else{
            setTimeout(checkCacheDone, 1000);
          }
        };
        checkCacheDone();
      }
  }
  return {
    config: config,
    hashCode: hashCode,
    init: init
  };
})();