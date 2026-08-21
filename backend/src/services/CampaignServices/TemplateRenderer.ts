type Variables = Record<string, string | number | null | undefined>;

const normalizeKey = (key: string): string => key.trim();

const renderTemplate = (template: string, variables: Variables = {}): string => {
  if (!template) {
    return "";
  }

  return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, key) => {
    const normalized = normalizeKey(key);
    const value = variables[normalized];
    if (value === undefined || value === null) {
      return "";
    }
    return String(value);
  });
};

export default renderTemplate;
