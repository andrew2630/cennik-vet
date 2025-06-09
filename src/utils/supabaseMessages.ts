const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'invalidCredentials',
  'Email not confirmed': 'emailNotConfirmed',
  'User already registered': 'userExists',
  'User already exists': 'userExists',
  'Password should be at least 6 characters': 'weakPassword',
  'Unable to validate email address: invalid format': 'invalidEmail',
}

export function localizeSupabaseMessage(
  message: string,
  t: (key: string) => string,
  fallbackKey: string,
): string {
  const key = ERROR_MAP[message.trim()]
  if (key) return t(key)
  return message || t(fallbackKey)
}
