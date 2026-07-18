@extends('emails.layouts.base')

@section('title', $announcement->subject)

@section('content')
            <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:11.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#378add; margin-bottom:12px;">Announcement</div>

            <h1 style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:23px; font-weight:800; letter-spacing:-.02em; margin:0 0 14px; line-height:1.25; color:#14151a;">{{ $announcement->subject }}</h1>

            @if ($announcement->description)
            <p style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:14.5px; line-height:1.6; color:#4b5159; margin:0 0 22px; white-space:pre-line;">{{ $announcement->description }}</p>
            @endif

            <p style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:13px; line-height:1.6; color:#9099a3; margin:0;">Sign in to view the full announcement and any prior posts.</p>
@endsection
