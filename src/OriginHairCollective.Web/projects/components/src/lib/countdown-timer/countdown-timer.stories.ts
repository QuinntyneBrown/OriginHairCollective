import type { Meta, StoryObj } from '@storybook/angular';
import { CountdownTimerComponent } from './countdown-timer';

const meta: Meta<CountdownTimerComponent> = {
  title: 'Components/CountdownTimer',
  component: CountdownTimerComponent,
  tags: ['autodocs'],
  argTypes: {
    targetDate: { control: 'text' },
  },
  decorators: [
    (story) => ({
      ...story(),
      template: `<div style="display: flex; justify-content: center; background: #0b0a08; padding: 60px 40px;">${story().template ?? `<lib-countdown-timer [targetDate]="targetDate" />`}</div>`,
    }),
  ],
};

export default meta;
type Story = StoryObj<CountdownTimerComponent>;

// Default: 30 days from now
const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

export const Default: Story = {
  args: {
    targetDate: thirtyDaysFromNow,
  },
};

// Short countdown: 2 hours from now
const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

export const ShortCountdown: Story = {
  args: {
    targetDate: twoHoursFromNow,
  },
};
