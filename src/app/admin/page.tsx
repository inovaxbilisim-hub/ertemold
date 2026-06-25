import { redirect } from 'next/navigation';

export default function AdminRootPage() {
  // Admin kök dizinine gelindiğinde artık doğrudan Dashboard sayfasına yönlendiriyoruz
  redirect('/admin/dashboard');
}
