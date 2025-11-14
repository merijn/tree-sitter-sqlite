module.exports = {
  case_insensitive: word => { return new RustRegex('(?i)' + word); },
  identifier_regex: /[A-Za-z_\u007f-\uffff][0-9A-Za-z_\u007f-\uffff$]*/,
  double_quote_identifier_regex: /"[^"\u0000]*"/,
  mssql_identifier_regex: /\[[^\u0000\]]\]/,
  mysql_identifier_regex: /`[^`\u0000]`/,
}
