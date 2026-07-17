@extends('emails.layouts.base')

@section('title', 'Set up your account')

@section('content')
            <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:11.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#378add; margin-bottom:12px;">Account created</div>

            <h1 style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:23px; font-weight:800; letter-spacing:-.02em; margin:0 0 14px; line-height:1.25; color:#14151a;">Welcome to Learning Solutions, {{ $user->name }}</h1>

            <p style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:14.5px; line-height:1.6; color:#4b5159; margin:0 0 22px;">Your Learning Solutions account has just been created. Set up your password below to access your account and start submitting or tracking support tickets.</p>

            <!-- Info card -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #ecedf1; border-radius:12px; margin-bottom:24px;">
              <tr>
                <td style="padding:12px 16px; border-bottom:1px solid #f0f1f4; font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:13px; color:#9099a3; font-weight:500;">Account email</td>
                <td align="right" style="padding:12px 16px; border-bottom:1px solid #f0f1f4; font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:13px; color:#14151a; font-weight:600;">{{ $user->email }}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px; font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:13px; color:#9099a3; font-weight:500;">Role</td>
                <td align="right" style="padding:12px 16px; font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:13px; color:#14151a; font-weight:600;">{{ $roleLabel }}</td>
              </tr>
            </table>

            <!-- CTA button -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="border-radius:10px; background-color:#378add;">
                  <a href="{{ $resetUrl }}" style="display:inline-block; padding:12px 24px; font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:10px;">Set up your password</a>
                </td>
              </tr>
            </table>

            <p style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:13px; line-height:1.6; color:#9099a3; margin:20px 0 0;">This link is valid for a limited time. Didn't expect this email? Just reply and we'll sort it out.</p>
@endsection
