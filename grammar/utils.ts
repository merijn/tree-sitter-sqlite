/// <reference types="tree-sitter-cli/dsl" />

export function case_insensitive(word: string): RustRegex {
  return new RustRegex('(?i)' + word);
}

export const identifier_regex: RegExp = /[A-Za-z_\u007f-\uffff][0-9A-Za-z_\u007f-\uffff$]*/;

export const double_quote_identifier_regex: RegExp = /"[^"\u0000]*"/;

export const mssql_identifier_regex: RegExp = /\[[^\u0000\]]\]/;

export const mysql_identifier_regex: RegExp = /`[^`\u0000]`/;
