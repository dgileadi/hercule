var assert = require('assert-diff');
var utils = require('../src/utils');
var nock = require('nock');

describe('utils', function() {

  describe('scan', function() {
    it('should find zero links when there are none.', function(done) {
      var input = "Test document with no placeholders.";

      var links = utils.scan(input);
      assert.deepEqual(links, []);

      done();
    });

    it('should find links', function(done) {
      var input = "Test :[document](test/doc.md) with :[number](four.md footer:common/footer.md)\
      :[remote link](http://github.com/example.md) :[placeholders]().";

      var links = utils.scan(input);
      assert.equal(links[0].placeholder, ":[document](test/doc.md)");
      assert.equal(links[1].placeholder, ":[number](four.md footer:common/footer.md)");
      assert.equal(links[2].placeholder, ":[remote link](http://github.com/example.md)");
      assert.equal(links[3].placeholder, ":[placeholders]()");

      done();
    });

    it('should ignore whitespace between words', function(done) {
      var input = "word :[word](test.md) word";

      var links = utils.scan(input);
      assert.equal(links[0].whitespace, "");

      done();
    });

    it('should find leading whitespace', function(done) {
      var input = "\t:[](tab)\n\n :[](space) \n  \t :[](mixed)";

      var links = utils.scan(input);
      assert.equal(links[0].whitespace, "\t");
      assert.equal(links[1].whitespace, " ");
      assert.equal(links[2].whitespace, "  \t ");

      done();
    });
  });

  describe('parse', function() {
    it('should parse simple local links', function(done) {
      var file = "file.md";
      var link = {
        href: file,
        placeholder: `:[simple](${file})`,
        relativePath: "",
      }

      var parsedLink = utils.parse(link);

      assert.deepEqual(parsedLink, {
        href: "file.md",
        hrefType: "file",
        placeholder: link.placeholder,
        references: [],
        default: null,
        relativePath: "",
      });

      done();
    });

    it('should parse remote http links', function(done) {
      var url = "http://github.com/example.md";
      var link = {
        href: url,
        placeholder: `:[remote http link](${url})`,
        relativePath: "",
      };

      var parsedLink = utils.parse(link);

      assert.deepEqual(parsedLink, {
        href: "http://github.com/example.md",
        hrefType: "http",
        placeholder: link.placeholder,
        references: [],
        default: null,
        relativePath: ""
      });

      done();
    });

    it('should parse complex links', function(done) {
      var mixedLink = "file.md fruit:apple.md header: footer:../common/footer.md copyright:\"Copyright 2014 (c)\"";
      var link = {
        href: mixedLink,
        placeholder: `:[](${mixedLink})`,
        relativePath: "customer/farmers-market"
      };

      var parsedLink = utils.parse(link);

      assert.deepEqual(parsedLink, {
        href: "file.md",
        hrefType: "file",
        placeholder: link.placeholder,
        references: [
          {
            placeholder: "fruit",
            hrefType: "file",
            href: "customer/farmers-market/apple.md"
          },
          {
            placeholder: "header",
            hrefType: "string",
            href: ""
          },
          {
            placeholder: "footer",
            hrefType: "file",
            href: "customer/common/footer.md"
          },
          {
            placeholder:"copyright",
            hrefType:"string",
            href:"Copyright 2014 (c)"
          }
        ],
        default: null,
        relativePath: "customer/farmers-market"
      });

      done();
    });

    it('should parse links with default', function(done) {
      var href = "file-which-does-not-exist.md || \"default value\"";
      var link = {
        href: href,
        placeholder: `:[simple](${href})`,
        relativePath: ""
      }

      var parsedLink = utils.parse(link);

      assert.deepEqual(parsedLink, {
        href: "file-which-does-not-exist.md",
        hrefType: "file",
        placeholder: link.placeholder,
        references: [],
        default: {
          hrefType: "string",
          href: "default value"
        },
        relativePath: ""
      });

      done();
    });

    it('should parse complex links with default', function(done) {
      var mixedLink = "file.md || \"Nope\" fruit:apple.md header: footer:../common/footer.md copyright:\"Copyright 2014 (c)\""
      var link = {
        href: mixedLink,
        placeholder: `:[](${mixedLink})`,
        relativePath: "customer/farmers-market"
      }

      var parsedLink = utils.parse(link);

      assert.deepEqual(parsedLink, {
        href: "file.md",
        hrefType: "file",
        placeholder: link.placeholder,
        references: [
          {
            placeholder: "fruit",
            hrefType: "file",
            href: "customer/farmers-market/apple.md"
          },
          {
            placeholder: "header",
            hrefType: "string",
            href: ""
          },
          {
            placeholder: "footer",
            hrefType: "file",
            href: "customer/common/footer.md"
          },
          {
            placeholder:"copyright",
            hrefType:"string",
            href:"Copyright 2014 (c)"
          }
        ],
        default: {
          hrefType: "string",
          href: "Nope"
        },
        relativePath: "customer/farmers-market"
      });

      done();
    });

    it('should parse links with an empty default', function(done) {
      var href = "file-which-does-not-exist.md || \"\"";
      var link = {
        href: href,
        placeholder: `:[simple](${href})`,
        relativePath: ""
      };

      var parsedLink = utils.parse(link);

      assert.deepEqual(parsedLink, {
        href: "file-which-does-not-exist.md",
        hrefType: "file",
        placeholder: link.placeholder,
        references: [],
        default: {
          hrefType: "string",
          href: ""
        },
        relativePath: ""
      });

      done();
    });
  });


  describe('readFile', function() {
    it('should return null for missing files', function(done) {
      var inputFile = __dirname + "/fixtures/missing.md";

      var content = utils.readFile('missing.md');
      assert.equal(content, null);

      done();
    });

    it('should read files which exist', function(done) {
      var inputFile = __dirname + "/fixtures/test-base/fox.md";

      var content = utils.readFile(inputFile);
      assert.equal(content, 'The quick brown fox jumps over the lazy dog.\n');

      done();
    });
  });


  describe('readUri', function() {
    it('should return null for files not found (404)', function(done) {
      var url  = "http://github.com";
      var file = "/dog.md";

      var mock = nock(url).get(file).reply(404);

      utils.readUri(`${url}${file}`, function(content) {
        assert.equal(content, null);

        done();
      });
    });

    it('should read http files which exist', function(done) {
      var url  = "http://github.com";
      var file = "/fox.md";
      var fox  = "The quick brown fox jumps over the lazy dog.\n";

      var mock = nock(url).get(file).reply(200, fox);

      utils.readUri(`${url}${file}`, function(content) {
        assert.equal(content, 'The quick brown fox jumps over the lazy dog.\n');

        done();
      });
    });
  });


  describe('inflate', function() {
    it('should return strings', function(done) {
      utils.inflate('dog', 'string', function(output) {
        assert.equal(output, 'dog');

        done();
      });
    });

    it('should return contents of local files', function(done) {
      var file = __dirname + "/fixtures/test-base/fox.md";
      utils.inflate(file, 'file', function(output) {
        assert.equal(output, 'The quick brown fox jumps over the lazy dog.\n');

        done();
      });
    });

    it ('should return contents of http files', function(done) {
      var url  = "http://github.com";
      var file = "/fox.md";
      var fox  = "The quick brown fox jumps over the lazy dog.\n";

      var mock = nock(url).get(file).reply(200, fox);

      utils.inflate(`${url}${file}`, 'http', function(output) {
        assert.equal(output, 'The quick brown fox jumps over the lazy dog.\n');

        done();
      });
    });

    it ('should return empty string for unsupported types', function(done) {
      utils.inflate('', 'foo', function(output) {
        assert.equal(output, '');

        done();
      });
    });

  });

});
