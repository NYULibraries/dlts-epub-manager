"use strict";

const path = require( 'path' );

const _    = require( 'lodash' );
const load = require( './load.js' );

describe( 'load', () => {

    describe( '#getEpubList', () => {
        const EXPECTED_EPUBS_FROM_INTAKE_EPUBS = [
            '9780814707517',
            '9780814707821',
            '9780814709108',
            '9780814720981',
            '9780814721100',
            '9780814723418',
            '9780814723425',
            '9780814723708',
            '9780814723715',
            '9780814725078',
            '9780814728048',
            '9780814728901',
            '9780814733486',
            '9780814738573',
            '9780814739617',
            '9780814741498',
            '9780814743959',
            '9780814743973',
            '9780814743980',
            '9780814744147',
            '9780814744758',
            '9780814744765',
            '9780814744772',
            '9780814744789',
            '9780814744819',
            '9780814744840',
            '9780814744871',
            '9780814749234',
            '9780814752685',
            '9780814752715',
            '9780814759271',
            '9780814759714',
            '9780814762622',
            '9780814763148',
            '9780814763179',
            '9780814763223',
            '9780814763520',
            '9780814763551',
            '9780814763582',
            '9780814767917',
            '9780814769409',
            '9780814769423',
            '9780814769447',
            '9780814769461',
            '9780814769485',
            '9780814771037',
            '9780814771501',
            '9780814771518',
            '9780814772195',
            '9780814773130',
            '9780814773215',
            '9780814776636',
            '9780814784488',
            '9780814784600',
            '9780814784891',
            '9780814786086',
            '9780814786123',
            '9780814788462',
            '9780814788707',
            '9780814788745',
            '9780814788806',
            '9780814790144',
            '9780814790168',
            '9780814790175',
            '9781479815357',
            '9781479829712',
            '9781479863570',
            '9781479898626',
        ];

        const EXPECTED_EPUBS_FROM_METADATA_DIRS_REPLACE_3_NEW_3 = [
            '9780000000000',
            '9780000000001',
            '9780000000002',
            '9780814707517',
            '9780814707821',
            '9780814725078',
        ]

        const NULL_CONF = {};
        const NULL_EPUB_LIST_TYPE = null;

        const INTAKE_EPUBS_PATH =
            path.resolve( __dirname, '../../test/acceptance/fixtures/intake-epubs' );
        const METADATA_DIRS_REPLACE_3_NEW_3 =
            path.resolve( __dirname, '../../test/acceptance/fixtures/metadataDirs/replace-3-new-3' );

        it( 'should return the correct EPUBs list given a directory containing subdirectories', () => {
            const epubs = load.getEpubList( NULL_CONF, NULL_EPUB_LIST_TYPE, INTAKE_EPUBS_PATH );

            expect( epubs ).toEqual( EXPECTED_EPUBS_FROM_INTAKE_EPUBS );
        } );

        it( 'should return the correct EPUBs list given a directory containing *.epub files', () => {
            const epubs = load.getEpubList( NULL_CONF, NULL_EPUB_LIST_TYPE, METADATA_DIRS_REPLACE_3_NEW_3 );

            expect( epubs ).toEqual( EXPECTED_EPUBS_FROM_METADATA_DIRS_REPLACE_3_NEW_3 );
        } );

    } );

} );
