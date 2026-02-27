"""
Service d'envoi d'emails.
En développement : logs console uniquement.
En production : décommenter l'intégration Resend (ou configurer SMTP).
"""
import logging
import os

logger = logging.getLogger(__name__)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


async def send_invitation_email(
    to_email: str,
    to_name: str,
    group_name: str,
    invite_url: str,
) -> None:
    logger.info(
        "── INVITATION EMAIL ────────────────────────────\n"
        f"  À       : {to_name} <{to_email}>\n"
        f"  Projet  : {group_name}\n"
        f"  Lien    : {invite_url}\n"
        "────────────────────────────────────────────────"
    )

    # ── Resend (pip install resend + RESEND_API_KEY dans .env) ───────────
    # import resend
    # resend.api_key = os.getenv("RESEND_API_KEY", "")
    # resend.Emails.send({
    #     "from": "FamilyFund <noreply@familyfund.fr>",
    #     "to": [to_email],
    #     "subject": f"Vous êtes invité(e) à rejoindre « {group_name} »",
    #     "html": f"""
    #         <p>Bonjour {to_name},</p>
    #         <p>
    #           Vous avez été invité(e) à participer au projet de financement
    #           familial <strong>{group_name}</strong>.
    #         </p>
    #         <p>
    #           <a href="{invite_url}"
    #              style="background:#2D6A4F;color:white;padding:12px 24px;
    #                     border-radius:8px;text-decoration:none;font-weight:600">
    #             Renseigner mon engagement
    #           </a>
    #         </p>
    #         <p style="color:#6B7280;font-size:12px">
    #           Ce lien est valable 72 heures. Vos données restent strictement privées.
    #         </p>
    #     """,
    # })
