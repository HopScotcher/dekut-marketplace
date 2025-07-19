import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../../../lib/prisma'; 
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { email } = forgotPasswordSchema.parse(json);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: 'No user found with this email address' },
        { status: 404 }
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const resetToken = crypto.createHash('sha256').update(token).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password. This link will expire in 1 hour.</p>`,
    });

    return NextResponse.json({ message: 'Password reset email sent' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
