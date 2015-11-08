var assert = require('assert-diff');
var hercule = require('../src/hercule');
var fs = require('fs');
var path = require('path');
var nock = require('nock');

describe('hercule', function() {

  describe('transcludeString', function() {

    it('should require a callback function', function(done) {
      var input = "Jackdaws love my big sphinx of quartz.";
      assert.throws(
        function() { hercule.transcludeString(input, input); },
        Error,
        "Argument error: 'callback' should be a function"
      );

      done();
    });

    it('should require a string', function(done) {
      assert.throws(
        function() { hercule.transcludeString(42, function() {}); },
        Error,
        "Argument error: 'input' should be a string"
      );

      done();
    });

    it('should allow a custom logger to be provided', function(done) {
      var file = __dirname + "/fixtures/test-basic/jackdaw.md";
      var input = fs.readFileSync(file).toString();
      var dir = path.dirname(file);
      var logOutput = []

      var logger = function(message) {
        logOutput.push(message);
      }

      hercule.transcludeString(input, logger, {relativePath: dir}, function(output) {
        assert.equal(output, 'Jackdaws love my big sphinx of quartz.\n');
        assert.equal(logOutput.length, 4);
        done();
      });
    });

    it('should transclude strings', function(done) {
      var input = "Jackdaws love my big sphinx of quartz.";

      hercule.transcludeString(input, function(output) {
        assert.equal(output, 'Jackdaws love my big sphinx of quartz.');
        done();
      });
    });

    it('should transclude strings with valid links', function(done) {
      var file = __dirname + "/fixtures/test-basic/jackdaw.md";
      var input = fs.readFileSync(file).toString();
      var dir = path.dirname(file);

      hercule.transcludeString(input, null, {relativePath: dir}, function(output) {
        assert.equal(output, 'Jackdaws love my big sphinx of quartz.\n');
        done();
      });
    });

    it('should transclude strings with valid remote http links', function(done) {
      var url  = "http://github.com";
      var file = "/size.md";
      var size = "big\n";

      var mock = nock(url).get(file).reply(200, size);

      var file = __dirname + "/fixtures/test-http/jackdaw.md";
      var input = fs.readFileSync(file).toString();
      var dir = path.dirname(file);

      hercule.transcludeString(input, null, {relativePath: dir}, function(output) {
        assert.equal(output, 'Jackdaws love my big sphinx of quartz.\n');
        done();
      });
    });

    it('should transclude strings with invalid links but a default', function(done) {
      var file  = __dirname + "/fixtures/test-default/invalid-link.md";
      var input = fs.readFileSync(file).toString();
      var dir   = path.dirname(file);

      hercule.transcludeString(input, null, {relativePath: dir}, function(output) {
        assert.equal(output, 'Jackdaws love my imagined sphinx of quartz.\n');
        done();
      });
    });

    it('should transclude strings with undefined placeholders but a default', function(done) {
      var file  = __dirname + "/fixtures/test-default/undefined-placeholder.md";
      var input = fs.readFileSync(file).toString();
      var dir   = path.dirname(file);

      hercule.transcludeString(input, null, {relativePath: dir}, function(output) {
        assert.equal(output, 'Jackdaws love my imagined sphinx of quartz.\n');
        done();
      });
    });
  });


  describe('transcludeFile', function() {

    beforeEach(function() {
      hercule._VERBOSE = false;
    });

    it('should exit if a circular link exists', function(done) {
      var inputFile = __dirname + "/fixtures/test-circular/fox.md";

      assert.throws(
        function() { hercule.transcludeFile(inputFile, function(output) { return null; }); },
        Error,
        "Circular reference detected"
      );

      done();
    });

    it('should not change a file without links', function(done) {
      var inputFile = __dirname + "/fixtures/test-base/fox.md";

      hercule.transcludeFile(inputFile, function(output) {
        assert.equal(output, 'The quick brown fox jumps over the lazy dog.\n');
        done();
      });
    });

    it('should not change a file without valid links', function(done) {
      var inputFile = __dirname + "/fixtures/test-invalid/fox.md";

      hercule.transcludeFile(inputFile, function(output) {
        assert.equal(output, 'The quick brown fox {{jumps}} over the lazy dog.\n');
        done();
      });
    });

    it('should transclude files with valid links', function(done) {
      var inputFile = __dirname + "/fixtures/test-basic/jackdaw.md";

      hercule.transcludeFile(inputFile, function(output) {
        assert.equal(output, 'Jackdaws love my big sphinx of quartz.\n');
        done();
      });
    });

    it('should transclude files with valid links and respect leading whitespace', function(done) {
      var inputFile = __dirname + "/fixtures/test-whitespace/jackdaw.md";

      hercule.transcludeFile(inputFile, function(output) {
        assert.equal(output, 'Jackdaws love my\n  big\n  \n    sphinx of quartz.\n');
        done();
      });
    });

    it('should transclude files with valid links and references', function(done) {
      var inputFile = __dirname + "/fixtures/test-extend/fox.md";

      hercule.transcludeFile(inputFile, function(output) {
        assert.equal(output, "The quick brown fox jumps over the lazy dog.\n");
        done();
      });
    });

    it('should transclude files with reference naming collisions', function(done) {
      var inputFile = __dirname + "/fixtures/test-reference-collision/index.md";

      hercule.transcludeFile(inputFile, function(output) {
        assert.equal(output, "The quick brown fox jumps over the lazy dog.\n");
        done();
      });
    });

    it('should transclude files with parent leakage', function(done) {
      var inputFile = __dirname + "/fixtures/test-parent-leakage/index.md";

      hercule.transcludeFile(inputFile, function(output) {
        assert.equal(
          output,
          "The quick brown fox jumps over the lazy dog.\n\nThe quick brown fox jumps over the lazy dog.\n"
        );
        done();
      });
    });

    it('should transclude files with valid links, references and string substitutions', function(done) {
      var inputFile = __dirname + "/fixtures/test-string-extend/fox.md";

      hercule.transcludeFile(inputFile, function(output) {
        assert.equal(output, "The quick brown fox jumps over the lazy dog.\n");
        done();
      });
    });

    it('should transclude files with invalid links but a default', function(done) {
      var inputFile = __dirname + "/fixtures/test-default/invalid-link.md";

      hercule.transcludeFile(inputFile, function(output) {
        assert.equal(output, 'Jackdaws love my imagined sphinx of quartz.\n');
        done();
      });
    });

    it('should transclude files with undefined placeholder but a default', function(done) {
      var inputFile = __dirname + "/fixtures/test-default/undefined-placeholder.md";

      hercule.transcludeFile(inputFile, function(output) {
        assert.equal(output, 'Jackdaws love my imagined sphinx of quartz.\n');
        done();
      });
    });

    it('should transclude files with escaped quotes within strings', function(done) {
      var inputFile = __dirname + "/fixtures/test-quotes/main.md";

      hercule.transcludeFile(inputFile, function(output) {
        assert.equal(output, '```\n{\n  "bar": null\n},\n{\n  "bar": "green"\n}\n```\n');
        done();
      });
    });

  });

});
