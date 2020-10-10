"use strict";

class Book {
    static CATEGORY_LEVEL_DELIMITER = ' / ';
    static HARCOVER_FORMAT_CODE = 'BB';

    authors = [];
    date;
    description;
    isbn;
    languageCode;
    license;
    pages;
    publisher;
    subjects;
    subtitle;
    supafolioApiResponse;
    title;
    titleWithoutPrefix;

    // supafolioApiResponse is already public, no need to have this be public too.
    // We just need this for making the many calls more convenient.
    #book;

    constructor( supafolioApiResponse ) {
        this.supafolioApiResponse = supafolioApiResponse;
        this.book = supafolioApiResponse.data.book[ 0 ];

        this.authors = book.contributors.map( obj => {
            return {
                first : obj.contributor.first,
                last  : obj.contributor.last,
                name  : obj.contributor.name,
                order : obj.order,
                role  : obj.role.name,
                seo   : obj.contributor.seo,
            };
        } );
        this.authorsForDisplay = getAuthorsForDisplay( book );
        this.date = getDate( book );
        this.description = book.description;
        this.isbn = book.isbn13;
        this.languageCode = book.custom.language;
        this.license = {
            link : book.custom.license_link,
            name : book.custom.license_name,
        };
        this.pages = book.pages;
        this.publisher = book.publisher.name;
        this.subjects = getSubjects( book );
        this.subtitle = book.subtitle;
        this.title = book.title;
        this.titleWithoutPrefix = book.title_without_prefix;
    }
}

function getAuthorsForDisplay( book ) {
    const contributors = book.contributors;

    contributors.sort( ( a, b ) => {
        if ( a.order < b.order ) {
            return -1;
        }

        if ( a.order > b.order ) {
            return 1;
        }

        return 0;
    } );

    return contributors.map( obj => obj.contributor.name ).join( ', ' );
}

function getDate( book ) {
    const formats = book.formats;
    const hardcoverFormat = formats.find( obj => {
        return obj.format.code === Book.HARCOVER_FORMAT_CODE;
    } );

    if ( hardcoverFormat ) {
        return hardcoverFormat.date.date;
    } else {
        // Just use the date of the first format
        return book.formats[ 0 ].date.date;
    }
}

function getSubjects( book ) {
    const subjects = {};

    book.categories.forEach( obj => {
        const categoriesEachLevel = obj.category.name.split( Book.CATEGORY_LEVEL_DELIMITER );
        subjects[ categoriesEachLevel[ 0 ] ] = 1;
    } );

    return Object.keys( subjects ).sort();
}

module.exports.Book = Book;
