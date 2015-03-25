var SQLtoMarkdown = (function () {
  function parse(json){
    var tabularData = json.content;
    tabularData.unshift(json.headers);

    var maxColLen = [];
    //calculate column maxLen
    tabularData.forEach(function( e, i ) {
        tabularData[i].forEach(function( ee, ii ) {
            if( typeof maxColLen[ii] == "undefined" ) {
                maxColLen[ii] = 0;
            }
            maxColLen[ii] = Math.max(maxColLen[ii], String(ee).length);
        });
    });

    var headerOutput = '',
        seperatorOutput = '';

    maxColLen.forEach(function( len ) {
        var spacer;
        spacer = Array(Number(len + 1 + 2)).join('-');
        seperatorOutput += '|' + spacer;
    });

    seperatorOutput += '| \n';

    var rowOutput = '';
    tabularData.forEach(function( row, i ) {
        maxColLen.forEach(function( len, y ) {
            var cell = typeof row[y] == 'undefined' ? '' : String(row[y]);
            var spacing = Array((len - cell.length) + 1).join(' ');
            cell = cell.replace(/ /g, '&nbsp;');
            if( i === 0 ) {
                headerOutput += '| ' + cell + spacing + ' ';
            } else {
                rowOutput += '| ' + cell + spacing + ' ';
            }
        });
        
        if( i === 0 ) {
            headerOutput += '| \n';
        } else {
            rowOutput += '| \n';
        }
    });

    return headerOutput + seperatorOutput + rowOutput;
  }
  
  return {
    parse: parse
  }
})();
