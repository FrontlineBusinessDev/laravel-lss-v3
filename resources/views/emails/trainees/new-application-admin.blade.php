@extends('emails.layouts.base')

@section('title', 'New trainee application')

@section('content')
            <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:11.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#378add; margin-bottom:12px;">New application</div>

            <h1 style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:23px; font-weight:800; letter-spacing:-.02em; margin:0 0 14px; line-height:1.25; color:#14151a;">New trainee application received</h1>

            <p style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:14.5px; line-height:1.6; color:#4b5159; margin:0 0 22px;">{{ $trainee->first_name }} {{ $trainee->last_name }} registered for batch {{ $batch->batch_code }} and is awaiting review.</p>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="border-radius:10px; background-color:#378add;">
                  <a href="{{ $reviewUrl }}" style="display:inline-block; padding:12px 24px; font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:10px;">Review application</a>
                </td>
              </tr>
            </table>
@endsection
