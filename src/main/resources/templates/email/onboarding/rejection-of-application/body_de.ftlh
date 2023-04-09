<#import "/common_de.ftlh" as common>
<@common.header title="Deine Elmo-Anmeldung wurde nicht akzeptiert!" />
<table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
  <tr>
    <td style="padding:0;">
      <p style="margin:0 0 16px 0;">
        <i>Hallo ${memberApplication.firstName!""}!</i>
      </p>
      <p style="margin:0 0 16px 0;">
        Du hast dich beim klimafreundlichen Fahrtendienst &quot;<i>${elmo.title}</i>&quot;
        registriert. Danke dafür!
      </p>
      <p style="margin:0 0 16px 0;">
        Leider konnte deine Registrierung nicht akzeptiert werden. Die Begründung dafür ist:
      </p>
      <p style="margin:0 0 16px 0;">
        <b>${memberApplication.comment!"Keine"}</b>
      </p>
      <p style="margin:0 0 16px 0;">
        Dein <i>${elmo.title}</i> Team
      </p>
    </td>
  </tr>
</table>
<@common.footer />
