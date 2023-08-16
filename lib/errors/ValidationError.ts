class ValidationError extends Error {
  code: number;
  cause: { status: 'error'; message: string };

  constructor(message: string, code?: number) {
    super(message);
    this.name = 'ValidationError';
    this.code = code || 400;
    this.cause = { status: 'error', message };
  }
}

export default ValidationError;
