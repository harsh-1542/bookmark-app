import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-indigo-600">📚 Bookmarks</div>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900">
            Log in
          </Link>
          <Link href="/signup" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
          Save. Organize. Share.
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          A lightweight bookmark manager that keeps your web links organized, searchable, and shareable.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
            Get started for free
          </Link>
          <Link href="/login" className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">🔐</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Private by default</h3>
            <p className="text-gray-600 dark:text-gray-400">Your bookmarks are yours. Mark them public only when you want to share.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">👤</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Unique handle</h3>
            <p className="text-gray-600 dark:text-gray-400">Create a public profile with your handle and share your best bookmarks with the world.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Quick access</h3>
            <p className="text-gray-600 dark:text-gray-400">Organize and edit your bookmarks instantly. Fast, responsive, and reliable.</p>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to organize your web?</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Start saving and sharing bookmarks in seconds.</p>
        <Link href="/signup" className="inline-block px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
          Create your account
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; 2026 Bookmark App. Built with Next.js and Supabase.</p>
        </div>
      </footer>
    </main>
  );
}
