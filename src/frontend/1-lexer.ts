import * as os from "os"

export enum TokenType {
  Number,
  String,
  Identifier,
  Equals,
  Let,
  Const,
  Final,
  Fn,
  Return,
  If,
  Else,
  While,
  Semicolon,
  Comma,
  Dot,
  And,
  Or,
  Exclamation,
  Equality,
  NotEquality,
  GreaterThan,
  LessThan,
  GreaterThanOrEqual,
  LessThanOrEqual,
  Colon,
  OpenParen, // (
  CloseParen, // )
  OpenBrace, // {
  CloseBrace, // }
  OpenBracket, // [
  CloseBracket, // ]
  BinaryOperator,
  EOF,

  // types
  NumberType,
  StringType,
  ArrayType,
  BooleanType,
  ObjectType,
  DynamicType,
}

const KEYWORDS: Record<string, TokenType> = {
  var: TokenType.Let,
  const: TokenType.Const,
  final: TokenType.Final,
  fn: TokenType.Fn,
  return: TokenType.Return,
  if: TokenType.If,
  else: TokenType.Else,
  while: TokenType.While,
  and: TokenType.And,
  or: TokenType.Or,
}

const TYPES: Record<string, TokenType> = {
  boolean: TokenType.BooleanType,
  number: TokenType.NumberType,
  string: TokenType.StringType,
  array: TokenType.ArrayType,
  object: TokenType.ObjectType,
  dynamic: TokenType.DynamicType,
}

export interface Token {
  type: TokenType
  value: string
}

function token(value = "", type: TokenType) {
  return { type, value }
}

function isalpha(src: string) {
  return src.toUpperCase() !== src.toLowerCase()
}

function isint(src: string) {
  const c = src.charCodeAt(0)
  const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)]
  return c >= bounds[0] && c <= bounds[1]
}

function isskippable(src: string) {
  return src === " " || src === "\n" || src === "\t" || src === os.EOL || src === "\r"
}

export function tokenize(sourceCode: string): Token[] {
  const tokens = new Array<Token>()

  const src = sourceCode.split("")

  while (src.length > 0) {
    // parens
    /**/ if (src[0] === "(") tokens.push(token(src.shift(), TokenType.OpenParen))
    else if (src[0] === ")") tokens.push(token(src.shift(), TokenType.CloseParen))
    // braces
    else if (src[0] === "{") tokens.push(token(src.shift(), TokenType.OpenBrace))
    else if (src[0] === "}") tokens.push(token(src.shift(), TokenType.CloseBrace))
    // brackets
    else if (src[0] === "[") tokens.push(token(src.shift(), TokenType.OpenBracket))
    else if (src[0] === "]") tokens.push(token(src.shift(), TokenType.CloseBracket))
    // arithematic ops
    else if (src[0] === "+" || src[0] === "-" || src[0] === "/" || src[0] === "*" || src[0] === "%")
      tokens.push(token(src.shift(), TokenType.BinaryOperator))
    // special chars
    else if (src[0] === ":") tokens.push(token(src.shift(), TokenType.Colon))
    else if (src[0] === ";") tokens.push(token(src.shift(), TokenType.Semicolon))
    else if (src[0] === ",") tokens.push(token(src.shift(), TokenType.Comma))
    else if (src[0] === ".") tokens.push(token(src.shift(), TokenType.Dot))
    else if (src[0] === "=") {
      if (src[1] === "=") tokens.push(token(src.shift() + src.shift()!, TokenType.Equality))
      else tokens.push(token(src.shift(), TokenType.Equals))
    } else if (src[0] === "!") {
      if (src[1] === "=") tokens.push(token(src.shift() + src.shift()!, TokenType.NotEquality))
      else tokens.push(token(src.shift(), TokenType.Exclamation))
    } else if (src[0] === ">") {
      if (src[1] === "=")
        tokens.push(token(src.shift() + src.shift()!, TokenType.GreaterThanOrEqual))
      else tokens.push(token(src.shift(), TokenType.GreaterThan))
    } else if (src[0] === "<") {
      if (src[1] === "=") tokens.push(token(src.shift() + src.shift()!, TokenType.LessThanOrEqual))
      else tokens.push(token(src.shift(), TokenType.LessThan))
    } else if (src[0] === "|") {
      if (src[1] === "|") tokens.push(token(src.shift() + src.shift()!, TokenType.Or))
    } else if (src[0] === "&") {
      if (src[1] === "&") tokens.push(token(src.shift() + src.shift()!, TokenType.And))
    }
    // multi char tokens
    else {
      if (isint(src[0])) {
        let num = ""
        while (src.length > 0 && isint(src[0])) num += src.shift()

        tokens.push(token(num, TokenType.Number))
      } else if (isalpha(src[0])) {
        let str = ""
        while (src.length > 0 && (isalpha(src[0]) || isint(src[0]) || src[0] == "_"))
          str += src.shift()

        // check for reserved keywords
        const reserved = KEYWORDS[str]

        // check for built-in types
        const builtInType = TYPES[str]

        if (typeof reserved === "number") {
          tokens.push(token(str, reserved))
        } else if (typeof builtInType === "number") {
          tokens.push(token(str, builtInType))
        } else {
          tokens.push(token(str, TokenType.Identifier))
        }
      } else if (src[0] === '"') {
        // handling strings
        src.shift() // remove start quote
        let str = ""
        while (src.length > 0 && src[0] !== '"') str += src.shift()
        src.shift() // remove end quote
        tokens.push(token(str, TokenType.String))
      } else if (src[0] === "#") {
        src.shift() // remove hash token

        if (os.EOL.length > 1) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          while (src.length > 0 && src[0] !== "\n" && src[1] !== "\r") src.shift()
          src.shift() // remove \n
          src.shift() // remove \r
        } else {
          while (src.length > 0 && src[0] !== os.EOL) src.shift()
          src.shift() // remove \n
        }
      } else if (isskippable(src[0])) {
        src.shift()
      } else {
        console.log("Unidentified token in source: ", src[0])
        process.exit()
      }
    }
  }

  tokens.push({ value: "EndOfFile", type: TokenType.EOF })

  return tokens
}
