const lisa = {
  name: "lisa",
  deps: [],
};

const petra = {
  name: "petra",
  deps: [],
};

const bjorn = {
  name: "bjorn",
  deps: [lisa],
};

const emil = {
  name: "emil",
  deps: [lisa],
};

const joel = {
  name: "joel",
  deps: [],
};

const samuel = {
  name: "samuel",
  deps: [lisa, petra, bjorn, emil, joel],
};

const ami = {
  name: "ami",
  deps: [petra],
};

const people = [ami, lisa, petra, bjorn, emil, samuel, joel];

// check if all dependencies are included
const checkRequiredDependencies = (middlewareArray) => {
  const errors = [];

  middlewareArray.forEach((middleware) => {
    const missing = [];
    middleware.deps.forEach((middlewareDep) => {
      const matchingDep = middlewareArray.find((dep) => dep === middlewareDep);
      if (!matchingDep) {
        missing.push(middlewareDep);
      }
    });
    if (missing.length > 0) {
      errors.push({
        message: "Missing dependencies",
        middleware,
        missing,
      });
    }
  });
  return errors;
};

const constructSegments = (middlewareChain) => {
  let remainingMiddlewares = [...middlewareChain];
  const segments = [[]];

  while (remainingMiddlewares.length > 0) {
    let iteration = [...remainingMiddlewares];
    remainingMiddlewares.forEach((middleware) => {
      let remainingDeps = middleware.deps;
      let middlewarePlaced = false;
      segments.forEach((segment, index) => {
        if (remainingDeps.length === 0 && !middlewarePlaced) {
          segments[index].push(middleware);
          middlewarePlaced = true;
        } else {
          segment.forEach((middlewareInSegment) => {
            remainingDeps = remainingDeps.filter((dep) => dep !== middlewareInSegment);
          });
        }
      });
      if (!middlewarePlaced && remainingDeps.length === 0) {
        segments.push([middleware]);
        middlewarePlaced = true;
      }
      if (middlewarePlaced) {
        iteration = iteration.filter((remainingMiddleware) => remainingMiddleware !== middleware);
      }
    });
    remainingMiddlewares = iteration;
  }

  return segments;
};

const constructed = constructSegments(people);

console.log(
  JSON.stringify(
    constructed.map((segment) =>
      segment.map((person) => ({ ...person, deps: person.deps.map((dep) => dep.name) }))
    ),
    null,
    2
  )
);
