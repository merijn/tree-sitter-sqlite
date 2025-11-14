function case_insensitive(word) {
  return new RustRegex('(?i)' + word);
}

const identifier_regex = /[A-Za-z_\u007f-\uffff][0-9A-Za-z_\u007f-\uffff$]*/;

const double_quote_identifier_regex = /"[^"\u0000]*"/;

const mssql_identifier_regex = /\[[^\u0000\]]\]/;

const mysql_identifier_regex = /`[^`\u0000]`/;

export {
  case_insensitive,
  identifier_regex,
  double_quote_identifier_regex,
  mssql_identifier_regex,
  mysql_identifier_regex
}
