/* jshint strict: false*/
function toIdList(path){
    var nodes = path.split('->');
    var list = nodes.map(function(item){
        return item.substr(0,2);
    });
    var de,a='';
    for(var i=0; i<nodes.length-1;i++){
        de=nodes[i].substr(0,2);
        a=nodes[i+1].substr(0,2);
        list.push(de+a);
        list.push(a+de);
    }
    return list;
}
function highlight(path){
    var ids = toIdList(path);
    $('#autoroutes .edge path').each(function(idx, el){
        var $el = $(el);
        var options = {stroke:'black', 'stroke-width':'1'};
        if(ids.indexOf($el.parent().attr('id')) > -1){
           options = {stroke:'red', 'stroke-width':'2'};
         }
        $el.attr(options);
    });
    $('#autoroutes .node polygon').each(function(idx, el){
        var $el = $(el);
        var options = {stroke:'black', 'stroke-width':'0'};
        if(ids.indexOf($el.parent().attr('id')) > -1){
           options = {stroke:'red', 'stroke-width':'2'};
         }
        $el.attr(options);
    });
}

function query(){
    var sql = $('#sql').text();
    sql = sql.replace('{de}', $('#villeDe').val());
    sql = sql.replace('{vers}', $('#villeVers').val());
    jQuery.ajax({
      url:'https://amc.ig.he-arc.ch/sqlexplorer/api/evaluate',
      type:'POST',
      dataType:'json',
      contentType:'application/json',
      data:JSON.stringify({db: 'SQLAVANCE',sql: sql}),
      success:function(data){
          var $ul = $('#trajets');
          $ul.empty();
          data.content.forEach(function(item){
             $('<li>' + item[0] + '</li>').appendTo($ul);
          });
      }
    });
}

$('select').on('change', query);
$('#trajets').on('click', 'li', function(){
    $('#trajets li').removeClass('warn');
    highlight($(this).addClass('warn').text());
});