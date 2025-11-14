import { identifier_regex } from './utils.js';

class OperatorPrec {
  precLevel: number;
  rules: RuleOrLiteral[];

  constructor(prec: number, rules: RuleOrLiteral[]) {
    this.precLevel = prec;
    this.rules = rules;
  }

  makeRulesWith(toRule: (baseRule: RuleOrLiteral) => RuleOrLiteral): PrecLeftRule[] {
    return this.rules.map(r => prec.left(this.precLevel, toRule(r)));
  }
}


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
      new OperatorPrec(12, ["~", "+", "-"]),
      new OperatorPrec(3, [$.keyword_not])
    ];

    const rules = table.flatMap(op =>
      op.makeRulesWith(parser => seq(
        field('operator', parser),
        field('expr', $.expr),
      ))
    );

    return choice(...rules);
  },

  postfix_expr: $ => {
    const table = [
      new OperatorPrec(11, [
        seq(
          $.expr,
          $.keyword_collate,
          field('collation', $.identifier)
        )
      ]),
      new OperatorPrec(4, [
        $.keyword_isnull,
        $.keyword_notnull,
        seq($.keyword_not, $.keyword_null)
      ])
    ];

    const rules = table.flatMap(op =>
      op.makeRulesWith(parser =>
        seq(
          field('expr', $.expr),
          field('operator', parser),
        )
      )
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
      new OperatorPrec(10, ["||", "->", "->>"]),
      new OperatorPrec(9, ["*", "/", "%"]),
      new OperatorPrec(8, ["+", "-"]),
      new OperatorPrec(7, ["&", "|", "<<", ">>"]),
      new OperatorPrec(5, ["<", ">", "<=", ">="]),
      new OperatorPrec(4, [
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
      ]),
      new OperatorPrec(2, [$.keyword_and]),
      new OperatorPrec(1, [$.keyword_or]),
    ]

    const rules = table.flatMap(op =>
      op.makeRulesWith(parser =>
        seq(
          field('left', $.expr),
          field('operator', parser),
          field('right', $.expr),
        )
      )
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
