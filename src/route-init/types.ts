export interface UrlMatcherResult {
  match: boolean;
  params?: Record<string, string>;
}
