interface Human {
  name: string;
  age: number;
}

export const hey = (human: Human) => {
  console.log(human.name);
  console.log(human.age);
};

export const makeHuman = (name: string, age: number): Human => {
  return {
    name,
    age,
  };
};
