const authErrorMessages: Record<string, string> = {
  'auth/email-already-in-use': 'May account na gamit ang email na ito.',
  'auth/invalid-email': 'Hindi wasto ang email address.',
  'auth/operation-not-allowed': 'Hindi pa naka-enable ang sign-in method na ito sa Firebase.',
  'auth/weak-password': 'Dapat hindi bababa sa 6 na character ang password.',
  'auth/user-disabled': 'Na-disable ang account na ito.',
  'auth/user-not-found': 'Walang account na tumutugma sa email at password.',
  'auth/wrong-password': 'Mali ang email o password.',
  'auth/invalid-credential': 'Mali ang email o password.',
  'auth/too-many-requests': 'Masyadong maraming pagtatangka. Subukan muli mamaya.',
  'auth/network-request-failed': 'May problema sa internet. Suriin ang koneksyon mo.',
};

export function getAuthErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String(error.code);
    if (authErrorMessages[code]) {
      return authErrorMessages[code];
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'May naganap na error. Subukan muli.';
}
