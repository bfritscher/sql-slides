# SQL-Slides

Present slides with interactive SQL queries getting live results from a database. If the slides are created with the Reveal.js markdown format they can also be used to generate a pdf document with answers and notes embeded.

This is a customized version of Reveal.js based on a starting template from generator-reveal.

Slide content has to be put into a /slides folder inside the project's root directory.

## Install

Clone project and install dependencies.

`npm install && bower install`

Change the hardcoded SQL-Explorer server location in `js/sqlquery.js`

## Usage

1. Create a new presentation with `grunt new:"name of the presentation"`
2. `grunt serve` to start the web server. Start editing the files in /slides with custom annotations. Use *.json file to merge multiple files (see generator-reveal)
3. `grunt dist` to generate a version with minimal dependencies in the dist folder, as well as all the **pdfs**. (pdf export does not merge multiple files into one)

## Custom Annotations

In addition to Reveal.js annotation (see their documentation) custom annotation are supported inside reveal.js markdown format element annotation:

`<!-- .element: -->`
`<!-- .slides: -->`

<!-- .element: class="col2 run" data-fragment-index="0" data-db="SQLAVANCE" -->

The main use of special annotation is to give information to SQL code blocks to make them interactive and display results. The same annotations can also be used in html mode by applying them to the pre object which is parent of a code object with class sql.

**WARNING:** for the default markdown slide separation regex to work, end of line must be \n (unix) and not windows.

**Markdown example:**
```markdown
```sql
SELECT *
  FROM table;
```(without this comment used to display code)
<!-- .element: class="fragment col2 run start-hidden"
               data-fragment-index="1"
               data-output-fragment-index="2"
               data-tile="demo"
               data-db="SQLDB" -->
```

**HTML example:**
```html
<pre class="fragment col2 run start-hidden"
     data-fragment-index="1"
     data-output-fragment-index="2"
     data-tile="demo"
     data-db="SQLDB"><code class="sql">
SELECT *
  FROM table;
</code></pre>
```

## Annotations for SQL code blocks

All annotations are optional except **data-db**, which starts the custom functionnality of a sql code block.

-  **db-schema** attribute enables contenteditable and adds a *run* button on the bottom right of the code zone. The content has to be a valid schema of the connected SQL Explorer server.

Clicking the *run* button or using *ctrl+enter* sends the query to the server. The result is added into a table inside a div.output next to the pre code element.

- **.run** class is used to specify that the output has to be computed at presentation start not waiting to manually trigger a run (output can still be hidden in a fragment).

- Reveal's original **.fragment** class and **data-fragment-index** will work normally with the pre code block.

- To apply *.fragment* class and *data-fragment-index* to the output element use the **.start-hidden** class and the **data-output-fragment-index** attribute.

- Class **.col2** will wrap *pre* and *output* inside a *div* and make them display next to each other.
- **data-title** attribute can be used to set a title. A div will be added after the *code* element in the *pre*.

By default the **output table can be dragged**. Except if one of the following class is applied (**.left, .right, .bottom, .top, .nodrag**) which are applied to the output and not the code block.

## Annotations for PDF export

There are also some class annotation available to affect the exported PDF results.

- **.nopdf** class on any element will hide this element from the pdf output
- **.output-in-statement** class forces the output to be displayed in the pdf (used for filtered version which otherwise strips most of the fragment and tables to produce an assignment statement)
- **title** file inside **/slides** is used to set *top left header* of pdf files.

## SQL query cache handling

In order to generate pdf files and also to not depend on the server a cache file of query results can be created. The cache is a json file with the sql query hashed through the function available on *SQLQuery.hashCode(sql)*. Cache is generated and used through URL search parameters.

- **?cache** to generate cache file for all data-db blocks (must be connected to the server). Download the file and put it into the same folder as the original *.md file. Cache file has to have the same name as the md filename but end with *.cache*.

- **?usecache** can be used to forces to load data from cache without going to the server (needed for slow connection which do not respond error directly).

### Known issues

- A line without characters has to have no spaces. Otherwise output will not be shown in pdf.


## URL options


- **?sqlrun** forces to run all data-db block even if not annotated with run.
- **?sqlnorun** loads page without running or loading run annotated sql codes. 

## Animation configuration

The animation used when displaying a result from the server can be customized on the SQLQuery object.
- SQLQuery.config.animation
- SQLQuery.config.animationError

Accept any of the [Animate.css](http://daneden.me/) animation class.

# Development details

SQL_slides features are provided by a combination of reveal.js plugins and grunt tasks.

## Custom Reveal.js plugins

### sqlquery.js
Parses page and upgrades all sql code blocks to interact with a sql-explorer instance. 

### sqltomarkdown.js
Transforms a sql-explorer result object into a markdown table.

**sql-explorer object format:**
```javaqscript
{
  headers: ['ha', 'hb'],
  content: [['a', 'b'],
			['c', 'd'],
			['e', 'f']]
}
```

### toc.js
Parses the html and generates a flat table of content(ToC) with h1, h2, h3. The ToC is  available in the slide overview through the TOC button on the top right.

## Grunt tasks details

- **grunt serve** start a dev server with livereload, and watch
- **grunt new:"file_name"** is used to create a new file from a template
- **grunt dist** generates version with minimal dependencies and generates pdf files.

**Dist flow description:**
### 1. buildIndex
creates a html file in / from slides/*.json (see generator-reveal).

### 2. filterMarkdown
creates a filtered version of the *_serie.md files to create exercise statements.

### 3. buildMarkdown
created a copy of the normal and filtered markdown files and adds table results for all query found in the cache for the same file.

### 4. markdownpdf
converts all the markdown versions to a pdf file with phantom, custom headers are generated based on the file names.

### 5. copy to dist folder
**dist** folders contains the needed filews

**dist/pdf/** folder contains the pdf files: 
- for normal markdown all slides with all tables
- for *_serie.md two files one _solution.pdf with all and one _enonce.pdf which is the filtered version which can be used as statement.