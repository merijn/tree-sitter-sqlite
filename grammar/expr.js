import { identifier_regex } from './utils.js';

export const expr = {
  expr: $ => choice(
    $.literal,
    $.bind_parameter,
    $.column_reference,
    $.prefix_expr,
    $.postfix_expr,
    $.infix_expr,
  ),

  bind_parameter: $ => choice(
    $._question_bind,
    $._name_bind,
    //TODO
    //$._tcl_bind,
  ),

  _question_bind: _ => seq('?', optional(token.immediate(/[0-9_]{1,}/))),
  _name_bind: _ => seq(
    choice(':', '@'),
    token.immediate(identifier_regex)
  ),
  //TODO
  //_tcl_bind: _ => "TODO",

  column_reference: $ => seq(
    optional(
      seq(
        optional(
          seq( field('schema', $.identifier), '.')
        ),
        seq(field('table', $.identifier), '.')
      ),
    ),
    field('column', $.identifier),
  ),

  prefix_expr: $ => {
    const table = [
      [12, ["~", "+", "-"]],
      [3, [$.keyword_not]]
    ];

    const makeRule = (level, op) => prec(
      level,
      seq(
        field('operator', op),
        field('expr', $.expr),
      )
    );

    const rules = table.flatMap(([level, ops]) =>
      ops.map(op => makeRule(level, op))
    );

    return choice(...rules);
  },

  postfix_expr: $ => {
    const table = [
      [11, [
        seq(
          $.expr,
          $.keyword_collate,
          field('collation', $.identifier)
        )
      ]],
      [
        4, [
        $.keyword_isnull,
        $.keyword_notnull,
        seq($.keyword_not, $.keyword_null)
      ]]
    ];

    const makeRule = (level, op) => prec(
      level,
      seq(
        field('expr', $.expr),
        field('operator', op),
      )
    );

    const rules = table.flatMap(([level, ops]) =>
      ops.map(op => makeRule(level, op))
    );

    const between_expr = prec(4,
      seq(
        $.expr,
        optional($.keyword_not),
        $.keyword_between,
        $.expr,
        $.keyword_and,
        $.expr
      )
    );

    return choice(...rules, between_expr);
  },

  infix_expr: $ => {
    const table = [
      [10, ["||", "->", "->>"]],
      [9, ["*", "/", "%"]],
      [8, ["+", "-"]],
      [7, ["&", "|", "<<", ">>"]],
      [5, ["<", ">", "<=", ">="]],
      [4, [
        "=",
        "==",
        "<>",
        "!=",
        seq(
          $.keyword_is,
          optional($.keyword_not),
          optional(
            seq(
              $.keyword_distinct,
              $.keyword_from
            )
          )
        ),
        seq(
          optional($.keyword_not),
          choice(
            $.keyword_in,
            $.keyword_match,
            $.keyword_regexp,
            $.keyword_glob,
          )
        ),
      ]],
      [2, [$.keyword_and]],
      [1, [$.keyword_or]],
    ]

    const makeRule = (level, op) => prec.left(
      level,
      seq(
        field('left', $.expr),
        field('operator', op),
        field('right', $.expr),
      )
    );

    const rules = table.flatMap(([level, ops]) =>
      ops.map(op => makeRule(level, op))
    );

    const like_expr = prec.left(
      4,
      seq(
        field('left', $.expr),
        field('operator', seq(optional($.keyword_not), $.keyword_like)),
        field('right', $.expr),
        optional(
          prec(
            6,
            seq(
              $.keyword_escape,
              $.string_literal
            )
          )
        )
      )
    )

    return choice(...rules, like_expr);
  },
};
