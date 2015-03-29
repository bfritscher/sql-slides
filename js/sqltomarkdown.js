/* exported SQLtoMarkdown */
/* globals exports */
var SQLtoMarkdown = (function () {
  'use strict';
  function parse(json, limit){
    if(!(json && json.hasOwnProperty('content') && json.hasOwnProperty('headers'))){
      return '';
    }
    if(json.content.length === 0 && json.headers.length === 0){
      return '';
    }
    var tabularData = json.content.slice(0);
    tabularData.unshift(json.headers);

    var maxColLen = [];
    //calculate column maxLen
    tabularData.forEach(function( e, i ) {
        tabularData[i].forEach(function( ee, ii ) {
            if( typeof maxColLen[ii] === 'undefined' ) {
                maxColLen[ii] = 0;
            }
            maxColLen[ii] = Math.max(maxColLen[ii], String(ee).length);
        });
    });

    var headerOutput = '',
        seperatorOutput = '';

    maxColLen.forEach(function( len ) {
        var spacer;
        spacer = new Array(Number(len + 1 + 2)).join('-');
        seperatorOutput += '|' + spacer;
    });

    seperatorOutput += '| \n';

    var rowOutput = '';
    tabularData.forEach(function( row, i ) {
        if(limit && i > limit){
          return;
        }
        maxColLen.forEach(function( len, y ) {
            var cell = typeof row[y] === 'undefined' ? '' : String(row[y]);
            if(limit && limit === i){
              cell = '...';
            }
            var spacing = new Array((len - cell.length) + 1).join(' ');
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
  if(typeof exports !== 'undefined'){
    exports.parse = parse;
  }
  return {
    parse: parse
  };
})();

