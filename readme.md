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

| File      | Endpoint |
| ----------- | ----------- |
| ./api-routes/resources/books.ts      | http://localhost:8080/resources/books       |
| ./api-routes/users/{userId}/interests.ts   | http://localhost:8080/users/00432/interests        |


