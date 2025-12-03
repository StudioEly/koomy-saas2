export const EMAIL_TYPES = {
  WELCOME_COMMUNITY_ADMIN: "welcome_community_admin",
  INVITE_DELEGATE: "invite_delegate",
  INVITE_MEMBER: "invite_member",
  RESET_PASSWORD: "reset_password",
  VERIFY_EMAIL: "verify_email",
  NEW_EVENT: "new_event",
  NEW_COLLECTION: "new_collection",
  MESSAGE_TO_ADMIN: "message_to_admin"
} as const;

export type EmailType = typeof EMAIL_TYPES[keyof typeof EMAIL_TYPES];

export const EMAIL_TYPE_LABELS: Record<EmailType, string> = {
  [EMAIL_TYPES.WELCOME_COMMUNITY_ADMIN]: "Bienvenue administrateur",
  [EMAIL_TYPES.INVITE_DELEGATE]: "Invitation délégué",
  [EMAIL_TYPES.INVITE_MEMBER]: "Invitation membre",
  [EMAIL_TYPES.RESET_PASSWORD]: "Réinitialisation mot de passe",
  [EMAIL_TYPES.VERIFY_EMAIL]: "Vérification email",
  [EMAIL_TYPES.NEW_EVENT]: "Nouvel événement",
  [EMAIL_TYPES.NEW_COLLECTION]: "Nouvelle collecte",
  [EMAIL_TYPES.MESSAGE_TO_ADMIN]: "Message à l'administrateur"
};

export const EMAIL_TYPE_VARIABLES: Record<EmailType, string[]> = {
  [EMAIL_TYPES.WELCOME_COMMUNITY_ADMIN]: ["name", "communityName", "code", "loginUrl"],
  [EMAIL_TYPES.INVITE_DELEGATE]: ["name", "adminName", "communityName", "role", "activationUrl"],
  [EMAIL_TYPES.INVITE_MEMBER]: ["name", "communityName", "codeMembre", "activationUrl"],
  [EMAIL_TYPES.RESET_PASSWORD]: ["name", "resetUrl"],
  [EMAIL_TYPES.VERIFY_EMAIL]: ["name", "codeVerification", "activateUrl"],
  [EMAIL_TYPES.NEW_EVENT]: ["title", "date", "communityName"],
  [EMAIL_TYPES.NEW_COLLECTION]: ["title", "amount", "deadline", "communityName"],
  [EMAIL_TYPES.MESSAGE_TO_ADMIN]: ["memberName", "subject", "message"]
};
