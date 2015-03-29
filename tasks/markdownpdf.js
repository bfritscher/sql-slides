/*
 * grunt-markdown-pdf
 * https://github.com/alanshaw/grunt-markdown-pdf
 *
 * Copyright (c) 2013 Alan Shaw
 * Licensed under the MIT license.
 */

var markdownpdf = require("markdown-pdf")
  , path = require("path")
  , execSync = require('child_process').execSync
  , extend = require('util')._extend;

module.exports = function (grunt) {

  grunt.registerMultiTask("markdownpdf", "Convert Markdown documents to PDF", function () {

    var opts = this.options()
      , done = this.async();

    function getBodyFontFamily(){
      var css = grunt.file.read(opts.cssPath);
      var match = css.match(/body.*?{[\s\S]*?font-family:(.*?);/)
      if(match){
        return match[1];
      }
      return 'Arial';
    }
    
    function getVersion(file){
      try{
        return execSync('git log -n 1  --abbrev-commit --pretty=oneline -- slides/' + file).toString().slice(0,7) || '0';
      }catch(ex){
        return '0';
      }
    }
    
    function escape(str){
      return str.replace(/'/g, "\\'");
    }
      
    // Create the tasks to process the targets
    this.files.forEach(function (f) {
        f.src.forEach(function (filepath) {
          // Warn on and remove invalid source files (if nonull was set).
          if (!grunt.file.exists(filepath)) {
            grunt.log.warn('Source file not found ' + filepath);
            return false;
          }
          if(!grunt.file.isFile(filepath)) {
            grunt.verbose.writeln('Ignoring non file ' + filepath);
            return false;
          }
          // create running file
          grunt.verbose.writeln("Found src file: " + filepath);
          var file = path.parse(filepath);
          var content = grunt.file.read(filepath);
          var match = content.match(/#+ (.*?)\n/);
          var title = file.name;
          if(match){
            title = match[1];
          }
          
          var runningsTemplate = grunt.file.read(path.join(process.cwd(), 'templates', '_runnings.js'));
          var localOpts = extend({}, opts);
          localOpts.preProcessMd = opts.preProcessMd;
          localOpts.preProcessHtml = opts.preProcessHtml;
          var runnings = grunt.template.process(runningsTemplate, {data:{
            topLeft: title,
            bottomLeft: file.base + '@' + getVersion(file.base),
            assetDir: localOpts.assetDir ||'',
            font: escape(localOpts.font || getBodyFontFamily())}});
          var runningsPath = path.join(process.cwd(), '.tmp', file.name + '_runnings.js');
          grunt.file.write(runningsPath, runnings);
          localOpts.runningsPath = runningsPath;
          grunt.verbose.writeln("Wrote runnings file: " + runningsPath);
          
          //execute markdownpdf
          var destPath = filepath.replace(/\.(markdown|md)/g, "") + ".pdf";
          grunt.verbose.writeln("Determined dest path: " + destPath);
          //start a markdown for each file because we have custom runnings
          
          markdownpdf(localOpts).from(filepath).to(destPath, function (er) {
            grunt.log.ok(destPath);
          });
          return true;
        })

        
    });
  });

}