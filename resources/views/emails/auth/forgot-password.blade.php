@extends('emails.layouts.base')

@section('title', 'Reset your password')

@section('content')
            <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:11.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#378add; margin-bottom:12px;">Password reset requested</div>

            <h1 style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:23px; font-weight:800; letter-spacing:-.02em; margin:0 0 14px; line-height:1.25; color:#14151a;">Reset your password, {{ $user->name }}</h1>

            <p style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:14.5px; line-height:1.6; color:#4b5159; margin:0 0 22px;">We received a request to reset the password for the account registered to {{ $user->email }}. Click the button below to choose a new password.</p>

            <!-- CTA button -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="border-radius:10px; background-color:#378add;">
                  <a href="{{ $resetUrl }}" style="display:inline-block; padding:12px 24px; font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:10px;">Reset password</a>
                </td>
              </tr>
            </table>

            <p style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:13px; line-height:1.6; color:#9099a3; margin:20px 0 0;">This link is valid for a limited time. If you didn't request a password reset, you can safely ignore this email — your password will not be changed.</p>
@endsection
