# Hercule – Markdown Transclusion Tool

[![Join the chat at https://gitter.im/jamesramsay/hercule](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/jamesramsay/hercule?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/jamesramsay/hercule.svg?branch=master)](https://travis-ci.org/jamesramsay/hercule)
[![Coverage Status](https://coveralls.io/repos/jamesramsay/hercule/badge.svg)](https://coveralls.io/r/jamesramsay/hercule)
[![Dependency Status](https://david-dm.org/jamesramsay/hercule.svg)](https://david-dm.org/jamesramsay/hercule)

![Hercule logo](hercule.png)

Write large markdown documents, including API Blueprints, while keeping things DRY (don't repeat yourself).

```bash
hercule src/document.md -o document.md
```

Hercule is a command-line tool and library for transcluding markdown documents, including API documentation written in [API Blueprint](http://apiblueprint.org) format. With Hercule you can easily break complex documents into smaller logical documents, preventing repetition and improving consistency using transclusion links `:[abstract](src/abstract.md)`.

-----

[![Adslot](adslot.png)](http://adslot.com/)

Hercule is used by [Adslot](http://adslot.com) to help document our APIs in [API Blueprint](http://apiblueprint.org) more efficiently and more accurately. We also use [Apiary](http://apiary.io) to distribute our API documentation and [DREDD](https://github.com/apiaryio/dredd) (a tool by [Apiary](http://apiary.io)) to validate the documentation against implementation.

-----

## Installation

[Node.js](http://nodejs.org) and [NPM](http://npmjs.org) is required.

```
$ npm install -g hercule
```

Use as a command-line utility:

```
hercule src/document.md -o document.md
```

Or use as a library:

```javascript
var hercule = require('hercule');

hercule.transcludeString("# Title\n\n:[abstract](abstract.md)", function(output) {
  return console.log(output);
});
```

## Basic use: file transclusion

Hercule extends the Markdown inline link syntax with a leading colon (`:`) to denote the link should transcluded.

```markdown
This is an :[example link](foo.md).
```

Output from `hercule examples/basic/main.md`:

```
This is an example transclusion.
```

Extending the standard Markdown link syntax means that most other markdown parsers will treat them as normal links.
For example, Github handles transclusion links in this manner.

## Basic use: remote file (http) transclusion

Hercule is able to transclude HTTP references also.
This done by simply providing the URL as the link.

```markdown
Jackdaws love my :[size](https://gist.githubusercontent.com/jamesramsay/e869c0164a187cc756d4/raw/5e6052f67b6bf87c6862e3e17e1a646cf31cbe16/size.md) sphinx of quartz.
```

Output from `hercule test/fixtures/test-http-live/jackdaw.md`:

```
Jackdaws love my big sphinx of quartz.
```

## Advanced use: placeholders and references

As well as basic file transclusion, Hercule supports placeholders and references.
Placeholders and references may be useful for increasing the _'dryness'_ of your source documents.

Example placeholder link in `examples/advanced/foo.md`:

```markdown
is an :[example placeholder](bar)
```

In this example `bar` is being used as a placeholder link.
When transcluding `foo.md`, the placeholder can be targeted by a reference file or string.

```markdown
This document :[example link with string reference](foo.md bar:"example foobar!")
```

Output from `hercule examples/advanced/main.md`:

```
This document is an example foobar!
```

References are passed down to any nested transclusion links.

## Advanced use: default placeholders

Sometimes a file might be used in multiple contexts, some contexts requiring references and others not.
Default placeholders help handle this situation more conveniently.

The following example uses Apiary's [Markdown Syntax for Object Notation (MSON)](https://github.com/apiaryio/mson).

```markdown
## Properties

- id: 1 (number, required)
- name: Cucumber (string, required)
- description: Essential for tzatziki (string, :[is required](required || "optional"))
```

Output from `hercule examples/default/main.md` without reference `required`:

```markdown
## Properties

- id: 1 (number, required)
- name: Cucumber (string, required)
- description: Essential for tzatziki (string, optional)
```

Output from `hercule examples/default/main-override.md` with reference `required`:

```markdown
## Properties

- id: 1 (number, required)
- name: Cucumber (string, required)
- description: Essential for tzatziki (string, required)
```

## Whitespace sensitivity

Leading whitespace is significant in Markdown.
Hercule preserves whitespace at the beginning of each line.

```markdown
Binary sort example:

  :[](snippet.c)

```

Each line of `snippet.c` will be indented with the whitespace preceding it.

----

## Acknowledgments

Special thanks:

- [@zdne](https://github.com/zdne) for your feedback and ideas, particularly on syntax
- [@MichaelHirn](https://github.com/MichaelHirn) for contributions including the default link behaviour

Related projects:

- [Grunt Hercule](https://github.com/chesleybrown/grunt-hercule): a Grunt task that wraps hercule
