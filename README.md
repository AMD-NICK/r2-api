# API для CloudFlare R2

Позволяет публично получать объекты через `GET /path`, либо заливать через `POST /path`.
Оригинальный репозиторий: [proselog/r2-api](https://github.com/proselog/r2-api). Вырезан JWT токен, добавлена возможность загрузки по своему пути

## wrangler.toml:

В файле есть блок `env.development.*`, он применяется если делать `wrangler dev/publish --env development`

- `name` – создаст или обновит воркера с таким именем
- `bucket_name` – имя бакета, с которым будет работать `wrangler publish`
- `preview_bucket_name` – что и сверху но для `wrangler dev`
- `ENCRYPT_SECRET` – условно "пароль", который надо указать в `Authorization` хедере для загрузки файлов

Также нужно ввести `wrangler secret put ENCRYPT_SECRET`, чтобы после `publish` у воркера был env

## Быстрый старт

- `git clone` этого репозитория
- `npm i` в скачанной папке для установки wrangler и зависимостей
- `wrangler wrangler secret put ENCRYPT_SECRET` для установки пароля
- отредактировать `wrangler.toml`, как написано выше
- `wrangler dev` для проверки локально и `wrangler publish`, чтобы создать/обновить воркер

## Upload файла

`curl -X POST -H "Authorization: xxx" -F "file=@/path/to/file.ext" http://localhost:8787/`, где `xxx` это `ENCRYPT_SECRET`

Если залить два файла по одному `/path`, то новый файл перезапишет старый
