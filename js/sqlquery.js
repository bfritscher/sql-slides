var SQLQuery = (function () {
  'use strict';
  var config = {
    animation: 'flipInX',
    animationError: 'tada'
  };
  var cache = {};
  var cacheCounter = 0;
  var cacheDone = 0;
  var cacheError = 0;
  
  var generateCache = window.location.search.indexOf('cache') > -1;
  
  function run(db, sql, $output){
    function handleResponse(response){
      if(generateCache){
        cache[sql] = $.extend(true, {}, response);
        cacheDone++;
      }
      if(response.error){
        $output.html(response.error);
        $output.addClass('error animated ' + config.animationError)
        .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
            $output.removeClass('animated ' + config.animationError);
          });
      }else{
        $output.html(marked(SQLtoMarkdown.parse(response)));
        $output.removeClass('error');
        $output.addClass('animated ' + config.animation)
        .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
           $output.removeClass('animated ' + config.animation );
        });
      }
    }
  
    $.ajax({
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
          if(cache.hasOwnProperty(sql)){
            handleResponse(cache[sql]);
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
    $('code.sql').each(function(index, code){
      var $code = $(code);
      $code.attr('contenteditable','')
      .attr('spellcheck', 'false')
      .keydown(function (e) {
        if (e.ctrlKey && e.keyCode === 13) {
            $run.click();
        }
      });
      var $pre = $code.parent();
      var db = $pre.data('db');
      if(db){
        if($pre.hasClass('col2')){
          $pre.wrap('<div class="layout-two"></div>');
        }
        var $output = $('<div class="output"></div>').insertAfter($pre);
        $output.draggabilly({});
        if($pre.hasClass('start-hidden')){
          $output.addClass('fragment');
        }
        var toRemove = [];
        $pre[0].classList.forEach(function(className){
           if(['top','left', 'right', 'bottom', 'no-margin'].indexOf(className) > -1){
              $output.addClass(className);
              toRemove.push(className);
           }
        });
        toRemove.forEach(function(className){
            $pre.removeClass(className);
        });
        var $run = $('<div class="run">run</div>')
        .appendTo($pre);
        $run.click(function(){
          run(db, $code.text(), $output);
        });
        if( window.location.search.indexOf('sqlnorun') === -1 &&
            ($pre.hasClass('run') || window.location.search.indexOf('sqlrun') > -1)){
          $run.click();
          if(generateCache){
            cache[$code.text()] = '';
            cacheCounter++;
          }
        }
      }
    });
  }
  
  if(!generateCache){
    //try to load cache
    $.getJSON( 'slides/' + $('title').text().toLowerCase().split(' ').join('_') + '.cache', function(data){
      cache = data;
    })
    .always(parseCode);
  }  
  if(generateCache){
    parseCode();
    function checkCacheDone(){
      if(cacheCounter === cacheDone){
        $('<a download="cache.json" href="data:application/octet-stream;charset=utf-8,' + encodeURIComponent(JSON.stringify(cache)) + '">cache</a>')[0].click();
      }
      else if(cacheCounter === cacheDone + cacheError){
        alert('Caching failed: ' + cacheDone + ' ok and ' + cacheError + ' errors.');
      }else{
        setTimeout(checkCacheDone, 1000);
      }
    }
    checkCacheDone();
  }
  
  return config
})();