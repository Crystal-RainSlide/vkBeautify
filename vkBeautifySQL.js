/**
* vkbeautifySQL - javascript plugin to pretty-print or minify SQL using regular expression.
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
*        vkbeautifySQL.sql(text [,indent_pattern]);
*
*        @text - String; text to beatufy;
*        @indent_pattern - Integer | String;
*                Integer:  number of white spaces;
*                String:   character string to visualize indentation ( can also be a set of white spaces )
*   Minify
*
*        vkbeautifySQL.sqlmin(text);
*
*        @text - String; text to minify;
*        @preserve_comments - Bool; [optional];
*                Set this flag to true to prevent removing comments from @text ( minxml and mincss functions only. )
*
*   Examples:
*        vkbeautify.sql(text, '----'); // pretty print SQL
*        vkbeautify.sqlmin(text);      // minify SQL
*
*/

(function() {

function createShiftArr(step) {

	var space = '    ';

	if ( isNaN(parseInt(step)) ) {  // argument is not integer
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

}

	var shift = ['\n']; // array of shifts
	for(ix = 0; ix < 100; ix++) {
		shift.push(shift[ix] + space); 
	}
	return shift;
}

function vkbeautifySQL() {
	this.step = '\t'; // 4 spaces
	this.shift = createShiftArr(this.step);
};

vkbeautifySQL.prototype.sql = function(text,step) {

	var ar_by_quote = text.replace(/\s{1,}/g, " ")
		                   .replace(/\'/ig, "~::~\'")
		                   .split("~::~"),
		len = ar_by_quote.length,
		ar = [],
		deep = 0,
		tab = this.step,// + this.step,
		inComment = true,
		inQuote   = false,
		parenthesisLevel = 0,
		str = '',
		ix = 0,
		shift = step ? createShiftArr(step) : this.shift;

		for(ix = 0; ix < len; ix++) {
			if(ix % 2) {
				ar = ar.concat(ar_by_quote[ix]);
			} else {
				ar = ar.concat(split_sql(ar_by_quote[ix], tab));
			}
		}

		len = ar.length;
		for(ix = 0; ix < len; ix++) {

			parenthesisLevel = isSubquery(ar[ix], parenthesisLevel);

			if( /\s{0,}\s{0,}SELECT\s{0,}/.exec(ar[ix]) ) { 
				ar[ix] = ar[ix].replace(/\,/g, ",\n" + tab + tab + "")
			} 

			if( /\s{0,}\s{0,}SET\s{0,}/.exec(ar[ix]) ) { 
				ar[ix] = ar[ix].replace(/\,/g, ",\n" + tab + tab + "")
			} 

			if( /\s{0,}\(\s{0,}SELECT\s{0,}/.exec(ar[ix]) ) { 
				deep++;
				str += shift[deep] + ar[ix];
			} else 
			if( /\'/.exec(ar[ix]) )  { 
				if(parenthesisLevel < 1 && deep) {
					deep--;
				}
				str += ar[ix];
			}
			else  { 
				str += shift[deep] + ar[ix];
				if(parenthesisLevel < 1 && deep) {
					deep--;
				}
			} 
			var junk = 0;
		}

		str = str.replace(/^\n{1,}/, '')
		         .replace(/\n{1,}/g, "\n");
		return str;
}

vkbeautifySQL.prototype.sqlmin = function(text) {
	return text.replace(/\s{1,}/g , " ")
	           .replace(/\s{1,}\(/, "(")
	           .replace(/\s{1,}\)/, ")");
}

window.vkbeautifySQL = new vkbeautifySQL();

})();

