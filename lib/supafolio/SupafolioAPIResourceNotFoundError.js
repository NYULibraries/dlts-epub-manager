// See https://jira.nyu.edu/jira/browse/NYUP-738 for documentation on possible
// Supafolio API errors.

class SupafolioAPIResourceNotFoundError extends SupafolioAPIError {
    static MESSAGE = 'Resource not found.';

    constructor() {
        super(
            'SupafolioAPIResourceNotFoundError',
            SupafolioAPIResourceNotFoundError.MESSAGE,
        );
    }
}
