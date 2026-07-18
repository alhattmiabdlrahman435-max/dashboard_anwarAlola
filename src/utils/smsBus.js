let smsListener = null;

export const smsBus = {
  subscribe: (listener) => {
    smsListener = listener;
    return () => {
      smsListener = null;
    };
  },
  emit: (logOrFn) => {
    if (smsListener) {
      smsListener(logOrFn);
    }
  }
};
