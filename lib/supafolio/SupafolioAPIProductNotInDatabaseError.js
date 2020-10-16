// See https://jira.nyu.edu/jira/browse/NYUP-738 for documentation on possible
// Supafolio API errors.

class SupafolioAPIProductNotInDatabaseError extends SupafolioAPIError {
    static MESSAGE = 'Product not in database';

    constructor() {
        super(
            'SupafolioAPIProductNotInDatabaseError',
            SupafolioAPIProductNotInDatabaseError.MESSAGE,
        );
    }
}
