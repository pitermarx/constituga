    // cheerio dependency
var cheerio = require('cheerio'),
    // fileSystem dependency
    fs = require('fs'),
    // pseudo jQuery from cheerio
    $,
    // output path
    path = 'Output';

// enhance string
String.prototype.repeat = function(n){
    n= n || 1;
    return Array(n+1).join(this);
}

// ensure output path
fs.mkdir(path, function(e){
    if(e && e.code !== 'EEXIST'){
       throw e;
    }
    
    // read from fs
    fs.readFile('./source.html', 'utf8', function fileRead (e, data) {
        if (e){
            throw e;
        }
        
        // save pseudo jQuery
        $ = cheerio.load(data);
        
        // HACK! replace <br/> with a space
        $('.ConteudoTexto br').replaceWith(' ');
        
        // parse document
        parseNodes($('.ConteudoTexto').children());
        
        // write each part to files
        contituga.parts.forEach(function (e) {
          fs.writeFile(path + '/' + e.title + '.md', e.text);
        });	
    });
});

// helper for caching parts
var contituga = (function () {
	var current = -1,  // current part index
		threshold = 1, // if importance <= threshold, create a new part
        parts = [];    // the parsed document
    
	return {
		parts: parts,
		addLine: function (line) {
			parts[current].text += line + '\n';
		},
		addTitle: function (importance, title) {
            // precede by N '#'
			var text = '#'.repeat(importance + 1) + ' ' + title;
            
            // create a new part
			if (importance <= threshold) {
				parts.push({
					title: title,
					text: text
				});
				current++;
			}
            // add text to current part
			else {
				parts[current].text += ('\n' + text);
			}
            // always add a breakline
			parts[current].text += '\n';
		}
	};
}());



// recursive parse.
function parseNodes (node) {
	var tagName = node[0].name,
		text = node.text().trim();
    
    // skip if empty
	if (text) {
        // a header
		if (tagName[0] === 'h') {
            // the importance is the header number
            var importance = +tagName[1];
			contituga.addTitle(importance, text);
		}
        // a paragraph
		else if (tagName === 'p') {
			contituga.addLine(text);
		}
        // special cases
		else if (text.indexOf("Princípios fundamentais") != -1){
			contituga.addTitle(1, text);
		}
		else if (text.indexOf("PREÂMBULO") != -1){
			contituga.addTitle(1, text);
		}
	}

    // parse children
	node.children().each(function (i, n) { 
		parseNodes($(n)); 
	});
}
