"use strict";

const em     = require( '../../lib/bootstrap' );
const fs     = require( 'fs' );
const util   = require( '../../lib/util' );
const vorpal = em.vorpal;

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
        const readiumJsonFile = `${vorpal.em.rootDir}/${vorpal.em.conf.readiumJsonFile}`;

        // First, fill up the file so we can be sure EPUBs were there that were
        // later deleted.
        const countOfExpectedEpubs = JSON.parse( expectedFull ).length;
        fs.writeFileSync( readiumJsonFile, expectedFull, { flag : 'w' } );
        const epubsBefore = util.getJsonFromFile( readiumJsonFile );
        expect( epubsBefore.length ).toEqual( countOfExpectedEpubs );

        vorpal.execSync(  'readium-json delete all full-metadataDir', { fatal : true } );

        const epubsAfter = JSON.parse( fs.readFileSync( readiumJsonFile ) );

        expect( epubsAfter.length ).toBe( 0 );
    });

    it('should correctly delete 3 EPUBs from epub_library.json', () => {
        const readiumJsonFile = `${vorpal.em.rootDir}/${vorpal.em.conf.readiumJsonFile}`;

        // First, fill up the file so we can be sure EPUBs were there that were
        // later deleted.
        const countOfExpectedEpubs = JSON.parse( expectedFull ).length;
        fs.writeFileSync( readiumJsonFile, expectedFull, { flag : 'w' } );
        const epubsBefore = util.getJsonFromFile( readiumJsonFile );
        expect( epubsBefore.length ).toEqual( countOfExpectedEpubs );

        vorpal.execSync( 'readium-json delete delete-3', { fatal : true } );

        const expectedDelete3 = util.jsonStableStringify(
            require( './expected/readiumJsonFiles/expected_delete_delete-3_epub_library.json' )
        );

        const actual = util.jsonStableStringify( util.getJsonFromFile( readiumJsonFile ) );

        expect( actual ).toEqual( expectedDelete3 );
    });

    it('should correctly add all EPUBs to epub_library.json', () => {
        vorpal.execSync( 'readium-json add full-metadataDir', { fatal : true } );

        const readiumJsonFile = `${vorpal.em.rootDir}/${vorpal.em.conf.readiumJsonFile}`;

        const actual = util.jsonStableStringify( util.getJsonFromFile( readiumJsonFile ) );

        expect( actual ).toEqual( expectedFull );
    } );

    it(
        'should correctly add 3 replacement EPUBs and 3 new EPUBs to epub_library.json',
        () => {
            const readiumJsonFile = `${vorpal.em.rootDir}/${vorpal.em.conf.readiumJsonFile}`;

            // First, fill up the file.  There have to be existing EPUBs to be replaced
            // and added to.
            fs.writeFileSync( readiumJsonFile, expectedFull, { flag : 'w' } );

            vorpal.execSync( 'readium-json add replace-3-new-3', { fatal : true } );

            const expectedReplace3New3 = util.jsonStableStringify(
                require( './expected/readiumJsonFiles/expected_add_replace-3-new-3_epub_library.json')
            );

            const actual = util.jsonStableStringify( util.getJsonFromFile( readiumJsonFile ) );

            expect( actual ).toEqual( expectedReplace3New3 );
        }
    );

    it('should correctly full-replace all EPUBs in epub_library.json', () => {
        const readiumJsonFile = `${vorpal.em.rootDir}/${vorpal.em.conf.readiumJsonFile}`;

        /// First, fill up the file so we can be sure EPUBs were there that were
        // later deleted.
        const countOfExpectedEpubs = JSON.parse( expectedFull ).length;
        fs.writeFileSync( readiumJsonFile, expectedFull, { flag : 'w' } );
        const epubsBefore = util.getJsonFromFile( readiumJsonFile );
        expect( epubsBefore.length ).toEqual( countOfExpectedEpubs );

        vorpal.execSync( 'readium-json full-replace replace-3-new-3', { fatal : true } );

        const expectedReplace3New3 = util.jsonStableStringify(
            require( './expected/readiumJsonFiles/expected_full-replace_replace-3-new-3_epub_library.json')
        );

        const actual = util.jsonStableStringify( util.getJsonFromFile( readiumJsonFile ) );

        expect( actual ).toEqual( expectedReplace3New3 );
    } );
} );

