-- ============================================================
-- Creates the admin login. Run SECOND. Safe to run again
-- (running it again resets this user's password).
-- Copy to 02_admin.sql and set the password there.
-- ============================================================
do $$
declare
  v_email    text := lower('admin@alhaj-store.com');  -- change if you like
  v_password text := '';  -- put a password here (8+ characters)
  v_id       uuid;
begin
  if length(v_password) < 8 then raise exception 'Set v_password first (8+ characters)'; end if;

  select id into v_id from auth.users where email = v_email;

  if v_id is null then
    v_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',
      v_email, extensions.crypt(v_password, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Store admin"}', now(), now(),
      '', '', '', ''
    );
    insert into auth.identities (
      id, user_id, provider_id, provider, identity_data,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_id, v_id::text, 'email',
      jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true),
      now(), now(), now()
    );
  else
    update auth.users
       set encrypted_password = extensions.crypt(v_password, extensions.gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           updated_at = now()
     where id = v_id;
  end if;

  insert into public.admins (user_id) values (v_id) on conflict do nothing;
end $$;
