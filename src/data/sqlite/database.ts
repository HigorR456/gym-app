// Renamed once (v2) to force a fresh database: earlier local installs had
// already run migration 0001 with an older `exercises` column set before it
// was corrected during step 5, so their `user_version` said "up to date"
// while the actual table didn't match the current migration source. Do not
// edit an already-run migration again after this point — add a new one
// instead (see spec/technical/database-schema.md, "Implementation notes").
export const DATABASE_NAME = 'gym-app-v2.db';
