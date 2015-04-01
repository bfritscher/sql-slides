(function(){
'use strict';
  var $ul = jQuery('<ul></ul>');
  
  jQuery('h1, h2, h3').each(function(i, item){
    jQuery('<li>' + item.innerText + '</li>')
    .appendTo($ul).on('click', function(){
      var x, y = 0;
      var $item = jQuery(item);
      if($item.parent().parent().hasClass('slides')){
        x = $item.parent().index();
        y = 0;
      }else{
        x = $item.parent().parent().index();
        y = $item.parent().index();
      }
      Reveal.slide(x, y);
    });
  });
  jQuery('<div id="toc" class="toc"></div>').appendTo(jQuery('.reveal')).append($ul);
}());
