<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Learning Solutions · @yield('title')</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f5f7;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f5f7;">
  <tr>
    <td align="center" style="padding:24px 16px;">

      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px; background-color:#ffffff; border-radius:16px;">
        <!-- Gradient top bar -->
        <tr>
          <td style="height:4px; line-height:4px; font-size:4px; background-color:#378add; background-image:linear-gradient(90deg,#378add,#7b2ecc); border-radius:16px 16px 0 0;">&nbsp;</td>
        </tr>

        <!-- Brand row -->
        <tr>
          <td style="padding:24px 36px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="30" style="width:30px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="30" height="30" align="center" valign="middle" style="width:30px; height:30px; border-radius:8px; background-color:#378add; font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:14px; font-weight:800; color:#ffffff;">F</td>
                    </tr>
                  </table>
                </td>
                <td style="padding-left:10px; font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:14px; font-weight:700; letter-spacing:-.01em; color:#14151a; white-space:nowrap;">Learning Solutions</td>
                <td align="right" style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:11px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:#aab0bb;">Support</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 36px 32px;">
@yield('content')
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 36px; background-color:#fafafb; border-top:1px solid #f0f1f4; border-radius:0 0 16px 16px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
              <tr>
                <td width="22" height="22" align="center" valign="middle" style="width:22px; height:22px; border-radius:6px; background-color:#378add; font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:11px; font-weight:800; color:#ffffff;">F</td>
                <td style="padding-left:8px; font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:12.5px; font-weight:700; color:#14151a;">Learning Solutions</td>
              </tr>
            </table>

            <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:12px; line-height:1.65; color:#9099a3;">Learning Solutions Business Solutions Inc. &middot; Baloc Road, Brgy. San Ignacio, San Pablo City, Philippines<br>@yield('footnote', "You're receiving this because you have a Learning Solutions account.")</div>
          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>
</body>
</html>
