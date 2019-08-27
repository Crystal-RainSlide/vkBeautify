/**
* vkBeautify - javascript plugin to pretty-print or minify XML, JSON and CSS using regular expression.
*  
* Version - 0.99.00.beta 
* Copyright (c) 2012 Vadim Kiryukhin
* vkiryukhin @ gmail.com
* http://www.eslinstructor.net/vkbeautify/
* 
* MIT license:
*   http://www.opensource.org/licenses/mit-license.php
*
*   Pretty print
*
*        vkbeautify.xml(text [,indent_pattern]);
*        vkbeautify.json(text [,indent_pattern]);
*        vkbeautify.css(text [,indent_pattern]);
*
*        @text - String; text to beatufy;
*        @indent_pattern - Integer | String;
*                Integer:  number of white spaces;
*                String:   character string to visualize indentation ( can also be a set of white spaces )
*   Minify
*
*        vkbeautify.xmlmin(text [,preserve_comments]);
*        vkbeautify.jsonmin(text);
*        vkbeautify.cssmin(text [,preserve_comments]);
*        vkbeautify.minify(type, text [,preserve_comments]);
*
*        @type - String; can be "xml", "json" or "css";
*        @text - String; text to minify;
*        @preserve_comments - Bool; [optional];
*                Set this flag to true to prevent removing comments from @text ( minxml and mincss functions only. )
*
*   Examples:
*        vkbeautify.xml(text);            // pretty print XML
*        vkbeautify.json(text, 4 );       // pretty print JSON
*        vkbeautify.css(text, '. . . .'); // pretty print CSS
*
*        vkbeautify.xmlmin(text, true);      // minify XML, preserve comments
*        vkbeautify.jsonmin(text);           // minify JSON
*        vkbeautify.cssmin(text);            // minify CSS, remove comments ( default )
*
*        // pretty print XML or JSON using inline judgement: (isXML ? "xml" : "json")
*        vkbeautify[ (isXML ? "xml" : "json") ](text, "\t");
*
*        // minify XML or JSON using the same inline judgement: (isXML ? "xml" : "json")
*        vkbeautify.minify((isXML ? "xml" : "json"), text, false); 
*
*/

/* TODO:
shift:
  By now, shift is just like:

[
	"\n",
	"\n\t",
	"\n\t\t",
	"\n\t\t\t",
	"\n\t\t\t\t",
	"\n\t\t\t\t\t"
	...
]

  and:

    shift.length === 101
    shift.join("").length === 5151

  That's not desirable.

  Should turn it into a function which produce the socalled "shift" with the given deepth,
  but determine whether this will affect the performance first.
*/

(function() {

function createShiftArr(step) {

	var space = '    ';

	if ( isNaN(parseInt(step)) ) { // argument is not integer
		space = String(step);
	} else { // argument is integer

		if (String.prototype.repeat) {
			space = " ".repeat(step);
		} else {
			// Modified from https://github.com/egoist/nano-repeat
			space = (function (str, count = 0) {
				if (count < 0) throw new RangeError("count must be non-negative");
				str = String(str);
				var res = "";
				count = parseInt(count, 10);
				while (count--) { res += str; }
				return res;
			})(" ", step);
		}

	}

	var shift = ['\n']; // array of shifts
	for(ix = 0; ix < 100; ix++) {
		shift.push(shift[ix] + space);
	}
	return shift;
}

function vkbeautify() {
	this.step = '\t'; // 4 spaces
	this.shift = createShiftArr(this.step);
};

vkbeautify.prototype.xml = function(text, step) {

	var ar = text.replace(/>\s*</g     , "><")
	             .replace(/</g         , "~::~<")
	             .replace(/\s*xmlns\:/g, "~::~xmlns:")
	             .replace(/\s*xmlns\=/g, "~::~xmlns=")
	             .split('~::~'),
		len = ar.length,
		inComment = false,
		deep = 0,
		str = '',
		ix = 0,
		shift = step ? createShiftArr(step) : this.shift;

		for(ix = 0; ix < len; ix++) {

			// start comment or <![CDATA[...]]> or <!DOCTYPE //
			if(ar[ix].search(/<!/) > -1) {
				str += shift[deep] + ar[ix];
				inComment = true;
				// end comment  or <![CDATA[...]]> //
				if(
					ar[ix].search(/-->/) > -1 ||
					ar[ix].search(/\]>/) > -1 ||
					ar[ix].search(/!DOCTYPE/) > -1
				) {
					inComment = false;
				}
			} else

			// end comment  or <![CDATA[...]]> //
			if(
				ar[ix].search(/-->/) > -1 ||
				ar[ix].search(/\]>/) > -1
			) {
				str += ar[ix];
				inComment = false;
			} else

			// <elm></elm> //
			if(
				/^<\w/.exec(ar[ix - 1]) &&
				/^<\/\w/.exec(ar[ix]) &&
				/^<[\w:\-\.\,]+/.exec(ar[ix - 1]) == /^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace('/', '')
			) {
				str += ar[ix];
				if(!inComment) deep--;
			} else

			 // <elm> //
			if(
				ar[ix].search(/<\w/) > -1 &&
				ar[ix].search(/<\//) == -1 &&
				ar[ix].search(/\/>/) == -1
			) {
				str += !inComment
				       ? shift[deep++] + ar[ix]
				       : ar[ix];
			} else

			 // <elm>...</elm> //
			if(
				ar[ix].search(/<\w/) > -1 &&
				ar[ix].search(/<\//) > -1
			) {
				str += !inComment
				       ? shift[deep] + ar[ix]
				       : ar[ix];
			} else

			// </elm> //
			if(ar[ix].search(/<\//) > -1) {
				str += !inComment
				       ? shift[--deep] + ar[ix]
				       : ar[ix];
			} else

			// <elm/> //
			if(ar[ix].search(/\/>/) > -1 ) {
				str += !inComment
				       ? shift[deep] + ar[ix]
				       : ar[ix];
			} else

			// <? xml ... ?> //
			if(ar[ix].search(/<\?/) > -1) {
				str += shift[deep] + ar[ix];
			} else

			// xmlns //
			if(
				ar[ix].search(/xmlns[\:\=]/) > -1
			) {
				str += shift[deep] + ar[ix];
			} 
			else {
				str += ar[ix];
			}
		}

	return  (str[0] == "\n") ? str.slice(1) : str;
}

vkbeautify.prototype.json = function(text, step) {

	step = step ? step : this.step;

	if ( typeof JSON === 'undefined' ) return text; 

	if ( typeof text === "string" ) return JSON.stringify(JSON.parse(text), null, step);
	if ( typeof text === "object" ) return JSON.stringify(           text , null, step);

	return text; // text is not string nor object
}

vkbeautify.prototype.css = function(text, step) {

	var ar = text.replace(/\s+/g, ' ')
		          .replace(/\{/g         ,  "{~::~"     )
		          .replace(/\}/g         ,   "~::~}~::~")
		          .replace(/\;/g         ,  ";~::~"     )
		          .replace(/\/\*/g       ,   "~::~/*"   )
		          .replace(/\*\//g       , "*/~::~"     )
		          .replace(/~::~\s*~::~/g,   "~::~"     )
		          .split('~::~'),
		len  = ar.length,
		deep = 0,
		str  = '',
		ix   = 0,
		shift = step ? createShiftArr(step) : this.shift;

		for(ix = 0; ix < len; ix++) {

			     if(   /\{/.exec(ar[ix]) ) { str += shift[deep++] + ar[ix]; }
			else if(   /\}/.exec(ar[ix]) ) { str += shift[--deep] + ar[ix]; }
			else if( /\*\\/.exec(ar[ix]) ) { str += shift[deep]   + ar[ix]; }
			else                           { str += shift[deep]   + ar[ix]; }

		}

		return str.replace(/^\n+/, '');
}

// Minifiers

vkbeautify.prototype.xmlmin = function(text, preserveComments) {

	var str = preserveComments
	          ? text
	          : text.replace(/\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/g, "")
	                .replace(/[ \r\n\t]+xmlns/g, " xmlns");

	return  str.replace(/>\s*</g, "><"); 
}

vkbeautify.prototype.jsonmin = function(text) {
	if ( typeof JSON === 'undefined' ) return text;
	return JSON.stringify(JSON.parse(text), null, 0);
}

vkbeautify.prototype.cssmin = function(text, preserveComments) {

	var str = preserveComments
	          ? text
	          : text.replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\//g, "");

	return str.replace(/\s+/g, " ") // any amount of blank char => " "
	          .replace(/\{ /g, "{")
	          .replace(/\} /g, "}")
	          .replace(/\; /g, ";")
	          .replace(/\/\* /g, "/*")
	          .replace(/\*\/ /g, "*/");
}

vkbeautify.prototype.minify = function (type, ...arg) {
	if (/^(?:xml|json|css)$/.test(type)) {
		return vkbeautify.prototype[type + "min"](...arg)
	}
}

window.vkbeautify = new vkbeautify();

})();

