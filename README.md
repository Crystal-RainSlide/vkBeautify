# vkBeautify

javascript  plugin to **pretty-print** or **minify**
text in **XML**, **JSON**, **CSS** and **SQL** formats.

This fork split **SQL** out to fit the most use case:
SQL tools is not related to XML, JSON or CSS and vice versa.

**Version**: 0.99.00.beta

**Copyright**: (c) 2012 Vadim Kiryukhin ( vkiryukhin @ gmail.com )

**Home page**: [http://www.eslinstructor.net/vkbeautify/](http://www.eslinstructor.net/vkbeautify/) 

**License**: MIT

[http://www.opensource.org/licenses/mit-license.php](http://www.opensource.org/licenses/mit-license.php)

**Pretty print**
```
vkbeautify.xml(text [,indent_pattern]);
vkbeautify.json(text [,indent_pattern]);
vkbeautify.css(text [,indent_pattern]);
vkbeautify.sql(text [,indent_pattern]);

@text - String; text to beatufy;
@indent_pattern - Integer | String;
    Integer:  number of white spaces;
    String:   character string to visualize indentation ( can also be a set of white spaces )
```
  **Minify**
```
vkbeautify.xmlmin(text [,preserve_comments]);
vkbeautify.jsonmin(text);
vkbeautify.cssmin(text [,preserve_comments]);
vkbeautify.sqlmin(text);
vkbeautify.minify(type, text [,preserve_comments]);

@type - String; can be "xml", "json" or "css";
@text - String; text to minify;
@preserve_comments - Bool; [optional];
    Set this flag to true to prevent removing comments from @text ( minxml and mincss functions only. )
```
**Examples**
```
vkbeautify.xml(text);            // pretty print XML
vkbeautify.json(text, 4 );       // pretty print JSON
vkbeautify.css(text, '. . . .'); // pretty print CSS

vkbeautify.xmlmin(text, true);      // minify XML, preserve comments
vkbeautify.jsonmin(text);           // minify JSON
vkbeautify.cssmin(text);            // minify CSS, remove comments ( default )

// pretty print XML or JSON using inline judgement: (isXML ? "xml" : "json")
vkbeautify[ (isXML ? "xml" : "json") ](text, "\t");

// minify XML or JSON using the same inline judgement: (isXML ? "xml" : "json")
vkbeautify.minify((isXML ? "xml" : "json"), text, false); 
```
