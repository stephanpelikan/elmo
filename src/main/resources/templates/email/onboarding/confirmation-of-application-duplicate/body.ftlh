<#import "/common_de.ftlh" as common>
<@common.header title="Your registration has been accepted!" />
<table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
  <tr>
    <td style="padding:0;">
      <p style="margin:0 0 16px 0;">
        <i>Hello ${memberApplication.firstName!""}!</i>
      </p>
      <p style="margin:0 0 16px 0;">
        You have registered with the climate-friendly &quot;<i>${elmo.title}</i>&quot;
        travel service. Thanks for that!
      </p>
      <p style="margin:0 0 16px 0;">
        <b>Your Elmo registration has been accepted!</b>
        You may now use the service.
        Please go to <b><a style="color:${elmo.brandColor};text-decoration:underline;" href="${elmo.gatewayUrl?no_esc}">${elmo.gatewayUrl}</a></b>
        in your browser and log in again.
      </p>
      <p style="margin:0 0 16px 0;">
        If you make bookings by phone at ${elmo.phoneNumber}, please have your
        membership number ready!
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:0" align="center">
      <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;">
        <tr>
          <td style="padding:16px;background:${elmo.accentColor};color:#ffffff;font-size:24px" align="center">
            <b>Membership number: ${memberApplication.memberId!"-"}</b>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:0;">
      <p style="margin:16px 0 16px 0;">
        Your <i>${elmo.title}</i> team
      </p>
    </td>
  </tr>
</table>
<@common.footer />
