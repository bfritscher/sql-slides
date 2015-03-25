(function () {
  
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
          $output.addClass('error');
        }else{
          $output.html('<div>' + marked(SQLtoMarkdown.parse(response)) + '</div>');
          $output.removeClass('error');
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
        if (e.ctrlKey && e.keyCode == 13) {
            $run.click();
        }
      });
    var $pre = $code.parent();
    var db = $pre.data('db');
    if(db){
      var $output = $('<div class="output"></div>').insertAfter($pre);
      if($pre.hasClass('hidden')){
        $output.addClass('fragment');
      }
      var $run = $('<div class="run">run</div>')
      .appendTo($pre);
      $run.click(function(){
        run(db, $code.text(), $output);
      });
      if($pre.hasClass('run') || window.location.search.indexOf('sqlrun') > -1){
        $run.click();
      }
    }
  });
})();