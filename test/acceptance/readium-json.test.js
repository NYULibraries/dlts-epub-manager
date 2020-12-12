"use strict";

let em     = require( '../../lib/bootstrap' );
let fs     = require( 'fs' );
let util   = require( '../../lib/util' );
let vorpal = em.vorpal;

vorpal.em.configDir        = __dirname + '/fixture/config';
vorpal.em.configPrivateDir = __dirname + '/fixture/config-private';

describe( 'readium-json command', () => {
    let expectedFull;

    beforeAll( ( ) => {
        expectedFull = util.jsonStableStringify(
            require( './expected/readiumJsonFiles/expected_add_full-metadataDir_epub_library.json' )
        );
    });

    beforeEach( ( ) => {
        vorpal.execSync( 'readium-json delete all full-metadataDir', { fatal : true } );
    });

    it('should correctly delete all EPUBs from epub_library.json', () => {
        let readiumJsonFile = `${vorpal.em.rootDir}/${vorpal.em.conf.readiumJsonFile}`;

        // First, fill up the file so we can be sure EPUBs were there that were
        // later deleted.
        let countOfExpectedEpubs = JSON.parse( expectedFull ).length;
        fs.writeFileSync( readiumJsonFile, expectedFull, { flag : 'w' } );
        let epubsBefore = util.getJsonFromFile( readiumJsonFile );
        expect( epubsBefore.length === countOfExpectedEpubs ).toBeTruthy();

        vorpal.execSync(  'readium-json delete all full-metadataDir', { fatal : true } );

        let epubsAfter = JSON.parse( fs.readFileSync( readiumJsonFile ) );

        expect( epubsAfter.length === 0 ).toBeTruthy();
    });

    it('should correctly delete 3 EPUBs from epub_library.json', () => {
        let readiumJsonFile = `${vorpal.em.rootDir}/${vorpal.em.conf.readiumJsonFile}`;

        // First, fill up the file so we can be sure EPUBs were there that were
        // later deleted.
        let countOfExpectedEpubs = JSON.parse( expectedFull ).length;
        fs.writeFileSync( readiumJsonFile, expectedFull, { flag : 'w' } );
        let epubsBefore = util.getJsonFromFile( readiumJsonFile );
        expect( epubsBefore.length === countOfExpectedEpubs ).toBeTruthy();

        vorpal.execSync( 'readium-json delete delete-3', { fatal : true } );

        let expectedDelete3 = util.jsonStableStringify(
            require( './expected/readiumJsonFiles/expected_delete_delete-3_epub_library.json' )
        );

        let actual = util.jsonStableStringify( util.getJsonFromFile( readiumJsonFile ) );

        expect( actual === expectedDelete3 ).toBeTruthy();
    });

    it('should correctly add all EPUBs to epub_library.json', () => {
        vorpal.execSync( 'readium-json add full-metadataDir', { fatal : true } );

        let readiumJsonFile = `${vorpal.em.rootDir}/${vorpal.em.conf.readiumJsonFile}`;

        let actual = util.jsonStableStringify( util.getJsonFromFile( readiumJsonFile ) );

        expect( actual === expectedFull ).toBeTruthy();
    } );

    it(
        'should correctly add 3 replacement EPUBs and 3 new EPUBs to epub_library.json',
        () => {
            let readiumJsonFile = `${vorpal.em.rootDir}/${vorpal.em.conf.readiumJsonFile}`;

            // First, fill up the file.  There have to be existing EPUBs to be replaced
            // and added to.
            fs.writeFileSync( readiumJsonFile, expectedFull, { flag : 'w' } );

            vorpal.execSync( 'readium-json add replace-3-new-3', { fatal : true } );

            let expectedReplace3New3 = util.jsonStableStringify(
                require( './expected/readiumJsonFiles/expected_add_replace-3-new-3_epub_library.json')
            );

            let actual = util.jsonStableStringify( util.getJsonFromFile( readiumJsonFile ) );

            expect( actual === expectedReplace3New3 ).toBeTruthy();
        }
    );

    it('should correctly full-replace all EPUBs in epub_library.json', () => {
        let readiumJsonFile = `${vorpal.em.rootDir}/${vorpal.em.conf.readiumJsonFile}`;

        /// First, fill up the file so we can be sure EPUBs were there that were
        // later deleted.
        let countOfExpectedEpubs = JSON.parse( expectedFull ).length;
        fs.writeFileSync( readiumJsonFile, expectedFull, { flag : 'w' } );
        let epubsBefore = util.getJsonFromFile( readiumJsonFile );
        expect( epubsBefore.length === countOfExpectedEpubs ).toBeTruthy();

        vorpal.execSync( 'readium-json full-replace replace-3-new-3', { fatal : true } );

        let expectedReplace3New3 = util.jsonStableStringify(
            require( './expected/readiumJsonFiles/expected_full-replace_replace-3-new-3_epub_library.json')
        );

        let actual = util.jsonStableStringify( util.getJsonFromFile( readiumJsonFile ) );

        expect( actual === expectedReplace3New3 ).toBeTruthy();
    } );
} );

