"use strict";

class Book {
    static HARCOVER_FORMAT_CODE = 'BB';
    static CATEGORY_LEVEL_DELIMITER = ' / ';

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
    title;
    titleWithoutPrefix;

    constructor( supafolioResponse ) {
        const book = supafolioResponse.data.book[ 0 ];

        this.authors = book.contributors.map( obj => {
            return {
                first : obj.contributor.first,
                last  : obj.contributor.last,
                name  : obj.contributor.name,
                role  : obj.role.name,
                seo   : obj.contributor.seo,
            };
        }) ;
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
