const utils = require('./utils.js');

module.exports = {
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
    utils.case_insensitive("INT"),
    utils.case_insensitive("INTEGER"),
    utils.case_insensitive("REAL"),
    utils.case_insensitive("TEXT"),
    utils.case_insensitive("BLOB"),
    utils.case_insensitive("ANY"),
  ),

  loose_column_type: $ => seq(
    repeat1($.identifier),
    optional($.type_size),
  ),

  type_size: $ => seq(
    '(',
    optional(
      seq(
        alias($.signed_numeric_literal, $.numeric_literal),
        ','
      )
    ),
    alias($.signed_numeric_literal, $.numeric_literal),
    ')',
  ),

  constraint_name: $ => seq(
    $.keyword_constraint,
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
    $.keyword_primary,
    $.keyword_key,
    optional(choice($.keyword_asc, $.keyword_desc)),
    optional($.conflict_clause),
    optional($.keyword_autoincrement),
  ),

  not_null_constraint: $ => seq(
    $.keyword_not,
    $.keyword_null,
    optional($.conflict_clause),
  ),

  unique_constraint: $ => seq(
    $.keyword_unique,
    optional($.conflict_clause),
  ),

  check_constraint: $ => seq(
    $.keyword_check,
    '(',
    field('expr', $.expr),
    ')',
  ),

  conflict_clause: $ => seq(
    $.keyword_on,
    $.keyword_conflict,
    choice(
      $.keyword_rollback,
      $.keyword_abort,
      $.keyword_fail,
      $.keyword_ignore,
      $.keyword_replace,
    ),
  ),
}
