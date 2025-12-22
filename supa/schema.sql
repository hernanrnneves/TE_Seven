-- Create a table to store user profiles and their assigned Google Sheet
create table profiles (
  id uuid references auth.users on delete cascade,
  email text,
  google_sheet_id text,
  role text default 'chofer',
  primary key (id)
);

-- Enable RLS
alter table profiles enable row level security;

-- Create policies (only admin or self can view/edit)
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
