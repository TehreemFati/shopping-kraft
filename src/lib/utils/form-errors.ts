export type FormErrors = Record<string, string>;

/** Flatten Zod / action fieldErrors into a single message per field. */
export function flattenFieldErrors(
  errors: Record<string, string[] | undefined> | undefined | null,
): FormErrors {
  if (!errors) return {};
  const out: FormErrors = {};
  for (const [key, messages] of Object.entries(errors)) {
    if (messages?.length) out[key] = messages[0]!;
  }
  return out;
}

export function firstFormError(errors: FormErrors): string | undefined {
  return errors._form ?? Object.values(errors)[0];
}
