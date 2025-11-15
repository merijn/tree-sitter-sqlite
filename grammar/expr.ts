import * as keyword from './keywords.js';
import { literal, string_literal } from './literals.js';
import { identifier_regex } from './utils.js';

class OperatorPrec {
  precLevel: number;
  rules: RuleOrLiteral[];

  constructor(prec: number, rules: RuleOrLiteral[]) {
    this.precLevel = prec;
    this.rules = rules;
  }

  makeOperatorRules(toRule: (baseRule: RuleOrLiteral) => RuleOrLiteral): PrecLeftRule[] {
    return this.rules.map(r => prec.left(this.precLevel, toRule(r)));
  }
}

class OperatorTable {
  operatorPrecedence: OperatorPrec[];

  constructor(...precs: OperatorPrec[]) {
    this.operatorPrecedence = precs;
  }

  makeRulesWith(toRule: (baseRule: RuleOrLiteral) => RuleOrLiteral): PrecLeftRule[] {
    return this.operatorPrecedence.flatMap(rules => rules.makeOperatorRules(toRule));
  }
}

const question_bind: SeqRule = seq('?', optional(token.immediate(/[0-9_]{1,}/)));

const name_bind: SeqRule = seq(
  choice(':', '@'),
  token.immediate(identifier_regex)
);

export const expr = {
  expr: ($: GrammarCtx) => choice(
    literal,
    $.bind_parameter,
    $.column_reference,
    $.prefix_expr,
    $.postfix_expr,
    $.infix_expr,
  ),

  bind_parameter: (_: GrammarCtx) => choice(
    question_bind,
    name_bind,
    //TODO
    //$._tcl_bind,
  ),

  //TODO
  //_tcl_bind: _ => "TODO",

  column_reference: ($: GrammarCtx) => seq(
    optional(
      seq(
        optional(
          seq(field('schema', $.identifier), '.')
        ),
        seq(field('table', $.identifier), '.')
      ),
    ),
    field('column', $.identifier),
  ),

  prefix_expr: ($: GrammarCtx) => {
    const rules = new OperatorTable(
      new OperatorPrec(12, ["~", "+", "-"]),
      new OperatorPrec(3, [keyword.not])
    ).makeRulesWith(parser =>
      seq(
        field('operator', parser),
        field('expr', $.expr),
      )
    );

    return choice(...rules);
  },

  postfix_expr: ($: GrammarCtx) => {
    const rules = new OperatorTable(
      new OperatorPrec(11, [
        seq(
          $.expr,
          keyword.collate,
          field('collation', $.identifier)
        )
      ]),
      new OperatorPrec(4, [
        keyword.isnull,
        keyword.notnull,
        seq(keyword.not, keyword.null_)
      ])
    ).makeRulesWith(parser =>
      seq(
        field('expr', $.expr),
        field('operator', parser),
      )
    );

    const between_expr = prec(4,
      seq(
        $.expr,
        optional(keyword.not),
        keyword.between,
        $.expr,
        keyword.and,
        $.expr
      )
    );

    return choice(...rules, between_expr);
  },

  infix_expr: ($: GrammarCtx) => {
    const rules = new OperatorTable(
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
          keyword.is,
          optional(keyword.not),
          optional(
            seq(
              keyword.distinct,
              keyword.from
            )
          )
        ),
        seq(
          optional(keyword.not),
          choice(
            keyword.in_,
            keyword.match,
            keyword.regexp,
            keyword.glob,
          )
        ),
      ]),
      new OperatorPrec(2, [keyword.and]),
      new OperatorPrec(1, [keyword.or]),
    ).makeRulesWith(parser =>
      seq(
        field('left', $.expr),
        field('operator', parser),
        field('right', $.expr),
      )
    );

    const like_expr = prec.left(
      4,
      seq(
        field('left', $.expr),
        field('operator', seq(optional(keyword.not), keyword.like)),
        field('right', $.expr),
        optional(
          prec(
            6,
            seq(
              keyword.escape,
              string_literal
            )
          )
        )
      )
    )

    return choice(...rules, like_expr);
  },
};
