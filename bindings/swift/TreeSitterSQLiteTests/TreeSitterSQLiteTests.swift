import XCTest
import SwiftTreeSitter
import TreeSitterSqlite

final class TreeSitterSqliteTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_sqlite())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading SQLite grammar")
    }
}
