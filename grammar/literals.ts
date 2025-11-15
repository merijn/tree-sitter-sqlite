import * as keyword from './keywords.js';
import { case_insensitive } from './utils.js';

const nonHexLiteral: SeqRule = seq(
  choice(
    /[0-9_]{1,}(\.([0-9_]{1,})?)?/, // Literal starting with non-period
    /\.[0-9_]{1,}/, /// Literal starting with period
  ),
  optional(token.immediate(/[eE][-+]?[0-9][0-9_]*/))
);

const raw_numeric_literal: ChoiceRule = choice(
  nonHexLiteral,
  /0[xX][a-fA-F0-9_]{1,}/
);

export const sign: ChoiceRule = optional(choice('+', '-'));

export const signed_numeric_literal: TokenRule = token(seq(sign, raw_numeric_literal));

export const numeric_literal: TokenRule = token(raw_numeric_literal);

export const string_literal: RegExp = /'([^'\u0000]|'')*'/;

export const blob_literal: RegExp = /[xX]'([a-fA-F0-9]{2})*'/;

export const boolean: ChoiceRule = choice(
  case_insensitive("TRUE"),
  case_insensitive("FALSE"),
);

export const literal: ChoiceRule = choice(
  numeric_literal,
  string_literal,
  blob_literal,
  keyword.null_,
  boolean,
  keyword.current_time,
  keyword.current_date,
  keyword.current_timestamp,
);
