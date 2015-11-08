var test = require('ava');
var hercule = require('../lib/hercule');
var fs = require('fs');
var path = require('path');
var nock = require('nock');


test.before(function(t) {
  hercule._VERBOSE = false;
  t.end();
});


test('should exit if a circular link exists', function(t) {
  t.plan(1);
  var inputFile = __dirname + "/fixtures/test-circular/fox.md";

  t.throws(
    function() { hercule.transcludeFile(inputFile, function(output) { return null; }); },
    Error,
    "Circular reference detected"
  );

});


test('should not change a file without links', function(t) {
  t.plan(1);
  var inputFile = __dirname + "/fixtures/test-base/fox.md";

  hercule.transcludeFile(inputFile, function(output) {
    t.same(output, 'The quick brown fox jumps over the lazy dog.\n');
  });

});


test('should not change a file without valid links', function(t) {
  t.plan(1);
  var inputFile = __dirname + "/fixtures/test-invalid/fox.md";

  hercule.transcludeFile(inputFile, function(output) {
    t.same(output, 'The quick brown fox {{jumps}} over the lazy dog.\n');
  });

});


test('should transclude files with valid links', function(t) {
  t.plan(1);
  var inputFile = __dirname + "/fixtures/test-basic/jackdaw.md";

  hercule.transcludeFile(inputFile, function(output) {
    t.same(output, 'Jackdaws love my big sphinx of quartz.\n');
  });

});


test('should transclude files with valid links and respect leading whitespace', function(t) {
  t.plan(1);
  var inputFile = __dirname + "/fixtures/test-whitespace/jackdaw.md";

  hercule.transcludeFile(inputFile, function(output) {
    t.same(output, 'Jackdaws love my\n  big\n  \n    sphinx of quartz.\n');
  });

});


test('should transclude files with valid links and references', function(t) {
  t.plan(1);
  var inputFile = __dirname + "/fixtures/test-extend/fox.md";

  hercule.transcludeFile(inputFile, function(output) {
    t.same(output, "The quick brown fox jumps over the lazy dog.\n");
  });

});


test('should transclude strings with valid remote http links', function(t) {
  t.plan(1);
  var mock = nock("http://github.com").get("/size.md").reply(200, "big\n");

  var inputFile = __dirname + "/fixtures/test-http/jackdaw.md";

  hercule.transcludeFile(inputFile, function(output) {
    t.same(output, 'Jackdaws love my big sphinx of quartz.\n');
  });

});



test('should transclude files with reference naming collisions', function(t) {
  t.plan(1);
  var inputFile = __dirname + "/fixtures/test-reference-collision/index.md";

  hercule.transcludeFile(inputFile, function(output) {
    t.same(output, "The quick brown fox jumps over the lazy dog.\n");
  });

});


test('should transclude files with parent leakage', function(t) {
  t.plan(1);
  var inputFile = __dirname + "/fixtures/test-parent-leakage/index.md";

  hercule.transcludeFile(inputFile, function(output) {
    t.same(
      output,
      "The quick brown fox jumps over the lazy dog.\n\nThe quick brown fox jumps over the lazy dog.\n"
    );
  });

});


test('should transclude files with valid links, references and string substitutions', function(t) {
  t.plan(1);
  var inputFile = __dirname + "/fixtures/test-string-extend/fox.md";

  hercule.transcludeFile(inputFile, function(output) {
    t.same(output, "The quick brown fox jumps over the lazy dog.\n");
  });

});


test('should transclude files with invalid links but a default', function(t) {
  t.plan(1);
  var inputFile = __dirname + "/fixtures/test-default/invalid-link.md";

  hercule.transcludeFile(inputFile, function(output) {
    t.same(output, 'Jackdaws love my imagined sphinx of quartz.\n');
  });

});


test('should transclude files with undefined placeholder but a default', function(t) {
  t.plan(1);
  var inputFile = __dirname + "/fixtures/test-default/undefined-placeholder.md";

  hercule.transcludeFile(inputFile, function(output) {
    t.same(output, 'Jackdaws love my imagined sphinx of quartz.\n');
  });

});


test('should transclude files with escaped quotes within strings', function(t) {
  t.plan(1);
  var inputFile = __dirname + "/fixtures/test-quotes/main.md";

  hercule.transcludeFile(inputFile, function(output) {
    t.same(output, '```\n{\n  "bar": null\n},\n{\n  "bar": "green"\n}\n```\n');
  });

});
