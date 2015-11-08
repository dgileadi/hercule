var test = require('ava');
var hercule = require('../lib/hercule');
var fs = require('fs');
var path = require('path');
var nock = require('nock');


test('should require a callback function', function(t) {
  t.plan(1);
  var input = "Jackdaws love my big sphinx of quartz.";
  t.throws(
    function() { hercule.transcludeString(input, input); },
    Error,
    "Argument error: 'callback' should be a function"
  );
});


test('should require a string', function(t) {
  t.plan(1);
  t.throws(
    function() { hercule.transcludeString(42, function() {}); },
    Error,
    "Argument error: 'input' should be a string"
  );
});


test('should allow a custom logger to be provided', function(t) {
  t.plan(2);
  var file = __dirname + "/fixtures/test-basic/jackdaw.md";
  var input = fs.readFileSync(file).toString();
  var dir = path.dirname(file);
  var logOutput = []

  var logger = function(message) {
    logOutput.push(message);
  }

  hercule.transcludeString(input, logger, {relativePath: dir}, function(output) {
    t.same(output, 'Jackdaws love my big sphinx of quartz.\n');
    t.same(logOutput.length, 4);
  });
});


test('should transclude strings', function(t) {
  t.plan(1);
  var input = "Jackdaws love my big sphinx of quartz.";

  hercule.transcludeString(input, function(output) {
    t.same(output, 'Jackdaws love my big sphinx of quartz.');
  });
});
