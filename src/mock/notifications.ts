import { NotificationItem } from '../lib/types';

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'lifecycle',
    title: 'Example Tender Schedule: GOLDGUINEA Oct-26',
    body: 'Illustrative calendar fixture only. No current tender notice is verified, and no position action is being recommended.',
    createdAt: '1 hour ago',
    read: false,
    link: '/calendar'
  },
  {
    id: 'notif-2',
    type: 'system',
    title: 'Sample Data Health Fixture',
    body: 'Example row and session counts only. No MCX data has been ingested or verified.',
    createdAt: '4 hours ago',
    read: false,
    link: '/health'
  },
  {
    id: 'notif-3',
    type: 'alert',
    title: 'Example Alert Outcome',
    body: 'Illustrative scenario result only; no live alert or trade was executed.',
    createdAt: 'Oct 12, 2026',
    read: true,
    link: '/alerts'
  },
  {
    id: 'notif-4',
    type: 'health',
    title: 'Example Calendar Item',
    body: 'Illustrative notice fixture only. Check official exchange sources for current trading sessions.',
    createdAt: 'Oct 10, 2026',
    read: true,
    link: '/health'
  }
];
