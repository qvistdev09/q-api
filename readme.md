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

Routing is file based and inferred from the contents of your base directory (basePath).

### Examples

File:
`./api-routes/resources/books.ts`

Endpoint:
`http://localhost:8080/resources/books`

Dynamic params can be enclosed in curly braces.

File:

```./api-routes/users/{userId}/interests.ts```

Endpoint:

```http://localhost:8080/users/00432/interests```

