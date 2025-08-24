export const payuConfig = {
    key: process.env.PAYU_KEY,       // from PayU dashboard
    salt: process.env.PAYU_SALT,     // 32-bit salt
    baseUrl: process.env.PAYU_ENV === "test"
      ? "https://test.payu.in/_payment"
      : "https://secure.payu.in/_payment"
  };
  