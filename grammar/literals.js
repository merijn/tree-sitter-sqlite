import { case_insensitive } from './utils.js';

const sign = optional(choice('+', '-'));
const nonHexLiteral = seq(
  choice(
    /[0-9_]{1,}(\.([0-9_]{1,})?)?/, // Literal starting with non-period
    /\.[0-9_]{1,}/, /// Literal starting with period
  ),
  optional(token.immediate(/[eE][-+]?[0-9][0-9_]*/))
);
const numeric_literal = choice(
  nonHexLiteral,
  /0[xX][a-fA-F0-9_]{1,}/
);

const string_literal = /'([^'\u0000]|'')*'/;

const blob_literal = /[xX]'([a-fA-F0-9]{2})*'/;

export const literals = {
  sign: _ => sign,

  signed_numeric_literal: _ => seq(sign, numeric_literal),

  numeric_literal: _ => token(numeric_literal),
  string_literal: _ => string_literal,
  blob_literal: _ => blob_literal,

  boolean: _ => choice(
    case_insensitive("TRUE"),
    case_insensitive("FALSE"),
  ),

  current_time: _ => case_insensitive("CURRENT_TIME"),
  current_date: _ => case_insensitive("CURRENT_DATE"),
  current_timestamp: _ => case_insensitive("CURRENT_TIMESTAMP"),

  literal: $ => choice(
    $.numeric_literal,
    $.string_literal,
    $.blob_literal,
    $.keyword_null,
    $.boolean,
    $.current_time,
    $.current_date,
    $.current_timestamp,
  ),
}
