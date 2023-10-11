export default {
  name: 'TypeScriptReact',
  scopeName: 'source.tsx',
  fileTypes: [
    'tsx',
  ],
  uuid: '805375ec-d614-41f5-8993-5843fe63ea82',
  variables: {
    typeparamertStartOfArrow: '(\n  [<]\\s*{{identifier}}\\s+extends\\s*[^=>]                                                              # < typeparam extends\n) |',
    possiblyMultilineArrow: '((<\\s*$)|({{possiblyMultilineArrowWithoutTypeParameters}}))',
    jsxTagOrAtrributeIdentifier: '[_$[:alpha:]][-_$[:alnum:].]*',
    jsxTagNamespace: '(?:({{jsxTagOrAtrributeIdentifier}})(?<!\\.|-)(:))?',
    jsxTagName: '\\s*{{jsxTagNamespace}}((?:[a-z][a-z0-9]*|({{jsxTagOrAtrributeIdentifier}}))(?<!\\.|-))',
    jsxOpeningTagWithoutAttributes: '(<){{jsxTagName}}?\\s*(>)',
    jsxClosingTag: '(</){{jsxTagName}}?\\s*(>)',
    jsxTagStart: '(<){{jsxTagName}}(?=((<\\s*)|(\\s+))(?!\\?)|\\/?>)',
    jsxTagStartLookahead: '(?={{jsxTagStart}})',
    jsxLookBehindInExpression: '(?<!\\+\\+|--)(?<=[({\\[,?=>:*]|&&|\\|\\||\\?|\\*\\/|{{lookBehindAwait}}|{{lookBehindReturn}}|{{lookBehindDefault}}|{{lookBehindYield}}|^)\\s*',
  },
  repository: {
    'expressionWithoutIdentifiers': {
      patterns: [
        {
          include: '#jsx',
        },
      ],
    },
    'cast': {
      patterns: [
        {
          include: '#jsx',
        },
      ],
    },
    'jsx': {
      patterns: [
        {
          include: '#jsx-tag-without-attributes-in-expression',
        },
        {
          include: '#jsx-tag-in-expression',
        },
      ],
    },
    'jsx-tag-without-attributes-in-expression': {
      begin: '{{jsxLookBehindInExpression}}(?={{jsxOpeningTagWithoutAttributes}})',
      end: '(?!{{jsxOpeningTagWithoutAttributes}})',
      patterns: [
        {
          include: '#jsx-tag-without-attributes',
        },
      ],
    },
    'jsx-tag-without-attributes': {
      name: 'meta.tag.without-attributes.tsx',
      begin: '{{jsxOpeningTagWithoutAttributes}}',
      end: '{{jsxClosingTag}}',
      beginCaptures: {
        1: {
          name: 'punctuation.definition.tag.begin.tsx',
        },
        2: {
          name: 'entity.name.tag.namespace.tsx',
        },
        3: {
          name: 'punctuation.separator.namespace.tsx',
        },
        4: {
          name: 'entity.name.tag.tsx',
        },
        5: {
          name: 'support.class.component.tsx',
        },
        6: {
          name: 'punctuation.definition.tag.end.tsx',
        },
      },
      endCaptures: {
        1: {
          name: 'punctuation.definition.tag.begin.tsx',
        },
        2: {
          name: 'entity.name.tag.namespace.tsx',
        },
        3: {
          name: 'punctuation.separator.namespace.tsx',
        },
        4: {
          name: 'entity.name.tag.tsx',
        },
        5: {
          name: 'support.class.component.tsx',
        },
        6: {
          name: 'punctuation.definition.tag.end.tsx',
        },
      },
      contentName: 'meta.jsx.children.tsx',
      patterns: [
        {
          include: '#jsx-children',
        },
      ],
    },
    'jsx-tag-in-expression': {
      begin: '(?x)\n  {{jsxLookBehindInExpression}}\n  (?!<\\s*[_$[:alpha:]][_$[:alnum:]]*((\\s+extends\\s+[^=>])|,)) # look ahead is not type parameter of arrow\n  {{jsxTagStartLookahead}}',
      end: '(?!{{jsxTagStart}})',
      patterns: [
        {
          include: '#jsx-tag',
        },
      ],
    },
    'jsx-tag': {
      name: 'meta.tag.tsx',
      begin: '{{jsxTagStartLookahead}}',
      end: '(/>)|(?:{{jsxClosingTag}})',
      endCaptures: {
        1: {
          name: 'punctuation.definition.tag.end.tsx',
        },
        2: {
          name: 'punctuation.definition.tag.begin.tsx',
        },
        3: {
          name: 'entity.name.tag.namespace.tsx',
        },
        4: {
          name: 'punctuation.separator.namespace.tsx',
        },
        5: {
          name: 'entity.name.tag.tsx',
        },
        6: {
          name: 'support.class.component.tsx',
        },
        7: {
          name: 'punctuation.definition.tag.end.tsx',
        },
      },
      patterns: [
        {
          begin: '{{jsxTagStart}}',
          beginCaptures: {
            1: {
              name: 'punctuation.definition.tag.begin.tsx',
            },
            2: {
              name: 'entity.name.tag.namespace.tsx',
            },
            3: {
              name: 'punctuation.separator.namespace.tsx',
            },
            4: {
              name: 'entity.name.tag.tsx',
            },
            5: {
              name: 'support.class.component.tsx',
            },
          },
          end: '(?=[/]?>)',
          patterns: [
            {
              include: '#comment',
            },
            {
              include: '#type-arguments',
            },
            {
              include: '#jsx-tag-attributes',
            },
          ],
        },
        {
          begin: '(>)',
          beginCaptures: {
            1: {
              name: 'punctuation.definition.tag.end.tsx',
            },
          },
          end: '(?=</)',
          contentName: 'meta.jsx.children.tsx',
          patterns: [
            {
              include: '#jsx-children',
            },
          ],
        },
      ],
    },
    'jsx-children': {
      patterns: [
        {
          include: '#jsx-tag-without-attributes',
        },
        {
          include: '#jsx-tag',
        },
        {
          include: '#jsx-evaluated-code',
        },
        {
          include: '#jsx-entities',
        },
      ],
    },
    'jsx-evaluated-code': {
      contentName: 'meta.embedded.expression.tsx',
      begin: '\\{',
      end: '\\}',
      beginCaptures: {
        0: {
          name: 'punctuation.section.embedded.begin.tsx',
        },
      },
      endCaptures: {
        0: {
          name: 'punctuation.section.embedded.end.tsx',
        },
      },
      patterns: [
        {
          include: '#expression',
        },
      ],
    },
    'jsx-entities': {
      patterns: [
        {
          name: 'constant.character.entity.tsx',
          match: '(&)([a-zA-Z0-9]+|#[0-9]+|#x[0-9a-fA-F]+)(;)',
          captures: {
            1: {
              name: 'punctuation.definition.entity.tsx',
            },
            3: {
              name: 'punctuation.definition.entity.tsx',
            },
          },
        },
      ],
    },
    'jsx-tag-attributes': {
      name: 'meta.tag.attributes.tsx',
      begin: '\\s+',
      end: '(?=[/]?>)',
      patterns: [
        {
          include: '#comment',
        },
        {
          include: '#jsx-tag-attribute-name',
        },
        {
          include: '#jsx-tag-attribute-assignment',
        },
        {
          include: '#jsx-string-double-quoted',
        },
        {
          include: '#jsx-string-single-quoted',
        },
        {
          include: '#jsx-evaluated-code',
        },
        {
          include: '#jsx-tag-attributes-illegal',
        },
      ],
    },
    'jsx-tag-attribute-name': {
      match: '(?x)\n  \\s*\n  (?:({{jsxTagOrAtrributeIdentifier}})(:))?\n  ([_$[:alpha:]][-_$[:alnum:]]*)\n  (?=\\s|=|/?>|/\\*|//)',
      captures: {
        1: {
          name: 'entity.other.attribute-name.namespace.tsx',
        },
        2: {
          name: 'punctuation.separator.namespace.tsx',
        },
        3: {
          name: 'entity.other.attribute-name.tsx',
        },
      },
    },
    'jsx-tag-attribute-assignment': {
      name: 'keyword.operator.assignment.tsx',
      match: '=(?=\\s*(?:\'|"|{|/\\*|//|\\n))',
    },
    'jsx-string-double-quoted': {
      name: 'string.quoted.double.tsx',
      begin: '"',
      end: '"',
      beginCaptures: {
        0: {
          name: 'punctuation.definition.string.begin.tsx',
        },
      },
      endCaptures: {
        0: {
          name: 'punctuation.definition.string.end.tsx',
        },
      },
      patterns: [
        {
          include: '#jsx-entities',
        },
      ],
    },
    'jsx-string-single-quoted': {
      name: 'string.quoted.single.tsx',
      begin: '\'',
      end: '\'',
      beginCaptures: {
        0: {
          name: 'punctuation.definition.string.begin.tsx',
        },
      },
      endCaptures: {
        0: {
          name: 'punctuation.definition.string.end.tsx',
        },
      },
      patterns: [
        {
          include: '#jsx-entities',
        },
      ],
    },
    'jsx-tag-attributes-illegal': {
      name: 'invalid.illegal.attribute.tsx',
      match: '\\S+',
    },
  },
}
