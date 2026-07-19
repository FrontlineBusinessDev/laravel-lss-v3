Your leave request was {{ $approved ? 'approved' : 'declined' }}

Hi {{ $leaveRequest->trainee->first_name }}, your leave request has been {{ $approved ? 'approved' : 'declined' }}.

Category: {{ $leaveRequest->leaveCategory->name ?? 'N/A' }}
Duration: {{ \Illuminate\Support\Carbon::parse($leaveRequest->leave_date)->format('M j, Y') }} - {{ \Illuminate\Support\Carbon::parse($leaveRequest->return_date)->format('M j, Y') }}
Reason: {{ $leaveRequest->reason }}
@if (! $approved && $leaveRequest->decision_remarks)
Remarks: {{ $leaveRequest->decision_remarks }}
@endif

View your leave history from the Leave page.

--
Learning Solutions
Learning Solutions Business Solutions Inc. · Baloc Road, Brgy. San Ignacio, San Pablo City, Philippines
