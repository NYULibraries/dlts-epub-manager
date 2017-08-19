"use strict";

let assert = require( 'chai' ).assert,
    _      = require( 'lodash' ),
    util   = require( '../../lib/util/index' );

describe( 'util', () => {
    // From https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9781449327453/ch04s13.html
    const VALID_ISBN_13_STRINGS = [
        'ISBN 978-0-596-52068-7',
        'ISBN-13: 978-0-596-52068-7',
        '978 0 596 52068 7',
        '9780596520687',

        'ISBN 979-0-596-52068-7',
        'ISBN-13: 979-0-596-52068-7',
        '979 0 596 52068 7',
        '9790596520687'
    ];

    const VALID_ISBN_10_STRINGS = [
        'ISBN-10 0-596-52068-9',
        '0-596-52068-9'
    ];

    const INVALID_ISBN_STRINGS = [
        // 3rd digit is invalid
        'ISBN 976-0-596-52068-7',
        'ISBN-13: 976-0-596-52068-7',
        '976 0 596 52068 7',
        '9760596520687',

        // Incorrect separation
        'ISBN 9780-596-52068-7',
        'ISBN-13: 9780-596-52068-7',
        '9780 596 52068 7',
        '978 0  596 52068 7',
        '978-0596520687',

        // Leading and trailing whitespace
        ' 978 0 596 52068 7',
        '978 0 596 52068 7 ',

        'total garbage'
    ];

    const VALID_NORMALIZED_ISBN_13_STRINGS= [
        '9790814793114',
        '9790814793398',
        '9791479824243',
        '9791479899982',

        '9780814793114',
        '9780814793398',
        '9781479824243',
        '9781479899982'
    ];

    const INVALID_NORMALIZED_ISBN_13_STRINGS = [
        // Not normalized
        'ISBN 978-0-596-52068-7',
        'ISBN-13: 978-0-596-52068-7',
        '978 0 596 52068 7',

        // 3rd digit is invalid
        '9760814793114',
        '9760814793398',
        '9761479824243',
        '9761479899982',

        // Normalized, but ISBN-10
        '0596520689',

        ...INVALID_ISBN_STRINGS
    ];

    // Some test authors to add from U. Michigan and U. Minnesota presses, when
    // ready to make the necessary improvments to util.getAuthorSortKey:
    //
    // "Aimee Carrillo Rowe, Sheena Malhotra, and Kimberlee Pérez" : "Aimee Carrillo Rowe, Sheena Malhotra, and Kimberlee Pérez",
    // "Amy Koritz and George J. Sanchez" : "Amy Koritz and George J. Sanchez",
    // "Antonio T. Tiongson Jr." : "Antonio T. Tiongson Jr.",
    // "Cohen, Daniel J.; Scheinfeldt, Tom" : "Cohen, Daniel J.; Scheinfeldt, Tom",
    // "Cummings, Robert E.; Barton, Matt" : "Cummings, Robert E.; Barton, Matt",
    // "Darling-Wolf, Fabienne" : "Darling-Wolf, Fabienne",
    // "Herscher, Andrew" : "Herscher, Andrew",
    // "Lee, Chin-Chuan" : "Lee, Chin-Chuan",
    // "Susana Peña" : "Susana Peña",
    // "Syvertsen, Trine; Enli, Gunn; Mjøs, Ole J.; Moe, Hallvard" : "Syvertsen, Trine; Enli, Gunn; Mjøs, Ole J.; Moe, Hallvard",
    // "Turrow, Joseph; Tsui, Lokman" : "Turrow, Joseph; Tsui, Lokman",

    const AUTHORS = {
        "Jody David Armour" : "Armour, Jody David",
        "Marshall W. Alcorn Jr." : "Alcorn, Marshall W.",
        "Natalie Clifford Barney, John Spalding Gatton" : "Barney, Natalie Clifford",
        "Ellen E. Berry" : "Berry, Ellen E.",
        "Kathleen L. Barry" : "Barry, Kathleen L.",
        "Gail R. Benjamin" : "Benjamin, Gail R.",
        "Michael F. Bérubé" : "Bérubé, Michael F.",
        "Keith Beattie" : "Beattie, Keith",
        "John W. Chapman" : "Chapman, John W.",
        "Charles B. Craver" : "Craver, Charles B.",
        "Thomas Cushman, Stjepan Mestrovic" : "Cushman, Thomas",
        "Ruth Colker" : "Colker, Ruth",
        "Joseph Dan" : "Dan, Joseph",
        "James Darsey" : "Darsey, James",
        "Martha Grace Duncan" : "Duncan, Martha Grace",
        "Seth Forman" : "Forman, Seth",
        "Stephen M. Feldman" : "Feldman, Stephen M.",
        "Steven Goldberg" : "Goldberg, Steven",
        "Scott Douglas Gerber" : "Gerber, Scott Douglas",
        "Bertha Harris" : "Harris, Bertha",
        "Jay Harris" : "Harris, Jay",
        "Anselm Haverkamp, H. R. Dodge" : "Haverkamp, Anselm",
        "Moshe Y. Herczl" : "Herczl, Moshe Y.",
        "Bill Ong Hing" : "Hing, Bill Ong",
        "David K. Holbrook" : "Holbrook, David K.",
        "Mark Hertzog" : "Hertzog, Mark",
        "Robert L. Hayman Jr." : "Hayman, Robert L.",
        "Paul Harris" : "Harris, Paul",
        "Don Judson" : "Judson, Don",
        "James B. Jacobs, Christopher Panarella, Jay Worthington" : "Jacobs, James B.",
        "Peggy Fitzhugh Johnstone" : "Johnstone, Peggy Fitzhugh",
        "Steve Kroll-Smith, H. Hugh Floyd" : "Kroll-Smith, Steve",
        "David Kleinbard" : "Kleinbard, David",
        "Steven T. Katz" : "Katz, Steven T.",
        "Mark E. Kann" : "Kann, Mark E.",
        "Amia Lieblich" : "Lieblich, Amia",
        "Barbara Fass Leavy" : "Leavy, Barbara Fass",
        "Nancy Levit" : "Levit, Nancy",
        "Gary Minda" : "Minda, Gary",
        "Jennifer L Manlowe" : "Manlowe, Jennifer L",
        "Katherine Mayberry" : "Mayberry, Katherine",
        "Diane Helene Miller" : "Miller, Diane Helene",
        "Cary Nelson" : "Nelson, Cary",
        "Pearl Oliner, Samuel P. Oliner, Lawrence Baron, Lawrence Blum" : "Oliner, Pearl",
        "Bernard Jay Paris" : "Paris, Bernard Jay",
        "Ronald Jeffrey Ringer" : "Ringer, Ronald Jeffrey",
        "Robert Rogers" : "Rogers, Robert",
        "Paula C Rust" : "Rust, Paula C",
        "Stanley A Renshon" : "Renshon, Stanley A",
        "Peter L. Rudnytsky, Antal Bokay, Patrizia Giampieri-Deutsch" : "Rudnytsky, Peter L.",
        "Ronald Suresh Roberts" : "Roberts, Ronald Suresh",
        "Daniel Rancour-Laferriere" : "Rancour-Laferriere, Daniel",
        "Ben-Ami Scharfstein" : "Scharfstein, Ben-Ami",
        "Joe Schall" : "Schall, Joe",
        "Peter N. Stearns" : "Stearns, Peter N.",
        "Robert Seltzer, Norman S. Cohen" : "Seltzer, Robert",
        "Ryuzo Sato" : "Sato, Ryuzo",
        "Ian Shapiro, Robert Adams" : "Shapiro, Ian",
        "Michael Guy Thompson" : "Thompson, Michael Guy",
        "Richard K Vedder, Lowell E. Gallaway" : "Vedder, Richard K",
        "Mark G. Winiarski" : "Winiarski, Mark G.",
        "Niobe Way" : "Way, Niobe",
        "Sonia Livingstone, Julian Sefton-Green" : "Livingstone, Sonia",
        "Henry Jenkins, Sangita Shresthova, Liana Gamber-Thompson, Neta Kligler-Vilenchik, Arely Zimmerman" : "Jenkins, Henry",
    };

    const TITLES = {
        "" : "",

        " A Heart Beating Hard" : "Heart Beating Hard",
        " A Republic of Men"    : "Republic of Men",

        "    A Heart Beating Hard" : "Heart Beating Hard",
        "    A Republic of Men"    : "Republic of Men",

        "An Inconvenient Truth"                  : "Inconvenient Truth",
        "An Inconvenient Sequel: Truth to Power" : "Inconvenient Sequel: Truth to Power",

        "    An Inconvenient Truth"                  : "Inconvenient Truth",
        "    An Inconvenient Sequel: Truth to Power" : "Inconvenient Sequel: Truth to Power",

        "Adventures of the Mind" : "Adventures of the Mind",
        "American Cool" : "American Cool",
        "American Law in the Age of Hypercapitalism" : "American Law in the Age of Hypercapitalism",
        "The Americanization of the Jews" : "Americanization of the Jews",
        "The Beginning of Terror" : "Beginning of Terror",
        "Bird-Self Accumulated" : "Bird-Self Accumulated",
        "Bisexuality and the Challenge to Lesbian Politics" : "Bisexuality and the Challenge to Lesbian Politics",
        "Black Rage Confronts the Law" : "Black Rage Confronts the Law",
        "Blacks in the Jewish Mind" : "Blacks in the Jewish Mind",
        "Bodies in Protest" : "Bodies in Protest",
        "Busting the Mob" : "Busting the Mob",
        "By Any Media Necessary" : "By Any Media Necessary",
        "Can Unions Survive?" : "Can Unions Survive?",
        "Charles Dickens and the Image of Women" : "Charles Dickens and the Image of Women",
        "Christianity and the Holocaust of Hungarian Jewry" : "Christianity and the Holocaust of Hungarian Jewry",
        "The Chrysanthemum and the Eagle" : "Chrysanthemum and the Eagle",
        "Clarence Thomas and the Tough Love Crowd" : "Clarence Thomas and the Tough Love Crowd",
        "The Class" : "Class",
        "Compensatory Justice" : "Compensatory Justice",
        "Culture Clash" : "Culture Clash",
        "Deconstruction Is/In America" : "Deconstruction Is/In America",
        "The Dilemma of Context" : "Dilemma of Context",
        "Embracing the Other" : "Embracing the Other",
        "Employment of English" : "Employment of English",
        "The Essential Agus" : "Essential Agus",
        "Everyday Courage" : "Everyday Courage",
        "Faith Born of Seduction" : "Faith Born of Seduction",
        "Ferenczi's Turn in Psychoanalysis" : "Ferenczi's Turn in Psychoanalysis",
        "Freedom to Differ" : "Freedom to Differ",
        "The Gender Line" : "Gender Line",
        "Genders 22" : "Genders 22",
        "Gershom Scholem and the Mystical Dimension of Jewish History" : "Gershom Scholem and the Mystical Dimension of Jewish History",
        "High Hopes" : "High Hopes",
        "HIV Mental Health for the 21st Century" : "HIV Mental Health for the 21st Century",
        "Hybrid" : "Hybrid",
        "Imagined Human Beings" : "Imagined Human Beings",
        "In Search of the Swan Maiden" : "In Search of the Swan Maiden",
        "Indentations and Other Stories" : "Indentations and Other Stories",
        "Integrity and Conscience" : "Integrity and Conscience",
        "Japanese Lessons" : "Japanese Lessons",
        "The Lavender Vote" : "Lavender Vote",
        "Lover" : "Lover",
        "Manifesto of a Tenured Radical" : "Manifesto of a Tenured Radical",
        "Markets and Justice" : "Markets and Justice",
        "Nachman Krochmal" : "Nachman Krochmal",
        "Narcissism and the Literary Libido" : "Narcissism and the Literary Libido",
        "Negrophobia and Reasonable Racism" : "Negrophobia and Reasonable Racism",
        "Out of Work" : "Out of Work",
        "Please Don't Wish Me a Merry Christmas" : "Please Don't Wish Me a Merry Christmas",
        "Postmodern Legal Movements" : "Postmodern Legal Movements",
        "The Prophetic Tradition and Radical Rhetoric in America" : "Prophetic Tradition and Radical Rhetoric in America",
        "The Prostitution of Sexuality" : "Prostitution of Sexuality",
        "The Psychological Assessment of Presidential Candidates" : "Psychological Assessment of Presidential Candidates",
        "Queer Words, Queer Images" : "Queer Words, Queer Images",
        "A Republic of Men" : "Republic of Men",
        "Romantic Outlaws, Beloved Prisons" : "Romantic Outlaws, Beloved Prisons",
        "The Scar That Binds" : "Scar That Binds",
        "Seasons of Captivity" : "Seasons of Captivity",
        "Self and Other" : "Self and Other",
        "Seriatim" : "Seriatim",
        "The Slave Soul of Russia" : "Slave Soul of Russia",
        "The Smart Culture" : "Smart Culture",
        "Teaching What You're Not" : "Teaching What You're Not",
        "This Time We Knew" : "This Time We Knew",
        "To Be An American" : "To Be An American",
        "Transformation of Rage" : "Transformation of Rage",
        "The Truth About Freud's Technique" : "Truth About Freud's Technique",
    };

    describe( '#getAuthorSortKey', () => {
        it( 'should return correct author sort keys', () => {
            Object.keys( AUTHORS ).forEach( originalAuthors => {
                let expectedAuthors = AUTHORS[ originalAuthors ];
                let got             = util.getAuthorSortKey( originalAuthors );

                assert(
                    got === expectedAuthors,
                    `util.getAuthorSortKey( '${originalAuthors}' ) returned "${got}" ` +
                    `instead of "${expectedAuthors}"` );
            } );
        } );
    } );

    describe( '#getTitleSortKey', () => {
        it( 'should return correct title sort keys', () => {
            Object.keys( TITLES ).forEach( originalTitle => {
                let expectedTitle = TITLES[ originalTitle ];
                let got           = util.getTitleSortKey( originalTitle );

                assert(
                    got === expectedTitle,
                    `util.getTitleSortKey( '${originalTitle}' ) returned "${got}" ` +
                        `instead of "${expectedTitle}"` );
            } );
        } );
    } );

    describe( '#isValidIsbn13', () => {

        it( 'should return true for valid ISBN-13 strings', () => {
            VALID_ISBN_13_STRINGS.forEach( str => {
                assert( util.isValidIsbn13( str ) === true,
                        `Did not return true for '${str}'` );
            } );
        } );

        it( 'should return false for valid ISBN-10 strings', () => {
            VALID_ISBN_10_STRINGS.forEach( str => {
                assert( util.isValidIsbn13( str ) === false,
                        `Did not return false for '${str}'` );
            } );
        } );

        it( 'should return false for invalid strings', () => {
            INVALID_ISBN_STRINGS.forEach( str => {
                assert( util.isValidIsbn13( str ) === false,
                        `Did not return false for '${str}'` );
            } );
        } );

    } );

    describe( '#isValidNormalizedIsbn', () => {

        it( 'should return true for valid normalized ISBN-13 strings', () => {
            VALID_NORMALIZED_ISBN_13_STRINGS.forEach( str => {
                assert( util.isValidNormalizedIsbn13( str ) === true,
                        `Did not return true for '${str}'` );
            } );
        } );

        it( 'should return false for invalid normalized ISBN-13 strings', () => {
            INVALID_NORMALIZED_ISBN_13_STRINGS.forEach( str => {
                assert( util.isValidNormalizedIsbn13( str ) === false,
                        `Did not return false for '${str}'` );
            } );
        } );

    } );

    describe( '#normalizeDltsEpubIdentifier', () => {

        it( 'should correctly normalized "close-enough" identifiers', () => {
            const input    = 'urn:isbn:9780814780978';
            const expected = '9780814780978';

            let got = util.normalizeDltsEpubIdentifier( input );
            assert(
                got === expected,
                `Did not return "${expected}" for "${input}", got: ${got}`
            );
        } );

    } );

} );