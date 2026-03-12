import { redirect } from 'next/navigation';

export default function StoryboardPage() {
  redirect('/dashboard?agent=storyboard_generator');
}
