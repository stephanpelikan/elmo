<#import "/common_de.ftlh" as common>
<@common.header title="Your registration is not complete!" />
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
        So, that you can book rides and we can then take you with us in our electric cars,
        <b>we ask you to complete the registration</b>.
      </p>
      <p style="margin:0 0 16px 0;">
        Please go to <b><a style="color:${elmo.brandColor};text-decoration:underline;" href="${elmo.gatewayUrl?no_esc}">${elmo.gatewayUrl}</a></b>
        in your browser and log in again. The form appears immediately with a note which data is still missing or click on the blue button:
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:0" align="center">
      <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;">
        <tr>
          <td style="padding:16px;background:${elmo.accentColor};color:#ffffff;font-size:24px" align="center">
            <a style="color:#ffffff;text-decoration:none;" href="${elmo.gatewayUrl?no_esc}"><b>Complete the registration</b></a>
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
