<#import "/common_de.ftlh" as common>
<@common.header title="Your Elmo registration has been rejected!" />
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
        Sorry, but your registration was not accepted. The reason is:
      </p>
      <p style="margin:0 0 16px 0;">
        <b>${memberApplication.comment!"None"}</b>
      </p>
      <p style="margin:0 0 16px 0;">
        Your <i>${elmo.title}</i> team
      </p>
    </td>
  </tr>
</table>
<@common.footer />
