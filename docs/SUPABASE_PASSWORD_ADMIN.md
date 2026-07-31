# Set A User Password In Supabase (Admin)

Use this when you need to choose a password for a user directly, without the email reset flow.

## 1) Get your service role key

In Supabase Dashboard:

- Project Settings -> API
- Copy:
  - `Project URL` (SUPABASE_URL)
  - `service_role` key (SUPABASE_SERVICE_ROLE_KEY)

Do not put the service role key in frontend env files like `.env.local`.

## 2) Run the command

From the project root:

```bash
SUPABASE_URL="https://YOUR-PROJECT.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY" \
npm run supabase:set-password -- --email user@example.com --password 'NewPass123!'
```

## 3) Expected result

On success:

```text
Password updated successfully for user@example.com (user id: ...).
```

## Notes

- Requires minimum password length of 8 characters.
- Fails with a clear error if user email does not exist.
- This command uses Supabase Admin API and should only be run by project owners/admins.