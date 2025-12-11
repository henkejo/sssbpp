import { NextResponse } from 'next/server';

export const badRequestError = (message: string): NextResponse => {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status: 400 });
};

export const serverError = (error: unknown): NextResponse => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return NextResponse.json({
    success: false,
    error: message,
  }, { status: 500 });
};
