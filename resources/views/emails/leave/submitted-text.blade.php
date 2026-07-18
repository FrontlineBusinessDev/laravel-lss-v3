New leave request submitted

{{ $leaveRequest->trainee->first_name }} {{ $leaveRequest->trainee->last_name }} submitted a leave request awaiting your review.

Category: {{ $leaveRequest->leaveCategory->name ?? 'N/A' }}
Duration: {{ \Illuminate\Support\Carbon::parse($leaveRequest->leave_date)->format('M j, Y') }} - {{ \Illuminate\Support\Carbon::parse($leaveRequest->return_date)->format('M j, Y') }}
Reason: {{ $leaveRequest->reason }}

Review and approve or decline this request from the Leave Management page.

--
LS Support
LS Business Solutions Inc. · Baloc Road, Brgy. San Ignacio, San Pablo City, Philippines
