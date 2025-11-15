/**
 * @file SQLite grammar for tree-sitter
 * @author Merijn Verstraaten <merijn@inconsistent.nl>
 * @license GPL 3.0
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

import { identifier_regex, double_quote_identifier_regex, mssql_identifier_regex, mysql_identifier_regex } from './grammar/utils.js';
import * as keyword from './grammar/keywords.js';
import { columns } from './grammar/columns.js';
import { expr } from './grammar/expr.js';

export default grammar({
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

    ...columns,
    ...expr,

    statement: $ => seq(
      optional($.explain),
      choice(
        $.alter_table_statement
      )
    ),

    explain: _ => seq(
      keyword.explain,
      optional(
        seq(
          keyword.query,
          keyword.plan
        )
      )
    ),

    alter_table_statement: $ => seq(
      keyword.alter,
      keyword.table,
      field('table', $.table_reference),
      choice(
        $.rename_table,
        $.rename_column,
        $.add_column,
        $.drop_column
      ),
    ),

    rename_table: $ => seq(
      keyword.rename,
      keyword.to,
      $._table_name,
    ),

    rename_column: $ => seq(
      keyword.rename,
      optional(keyword.column),
      field('from', $.identifier),
      keyword.to,
      field('to', $.identifier),
    ),

    add_column: $ => seq(
      keyword.add,
      optional(keyword.column),
      $.column_def
    ),

    drop_column: $ => seq(
      keyword.drop,
      optional(keyword.column),
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

    _identifier: _ => identifier_regex,
    _double_quote_identifier: _ => double_quote_identifier_regex,
    _mssql_identifier: _ => mssql_identifier_regex,
    _mysql_identifier: _ => mysql_identifier_regex,
  }
});
