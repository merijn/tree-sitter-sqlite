import * as keyword from './keywords.js';
import { case_insensitive } from './utils.js';
import { signed_numeric_literal } from './literals.js';

export const columns = {
  column_def: $ => seq(
    field('name', $.identifier),
    optional($.column_type),
    repeat($.column_constraint),
  ),

  column_type: $ => choice(
    $.strict_column_type,
    $.loose_column_type
  ),

  strict_column_type: _ => choice(
    case_insensitive("INT"),
    case_insensitive("INTEGER"),
    case_insensitive("REAL"),
    case_insensitive("TEXT"),
    case_insensitive("BLOB"),
    case_insensitive("ANY"),
  ),

  loose_column_type: $ => seq(
    repeat1($.identifier),
    optional($.type_size),
  ),

  type_size: $ => seq(
    '(',
    optional(
      seq(
        alias(signed_numeric_literal, $.numeric_literal),
        ','
      )
    ),
    alias(signed_numeric_literal, $.numeric_literal),
    ')',
  ),

  constraint_name: $ => seq(
    keyword.constraint,
    field("name", $.identifier),
  ),

  column_constraint: $ => seq(
    optional($.constraint_name),
    choice(
      $.primary_key_constraint,
      $.not_null_constraint,
      $.unique_constraint,
      $.check_constraint,
      //TODO finish
    ),
  ),

  primary_key_constraint: $ => seq(
    keyword.primary,
    keyword.key,
    optional(choice(keyword.asc, keyword.desc)),
    optional($.conflict_clause),
    optional(keyword.autoincrement),
  ),

  not_null_constraint: $ => seq(
    keyword.not,
    keyword.null_,
    optional($.conflict_clause),
  ),

  unique_constraint: $ => seq(
    keyword.unique,
    optional($.conflict_clause),
  ),

  check_constraint: $ => seq(
    keyword.check,
    '(',
    field('expr', $.expr),
    ')',
  ),

  conflict_clause: _ => seq(
    keyword.on,
    keyword.conflict,
    choice(
      keyword.rollback,
      keyword.abort,
      keyword.fail,
      keyword.ignore,
      keyword.replace,
    ),
  ),
}
