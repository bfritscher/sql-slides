var SQLQuery = (function () {
  'use strict';
  var config = {
    animation: 'flipInX',
    animationError: 'tada'
  };
  function run(db, sql, $output){
    $.ajax({
      url:'https://amc.ig.he-arc.ch/sqlexplorer/api/evaluate',
      type:'POST',
      dataType:'json',
      contentType:'application/json',
      data:JSON.stringify({db: db,sql: sql}),
      success:function(response){
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
      },
      error:function(response, error){
        $output.html(error);
        $output.addClass('error');
      }
    });
  }
  
  $('code.sql').each(function(index, code){
    var $code = $(code);
    $code
      .attr('contenteditable','')
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
      $output.on('dblclick', function(){
        $output.toggleClass('popup');
      });
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
      if( window.location.search.indexOf('sqlnorun') === -1 && ($pre.hasClass('run') || window.location.search.indexOf('sqlrun') > -1)){
        $run.click();
      }
    }
  });
  return config
})();