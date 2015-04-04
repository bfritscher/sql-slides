(function(){
'use strict';
  var $ul = jQuery('<ul></ul>');
  
  jQuery('h1, h2, h3').each(function(i, item){
    if(item.innerText.trim() != ''){
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
          Reveal.toggleOverview();
        });
    }
  });
  var $toc = jQuery('<div id="toc" class="toc"></div>');
  $toc.appendTo(jQuery('.reveal'));
  var $button = jQuery('<button id="tocshow">TOC</button>');
  $button.on('click', function(){
    $toc.css({width:'100%', height:'100%', 'z-index': 900});
  });
  $button.appendTo(jQuery('.reveal'));
  $toc.append($ul);
  $toc.on('click', function(){
    $toc.css({width:'0%', height:'0%', 'z-index': 800}); 
  });
}());
