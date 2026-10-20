/**
 * Mantra Care Platform Configuration
 */
export const MANTRA_CONFIG = {
  dashboardUrl: 'https://web.mantracare.com/tasks',

  webhookUrl: 'https://api.mantracare.com/webhook/pathway',

  /**
   * Default webhook intent.
   * Supported values:
   * - complete_activity
   * - assign_activity
   * - assign_pathway
   * - assign_and_complete_activity
   */
  defaultWebhookIntent: 'complete_activity',

  redirectAfterCompletion: false,

  devMode: true
} as const;