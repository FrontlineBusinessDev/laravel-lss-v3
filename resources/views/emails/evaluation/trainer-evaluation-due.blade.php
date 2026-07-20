@extends('emails.layouts.base')

@section('title', 'Your trainer evaluation is now due')

@section('content')
            <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:11.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#378add; margin-bottom:12px;">Trainer evaluation</div>

            <h1 style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:23px; font-weight:800; letter-spacing:-.02em; margin:0 0 14px; line-height:1.25; color:#14151a;">Your trainer evaluation is now due</h1>

            <p style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:14.5px; line-height:1.6; color:#4b5159; margin:0 0 22px;">Hi {{ $trainee->first_name }}, you've reached your required rendered hours. Please accomplish your pending Trainer Evaluation form before you can proceed with certificate clearance.</p>

            <p style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:13px; line-height:1.6; color:#9099a3; margin:0;">Log in to the Trainee Portal and open the Evaluation page to get started.</p>
@endsection
