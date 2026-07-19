@extends('emails.layouts.base')

@section('title', $approved ? 'Your leave request was approved' : 'Your leave request was declined')

@section('content')
            <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:11.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:{{ $approved ? '#2f9e5b' : '#d94f4f' }}; margin-bottom:12px;">Leave request {{ $approved ? 'approved' : 'declined' }}</div>

            <h1 style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:23px; font-weight:800; letter-spacing:-.02em; margin:0 0 14px; line-height:1.25; color:#14151a;">Your leave request was {{ $approved ? 'approved' : 'declined' }}</h1>

            <p style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:14.5px; line-height:1.6; color:#4b5159; margin:0 0 22px;">Hi {{ $leaveRequest->trainee->first_name }}, your leave request has been {{ $approved ? 'approved' : 'declined' }}.</p>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fafafb; border-radius:10px; margin-bottom:22px;">
              <tr>
                <td style="padding:16px 20px; font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:13.5px; line-height:1.9; color:#4b5159;">
                  <strong style="color:#14151a;">Category:</strong> {{ $leaveRequest->leaveCategory->name ?? 'N/A' }}<br>
                  <strong style="color:#14151a;">Duration:</strong> {{ \Illuminate\Support\Carbon::parse($leaveRequest->leave_date)->format('M j, Y') }} &ndash; {{ \Illuminate\Support\Carbon::parse($leaveRequest->return_date)->format('M j, Y') }}<br>
                  <strong style="color:#14151a;">Reason:</strong> {{ $leaveRequest->reason }}
                  @if (! $approved && $leaveRequest->decision_remarks)
                  <br><strong style="color:#14151a;">Remarks:</strong> {{ $leaveRequest->decision_remarks }}
                  @endif
                </td>
              </tr>
            </table>

            <p style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:13px; line-height:1.6; color:#9099a3; margin:0;">View your leave history from the Leave page.</p>
@endsection
