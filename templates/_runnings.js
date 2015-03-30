exports.header = {
    height: '2cm',
    contents: function(pageNum, numPages) {
      return '<div style="font-family: <%= font %>;padding:0 0 0.5em 0;margin:0 0.8cm;border-bottom:1px solid #000;position:relative;height:2.2em"><%= topLeft %> <img style="right:0; position:absolute;top:0;height: 1cm" src="<%= assetDir %>/common/logo_heg.png" /></div>';
    }
  }

exports.footer = {
    height: '2cm',
    contents: function(pageNum, numPages) {
      return '<div style="font-family: <%= font %>;padding-top: 0.3cm;margin: 0 0.8cm 0 0.8cm;"><div style="display:inline-block;height: 100%;vertical-align: bottom;width:0px;"></div><div style="display:inline-block;text-align:center;width:100%;position:relative"><span style="text-align:left;position:absolute;left:0;bottom:0;"><%= bottomLeft %></span>' + pageNum + ' / ' + numPages + '<img style="height: 1cm;vertical-align:bottom;position:absolute;bottom:0;right:0" src="<%=assetDir%>/common/logo_hes-so_noir.jpg" /></div></div>';
    }
  }