import { DomParseError } from "./DomParseError";

export const querySelectorOrThrow = (
  element: Element,
  selector: string,
): Element => {
  const result = element.querySelector(selector);

  if (!result) {
    throw new DomParseError(selector);
  }

  return result;
};
