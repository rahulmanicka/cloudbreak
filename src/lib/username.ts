// Usernames only: no real names, emails, or phone numbers (see README "Safety design").
export const USERNAME = /^[a-zA-Z0-9_]{3,20}$/;
export const LOOKS_LIKE_PII = /\d{7,}|@|(snap|insta|ig|tiktok|discord)/i;
