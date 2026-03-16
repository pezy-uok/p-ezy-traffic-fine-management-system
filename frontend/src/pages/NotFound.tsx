import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container mx-auto p-6 text-center">
      <div className="py-20">
        <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200 mb-4">404</h1>
        <p className="text-2xl text-gray-600 dark:text-gray-400 mb-4">Page Not Found</p>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded hover:bg-blue-700 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
