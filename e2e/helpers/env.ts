export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.e2e.example to .env.e2e and set credentials.`,
    );
  }
  return value;
}

export function adminCredentials() {
  return {
    email: requireEnv("E2E_ADMIN_EMAIL"),
    password: requireEnv("E2E_ADMIN_PASSWORD"),
  };
}

export function customerCredentials() {
  const email = process.env.E2E_CUSTOMER_EMAIL?.trim();
  const password = process.env.E2E_CUSTOMER_PASSWORD?.trim();
  if (email && password) return { email, password };
  return null;
}

export function uniqueSuffix() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
