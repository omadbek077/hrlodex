/**
 * Link nusxalanganda clipboardga link + invite code va ish nomi (tilga qarab) qo'shiladi.
 * Bu matn faqat nusxalanganda ko'rinadi, sahifada qo'shimcha blok ko'rsatilmaydi.
 */
export type CopyLinkLabels = {
  copyBlockFormTitle: string;
  copyBlockInterviewTitle: string;
  copyBlockInviteCode: string;
  copyBlockJob: string;
};

export function buildCopyText(
  type: 'interview' | 'apply',
  url: string,
  jobTitle: string,
  inviteCode: string,
  labels: CopyLinkLabels
): string {
  const title = type === 'apply' ? labels.copyBlockFormTitle : labels.copyBlockInterviewTitle;
  const lines = [
    `${title} — ${jobTitle}`,
    '',
    url,
    '',
    `${labels.copyBlockInviteCode}: ${inviteCode}`,
    `${labels.copyBlockJob}: ${jobTitle}`,
  ];
  return lines.join('\n');
}
