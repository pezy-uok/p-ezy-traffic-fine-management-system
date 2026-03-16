export default function Settings() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Settings Menu</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-blue-600 hover:underline">Account</a></li>
              <li><a href="#" className="text-blue-600 hover:underline">Privacy</a></li>
              <li><a href="#" className="text-blue-600 hover:underline">Notifications</a></li>
              <li><a href="#" className="text-blue-600 hover:underline">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Account Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Language</label>
                <select className="w-full px-4 py-2 border rounded">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="notifications" className="mr-2" />
                <label htmlFor="notifications">Enable notifications</label>
              </div>
              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
