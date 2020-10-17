// See https://jira.nyu.edu/jira/browse/NYUP-738 for documentation on possible
// Supafolio API errors.

const SupafolioAPIError = require( './SupafolioApiError' ).SupafolioAPIError;

class SupafolioApiErrorProductNotInDatabase extends SupafolioAPIError {
    static MESSAGE = 'Product not in database';

    constructor() {
        super(
            'SupafolioAPIErrorProductNotInDatabase',
            SupafolioApiErrorProductNotInDatabase.MESSAGE,
        );
    }
}

module.exports.SupafolioAPIErrorProductNotInDatabase = SupafolioApiErrorProductNotInDatabase;
