const REGEX = {
  VALID_COLOR: /^#[0-9A-Fa-f]{6}$/,
  ACCOUNT_FORMAT: /(\d{4})(\d{4})(\d{4})/,
};

const MESSAGES = {
  PING: "AC3__ping",
  PONG: "AC3__pong",
  UPDATE_COLOR: "AC3__updateColor",
  POPUP_PORT: "AC3__popup",
};

const URLS = {
  AWS_CONSOLE: "console.aws.amazon.com",
};

export { REGEX, MESSAGES, URLS };
