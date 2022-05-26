# q-api

A zero-dependency project for creating JSON-based REST APIs in Node.js.

More to come!

## API initialization

```javascript
import { createApi } from "q-api";
import { tasksService, userService } from "./services";
import path from "path";

const api = createApi({
  authConfig: {
    auth0HostName: "qvistdev09.eu.auth0.com",
    publicKeyCacheLimitInMinutes: 300,
  },
  basePath: path.resolve(__dirname, "./api-routes"),
  services: [
    { name: "tasksService", reference: tasksService },
    { name: "userService", reference: userService },
  ],
});

api.listen(8080);
```

## Routing

Routing is file based and inferred from the contents of your base directory (basePath). Dynamic params can be enclosed in curly braces.

### Examples

| File                                      | Endpoint                                      |
| ----------------------------------------- | --------------------------------------------- |
| ./api-routes/resources/books.ts           | http://localhost:8080/resources/books         |
| ./api-routes/users/{userId}/interests.ts  | http://localhost:8080/users/00432/interests   |

## Creating handlers (your API endpoints)

Q-API does not utilize the pattern of many tiny middlewares (like Express). Instead, endpoints are defined as classes by extending the class BaseEndpoint. Injectable services can be defined, which will be injected into an instance of the endpoint class at runtime.

The request body, URL params and URL query can all be validated through schemas.

### Endpoint example

```javascript
import { BaseEndpoint, number, string } from "q-api";

export class Endpoint extends BaseEndpoint {
  constructor(private booksService: BooksService) {
    super();
  }

  GET = this.createMethodHandler({
    useAuth: true,
    handlerFunction: async (context) => {
      const userBooks = await this.booksService.getUserBooks(context.user.sub);
      return {
        data: userBooks,
        statusCode: 200,
      };
    },
  });

  POST = this.createMethodHandler({
    useAuth: true,
    schemas: {
      body: {
        data: {
          title: string().minLength(4).maxLength(50),
          price: number().integer(),
        },
      },
    },
    handlerFunction: async (context) => {
      const newBook = await this.booksService.createBook(context.body.data);
      return {
        data: newBook,
        statusCode: 201,
      };
    },
  });
}

Endpoint.services = ["BooksService"];
```

### Context

The context object is passed as the first argument to the handler-functions. It wraps the request- and response-objects from the Node.js http-server. It also gives access to the request body, params, query and headers. If a validation schema is supplied when initializing the method handler, the validated part of the request will be strongly typed.

Schema:

```javascript
const bodySchema = {
  data: {
    title: string().minLength(4).maxLength(50),
    price: number().integer(),
  },
};
```

Resulting type on the request body:

```
{
  data: {
    title: string;
    price: number;
  }
}
```