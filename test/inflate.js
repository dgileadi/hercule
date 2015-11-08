var test  = require('ava');
var utils = require('../lib/utils');
var nock  = require('nock');

test('should return strings', function(t) {
  t.plan(1);
  utils.inflate('dog', 'string', function(output) {
    t.same(output, 'dog');
  });
});


test('should return contents of local files', function(t) {
  t.plan(1);
  var file = __dirname + "/fixtures/test-base/fox.md";
  utils.inflate(file, 'file', function(output) {
    t.same(output, 'The quick brown fox jumps over the lazy dog.\n');
  });
});


test('should return contents of http files', function(t) {
  t.plan(1);
  var url  = "http://github.com";
  var file = "/fox.md";
  var fox  = "The quick brown fox jumps over the lazy dog.\n";

  var mock = nock(url).get(file).reply(200, fox);

  utils.inflate(`${url}${file}`, 'http', function(output) {
    t.same(output, 'The quick brown fox jumps over the lazy dog.\n');
  });
});


test('should return empty string for unsupported types', function(t) {
  t.plan(1);
  utils.inflate('', 'foo', function(output) {
    t.same(output, '');
  });
});
