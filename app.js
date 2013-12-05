/*
* Source - Front-end documentation engine
* @copyright 2013 Sourcejs.com
* @license MIT license: http://github.com/sourcejs/source/wiki/MIT-License
* */

/* Module dependencies */
var express = require('express')
    , colors = require('colors')
    , fs = require('fs')
    , commander = require('commander')
    , pkg = require('./package.json');

global.app = express();
global.opts = require('./core/options/');

global.app.set('views', __dirname + '/core/views');
global.app.set('specs path', __dirname + '/' + global.opts.common.pathToSpecs);

// Parse args
commander
  .version(pkg.version)
  .option('-p, --port [number]', 'Server port (default: 80)', 80)
  .parse(process.argv);

/*  Clarify module */
var clarify = require('./core/clarify');
app.use(clarify);
app.use(express.static(__dirname + '/core/clarify')); // static for module css
/*  /Clarify module */

/*  File tree module */
fileTree = require('./core/file-tree');
global.app.use(function(req, res, next){
    if(req.url === "/") {
        fileTree.scan();
    }
    next();
});
/*  /File tree module */

/* Error handling */
global.app.use(logErrors);
global.app.use(clientErrorHandler);
global.app.use(errorHandler);

/* serve static content */
global.app.use(express.static(global.app.get('specs path')));

try {
    /* Routes */
    global.routes = require('./core/routes');

    /* User plugins */
    global.plugins = require("./user/plugins/");

    /* User additional functionality */
    global.extApp = require("./user/app.js");
} catch(e) {
    console.log(e);
    process.exit(e.code);
}

if (!module.parent) {
    var port = parseInt(commander.port);
    global.app.listen(port);
    console.log('[SOURCE] is working on '+port+' port...'.blue);
}

function logErrors(err, req, res, next) {
    console.error(("Error: " + err.stack).red);
    next(err);
}

function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.send(500, { error: 'Something blew up!' });
    } else {
        next(err);
    }
}

function errorHandler(err, req, res, next) {
    res.status(500);
    res.render('error', { error: err });
}
