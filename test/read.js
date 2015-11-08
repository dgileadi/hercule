var test  = require('ava');
var utils = require('../lib/utils');
var nock  = require('nock');


test('readFile should return null for missing files', function(t) {
  t.plan(1);
  var inputFile = __dirname + "/fixtures/missing.md";

  var content = utils.readFile('missing.md');
  t.same(content, null);
});


test('readFile should read files which exist', function(t) {
  t.plan(1);
  var inputFile = __dirname + "/fixtures/test-base/fox.md";

  var content = utils.readFile(inputFile);
  t.same(content, 'The quick brown fox jumps over the lazy dog.\n');
});


test('readUri should return null for files not found (404)', function(t) {
  t.plan(1);
  var url  = "http://github.com";
  var file = "/dog.md";

  var mock = nock(url).get(file).reply(404);

  utils.readUri(`${url}${file}`, function(content) {
    t.same(content, null);
  });
});


test('readUri should read http files which exist', function(t) {
  t.plan(1);
  var url  = "http://github.com";
  var file = "/fox.md";
  var fox  = "The quick brown fox jumps over the lazy dog.\n";

  var mock = nock(url).get(file).reply(200, fox);

  utils.readUri(`${url}${file}`, function(content) {
    t.same(content, 'The quick brown fox jumps over the lazy dog.\n');
  });
});
