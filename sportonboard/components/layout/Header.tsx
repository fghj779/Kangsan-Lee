import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary">SportOnboard</span>
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link href="/sports" className="text-gray-700 hover:text-primary transition">
              Sports
            </Link>
            <Link href="/teams" className="text-gray-700 hover:text-primary transition">
              Teams
            </Link>
            <Link href="/players" className="text-gray-700 hover:text-primary transition">
              Players
            </Link>
            <Link href="/onboarding" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition">
              Take Quiz
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
