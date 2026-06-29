import NetInfo from '@react-native-community/netinfo';

let pendingInternetError = false;

export function markPendingInternetError() {
  pendingInternetError = true;
}

export function consumePendingInternetError() {
  const shouldShow = pendingInternetError;
  pendingInternetError = false;
  return shouldShow;
}

export async function hasValidInternetConnection(): Promise<boolean> {
  let state = await NetInfo.fetch();

  if (state.isConnected === false) {
    return false;
  }

  if (state.isInternetReachable === false) {
    return false;
  }

  if (state.isInternetReachable === true) {
    return true;
  }

  state = await NetInfo.refresh();

  if (state.isConnected === false || state.isInternetReachable === false) {
    return false;
  }

  if (state.isInternetReachable === true) {
    return true;
  }

  try {
    const response = await fetch('https://clients3.google.com/generate_204', {
      method: 'HEAD',
    });
    return response.ok;
  } catch {
    return false;
  }
}
