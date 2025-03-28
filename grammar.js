/**
 * @file SQLite grammar for tree-sitter
 * @author Merijn Verstraaten <merijn@inconsistent.nl>
 * @license GPL 3.0
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "sqlite",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
