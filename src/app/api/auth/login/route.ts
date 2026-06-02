import { comparePassword, generateToken, isValidEmail } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await prisma.$connect();
    
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required', code: 'MISSING_PASSWORD' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true,
        avatar: true,
        department: true,
        position: true,
        isVerified: true,
      },
    });

    // User not found
    if (!user) {
      return NextResponse.json(
        { 
          error: 'No account found with this email address. Please check or create a new account.',
          code: 'USER_NOT_FOUND'
        },
        { status: 401 }
      );
    }

    // Email not verified
    if (!user.isVerified) {
      return NextResponse.json(
        { 
          error: 'Please verify your email address before logging in. Check your inbox for the verification code.',
          code: 'EMAIL_NOT_VERIFIED',
          needsVerification: true,
          email: user.email
        },
        { status: 403 }
      );
    }

    // Validate password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { 
          error: 'Incorrect password. Please try again or use "Forgot password?" to reset it.',
          code: 'INVALID_PASSWORD'
        },
        { status: 401 }
      );
    }

    // Generate token and return success
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          department: user.department,
          position: user.position,
          isVerified: user.isVerified,
        },
        token,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    
    const errorMessage = error.message || 'Internal server error';
    const isDbError = errorMessage.includes('prisma') || errorMessage.includes('database') || errorMessage.includes('connect');
    const isNetworkError = errorMessage.includes('ECONNREFUSED') || errorMessage.includes('timeout') || errorMessage.includes('ENOTFOUND');
    
    let errorResponse = {
      error: 'Something went wrong. Please try again later.',
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    };

    if (isDbError) {
      errorResponse.error = 'Database connection error. Please try again in a moment.';
      errorResponse.code = 'DB_ERROR';
    } else if (isNetworkError) {
      errorResponse.error = 'Network error. Please check your internet connection and try again.';
      errorResponse.code = 'NETWORK_ERROR';
    }

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
