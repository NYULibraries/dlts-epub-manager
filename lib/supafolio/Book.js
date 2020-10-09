"use strict";

class Book {
    static HARCOVER_FORMAT_CODE = 'BB';

    authors = [];
    date;
    description;
    pages;

    constructor( supafolioResponse ) {
        const book = supafolioResponse.data.book[ 0 ];

        this.authors = getAuthors( book );
        this.date = getDate( book );
        this.description = book.description;
        this.pages = book.pages;
    }
}

function getAuthors( book ) {
    const authors = [];

    book.contributors.forEach( obj => {
        authors.push(
            {
                first : obj.contributor.first,
                last  : obj.contributor.last,
                name  : obj.contributor.name,
                role  : obj.role.name,
                seo   : obj.contributor.seo,
            }
        );
    } );

    return authors;
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

module.exports.Book = Book;
