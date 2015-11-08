var test  = require('ava');
var utils = require('../lib/utils');


test('should parse simple local links', function(t) {
  t.plan(1);
  var file = "file.md";
  var link = {
    href: file,
    placeholder: `:[simple](${file})`,
    relativePath: "",
  }

  var parsedLink = utils.parse(link);

  t.same(parsedLink, {
    href: "file.md",
    hrefType: "file",
    placeholder: link.placeholder,
    references: [],
    default: null,
    relativePath: "",
  });
});


test('should parse remote http links', function(t) {
  t.plan(1);
  var url = "http://github.com/example.md";
  var link = {
    href: url,
    placeholder: `:[remote http link](${url})`,
    relativePath: "",
  };

  var parsedLink = utils.parse(link);

  t.same(parsedLink, {
    href: "http://github.com/example.md",
    hrefType: "http",
    placeholder: link.placeholder,
    references: [],
    default: null,
    relativePath: ""
  });
});

test('should parse complex links', function(t) {
  t.plan(1);
  var mixedLink = "file.md fruit:apple.md header: footer:../common/footer.md copyright:\"Copyright 2014 (c)\"";
  var link = {
    href: mixedLink,
    placeholder: `:[](${mixedLink})`,
    relativePath: "customer/farmers-market"
  };

  var parsedLink = utils.parse(link);

  t.same(parsedLink, {
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
});


test('should parse links with default', function(t) {
  t.plan(1);
  var href = "file-which-does-not-exist.md || \"default value\"";
  var link = {
    href: href,
    placeholder: `:[simple](${href})`,
    relativePath: ""
  }

  var parsedLink = utils.parse(link);

  t.same(parsedLink, {
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
});


test('should parse complex links with default', function(t) {
  t.plan(1);
  var mixedLink = "file.md || \"Nope\" fruit:apple.md header: footer:../common/footer.md copyright:\"Copyright 2014 (c)\""
  var link = {
    href: mixedLink,
    placeholder: `:[](${mixedLink})`,
    relativePath: "customer/farmers-market"
  }

  var parsedLink = utils.parse(link);

  t.same(parsedLink, {
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
});


test('should parse links with an empty default', function(t) {
  t.plan(1);
  var href = "file-which-does-not-exist.md || \"\"";
  var link = {
    href: href,
    placeholder: `:[simple](${href})`,
    relativePath: ""
  };

  var parsedLink = utils.parse(link);

  t.same(parsedLink, {
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
});
