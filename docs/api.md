# API

REST conventions

GET

POST

PATCH

DELETE

Response

{
  success,
  data,
  message
}

Error

{
  success:false,
  error
}

Pagination

page

limit

total

items

Never return raw database errors.