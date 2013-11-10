var jsdom = require('jsdom'),
	fs = require('fs'),
	$;

var out = (function (parts) {
	var current = -1,
		threshold = 1;
	return {
		line: function (line) {
			parts[current].text += line + '\n';
		},
		title: function (importance, title) {
			var text = Array(importance + 1).join('#') + ' ' + title;
			if (importance <= threshold) {
				parts.push({
					title: title,
					text: text
				});
				current++;
			}
			else {
				parts[current].text += '\n';
				parts[current].text += text;
			}
			parts[current].text += '\n';
		},
		text: function () {
			return parts;
		}
	};
}([]));

fs.readFile('./const.htm', 'utf8', fileRead);
function fileRead (err, data) {
	jsdom.env({
	  html: data,
	  scripts: ['http://code.jquery.com/jquery-1.5.min.js'],
	  done: function (err, window) {
	  	  $ = window.jQuery;
	      ActOnNode($('.ConteudoTexto'));
	      out.text().forEach(function (e) {
	      	fs.writeFile(e.title+'.md', e.text);
	      });	      
	  }
	});	
}

function ActOnNode (node) {
	var tagName = node.get(0).tagName,
		text = node.text().trim();

	if (text) {
		if (tagName[0] === 'H') {
			out.title(+tagName[1], text);
		}
		else if (tagName === 'P') {
			out.line(text);
		}
		else if (text.indexOf("Princípios fundamentais") != -1){
			out.title(1, text);
		}
		else if (text.indexOf("PREÂMBULO") != -1){
			out.title(1, text);
		}
	}

	node.children().each(function (i, n) { 
		ActOnNode($(n)); 
	});
}