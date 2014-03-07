    // cheerio dependency
var cheerio = require('cheerio'),
    // fileSystem dependency
    fs = require('fs'),
    // pseudo jQuery from cheerio
    $;

// helper for caching parts
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

// read from fs
fs.readFile('./const.htm', 'utf8', fileRead);
function fileRead (err, data) {
	$ = cheerio.load(data);
	ActOnNode($('.ConteudoTexto').children());
	out.text().forEach(function (e) {
	  fs.writeFile(e.title+'.md', e.text);
	});	
}

// recursive
function ActOnNode (node) {
	var tagName = node[0].name,
		text = node.text().trim();

	if (text) {
		if (tagName[0] === 'h') {
			out.title(+tagName[1], text);
		}
		else if (tagName === 'p') {
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
