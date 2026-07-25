# Налаштування особистих кабінетів

## 1. Оновити базу

У Supabase відкрийте **SQL Editor**, вставте вміст файлу
`supabase/migrations/20260725_player_accounts.sql` і виконайте запит.

Міграція:

- додає до гравців дані профілю та налаштування приватності;
- дозволяє гравцеві змінювати лише власну картку;
- створює сховище `player-avatars` для фотографій;
- не змінює матчі, турніри та чинний рейтинг.

## 2. Налаштувати Auth

У **Authentication → URL Configuration** вкажіть:

- Site URL: `https://irpintennis.com`
- Redirect URL: `https://irpintennis.com/auth/callback`
- для локальної розробки: `http://localhost:3000/auth/callback`

У **Authentication → Providers → Email** залиште увімкненим Email/Password.

## 3. Прив’язати гравця

Після реєстрації відкрийте **Authentication → Users**, скопіюйте UUID
користувача і виконайте в SQL Editor:

```sql
update public.players
set user_id = 'UUID-КОРИСТУВАЧА'
where slug = 'SLUG-ГРАВЦЯ';
```

Ручне підтвердження потрібне, щоб стороння людина не могла привласнити профіль
іншого гравця.

## 4. Приватність

Телефон і адреса за замовчуванням не публікуються. Вони з’являються у
публічному профілі лише після окремого дозволу гравця.
