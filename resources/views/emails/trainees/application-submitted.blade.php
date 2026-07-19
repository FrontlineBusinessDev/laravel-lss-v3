@extends('emails.layouts.base')

@section('title', 'Application submitted')

@section('content')
            <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:11.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#378add; margin-bottom:12px;">Application received</div>

            <h1 style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:23px; font-weight:800; letter-spacing:-.02em; margin:0 0 14px; line-height:1.25; color:#14151a;">Thanks for applying, {{ $trainee->first_name }}!</h1>

            <p style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:14.5px; line-height:1.6; color:#4b5159; margin:0 0 22px;">We've received your registration and it's now pending admin approval. You'll receive another email with your account activation link once an administrator reviews and approves your application.</p>

            <p style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:13px; line-height:1.6; color:#9099a3; margin:0;">No action is needed from you right now.</p>
@endsection
