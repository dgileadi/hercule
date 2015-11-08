var test  = require('ava');
var utils = require('../lib/utils');


test('should find zero links when there are none.', function(t) {
  t.plan(1);
  var input = "Test document with no placeholders.";

  var links = utils.scan(input);
  t.same(links, []);
});


test('should find links', function(t) {
  t.plan(4);
  var input = "Test :[document](test/doc.md) with :[number](four.md footer:common/footer.md)\
  :[remote link](http://github.com/example.md) :[placeholders]().";

  var links = utils.scan(input);
  t.same(links[0].placeholder, ":[document](test/doc.md)");
  t.same(links[1].placeholder, ":[number](four.md footer:common/footer.md)");
  t.same(links[2].placeholder, ":[remote link](http://github.com/example.md)");
  t.same(links[3].placeholder, ":[placeholders]()");
});


test('should ignore whitespace between words', function(t) {
  t.plan(1);
  var input = "word :[word](test.md) word";

  var links = utils.scan(input);
  t.same(links[0].whitespace, "");
});


test('should find leading whitespace', function(t) {
  t.plan(3);
  var input = "\t:[](tab)\n\n :[](space) \n  \t :[](mixed)";

  var links = utils.scan(input);
  t.same(links[0].whitespace, "\t");
  t.same(links[1].whitespace, " ");
  t.same(links[2].whitespace, "  \t ");
});
