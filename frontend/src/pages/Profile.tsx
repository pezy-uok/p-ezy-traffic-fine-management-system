export default function Profile() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">Profile</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-2xl">
        <div className="flex items-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
          <div className="ml-6">
            <h2 className="text-2xl font-semibold">User Profile</h2>
            <p className="text-gray-600 dark:text-gray-300">user@example.com</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" className="w-full px-4 py-2 border rounded" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full px-4 py-2 border rounded" placeholder="your@email.com" />
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
