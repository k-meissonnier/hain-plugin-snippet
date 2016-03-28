'use strict';

module.exports = (pluginContext) => {
    var logger = pluginContext.logger;
    var app = pluginContext.app;

    var fs = require('fs');
    var LineByLineReader = require('line-by-line');
    var ncp = require("copy-paste");

    const dir = '../../hain-snippet-plugin';
    const file = dir + "/snippet.txt";


        
    function search(query, res) {
        const query_trim = query.trim();
       
        if (query_trim.length == 0) {
            return;
        }

        res.add({
            id: query_trim,
            payload: 'write',
            title: `<b>Add : ${query_trim}</b>`,
            desc: 'Save this snippet',
            icon: '#fa fa-plus'
        });

        var lr = new LineByLineReader(file);

        lr.on('line', function (line) {
            if(line != '' && line.indexOf(query_trim) > -1) {
                var lineWithBold = line.replace(query_trim, '<b>' + query_trim + '</b>');
                res.add({
                    id: line,
                    payload: 'copy',
                    title: lineWithBold,
                    desc: "Click... It's Copied!",
                    icon: '#fa fa-files-o'
                });
            }
        });

    }

  
    function execute(id, payload) {

        if (payload == 'write') {

            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }

            if (fs.existsSync(file)) {

                var lr = new LineByLineReader(file);
                var exist = false;

                lr.on('line', function (line) {
                    if (line == id) {
                        exist = true;
                    }
                });

                lr.on('end', function () {
                    if( !exist ){
                        write(id);
                    }
                }); 

            } 

            else {
                write(id);
            }

            app.setInput('/snippet ');
        }

        if (payload == 'copy') {
            ncp.copy(id, function(){
                app.close();
            });
        }

    }


    function write(value) {
        fs.appendFile(file, '\n' + value, function(err) {
            if(err) {
                logger.log(err);
            }
        }); 
    }


    return {search, execute};
};