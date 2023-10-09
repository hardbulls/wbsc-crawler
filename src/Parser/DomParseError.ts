export class DomParseError extends Error {
  constructor(selector: string) {
    super(`Cannot parse DOM for ${selector}`);
  }
}
