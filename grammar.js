/**
 * @file SQLite grammar for tree-sitter
 * @author Merijn Verstraaten <merijn@inconsistent.nl>
 * @license GPL 3.0
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const utils = require('./grammar/utils.js')
const keywords = require('./grammar/keywords.js');
const literals = require('./grammar/literals.js');
const columns = require('./grammar/columns.js');
const expr = require('./grammar/expr.js');

module.exports = grammar({
  name: "sqlite",

  //word: $ => $._identifier,

  conflicts: $ => [
    [$.postfix_expr, $.infix_expr],
  ],

  rules: {

    source_file: $ => seq(
      repeat(
        seq(
          $.statement,
          ';',
        )
      ),
      optional($.statement)
    ),

    ...keywords,
    ...literals,
    ...columns,
    ...expr,

    statement: $ => seq(
      optional($.explain),
      choice(
        $.alter_table_statement
      )
    ),

    explain: $ => seq(
      $.keyword_explain,
      optional(
        seq(
          $.keyword_query,
          $.keyword_plan
        )
      )
    ),

    alter_table_statement: $ => seq(
      $.keyword_alter,
      $.keyword_table,
      field('table', $.table_reference),
      choice(
        $.rename_table,
        $.rename_column,
        $.add_column,
        $.drop_column
      ),
    ),

    rename_table: $ => seq(
      $.keyword_rename,
      $.keyword_to,
      $._table_name,
    ),

    rename_column: $ => seq(
      $.keyword_rename,
      optional($.keyword_column),
      field('from', $.identifier),
      $.keyword_to,
      field('to', $.identifier),
    ),

    add_column: $ => seq(
      $.keyword_add,
      optional($.keyword_column),
      $.column_def
    ),

    drop_column: $ => seq(
      $.keyword_drop,
      optional($.keyword_column),
      field('name', $.identifier),
    ),

    table_reference: $ => seq(
      optional(
        seq($._schema_name, ".")
      ),
      $._table_name
    ),

    _schema_name: $ => field("schema_name", $.identifier),
    _table_name: $ => field("table_name", $.identifier),

    identifier: $ => choice(
      $._identifier,
      $._double_quote_identifier,
      $._mssql_identifier,
      $._mysql_identifier
    ),

    _identifier: _ => utils.identifier_regex,
    _double_quote_identifier: _ => utils.double_quote_identifier_regex,
    _mssql_identifier: _ => utils.mssql_identifier_regex,
    _mysql_identifier: _ => utils.mysql_identifier_regex,
  }
});
