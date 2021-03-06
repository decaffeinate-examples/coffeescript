/* eslint-disable
    func-names,
    max-len,
    no-multi-str,
    no-plusplus,
    no-restricted-syntax,
    no-shadow,
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const testScript = `\
if true
  x = 6
  console.log "A console #{x + 7} log"

foo = "bar"
z = /// ^ (a#{foo}) ///

x = () ->
    try
        console.log "foo"
    catch err
        # Rewriter will generate explicit indentation here.

    return null\
`;

test('Verify location of generated tokens', () => {
  const tokens = CoffeeScript.tokens('a = 79');

  eq(tokens.length, 4);
  const [aToken, equalsToken, numberToken] = Array.from(tokens);

  eq(aToken[2].first_line, 0);
  eq(aToken[2].first_column, 0);
  eq(aToken[2].last_line, 0);
  eq(aToken[2].last_column, 0);

  eq(equalsToken[2].first_line, 0);
  eq(equalsToken[2].first_column, 2);
  eq(equalsToken[2].last_line, 0);
  eq(equalsToken[2].last_column, 2);

  eq(numberToken[2].first_line, 0);
  eq(numberToken[2].first_column, 4);
  eq(numberToken[2].last_line, 0);
  return eq(numberToken[2].last_column, 5);
});

test('Verify location of generated tokens (with indented first line)', () => {
  const tokens = CoffeeScript.tokens('  a = 83');

  eq(tokens.length, 4);
  const [aToken, equalsToken, numberToken] = Array.from(tokens);

  eq(aToken[2].first_line, 0);
  eq(aToken[2].first_column, 2);
  eq(aToken[2].last_line, 0);
  eq(aToken[2].last_column, 2);

  eq(equalsToken[2].first_line, 0);
  eq(equalsToken[2].first_column, 4);
  eq(equalsToken[2].last_line, 0);
  eq(equalsToken[2].last_column, 4);

  eq(numberToken[2].first_line, 0);
  eq(numberToken[2].first_column, 6);
  eq(numberToken[2].last_line, 0);
  return eq(numberToken[2].last_column, 7);
});

const getMatchingTokens = function (str, ...wantedTokens) {
  const tokens = CoffeeScript.tokens(str);
  const matchingTokens = [];
  let i = 0;
  for (const token of Array.from(tokens)) {
    if (token[1].replace(/^'|'$/g, '"') === wantedTokens[i]) {
      i++;
      matchingTokens.push(token);
    }
  }
  eq(wantedTokens.length, matchingTokens.length);
  return matchingTokens;
};

test('Verify locations in string interpolation (in "string")', () => {
  const [a, b, c] = Array.from(getMatchingTokens('"a#{b}c"', '"a"', 'b', '"c"'));

  eq(a[2].first_line, 0);
  eq(a[2].first_column, 0);
  eq(a[2].last_line, 0);
  eq(a[2].last_column, 1);

  eq(b[2].first_line, 0);
  eq(b[2].first_column, 4);
  eq(b[2].last_line, 0);
  eq(b[2].last_column, 4);

  eq(c[2].first_line, 0);
  eq(c[2].first_column, 6);
  eq(c[2].last_line, 0);
  return eq(c[2].last_column, 7);
});

test('Verify locations in string interpolation (in "string", multiple interpolation)', () => {
  const [a, b, c] = Array.from(getMatchingTokens('"#{a}b#{c}"', 'a', '"b"', 'c'));

  eq(a[2].first_line, 0);
  eq(a[2].first_column, 3);
  eq(a[2].last_line, 0);
  eq(a[2].last_column, 3);

  eq(b[2].first_line, 0);
  eq(b[2].first_column, 5);
  eq(b[2].last_line, 0);
  eq(b[2].last_column, 5);

  eq(c[2].first_line, 0);
  eq(c[2].first_column, 8);
  eq(c[2].last_line, 0);
  return eq(c[2].last_column, 8);
});

test('Verify locations in string interpolation (in "string", multiple interpolation and line breaks)', () => {
  const [a, b, c] = Array.from(getMatchingTokens('"#{a}\nb\n#{c}"', 'a', '" b "', 'c'));

  eq(a[2].first_line, 0);
  eq(a[2].first_column, 3);
  eq(a[2].last_line, 0);
  eq(a[2].last_column, 3);

  eq(b[2].first_line, 0);
  eq(b[2].first_column, 5);
  eq(b[2].last_line, 1);
  eq(b[2].last_column, 1);

  eq(c[2].first_line, 2);
  eq(c[2].first_column, 2);
  eq(c[2].last_line, 2);
  return eq(c[2].last_column, 2);
});

test('Verify locations in string interpolation (in "string", multiple interpolation and starting with line breaks)', () => {
  const [a, b, c] = Array.from(getMatchingTokens('"\n#{a}\nb\n#{c}"', 'a', '" b "', 'c'));

  eq(a[2].first_line, 1);
  eq(a[2].first_column, 2);
  eq(a[2].last_line, 1);
  eq(a[2].last_column, 2);

  eq(b[2].first_line, 1);
  eq(b[2].first_column, 4);
  eq(b[2].last_line, 2);
  eq(b[2].last_column, 1);

  eq(c[2].first_line, 3);
  eq(c[2].first_column, 2);
  eq(c[2].last_line, 3);
  return eq(c[2].last_column, 2);
});

test('Verify locations in string interpolation (in "string", multiple interpolation and starting with line breaks)', () => {
  const [a, b, c] = Array.from(getMatchingTokens('"\n\n#{a}\n\nb\n\n#{c}"', 'a', '" b "', 'c'));

  eq(a[2].first_line, 2);
  eq(a[2].first_column, 2);
  eq(a[2].last_line, 2);
  eq(a[2].last_column, 2);

  eq(b[2].first_line, 2);
  eq(b[2].first_column, 4);
  eq(b[2].last_line, 5);
  eq(b[2].last_column, 0);

  eq(c[2].first_line, 6);
  eq(c[2].first_column, 2);
  eq(c[2].last_line, 6);
  return eq(c[2].last_column, 2);
});

test('Verify locations in string interpolation (in "string", multiple interpolation and starting with line breaks)', () => {
  const [a, b, c] = Array.from(getMatchingTokens('"\n\n\n#{a}\n\n\nb\n\n\n#{c}"', 'a', '" b "', 'c'));

  eq(a[2].first_line, 3);
  eq(a[2].first_column, 2);
  eq(a[2].last_line, 3);
  eq(a[2].last_column, 2);

  eq(b[2].first_line, 3);
  eq(b[2].first_column, 4);
  eq(b[2].last_line, 8);
  eq(b[2].last_column, 0);

  eq(c[2].first_line, 9);
  eq(c[2].first_column, 2);
  eq(c[2].last_line, 9);
  return eq(c[2].last_column, 2);
});

test('Verify locations in string interpolation (in """string""", line breaks)', () => {
  const [a, b, c] = Array.from(getMatchingTokens('"""a\n#{b}\nc"""', '"a\\n"', 'b', '"\\nc"'));

  eq(a[2].first_line, 0);
  eq(a[2].first_column, 0);
  eq(a[2].last_line, 0);
  eq(a[2].last_column, 4);

  eq(b[2].first_line, 1);
  eq(b[2].first_column, 2);
  eq(b[2].last_line, 1);
  eq(b[2].last_column, 2);

  eq(c[2].first_line, 1);
  eq(c[2].first_column, 4);
  eq(c[2].last_line, 2);
  return eq(c[2].last_column, 3);
});

test('Verify locations in string interpolation (in """string""", starting with a line break)', () => {
  const [b, c] = Array.from(getMatchingTokens('"""\n#{b}\nc"""', 'b', '"\\nc"'));

  eq(b[2].first_line, 1);
  eq(b[2].first_column, 2);
  eq(b[2].last_line, 1);
  eq(b[2].last_column, 2);

  eq(c[2].first_line, 1);
  eq(c[2].first_column, 4);
  eq(c[2].last_line, 2);
  return eq(c[2].last_column, 3);
});

test('Verify locations in string interpolation (in """string""", starting with line breaks)', () => {
  const [a, b, c] = Array.from(getMatchingTokens('"""\n\n#{b}\nc"""', '"\\n"', 'b', '"\\nc"'));

  eq(a[2].first_line, 0);
  eq(a[2].first_column, 0);
  eq(a[2].last_line, 1);
  eq(a[2].last_column, 0);

  eq(b[2].first_line, 2);
  eq(b[2].first_column, 2);
  eq(b[2].last_line, 2);
  eq(b[2].last_column, 2);

  eq(c[2].first_line, 2);
  eq(c[2].first_column, 4);
  eq(c[2].last_line, 3);
  return eq(c[2].last_column, 3);
});

test('Verify locations in string interpolation (in """string""", multiple interpolation)', () => {
  const [a, b, c] = Array.from(getMatchingTokens('"""#{a}\nb\n#{c}"""', 'a', '"\\nb\\n"', 'c'));

  eq(a[2].first_line, 0);
  eq(a[2].first_column, 5);
  eq(a[2].last_line, 0);
  eq(a[2].last_column, 5);

  eq(b[2].first_line, 0);
  eq(b[2].first_column, 7);
  eq(b[2].last_line, 1);
  eq(b[2].last_column, 1);

  eq(c[2].first_line, 2);
  eq(c[2].first_column, 2);
  eq(c[2].last_line, 2);
  return eq(c[2].last_column, 2);
});

test('Verify locations in string interpolation (in """string""", multiple interpolation, and starting with line breaks)', () => {
  const [a, b, c] = Array.from(getMatchingTokens('"""\n\n#{a}\n\nb\n\n#{c}"""', 'a', '"\\n\\nb\\n\\n"', 'c'));

  eq(a[2].first_line, 2);
  eq(a[2].first_column, 2);
  eq(a[2].last_line, 2);
  eq(a[2].last_column, 2);

  eq(b[2].first_line, 2);
  eq(b[2].first_column, 4);
  eq(b[2].last_line, 5);
  eq(b[2].last_column, 0);

  eq(c[2].first_line, 6);
  eq(c[2].first_column, 2);
  eq(c[2].last_line, 6);
  return eq(c[2].last_column, 2);
});

test('Verify locations in string interpolation (in """string""", multiple interpolation, and starting with line breaks)', () => {
  const [a, b, c] = Array.from(getMatchingTokens('"""\n\n\n#{a}\n\n\nb\n\n\n#{c}"""', 'a', '"\\n\\n\\nb\\n\\n\\n"', 'c'));

  eq(a[2].first_line, 3);
  eq(a[2].first_column, 2);
  eq(a[2].last_line, 3);
  eq(a[2].last_column, 2);

  eq(b[2].first_line, 3);
  eq(b[2].first_column, 4);
  eq(b[2].last_line, 8);
  eq(b[2].last_column, 0);

  eq(c[2].first_line, 9);
  eq(c[2].first_column, 2);
  eq(c[2].last_line, 9);
  return eq(c[2].last_column, 2);
});

test('Verify locations in heregex interpolation (in ///regex///, multiple interpolation)', () => {
  const [a, b, c] = Array.from(getMatchingTokens('///#{a}b#{c}///', 'a', '"b"', 'c'));

  eq(a[2].first_line, 0);
  eq(a[2].first_column, 5);
  eq(a[2].last_line, 0);
  eq(a[2].last_column, 5);

  eq(b[2].first_line, 0);
  eq(b[2].first_column, 7);
  eq(b[2].last_line, 0);
  eq(b[2].last_column, 7);

  eq(c[2].first_line, 0);
  eq(c[2].first_column, 10);
  eq(c[2].last_line, 0);
  return eq(c[2].last_column, 10);
});

test('Verify locations in heregex interpolation (in ///regex///, multiple interpolation)', () => {
  const [a, b, c] = Array.from(getMatchingTokens('///a#{b}c///', '"a"', 'b', '"c"'));

  eq(a[2].first_line, 0);
  eq(a[2].first_column, 0);
  eq(a[2].last_line, 0);
  eq(a[2].last_column, 3);

  eq(b[2].first_line, 0);
  eq(b[2].first_column, 6);
  eq(b[2].last_line, 0);
  eq(b[2].last_column, 6);

  eq(c[2].first_line, 0);
  eq(c[2].first_column, 8);
  eq(c[2].last_line, 0);
  return eq(c[2].last_column, 11);
});

test('Verify locations in heregex interpolation (in ///regex///, multiple interpolation and line breaks)', () => {
  const [a, b, c] = Array.from(getMatchingTokens('///#{a}\nb\n#{c}///', 'a', '"b"', 'c'));

  eq(a[2].first_line, 0);
  eq(a[2].first_column, 5);
  eq(a[2].last_line, 0);
  eq(a[2].last_column, 5);

  eq(b[2].first_line, 0);
  eq(b[2].first_column, 7);
  eq(b[2].last_line, 1);
  eq(b[2].last_column, 1);

  eq(c[2].first_line, 2);
  eq(c[2].first_column, 2);
  eq(c[2].last_line, 2);
  return eq(c[2].last_column, 2);
});

test('Verify locations in heregex interpolation (in ///regex///, multiple interpolation and line breaks)', () => {
  const [a, b, c] = Array.from(getMatchingTokens('///#{a}\n\n\nb\n\n\n#{c}///', 'a', '"b"', 'c'));

  eq(a[2].first_line, 0);
  eq(a[2].first_column, 5);
  eq(a[2].last_line, 0);
  eq(a[2].last_column, 5);

  eq(b[2].first_line, 0);
  eq(b[2].first_column, 7);
  eq(b[2].last_line, 5);
  eq(b[2].last_column, 0);

  eq(c[2].first_line, 6);
  eq(c[2].first_column, 2);
  eq(c[2].last_line, 6);
  return eq(c[2].last_column, 2);
});

test('Verify locations in heregex interpolation (in ///regex///, multiple interpolation and line breaks)', () => {
  const [a, b, c] = Array.from(getMatchingTokens('///a\n\n\n#{b}\n\n\nc///', '"a"', 'b', '"c"'));

  eq(a[2].first_line, 0);
  eq(a[2].first_column, 0);
  eq(a[2].last_line, 2);
  eq(a[2].last_column, 0);

  eq(b[2].first_line, 3);
  eq(b[2].first_column, 2);
  eq(b[2].last_line, 3);
  eq(b[2].last_column, 2);

  eq(c[2].first_line, 3);
  eq(c[2].first_column, 4);
  eq(c[2].last_line, 6);
  return eq(c[2].last_column, 3);
});

test('Verify locations in heregex interpolation (in ///regex///, multiple interpolation and line breaks and starting with linebreak)', () => {
  const [a, b, c] = Array.from(getMatchingTokens('///\n#{a}\nb\n#{c}///', 'a', '"b"', 'c'));

  eq(a[2].first_line, 1);
  eq(a[2].first_column, 2);
  eq(a[2].last_line, 1);
  eq(a[2].last_column, 2);

  eq(b[2].first_line, 1);
  eq(b[2].first_column, 4);
  eq(b[2].last_line, 2);
  eq(b[2].last_column, 1);

  eq(c[2].first_line, 3);
  eq(c[2].first_column, 2);
  eq(c[2].last_line, 3);
  return eq(c[2].last_column, 2);
});

test('Verify locations in heregex interpolation (in ///regex///, multiple interpolation and line breaks and starting with linebreak)', () => {
  const [a, b, c] = Array.from(getMatchingTokens('///\n\n\n#{a}\n\n\nb\n\n\n#{c}///', 'a', '"b"', 'c'));

  eq(a[2].first_line, 3);
  eq(a[2].first_column, 2);
  eq(a[2].last_line, 3);
  eq(a[2].last_column, 2);

  eq(b[2].first_line, 3);
  eq(b[2].first_column, 4);
  eq(b[2].last_line, 8);
  eq(b[2].last_column, 0);

  eq(c[2].first_line, 9);
  eq(c[2].first_column, 2);
  eq(c[2].last_line, 9);
  return eq(c[2].last_column, 2);
});

test('Verify locations in heregex interpolation (in ///regex///, multiple interpolation and line breaks and starting with linebreak)', () => {
  const [a, b, c] = Array.from(getMatchingTokens('///\n\n\na\n\n\n#{b}\n\n\nc///', '"a"', 'b', '"c"'));

  eq(a[2].first_line, 0);
  eq(a[2].first_column, 0);
  eq(a[2].last_line, 5);
  eq(a[2].last_column, 0);

  eq(b[2].first_line, 6);
  eq(b[2].first_column, 2);
  eq(b[2].last_line, 6);
  eq(b[2].last_column, 2);

  eq(c[2].first_line, 6);
  eq(c[2].first_column, 4);
  eq(c[2].last_line, 9);
  return eq(c[2].last_column, 3);
});

test('#3822: Simple string/regex start/end should include delimiters', () => {
  const [stringToken] = Array.from(CoffeeScript.tokens("'string'"));
  eq(stringToken[2].first_line, 0);
  eq(stringToken[2].first_column, 0);
  eq(stringToken[2].last_line, 0);
  eq(stringToken[2].last_column, 7);

  const [regexToken] = Array.from(CoffeeScript.tokens('/regex/'));
  eq(regexToken[2].first_line, 0);
  eq(regexToken[2].first_column, 0);
  eq(regexToken[2].last_line, 0);
  return eq(regexToken[2].last_column, 6);
});

test('#3621: Multiline regex and manual `Regex` call with interpolation should \
result in the same tokens', () => {
  const tokensA = CoffeeScript.tokens('(RegExp(".*#{a}[0-9]"))');
  const tokensB = CoffeeScript.tokens('///.*#{a}[0-9]///');
  eq(tokensA.length, tokensB.length);
  return (() => {
    const result = [];
    for (let i = 0, end = tokensA.length; i < end; i++) {
      const tokenA = tokensA[i];
      const tokenB = tokensB[i];
      if (!['REGEX_START', 'REGEX_END'].includes(tokenB[0])) { eq(tokenA[0], tokenB[0]); }
      eq(tokenA[1], tokenB[1]);
      if ((tokenA[0] !== 'STRING_START') && (tokenB[0] !== 'REGEX_START')) {
        eq(tokenA.origin != null ? tokenA.origin[1] : undefined, tokenB.origin != null ? tokenB.origin[1] : undefined);
      }
      result.push(eq(tokenA.stringEnd, tokenB.stringEnd));
    }
    return result;
  })();
});

test('Verify tokens have locations that are in order', () => {
  const source = `\
a {
  b: ->
    return c d,
      if e
        f
}
g\
`;
  const tokens = CoffeeScript.tokens(source);
  let lastToken = null;
  return (() => {
    const result = [];
    for (const token of Array.from(tokens)) {
      if (lastToken) {
        ok(token[2].first_line >= lastToken[2].last_line);
        if (token[2].first_line === lastToken[2].last_line) {
          ok(token[2].first_column >= lastToken[2].last_column);
        }
      }
      result.push(lastToken = token);
    }
    return result;
  })();
});

test('Verify OUTDENT tokens are located at the end of the previous token', () => {
  const source = `\
SomeArr = [ ->
  if something
    lol =
      count: 500
]\
`;
  const tokens = CoffeeScript.tokens(source);
  const number = tokens[tokens.length - 7]; const curly = tokens[tokens.length - 6]; const outdent1 = tokens[tokens.length - 5]; const outdent2 = tokens[tokens.length - 4]; const outdent3 = tokens[tokens.length - 3]; const bracket = tokens[tokens.length - 2]; const
    terminator = tokens[tokens.length - 1];
  eq(number[0], 'NUMBER');
  return (() => {
    const result = [];
    for (const outdent of [outdent1, outdent2, outdent3]) {
      eq(outdent[0], 'OUTDENT');
      eq(outdent[2].first_line, number[2].last_line);
      eq(outdent[2].first_column, number[2].last_column);
      eq(outdent[2].last_line, number[2].last_line);
      result.push(eq(outdent[2].last_column, number[2].last_column));
    }
    return result;
  })();
});

test('Verify OUTDENT and CALL_END tokens are located at the end of the previous token', () => {
  let token;
  const source = `\
a = b {
  c: ->
    d e,
      if f
        g {},
          if h
            i {}
}\
`;
  const tokens = CoffeeScript.tokens(source);
  const closeCurly1 = tokens[tokens.length - 13]; const callEnd1 = tokens[tokens.length - 12]; const outdent1 = tokens[tokens.length - 11]; const outdent2 = tokens[tokens.length - 10]; const callEnd2 = tokens[tokens.length - 9]; const outdent3 = tokens[tokens.length - 8]; const outdent4 = tokens[tokens.length - 7]; const callEnd3 = tokens[tokens.length - 6]; const outdent5 = tokens[tokens.length - 5]; const outdent6 = tokens[tokens.length - 4]; const closeCurly2 = tokens[tokens.length - 3]; const callEnd4 = tokens[tokens.length - 2]; const
    terminator = tokens[tokens.length - 1];
  eq(closeCurly1[0], '}');
  const assertAtCloseCurly = function (token) {
    eq(token[2].first_line, closeCurly1[2].last_line);
    eq(token[2].first_column, closeCurly1[2].last_column);
    eq(token[2].last_line, closeCurly1[2].last_line);
    return eq(token[2].last_column, closeCurly1[2].last_column);
  };

  for (token of [outdent1, outdent2, outdent3, outdent4, outdent5, outdent6]) {
    eq(token[0], 'OUTDENT');
    assertAtCloseCurly(token);
  }
  return (() => {
    const result = [];
    for (token of [callEnd1, callEnd2, callEnd3]) {
      eq(token[0], 'CALL_END');
      result.push(assertAtCloseCurly(token));
    }
    return result;
  })();
});

test('Verify generated } tokens are located at the end of the previous token', () => {
  const source = `\
a(b, ->
  c: () ->
    if d
      e
)\
`;
  const tokens = CoffeeScript.tokens(source);
  const identifier = tokens[tokens.length - 7]; const outdent1 = tokens[tokens.length - 6]; const outdent2 = tokens[tokens.length - 5]; const closeCurly = tokens[tokens.length - 4]; const outdent3 = tokens[tokens.length - 3]; const callEnd = tokens[tokens.length - 2]; const
    terminator = tokens[tokens.length - 1];
  eq(identifier[0], 'IDENTIFIER');
  const assertAtIdentifier = function (token) {
    eq(token[2].first_line, identifier[2].last_line);
    eq(token[2].first_column, identifier[2].last_column);
    eq(token[2].last_line, identifier[2].last_line);
    return eq(token[2].last_column, identifier[2].last_column);
  };

  return (() => {
    const result = [];
    for (const token of [outdent1, outdent2, closeCurly, outdent3]) {
      result.push(assertAtIdentifier(token));
    }
    return result;
  })();
});

test('Verify real CALL_END tokens have the right position', () => {
  const source = '\
a()\
';
  const tokens = CoffeeScript.tokens(source);
  const [identifier, callStart, callEnd, terminator] = Array.from(tokens);
  const startIndex = identifier[2].first_column;
  eq(identifier[2].last_column, startIndex);
  eq(callStart[2].first_column, startIndex + 1);
  eq(callStart[2].last_column, startIndex + 1);
  eq(callEnd[2].first_column, startIndex + 2);
  return eq(callEnd[2].last_column, startIndex + 2);
});

test('Verify normal heredocs have the right position', () => {
  const source = `\
"""
a"""\
`;
  const [stringToken] = Array.from(CoffeeScript.tokens(source));
  eq(stringToken[2].first_line, 0);
  eq(stringToken[2].first_column, 0);
  eq(stringToken[2].last_line, 1);
  return eq(stringToken[2].last_column, 3);
});

test('Verify heredocs ending with a newline have the right position', () => {
  const source = `\
"""
a
"""\
`;
  const [stringToken] = Array.from(CoffeeScript.tokens(source));
  eq(stringToken[2].first_line, 0);
  eq(stringToken[2].first_column, 0);
  eq(stringToken[2].last_line, 2);
  return eq(stringToken[2].last_column, 2);
});

test('Verify indented heredocs have the right position', () => {
  const source = `\
->
  """
    a
  """\
`;
  const [arrow, indent, stringToken] = Array.from(CoffeeScript.tokens(source));
  eq(stringToken[2].first_line, 1);
  eq(stringToken[2].first_column, 2);
  eq(stringToken[2].last_line, 3);
  return eq(stringToken[2].last_column, 4);
});

test('Verify heregexes with interpolations have the right ending position', () => {
  let token;
  const source = '\
[a ///#{b}///g]\
';
  const array = CoffeeScript.tokens(source); const stringEnd = array[array.length - 8]; const comma = array[array.length - 7]; const flagsString = array[array.length - 6]; const regexCallEnd = array[array.length - 5]; const regexEnd = array[array.length - 4]; const fnCallEnd = array[array.length - 3]; const arrayEnd = array[array.length - 2]; const
    terminator = array[array.length - 1];

  eq(comma[0], ',');
  eq(arrayEnd[0], ']');

  const assertColumn = function (token, column) {
    eq(token[2].first_line, 0);
    eq(token[2].first_column, column);
    eq(token[2].last_line, 0);
    return eq(token[2].last_column, column);
  };

  const arrayEndColumn = arrayEnd[2].first_column;
  for (token of [comma, flagsString]) {
    assertColumn(token, arrayEndColumn - 2);
  }
  for (token of [regexCallEnd, regexEnd, fnCallEnd]) {
    assertColumn(token, arrayEndColumn - 1);
  }
  return assertColumn(arrayEnd, arrayEndColumn);
});

test('Verify all tokens get a location', () => doesNotThrow(() => {
  const tokens = CoffeeScript.tokens(testScript);
  return Array.from(tokens).map((token) => ok(!!token[2]));
}));
