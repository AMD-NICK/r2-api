# API для CloudFlare R2

Позволяет публично получать объекты через `GET /path`, либо заливать через `POST /path`.
Оригинальный репозиторий: [proselog/r2-api](https://github.com/proselog/r2-api). Вырезан JWT токен, добавлена возможность загрузки по своему пути, возможность указания своих метаданных. 👉 Применяется в Telegram боте [t.me/cfr2bot](https://t.me/cfr2bot)

## wrangler.toml:

В файле есть блок `env.development.*`, он применяется если делать `wrangler dev/deploy --env development`

- `name` – создаст или обновит воркера с таким именем
- `bucket_name` – имя бакета, с которым будет работать `wrangler deploy`
- `preview_bucket_name` – что и сверху но для `wrangler dev`. Т.е. при `wrangler dev` будет использоваться этот bucket. Можно закомментировать
- `ENCRYPT_SECRET` – условно "пароль", который надо указать в `Authorization` хедере для загрузки файлов. В коде это `env.ENCRYPT_SECRET`. Нужно только для `--env development`

Для `wrangler deploy` единоразово нужно будет ввести `wrangler secret put ENCRYPT_SECRET`, чтобы у воркера в проде был env вар

## Быстрый старт

- `git clone` этого репозитория
- `npm i` в скачанной папке для установки wrangler и зависимостей
- `wrangler r2 bucket create NAME` для создания R2 хранилища
- `wrangler secret put ENCRYPT_SECRET` для установки пароля в проде (единоразово)
- отредактировать `wrangler.toml`, как написано выше
- `wrangler dev --remote --env development` для проверки локально и `wrangler deploy`, чтобы создать/обновить воркер. `--remote` будет работать с remote бакетом. Без него бакет будет локальным
- `wrangler deploy `

## Curl для тестов

`xxx` это `ENCRYPT_SECRET`

Если залить два файла по одному `/path`, то новый файл перезапишет старый. Если залить файл по пути /, то у него не будет названия. DELETE / удалил этот самый файл без названия, а не всю папку

- `curl -X POST -H "Authorization: xxx" -F "file=@file.ext" http://localhost:8787/file_path.ext`
- `curl -X DELETE -H "Authorization: xxx" http://localhost:8787/file_path.ext`
- `curl http://localhost:8787/file_path.ext`


