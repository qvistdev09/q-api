type JSONValues = number | string | boolean | null;

export interface JSON {
  [key: string]: JSONValues | JSON | Array<JSONValues | JSON>;
}
