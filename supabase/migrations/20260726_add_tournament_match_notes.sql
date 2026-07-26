alter table public.matches
  add column if not exists notes text;

update public.matches as match
set notes = 'Фора суперникам: Мирослав грав з однією подачею.'
from public.players as player1, public.players as player2
where match.player1_id = player1.id
  and match.player2_id = player2.id
  and match.tournament_id = '330a9fc6-c1c2-4035-8757-3acdf88a2556'
  and (player1.name = 'Мирослав Лозко' or player2.name = 'Мирослав Лозко');
